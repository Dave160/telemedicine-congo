const prisma = require('../config/database');
const notifService = require('../services/notification.service');

async function getUsers(req, res, next) {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
          patient: { select: { nom: true, prenom: true } },
          doctor: { select: { nom: true, prenom: true, specialite: true, isVerified: true, subscriptionActive: true } },
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total });
  } catch (err) {
    next(err);
  }
}

async function getPendingDoctors(req, res, next) {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isVerified: false },
      include: { user: { select: { phone: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
}

async function verifyDoctor(req, res, next) {
  try {
    const { id } = req.params;
    const { approve } = req.body; // true = approuver, false = rejeter
    const io = req.app.get('io');

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ message: 'Médecin introuvable' });

    await prisma.doctor.update({ where: { id }, data: { isVerified: approve } });

    const message = approve
      ? 'Votre compte médecin a été validé. Vous pouvez maintenant utiliser la plateforme.'
      : 'Votre demande de compte médecin a été refusée. Contactez le support.';

    await notifService.notify(io, doctor.userId, {
      type: approve ? 'DOCTOR_VERIFIED' : 'DOCTOR_REJECTED',
      title: approve ? 'Compte validé ✓' : 'Demande refusée',
      body: message,
    });

    res.json({ message: approve ? 'Médecin approuvé' : 'Médecin rejeté' });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPatients,
      totalDoctors,
      verifiedDoctors,
      totalAppointments,
      completedAppointments,
      monthlyAppointments,
      totalRevenue,
      monthlyRevenue,
      pendingDoctors,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.doctor.count({ where: { isVerified: true } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { platformFee: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
        _sum: { platformFee: true },
      }),
      prisma.doctor.count({ where: { isVerified: false } }),
    ]);

    res.json({
      users: { patients: totalPatients, doctors: totalDoctors, verifiedDoctors, pendingDoctors },
      appointments: { total: totalAppointments, completed: completedAppointments, thisMonth: monthlyAppointments },
      revenue: {
        total: totalRevenue._sum.platformFee || 0,
        thisMonth: monthlyRevenue._sum.platformFee || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllPayments(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { status } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          appointment: {
            include: {
              patient: { select: { nom: true, prenom: true } },
              doctor: { select: { nom: true, prenom: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({ payments, total });
  } catch (err) {
    next(err);
  }
}

async function subscribeDoctor(req, res, next) {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ message: 'Médecin introuvable' });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    await prisma.doctorSubscription.create({
      data: { doctorId: id, startDate, endDate, status: 'COMPLETED' },
    });

    await prisma.doctor.update({
      where: { id },
      data: { subscriptionActive: true, subscriptionEnd: endDate },
    });

    res.json({ message: 'Abonnement activé jusqu\'au ' + endDate.toLocaleDateString('fr-FR') });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, getPendingDoctors, verifyDoctor, getStats, getAllPayments, subscribeDoctor };
