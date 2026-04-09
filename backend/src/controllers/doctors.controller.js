const { body } = require('express-validator');
const prisma = require('../config/database');

// ─── Validation ───────────────────────────────────────────────────────────────

const profileRules = [
  body('nom').notEmpty().withMessage('Nom requis'),
  body('prenom').notEmpty().withMessage('Prénom requis'),
  body('specialite').notEmpty().withMessage('Spécialité requise'),
  body('tarif').isFloat({ min: 0 }).withMessage('Tarif invalide'),
];

const availabilityRules = [
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Format startTime: HH:MM'),
  body('endTime').matches(/^\d{2}:\d{2}$/).withMessage('Format endTime: HH:MM'),
];

// ─── Controllers ─────────────────────────────────────────────────────────────

async function listDoctors(req, res, next) {
  try {
    const { specialite, available, search, page = 1, limit = 20 } = req.query;
    const where = { isVerified: true };

    if (specialite) where.specialite = { contains: specialite, mode: 'insensitive' };
    if (available === 'true') where.isAvailableNow = true;
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { specialite: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        select: {
          id: true,
          nom: true,
          prenom: true,
          specialite: true,
          tarif: true,
          description: true,
          photo: true,
          isAvailableNow: true,
          user: { select: { id: true } },
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: [{ isAvailableNow: 'desc' }, { nom: 'asc' }],
      }),
      prisma.doctor.count({ where }),
    ]);

    res.json({ doctors, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function getDoctorById(req, res, next) {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { phone: true, email: true } },
        availabilities: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
      },
    });
    if (!doctor) return res.status(404).json({ message: 'Médecin introuvable' });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { nom, prenom, specialite, tarif, description, bio } = req.body;
    const doctor = await prisma.doctor.update({
      where: { userId: req.user.id },
      data: {
        nom,
        prenom,
        specialite,
        tarif: tarif ? parseFloat(tarif) : undefined,
        description,
        bio,
      },
    });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
}

async function toggleOnlineStatus(req, res, next) {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Profil médecin introuvable' });
    if (!doctor.subscriptionActive) {
      return res.status(403).json({ message: 'Abonnement inactif. Veuillez vous abonner.' });
    }

    const updated = await prisma.doctor.update({
      where: { id: doctor.id },
      data: { isAvailableNow: !doctor.isAvailableNow },
    });
    res.json({ isAvailableNow: updated.isAvailableNow });
  } catch (err) {
    next(err);
  }
}

async function getAvailabilities(req, res, next) {
  try {
    const doctorId = req.params.doctorId || undefined;
    let doctor;

    if (doctorId) {
      doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    } else {
      doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    }

    if (!doctor) return res.status(404).json({ message: 'Médecin introuvable' });

    const availabilities = await prisma.availability.findMany({
      where: { doctorId: doctor.id, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json(availabilities);
  } catch (err) {
    next(err);
  }
}

async function createAvailability(req, res, next) {
  try {
    const { dayOfWeek, specificDate, startTime, endTime } = req.body;
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Profil médecin introuvable' });

    const av = await prisma.availability.create({
      data: {
        doctorId: doctor.id,
        dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : null,
        specificDate: specificDate ? new Date(specificDate) : null,
        startTime,
        endTime,
      },
    });
    res.status(201).json(av);
  } catch (err) {
    next(err);
  }
}

async function updateAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const { dayOfWeek, specificDate, startTime, endTime, isActive } = req.body;
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });

    const av = await prisma.availability.findFirst({
      where: { id, doctorId: doctor?.id },
    });
    if (!av) return res.status(404).json({ message: 'Disponibilité introuvable' });

    const updated = await prisma.availability.update({
      where: { id },
      data: {
        dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
        specificDate: specificDate ? new Date(specificDate) : undefined,
        startTime,
        endTime,
        isActive,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    const av = await prisma.availability.findFirst({ where: { id, doctorId: doctor?.id } });
    if (!av) return res.status(404).json({ message: 'Disponibilité introuvable' });

    await prisma.availability.delete({ where: { id } });
    res.json({ message: 'Disponibilité supprimée' });
  } catch (err) {
    next(err);
  }
}

async function getAvailableNow(req, res, next) {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isVerified: true, isAvailableNow: true, subscriptionActive: true },
      select: {
        id: true,
        nom: true,
        prenom: true,
        specialite: true,
        tarif: true,
        photo: true,
        isAvailableNow: true,
      },
    });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDoctors,
  getDoctorById,
  updateProfile,
  toggleOnlineStatus,
  getAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getAvailableNow,
  profileRules,
  availabilityRules,
};
