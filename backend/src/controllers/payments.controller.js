const { body } = require('express-validator');
const prisma = require('../config/database');
const paymentService = require('../services/payment.service');
const notifService = require('../services/notification.service');
const smsService = require('../services/sms.service');

const initiateRules = [
  body('appointmentId').notEmpty().withMessage('ID consultation requis'),
  body('method').isIn(['MTN_MONEY', 'AIRTEL_MONEY', 'CARD']).withMessage('Méthode invalide'),
  body('phone').notEmpty().withMessage('Numéro de téléphone requis'),
];

async function initiatePayment(req, res, next) {
  try {
    const { appointmentId, method, phone } = req.body;
    const io = req.app.get('io');

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: true,
      },
    });
    if (!appointment) return res.status(404).json({ message: 'Consultation introuvable' });
    if (appointment.patient.userId !== req.user.id) {
      return res.status(403).json({ message: 'Seul le patient peut effectuer le paiement' });
    }

    // Vérifier qu'il n'y a pas déjà un paiement complété
    const existingPayment = await prisma.payment.findUnique({ where: { appointmentId } });
    if (existingPayment?.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cette consultation est déjà payée' });
    }

    const amount = appointment.doctor.tarif;
    const result = await paymentService.initiatePayment(method, {
      amount,
      phone,
      appointmentId,
      note: `Consultation TéléMéd Dr ${appointment.doctor.nom}`,
    });

    // Créer ou mettre à jour le paiement en base
    const payment = await prisma.payment.upsert({
      where: { appointmentId },
      update: {
        method,
        status: result.status,
        transactionId: result.transactionId,
        phoneNumber: phone,
      },
      create: {
        appointmentId,
        amount,
        platformFee: result.platformFee,
        doctorAmount: result.doctorAmount,
        method,
        status: result.status,
        transactionId: result.transactionId,
        phoneNumber: phone,
      },
    });

    // Si paiement complété immédiatement (cas mock sandbox)
    if (result.status === 'COMPLETED') {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CONFIRMED' },
      });

      await notifService.notifyPaymentSuccess(io, req.user.id, amount);
      await smsService.sendPaymentConfirmation(phone, amount, method);
    }

    res.json({ payment, transactionId: result.transactionId, status: result.status });
  } catch (err) {
    next(err);
  }
}

// Webhook appelé par MTN/Airtel lors de la confirmation du paiement
async function paymentCallback(req, res, next) {
  try {
    const { transactionId, status, externalId } = req.body;
    const io = req.app.get('io');

    const payment = await prisma.payment.findFirst({
      where: { OR: [{ transactionId }, { appointmentId: externalId }] },
      include: { appointment: { include: { patient: { include: { user: true } }, doctor: true } } },
    });

    if (!payment) return res.status(404).json({ message: 'Paiement introuvable' });

    const paymentStatus = status === 'SUCCESSFUL' ? 'COMPLETED' : 'FAILED';
    await prisma.payment.update({ where: { id: payment.id }, data: { status: paymentStatus } });

    if (paymentStatus === 'COMPLETED') {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      });

      await notifService.notifyPaymentSuccess(
        io,
        payment.appointment.patient.userId,
        payment.amount
      );
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

async function getPaymentHistory(req, res, next) {
  try {
    const userId = req.user.id;
    let where = {};

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient) return res.json([]);
      where = { appointment: { patientId: patient.id } };
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) return res.json([]);
      where = { appointment: { doctorId: doctor.id } };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: { select: { nom: true, prenom: true } },
            doctor: { select: { nom: true, prenom: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (err) {
    next(err);
  }
}

module.exports = { initiatePayment, paymentCallback, getPaymentHistory, initiateRules };
