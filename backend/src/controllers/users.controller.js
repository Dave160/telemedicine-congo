const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const prisma = require('../config/database');

const updateProfileRules = [
  body('nom').optional().notEmpty().withMessage('Nom ne peut pas être vide'),
  body('prenom').optional().notEmpty().withMessage('Prénom ne peut pas être vide'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nouveau mot de passe minimum 6 caractères'),
];

async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        patient: true,
        doctor: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            specialite: true,
            tarif: true,
            description: true,
            bio: true,
            photo: true,
            isVerified: true,
            isAvailableNow: true,
            subscriptionActive: true,
            subscriptionEnd: true,
          },
        },
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { nom, prenom, dateNaissance, sexe, adresse, email } = req.body;

    // Update email on user if provided
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
      });
      if (existing) return res.status(409).json({ message: 'Email déjà utilisé' });
      await prisma.user.update({ where: { id: userId }, data: { email } });
    }

    if (role === 'PATIENT') {
      const patient = await prisma.patient.upsert({
        where: { userId },
        update: { nom, prenom, dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined, sexe, adresse },
        create: { userId, nom: nom || '', prenom: prenom || '', dateNaissance: dateNaissance ? new Date(dateNaissance) : null, sexe, adresse },
      });
      return res.json(patient);
    }

    if (role === 'DOCTOR') {
      const { specialite, tarif, description, bio } = req.body;
      const doctor = await prisma.doctor.upsert({
        where: { userId },
        update: { nom, prenom, specialite, tarif: tarif ? parseFloat(tarif) : undefined, description, bio },
        create: { userId, nom: nom || '', prenom: prenom || '', specialite: specialite || '', tarif: tarif ? parseFloat(tarif) : 0 },
      });
      return res.json(doctor);
    }

    res.json({ message: 'Profil mis à jour' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, changePassword, updateProfileRules, changePasswordRules };
