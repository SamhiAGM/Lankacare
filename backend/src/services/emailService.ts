import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_PROVIDER_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PROVIDER_PORT || '587', 10),
  secure: process.env.EMAIL_PROVIDER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_PROVIDER_USER || '',
    pass: process.env.EMAIL_PROVIDER_PASS || process.env.EMAIL_PROVIDER_API_KEY || '',
  },
});

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'no-reply@lankacare.gov.lk';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'LankaCare';

/**
 * Send a secure OTP for password reset.
 */
export const sendPasswordResetOtpEmail = async (toEmail: string, otp: string, expiryMinutes: number): Promise<boolean> => {
  try {
    if (!process.env.EMAIL_PROVIDER_USER && !process.env.EMAIL_PROVIDER_API_KEY) {
      console.warn('EMAIL_PROVIDER credentials missing. Email OTP simulated but NOT sent.');
      return false; // Return false to indicate it wasn't actually sent in production
    }

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to: toEmail,
      subject: 'LankaCare Password Reset Verification Code',
      text: `LankaCare Password Reset Request\n\nYour verification code is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes.\n\nIf you did not request a password reset, you can ignore this message. For your security, never share this code with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f766e;">LankaCare Password Reset Request</h2>
          <p>You recently requested to reset the password for your LankaCare account.</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 4px; color: #1e293b;">${otp}</strong>
          </div>
          <p style="color: #b91c1c; font-weight: bold;">This code expires in ${expiryMinutes} minutes.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
            If you did not request a password reset, you can safely ignore this message. For your security, never share this code with anyone.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send email OTP:', error);
    return false;
  }
};

/**
 * Send security notification upon successful password change.
 */
export const sendPasswordChangeNotificationEmail = async (toEmail: string): Promise<boolean> => {
  try {
    if (!process.env.EMAIL_PROVIDER_USER && !process.env.EMAIL_PROVIDER_API_KEY) {
      return false;
    }

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to: toEmail,
      subject: 'Security Alert: Your LankaCare password was changed',
      text: `Your LankaCare password was changed successfully on ${new Date().toUTCString()}.\n\nIf you did not make this change, please contact LankaCare support immediately.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f766e;">Security Alert</h2>
          <p>Your LankaCare password was changed successfully on <strong>${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })} (Sri Lanka Time)</strong>.</p>
          <p style="color: #b91c1c; font-weight: bold; margin-top: 20px;">
            If you did not make this change, please contact LankaCare support immediately to secure your account.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send security notification email:', error);
    return false;
  }
};
