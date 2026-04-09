require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { initSocket } = require('./socket/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const doctorsRoutes = require('./routes/doctors.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const messagesRoutes = require('./routes/messages.routes');
const paymentsRoutes = require('./routes/payments.routes');
const prescriptionsRoutes = require('./routes/prescriptions.routes');
const articlesRoutes = require('./routes/articles.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const adminRoutes = require('./routes/admin.routes');
const subscriptionRoutes = require('./routes/subscription.routes');

const app = express();
const server = http.createServer(app);

// ─── Socket.io ──────────────────────────────────────────────────────────────
const io = initSocket(server);
app.set('io', io);

// ─── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:19006', 'exp://localhost:19000'],
  credentials: true,
}));
app.use(morgan(env.isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting général
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { message: 'Trop de requêtes. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Rate limiting strict pour l'auth
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
}));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api', messagesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', subscriptionRoutes);

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────────────────────
server.listen(env.PORT, () => {
  console.log(`\n🏥 TéléMéd Congo API démarré`);
  console.log(`   Environnement : ${env.NODE_ENV}`);
  console.log(`   Port         : ${env.PORT}`);
  console.log(`   URL          : http://localhost:${env.PORT}`);
  console.log(`   Health       : http://localhost:${env.PORT}/health\n`);
});

module.exports = { app, server };
