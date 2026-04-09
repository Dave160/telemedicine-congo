const env = require('../config/env');

/**
 * Envoie un message WhatsApp via l'API WhatsApp Business (ou simulation)
 */
async function sendWhatsAppMessage(to, message) {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) {
    console.log(`\n[WHATSAPP SIMULATION] To: ${to}\nMessage: ${message}\n`);
    return { success: true, simulated: true };
  }

  const axios = require('axios');
  try {
    const response = await axios.post(
      `${env.WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[WhatsApp Error]', error.response?.data || error.message);
    throw new Error('Échec envoi WhatsApp');
  }
}

/**
 * Envoie une ordonnance par WhatsApp (lien PDF)
 */
async function sendPrescriptionWhatsApp(phone, prescriptionUrl, doctorName) {
  const message = `*TéléMéd Congo*\nVotre ordonnance de Dr ${doctorName} est disponible :\n${prescriptionUrl}\n\n_Valable selon les instructions du médecin._`;
  return sendWhatsAppMessage(phone, message);
}

module.exports = { sendWhatsAppMessage, sendPrescriptionWhatsApp };
