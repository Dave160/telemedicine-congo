const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/database');

/**
 * Middleware d'authentification JWT
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token d\'authentification manquant' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });
    if (!user.isVerified) return res.status(401).json({ message: 'Compte non vérifié' });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token invalide' });
  }
}

/**
 * Middleware de vérification de rôle
 * @param {...string} roles - Rôles autorisés (PATIENT, DOCTOR, ADMIN)
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
