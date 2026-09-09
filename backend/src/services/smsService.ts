import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const SMS_API_KEY = process.env.SMS_API_KEY || '';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'LankaCare';
const SMS_PROVIDER_URL = process.env.SMS_PROVIDER_URL || '';

/**
 * Format local Sri Lankan mobile numbers (077...) to standard international format (+9477...)
 * If it's already international, return as is (normalized to +94...)
 */
export const normalizeSriLankanPhoneNumber = (phone: string): string | null => {
  if (!phone) return null;
  // Remove spaces, hyphens
  let clean = phone.replace(/[\s-]/g, '');
  
  // E.g. +94771234567
  if (clean.startsWith('+94') && clean.length === 12) {
    return clean;
  }
  
  // E.g. 94771234567
  if (clean.startsWith('94') && clean.length === 11) {
    return '+' + clean;
  }
  
  // E.g. 0771234567
  if (clean.startsWith('07') && clean.length === 10) {
    return '+94' + clean.substring(1);
  }
  
  return null; // Invalid format
};

/**
 * Send an OTP via SMS (generic implementation).
 */
export const sendPasswordResetOtpSms = async (phone: string, otp: string, expiryMinutes: number): Promise<boolean> => {
  try {
    const normalizedPhone = normalizeSriLankanPhoneNumber(phone);
    if (!normalizedPhone) {
      console.error('Invalid phone number format for SMS:', phone);
      return false;
    }

    if (!SMS_API_KEY || !SMS_PROVIDER_URL) {
      console.warn('SMS credentials not configured. SMS OTP simulated but NOT sent.');
      return false;
    }

    const message = `LankaCare password reset code: ${otp}. Expires in ${expiryMinutes} minutes. Do not share this code.`;

    const response = await fetch(SMS_PROVIDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_API_KEY}`,
      },
      body: JSON.stringify({
        sender: SMS_SENDER_ID,
        recipient: normalizedPhone,
        message: message,
      }),
    });

    if (!response.ok) {
      console.error('SMS provider API error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send SMS OTP:', error);
    return false;
  }
};

/**
 * Send security notification via SMS
 */
export const sendPasswordChangeNotificationSms = async (phone: string): Promise<boolean> => {
  try {
    const normalizedPhone = normalizeSriLankanPhoneNumber(phone);
    if (!normalizedPhone || !SMS_API_KEY || !SMS_PROVIDER_URL) {
      return false;
    }

    const message = `Security Alert: Your LankaCare password was changed successfully. If this wasn't you, contact support immediately.`;

    const response = await fetch(SMS_PROVIDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_API_KEY}`,
      },
      body: JSON.stringify({
        sender: SMS_SENDER_ID,
        recipient: normalizedPhone,
        message: message,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send SMS security notification:', error);
    return false;
  }
};
