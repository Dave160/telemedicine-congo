const env = require('../config/env');
const { v4: uuidv4 } = require('uuid');

// ─── Split configuration ─────────────────────────────────────────────────────
// Frais plateforme fixes (FCFA). Le reste va au médecin.
const PLATFORM_FEE = 1000;

/**
 * Calcule la répartition d'un paiement
 */
function calculateSplit(totalAmount) {
  const platformFee = PLATFORM_FEE;
  const doctorAmount = totalAmount - platformFee;
  return { platformFee, doctorAmount };
}

// ─── Mock sandbox helpers ────────────────────────────────────────────────────

function mockPaymentResponse(method, amount, phone) {
  const transactionId = `MOCK-${method}-${uuidv4().slice(0, 8).toUpperCase()}`;
  console.log(`\n[PAYMENT MOCK] ${method} | Phone: ${phone} | Amount: ${amount} XAF | TxID: ${transactionId}\n`);
  return { transactionId, status: 'COMPLETED' };
}

// ─── MTN Mobile Money ────────────────────────────────────────────────────────

async function initiateMTNPayment({ amount, phone, externalId, note }) {
  // En dev sans clés : simulation
  if (!env.MTN_COLLECTION_USER_ID || !env.MTN_COLLECTION_API_KEY) {
    return mockPaymentResponse('MTN_MONEY', amount, phone);
  }

  // Intégration réelle MTN MOMO Collection API
  const axios = require('axios');
  const referenceId = uuidv4();

  try {
    // 1. Créer le token d'accès
    const tokenRes = await axios.post(
      `${env.MTN_BASE_URL}/collection/token/`,
      {},
      {
        auth: {
          username: env.MTN_COLLECTION_USER_ID,
          password: env.MTN_COLLECTION_API_KEY,
        },
        headers: {
          'Ocp-Apim-Subscription-Key': env.MTN_SUBSCRIPTION_KEY,
        },
      }
    );
    const accessToken = tokenRes.data.access_token;

    // 2. Initier le paiement (Request to Pay)
    await axios.post(
      `${env.MTN_BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency: 'XAF',
        externalId: externalId || uuidv4(),
        payer: { partyIdType: 'MSISDN', partyId: phone },
        payerMessage: note || 'Consultation TéléMéd Congo',
        payeeNote: note || 'Paiement consultation médicale',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': env.NODE_ENV === 'production' ? 'mtncongo' : 'sandbox',
          'Ocp-Apim-Subscription-Key': env.MTN_SUBSCRIPTION_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return { transactionId: referenceId, status: 'PENDING' };
  } catch (error) {
    console.error('[MTN Payment Error]', error.response?.data || error.message);
    throw new Error('Échec paiement MTN Mobile Money');
  }
}

// ─── Airtel Money ────────────────────────────────────────────────────────────

async function initiateAirtelPayment({ amount, phone, reference, note }) {
  // En dev sans clés : simulation
  if (!env.AIRTEL_CLIENT_ID || !env.AIRTEL_CLIENT_SECRET) {
    return mockPaymentResponse('AIRTEL_MONEY', amount, phone);
  }

  const axios = require('axios');

  try {
    // 1. Obtenir le token OAuth
    const tokenRes = await axios.post(
      `${env.AIRTEL_BASE_URL}/auth/oauth2/token`,
      {
        client_id: env.AIRTEL_CLIENT_ID,
        client_secret: env.AIRTEL_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const accessToken = tokenRes.data.access_token;

    // 2. Initier le paiement
    const payRes = await axios.post(
      `${env.AIRTEL_BASE_URL}/merchant/v1/payments/`,
      {
        reference: reference || uuidv4(),
        subscriber: { country: env.AIRTEL_COUNTRY, currency: env.AIRTEL_CURRENCY, msisdn: phone },
        transaction: { amount, country: env.AIRTEL_COUNTRY, currency: env.AIRTEL_CURRENCY, id: uuidv4() },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Country': env.AIRTEL_COUNTRY,
          'X-Currency': env.AIRTEL_CURRENCY,
        },
      }
    );

    return {
      transactionId: payRes.data.data?.transaction?.id || uuidv4(),
      status: 'PENDING',
    };
  } catch (error) {
    console.error('[Airtel Payment Error]', error.response?.data || error.message);
    throw new Error('Échec paiement Airtel Money');
  }
}

// ─── Unified payment initiator ───────────────────────────────────────────────

/**
 * Lance un paiement selon la méthode
 * @param {'MTN_MONEY'|'AIRTEL_MONEY'|'CARD'} method
 * @param {{ amount, phone, appointmentId, note }} options
 * @returns {{ transactionId, status, platformFee, doctorAmount }}
 */
async function initiatePayment(method, { amount, phone, appointmentId, note }) {
  const { platformFee, doctorAmount } = calculateSplit(amount);

  let result;
  if (method === 'MTN_MONEY') {
    result = await initiateMTNPayment({ amount, phone, externalId: appointmentId, note });
  } else if (method === 'AIRTEL_MONEY') {
    result = await initiateAirtelPayment({ amount, phone, reference: appointmentId, note });
  } else {
    // Carte bancaire (mock)
    result = mockPaymentResponse('CARD', amount, phone);
  }

  return { ...result, platformFee, doctorAmount };
}

module.exports = {
  calculateSplit,
  initiatePayment,
  PLATFORM_FEE,
};
