import { logger } from './logger';
import { config } from '../config/config';
import crypto from 'crypto';

export interface OtpProvider {
  sendOtp(to: string, otp: string, channel: 'sms' | 'email'): Promise<boolean>;
}

export class MockOtpProvider implements OtpProvider {
  async sendOtp(to: string, otp: string, channel: 'sms' | 'email'): Promise<boolean> {
    logger.info(`[MOCK OTP PROVIDER - ${channel.toUpperCase()}] Sending OTP ${otp} to ${to}`);
    // In production, this would return true if sent successfully, false otherwise.
    return true;
  }
}

export class ProductionOtpProvider implements OtpProvider {
  async sendOtp(to: string, otp: string, channel: 'sms' | 'email'): Promise<boolean> {
    if (channel === 'sms') {
      if (!process.env.SMS_PROVIDER_API_KEY) {
        logger.error('SMS provider is not configured. Cannot send OTP.');
        return false;
      }
      logger.info(`[PROD OTP PROVIDER - SMS] Sending OTP to ${to} via configured provider.`);
      // Real implementation would go here (e.g. Twilio, Dialog SMS gateway)
      return true;
    } else {
      if (!process.env.EMAIL_PROVIDER_API_KEY) {
        logger.error('Email provider is not configured. Cannot send OTP.');
        return false;
      }
      logger.info(`[PROD OTP PROVIDER - EMAIL] Sending OTP to ${to} via configured provider.`);
      // Real implementation would go here (e.g. SendGrid, Nodemailer)
      return true;
    }
  }
}

export const otpProvider: OtpProvider = config.nodeEnv === 'production' 
  ? new ProductionOtpProvider() 
  : new MockOtpProvider();

export const generateSecureOtp = (): string => {
  // Generates a secure 6 digit OTP
  return crypto.randomInt(100000, 999999).toString();
};
