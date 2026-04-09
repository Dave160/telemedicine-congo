const prisma = require('../config/database');
const paymentService = require('../services/payment.service');

const SUBSCRIPTION_AMOUNT = 20000; // FCFA

async function subscribeToPlatform(req, res, next) {
  try {
    const { method, phone } = req.body;
    if (!['MTN_MONEY', 'AIRTEL_MONEY'].includes(method)) {
      return res.status(400).json({ message: 'Méthode de paiement invalide pour l\'abonnement' });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Profil médecin introuvable' });

    const result = await paymentService.initiatePayment(method, {
      amount: SUBSCRIPTION_AMOUNT,
      phone,
      appointmentId: `sub-${doctor.id}`,
      note: 'Abonnement TéléMéd Congo - Médecin',
    });

    if (result.status === 'COMPLETED') {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      await prisma.doctorSubscription.create({
        data: {
          doctorId: doctor.id,
          startDate,
          endDate,
          amount: SUBSCRIPTION_AMOUNT,
          status: 'COMPLETED',
          transactionId: result.transactionId,
        },
      });

      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { subscriptionActive: true, subscriptionEnd: endDate },
      });
    }

    res.json({
      transactionId: result.transactionId,
      status: result.status,
      amount: SUBSCRIPTION_AMOUNT,
    });
  } catch (err) {
    next(err);
  }
}

async function getSubscriptionStatus(req, res, next) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id },
      select: { subscriptionActive: true, subscriptionEnd: true },
    });
    if (!doctor) return res.status(404).json({ message: 'Profil médecin introuvable' });

    const history = await prisma.doctorSubscription.findMany({
      where: { doctor: { userId: req.user.id } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({ ...doctor, history });
  } catch (err) {
    next(err);
  }
}

module.exports = { subscribeToPlatform, getSubscriptionStatus, SUBSCRIPTION_AMOUNT };
