const prisma = require('../config/database');

async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;
    let where = {};

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient) return res.json([]);
      where.patientId = patient.id;
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) return res.json([]);
      where.doctorId = doctor.id;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        patient: { select: { nom: true, prenom: true } },
        doctor: { select: { nom: true, prenom: true, photo: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        appointment: { select: { status: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Vérifier accès
    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ patient: { userId } }, { doctor: { userId } }],
      },
    });
    if (!conv) return res.status(403).json({ message: 'Accès refusé' });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    res.json({ messages: messages.reverse(), total, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const { content, type = 'TEXT' } = req.body;
    const userId = req.user.id;
    const io = req.app.get('io');

    if (!content?.trim()) return res.status(400).json({ message: 'Message vide' });

    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ patient: { userId } }, { doctor: { userId } }],
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
    if (!conv) return res.status(403).json({ message: 'Accès refusé' });

    const message = await prisma.message.create({
      data: { conversationId, senderId: userId, content, type },
    });

    // Émettre via Socket.io
    if (io) {
      io.to(`conv:${conversationId}`).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const msg = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
    res.json(msg);
  } catch (err) {
    next(err);
  }
}

module.exports = { getConversations, getMessages, sendMessage, markRead };
