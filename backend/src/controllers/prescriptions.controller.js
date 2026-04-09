const { body } = require('express-validator');
const prisma = require('../config/database');
const pdfService = require('../services/pdf.service');
const smsService = require('../services/sms.service');
const whatsappService = require('../services/whatsapp.service');
const notifService = require('../services/notification.service');

const createRules = [
  body('appointmentId').notEmpty().withMessage('Consultation requise'),
  body('content').notEmpty().withMessage('Contenu de l\'ordonnance requis'),
  body('deliveryMethod').optional().isIn(['APP', 'SMS', 'WHATSAPP']),
];

async function createPrescription(req, res, next) {
  try {
    const { appointmentId, content, deliveryMethod = 'APP' } = req.body;
    const io = req.app.get('io');

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
    if (!appointment) return res.status(404).json({ message: 'Consultation introuvable' });
    if (appointment.doctor.userId !== req.user.id) {
      return res.status(403).json({ message: 'Seul le médecin peut créer une ordonnance' });
    }

    // Générer le PDF
    const prescriptionId = require('crypto').randomUUID().slice(0, 8).toUpperCase();
    const pdfBuffer = await pdfService.generatePrescriptionPDF({
      doctor: appointment.doctor,
      patient: appointment.patient,
      appointment,
      content,
      prescriptionId,
    });

    const pdfUrl = await pdfService.uploadPDF(pdfBuffer, `prescription-${prescriptionId}`);

    const prescription = await prisma.prescription.create({
      data: { appointmentId, content, pdfUrl, deliveryMethod },
    });

    // Envoyer selon la méthode choisie
    const patientPhone = appointment.patient.user.phone;
    const doctorName = `${appointment.doctor.prenom} ${appointment.doctor.nom}`;

    if (deliveryMethod === 'SMS') {
      await smsService.sendPrescriptionSMS(patientPhone, pdfUrl);
    } else if (deliveryMethod === 'WHATSAPP') {
      await whatsappService.sendPrescriptionWhatsApp(patientPhone, pdfUrl, doctorName);
    }

    // Mise à jour avec sentAt si envoyé
    if (deliveryMethod !== 'APP') {
      await prisma.prescription.update({
        where: { id: prescription.id },
        data: { sentAt: new Date() },
      });
    }

    // Notification in-app
    await notifService.notifyPrescriptionReady(io, appointment.patient.userId, doctorName);

    res.status(201).json({ ...prescription, pdfUrl });
  } catch (err) {
    next(err);
  }
}

async function getMyPrescriptions(req, res, next) {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) return res.json([]);

    const prescriptions = await prisma.prescription.findMany({
      where: { appointment: { patientId: patient.id } },
      include: {
        appointment: {
          include: { doctor: { select: { nom: true, prenom: true, specialite: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
}

async function getPrescriptionById(req, res, next) {
  try {
    const { id } = req.params;
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: { select: { phone: true } } } },
            patient: { include: { user: { select: { phone: true } } } },
          },
        },
      },
    });
    if (!prescription) return res.status(404).json({ message: 'Ordonnance introuvable' });

    const isDoctor = prescription.appointment.doctor.userId === req.user.id;
    const isPatient = prescription.appointment.patient.userId === req.user.id;
    if (!isDoctor && !isPatient && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(prescription);
  } catch (err) {
    next(err);
  }
}

async function sendPrescription(req, res, next) {
  try {
    const { id } = req.params;
    const { method } = req.body; // 'SMS' | 'WHATSAPP'

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: { include: { user: true } },
          },
        },
      },
    });
    if (!prescription) return res.status(404).json({ message: 'Ordonnance introuvable' });
    if (prescription.appointment.doctor.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const patientPhone = prescription.appointment.patient.user.phone;
    const doctorName = `${prescription.appointment.doctor.prenom} ${prescription.appointment.doctor.nom}`;

    if (method === 'SMS') {
      await smsService.sendPrescriptionSMS(patientPhone, prescription.pdfUrl);
    } else if (method === 'WHATSAPP') {
      await whatsappService.sendPrescriptionWhatsApp(patientPhone, prescription.pdfUrl, doctorName);
    } else {
      return res.status(400).json({ message: 'Méthode invalide: SMS ou WHATSAPP' });
    }

    await prisma.prescription.update({
      where: { id },
      data: { deliveryMethod: method, sentAt: new Date() },
    });

    res.json({ message: `Ordonnance envoyée par ${method}` });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPrescription, getMyPrescriptions, getPrescriptionById, sendPrescription, createRules };
