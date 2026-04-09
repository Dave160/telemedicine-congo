const env = require('../config/env');

// En développement (AT_API_KEY vide) : simulation locale — OTP loggué en console
// En production : Africa's Talking SMS réel

let africastalking = null;

function getATClient() {
  if (!africastalking && env.AT_API_KEY) {
    const AfricasTalking = require('africastalking');
    africastalking = AfricasTalking({
      apiKey: env.AT_API_KEY,
      username: env.AT_USERNAME,
    });
  }
  return africastalking;
}

/**
 * Envoie un SMS
 * @param {string} to - Numéro de téléphone (format international ex: +242XXXXXXXX)
 * @param {string} message - Contenu du message
 */
async function sendSMS(to, message) {
  const at = getATClient();

  if (!at) {
    // Mode simulation développement
    console.log(`\n[SMS SIMULATION] To: ${to}\nMessage: ${message}\n`);
    return { success: true, simulated: true };
  }

  try {
    const sms = at.SMS;
    const result = await sms.send({
      to: [to],
      message,
      from: env.AT_SENDER_ID,
    });
    return { success: true, result };
  } catch (error) {
    console.error('[SMS Error]', error.message);
    throw new Error('Échec envoi SMS: ' + error.message);
  }
}

/**
 * Génère un code OTP à 6 chiffres
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envoie un OTP par SMS
 */
async function sendOTP(phone, otp) {
  const message = `Votre code de vérification TéléMéd Congo est : ${otp}. Valide 10 minutes. Ne le partagez pas.`;
  return sendSMS(phone, message);
}

/**
 * Envoie un rappel de rendez-vous
 */
async function sendAppointmentReminder(phone, doctorName, date) {
  const message = `Rappel TéléMéd : Votre consultation avec Dr ${doctorName} est prévue le ${date}. Connectez-vous 5 min avant.`;
  return sendSMS(phone, message);
}

/**
 * Envoie une notification de confirmation de paiement
 */
async function sendPaymentConfirmation(phone, amount, method) {
  const message = `TéléMéd Congo : Paiement de ${amount} FCFA via ${method} confirmé. Votre consultation est réservée.`;
  return sendSMS(phone, message);
}

/**
 * Envoie une ordonnance par SMS (lien ou texte court)
 */
async function sendPrescriptionSMS(phone, prescriptionUrl) {
  const message = `TéléMéd Congo : Votre ordonnance est disponible : ${prescriptionUrl}`;
  return sendSMS(phone, message);
}

module.exports = {
  sendSMS,
  generateOTP,
  sendOTP,
  sendAppointmentReminder,
  sendPaymentConfirmation,
  sendPrescriptionSMS,
};
