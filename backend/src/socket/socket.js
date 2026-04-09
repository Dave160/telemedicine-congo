const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/database');

let io;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:19006'],
      credentials: true,
    },
  });

  // ─── Auth middleware ─────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token manquant'));
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) return next(new Error('Utilisateur introuvable'));
      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] Connected: ${userId}`);

    // Rejoindre la room personnelle (pour les notifications)
    socket.join(`user:${userId}`);

    // ─── Rejoindre une conversation ────────────────────────────────────────
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        // Vérifier que l'utilisateur appartient à cette conversation
        const conv = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { patient: { userId } },
              { doctor: { userId } },
            ],
          },
        });
        if (!conv) {
          return socket.emit('error', { message: 'Accès refusé à cette conversation' });
        }
        socket.join(`conv:${conversationId}`);
        socket.emit('joined_conversation', { conversationId });
      } catch (err) {
        socket.emit('error', { message: 'Erreur rejoindre conversation' });
      }
    });

    // ─── Envoyer un message ────────────────────────────────────────────────
    socket.on('send_message', async ({ conversationId, content, type = 'TEXT' }) => {
      try {
        // Vérifier accès
        const conv = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { patient: { userId } },
              { doctor: { userId } },
            ],
          },
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        });
        if (!conv) return socket.emit('error', { message: 'Conversation introuvable' });
        if (!content?.trim()) return;

        const message = await prisma.message.create({
          data: { conversationId, senderId: userId, content, type },
        });

        io.to(`conv:${conversationId}`).emit('new_message', message);

        // Notification au destinataire
        const recipientUserId =
          conv.patient.userId === userId ? conv.doctor.userId : conv.patient.userId;
        const senderName =
          conv.patient.userId === userId
            ? `${conv.patient.prenom} ${conv.patient.nom}`
            : `Dr ${conv.doctor.prenom} ${conv.doctor.nom}`;

        io.to(`user:${recipientUserId}`).emit('notification', {
          type: 'NEW_MESSAGE',
          title: 'Nouveau message',
          body: `${senderName} vous a envoyé un message.`,
        });
      } catch (err) {
        socket.emit('error', { message: 'Erreur envoi message' });
      }
    });

    // ─── Indicateur de frappe ─────────────────────────────────────────────
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('typing', { userId, isTyping });
    });

    // ─── Marquer messages lus ─────────────────────────────────────────────
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await prisma.message.updateMany({
          where: { conversationId, senderId: { not: userId }, isRead: false },
          data: { isRead: true },
        });
        socket.to(`conv:${conversationId}`).emit('messages_read', { conversationId, userId });
      } catch (err) {
        console.error('[Socket mark_read error]', err);
      }
    });

    // ─── Déconnexion ──────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io non initialisé');
  return io;
}

module.exports = { initSocket, getIO };
