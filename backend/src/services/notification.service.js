const prisma = require('../config/database');

/**
 * Crée une notification en base de données
 */
async function createNotification(userId, { type, title, body }) {
  return prisma.notification.create({
    data: { userId, type, title, body },
  });
}

/**
 * Envoie une notification in-app via Socket.io
 */
function emitNotification(io, userId, notification) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
}

/**
 * Crée et émet une notification
 */
async function notify(io, userId, { type, title, body }) {
  const notif = await createNotification(userId, { type, title, body });
  emitNotification(io, userId, notif);
  return notif;
}

// ─── Notifications prédéfinies ────────────────────────────────────────────────

async function notifyAppointmentConfirmed(io, patientUserId, doctorName) {
  return notify(io, patientUserId, {
    type: 'APPOINTMENT_CONFIRMED',
    title: 'Consultation confirmée',
    body: `Dr ${doctorName} a confirmé votre rendez-vous.`,
  });
}

async function notifyAppointmentCancelled(io, userId, reason) {
  return notify(io, userId, {
    type: 'APPOINTMENT_CANCELLED',
    title: 'Consultation annulée',
    body: reason || 'Votre consultation a été annulée.',
  });
}

async function notifyPaymentSuccess(io, userId, amount) {
  return notify(io, userId, {
    type: 'PAYMENT_SUCCESS',
    title: 'Paiement confirmé',
    body: `Votre paiement de ${amount} FCFA a bien été reçu.`,
  });
}

async function notifyNewMessage(io, userId, senderName) {
  return notify(io, userId, {
    type: 'NEW_MESSAGE',
    title: 'Nouveau message',
    body: `${senderName} vous a envoyé un message.`,
  });
}

async function notifyPrescriptionReady(io, patientUserId, doctorName) {
  return notify(io, patientUserId, {
    type: 'PRESCRIPTION_READY',
    title: 'Ordonnance disponible',
    body: `Dr ${doctorName} vous a envoyé une ordonnance.`,
  });
}

async function notifyNewPatient(io, doctorUserId, patientName) {
  return notify(io, doctorUserId, {
    type: 'NEW_APPOINTMENT',
    title: 'Nouvelle demande',
    body: `${patientName} a pris rendez-vous avec vous.`,
  });
}

module.exports = {
  createNotification,
  emitNotification,
  notify,
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyPaymentSuccess,
  notifyNewMessage,
  notifyPrescriptionReady,
  notifyNewPatient,
};
