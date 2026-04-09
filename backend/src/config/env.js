require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  AT_API_KEY: process.env.AT_API_KEY || '',
  AT_USERNAME: process.env.AT_USERNAME || 'sandbox',
  AT_SENDER_ID: process.env.AT_SENDER_ID || 'TELECONGO',

  MTN_COLLECTION_USER_ID: process.env.MTN_COLLECTION_USER_ID || '',
  MTN_COLLECTION_API_KEY: process.env.MTN_COLLECTION_API_KEY || '',
  MTN_BASE_URL: process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
  MTN_SUBSCRIPTION_KEY: process.env.MTN_SUBSCRIPTION_KEY || '',

  AIRTEL_CLIENT_ID: process.env.AIRTEL_CLIENT_ID || '',
  AIRTEL_CLIENT_SECRET: process.env.AIRTEL_CLIENT_SECRET || '',
  AIRTEL_BASE_URL: process.env.AIRTEL_BASE_URL || 'https://openapi.airtel.africa',
  AIRTEL_COUNTRY: process.env.AIRTEL_COUNTRY || 'CG',
  AIRTEL_CURRENCY: process.env.AIRTEL_CURRENCY || 'XAF',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || '',
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || '',
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',

  get isDev() {
    return this.NODE_ENV === 'development';
  },
  get isProd() {
    return this.NODE_ENV === 'production';
  },
};

module.exports = env;
