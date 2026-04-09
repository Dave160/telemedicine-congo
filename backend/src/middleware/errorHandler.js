const env = require('../config/env');

function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'Cette valeur existe déjà', field: err.meta?.target });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Ressource introuvable' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(status).json({
    message,
    ...(env.isDev && { stack: err.stack }),
  });
}

function notFound(req, res) {
  res.status(404).json({ message: `Route introuvable: ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFound };
