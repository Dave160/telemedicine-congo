const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const prisma = require('../config/database');
const env = require('../config/env');
const smsService = require('../services/sms.service');

// ─── Validation rules ────────────────────────────────────────────────────────

const registerRules = [
  body('phone').notEmpty().withMessage('Numéro de téléphone requis'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('role').optional().isIn(['PATIENT', 'DOCTOR']).withMessage('Rôle invalide'),
];

const loginRules = [
  body('phone').notEmpty().withMessage('Numéro requis'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

const verifyOTPRules = [
  body('phone').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Code OTP invalide'),
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
}

// ─── Controllers ─────────────────────────────────────────────────────────────

async function register(req, res, next) {
  try {
    const { phone, email, password, role = 'PATIENT' } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });
    if (existing) {
      return res.status(409).json({ message: 'Ce numéro ou email est déjà utilisé' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = smsService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await prisma.user.create({
      data: { phone, email, passwordHash, role, otp, otpExpires },
    });

    await smsService.sendOTP(phone, otp);

    res.status(201).json({
      message: 'Compte créé. Vérifiez votre téléphone pour le code OTP.',
      userId: user.id,
      ...(env.isDev && { devOtp: otp }), // En dev : afficher l'OTP dans la réponse
    });
  } catch (err) {
    next(err);
  }
}

async function verifyOTP(req, res, next) {
  try {
    const { phone, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.isVerified) return res.status(400).json({ message: 'Compte déjà vérifié' });
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Code OTP incorrect' });
    }
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Code OTP expiré. Demandez-en un nouveau.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otp: null, otpExpires: null },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    res.json({ message: 'Compte vérifié avec succès', accessToken, refreshToken, role: user.role });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Compte non vérifié. Vérifiez votre téléphone.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Identifiants incorrects' });

    const { accessToken, refreshToken } = generateTokens(user.id);
    res.json({ accessToken, refreshToken, role: user.role, userId: user.id });
  } catch (err) {
    next(err);
  }
}

async function resendOTP(req, res, next) {
  try {
    const { phone } = req.body;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.isVerified) return res.status(400).json({ message: 'Compte déjà vérifié' });

    const otp = smsService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpires } });
    await smsService.sendOTP(phone, otp);

    res.json({
      message: 'Code OTP renvoyé',
      ...(env.isDev && { devOtp: otp }),
    });
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token manquant' });

    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });

    const tokens = generateTokens(user.id);
    res.json(tokens);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
    }
    next(err);
  }
}

async function logout(req, res) {
  // Côté client, supprimer les tokens. Côté serveur, on peut blacklister si Redis disponible.
  res.json({ message: 'Déconnecté avec succès' });
}

module.exports = {
  register,
  verifyOTP,
  login,
  resendOTP,
  refreshToken,
  logout,
  registerRules,
  loginRules,
  verifyOTPRules,
};
