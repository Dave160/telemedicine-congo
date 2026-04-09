const { body } = require('express-validator');
const prisma = require('../config/database');
const notifService = require('../services/notification.service');
const smsService = require('../services/sms.service');

const bookRules = [
  body('doctorId').notEmpty().withMessage('Médecin requis'),
  body('type').isIn(['IMMEDIATE', 'SCHEDULED', 'PHYSICAL']).withMessage('Type invalide'),
  body('consultationType').optional().isIn(['CHAT', 'AUDIO', 'VIDEO', 'PHYSICAL']),
  body('scheduledAt').if(body('type').equals('SCHEDULED')).notEmpty().withMessage('Date requise pour rendez-vous'),
];

async function bookAppointment(req, res, next) {
  try {
    const { doctorId, type, consultationType = 'CHAT', scheduledAt, notes } = req.body;
    const io = req.app.get('io');

    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) return res.status(400).json({ message: 'Complétez votre profil patient d\'abord' });

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });
    if (!doctor) return res.status(404).json({ message: 'Médecin introuvable' });
    if (!doctor.isVerified) return res.status(400).json({ message: 'Ce médecin n\'est pas encore vérifié' });

    if (type === 'IMMEDIATE' && !doctor.isAvailableNow) {
      return res.status(400).json({ message: 'Ce médecin n\'est pas disponible en ce moment' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        type,
        consultationType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        notes,
      },
    });

    // Créer la conversation associée
    await prisma.conversation.create({
      data: {
        patientId: patient.id,
        doctorId,
        appointmentId: appointment.id,
      },
    });

    // Notification au médecin
    await notifService.notifyNewPatient(io, doctor.userId, `${patient.prenom} ${patient.nom}`);

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

async function listAppointments(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const user = req.user;
    let where = {};

    if (user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
      if (!patient) return res.json({ appointments: [], total: 0 });
      where.patientId = patient.id;
    } else if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
      if (!doctor) return res.json({ appointments: [], total: 0 });
      where.doctorId = doctor.id;
    }

    if (status) where.status = status;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { nom: true, prenom: true, user: { select: { phone: true } } } },
          doctor: { select: { nom: true, prenom: true, specialite: true, photo: true } },
          payment: { select: { status: true, amount: true, method: true } },
          conversation: { select: { id: true } },
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({ appointments, total, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
}

async function getAppointmentById(req, res, next) {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { phone: true, email: true } } } },
        doctor: { include: { user: { select: { phone: true, email: true } } } },
        payment: true,
        conversation: { select: { id: true } },
        prescriptions: true,
      },
    });
    if (!appointment) return res.status(404).json({ message: 'Consultation introuvable' });

    // Vérifier que l'utilisateur a accès
    const isPatient = appointment.patient.userId === req.user.id;
    const isDoctor = appointment.doctor.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

async function confirmAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const io = req.app.get('io');

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: { include: { user: true } } },
    });
    if (!appointment) return res.status(404).json({ message: 'Consultation introuvable' });
    if (appointment.doctor.userId !== req.user.id) {
      return res.status(403).json({ message: 'Seul le médecin peut confirmer' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    await notifService.notifyAppointmentConfirmed(
      io,
      appointment.patient.userId,
      `${appointment.doctor.prenom} ${appointment.doctor.nom}`
    );

    // SMS de confirmation
    if (appointment.scheduledAt) {
      await smsService.sendAppointmentReminder(
        appointment.patient.user.phone,
        `${appointment.doctor.prenom} ${appointment.doctor.nom}`,
        new Date(appointment.scheduledAt).toLocaleString('fr-FR')
      );
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function cancelAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const io = req.app.get('io');
    const { reason } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });
    if (!appointment) return res.status(404).json({ message: 'Consultation introuvable' });

    const isPatient = appointment.patient.userId === req.user.id;
    const isDoctor = appointment.doctor.userId === req.user.id;
    if (!isPatient && !isDoctor && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Impossible d\'annuler une consultation terminée' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    const notifyUserId = isDoctor ? appointment.patient.userId : appointment.doctor.userId;
    await notifService.notifyAppointmentCancelled(io, notifyUserId, reason);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function completeAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true },
    });
    if (!appointment) return res.status(404).json({ message: 'Consultation introuvable' });
    if (appointment.doctor.userId !== req.user.id) {
      return res.status(403).json({ message: 'Seul le médecin peut terminer la consultation' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  bookAppointment,
  listAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  bookRules,
};
