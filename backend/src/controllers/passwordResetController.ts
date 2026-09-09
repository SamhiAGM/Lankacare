import { Request, Response } from 'express';
import { User } from '../models/User';
import { PasswordResetOtp, OtpPurpose, OtpChannel } from '../models/PasswordResetOtp';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { AuditLog } from '../models/AuditLog';
import { AuditAction } from '../types/enums';
import { generateSecureOtp, generateResetToken, hashSensitiveValue, verifySensitiveValue, fastHash } from '../services/otpService';
import { sendPasswordResetOtpEmail, sendPasswordChangeNotificationEmail } from '../services/emailService';
import { normalizeSriLankanPhoneNumber, sendPasswordResetOtpSms, sendPasswordChangeNotificationSms } from '../services/smsService';
import mongoose from 'mongoose';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const TOKEN_EXPIRY_MINUTES = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || '10', 10);
const MAX_OTP_ATTEMPTS = 5;

/**
 * Handle POST /api/auth/forgot-password
 * Request an OTP via email or SMS. Does NOT reveal whether the user exists.
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Email or mobile number is required.' });
  }

  // Generic success message to prevent user enumeration
  const genericSuccessMessage = 'If an account exists for the information provided, a verification code will be sent.';

  try {
    const isEmail = identifier.includes('@');
    const normalizedPhone = !isEmail ? normalizeSriLankanPhoneNumber(identifier) : null;
    
    // Find user
    const query = isEmail 
      ? { email: identifier.toLowerCase().trim() }
      : { phone: normalizedPhone || identifier };

    const user = await User.findOne(query);

    if (!user) {
      // Simulate delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
      return res.status(200).json({ success: true, message: genericSuccessMessage });
    }

    // Determine channel
    let channel: OtpChannel;
    let destination: string;
    
    if (isEmail && user.email) {
      channel = OtpChannel.EMAIL;
      destination = user.email;
    } else if (user.phone) {
      channel = OtpChannel.SMS;
      destination = user.phone;
    } else {
      // Account exists but no contact method (unlikely, but handle it)
      return res.status(200).json({ success: true, message: genericSuccessMessage });
    }

    // Check rate limit for recent OTPs for this user
    const recentOtp = await PasswordResetOtp.findOne({ 
      user: user._id, 
      purpose: OtpPurpose.PASSWORD_RESET 
    }).sort({ createdAt: -1 });

    if (recentOtp && recentOtp.createdAt.getTime() > Date.now() - 60 * 1000) {
      // Requested within the last 60 seconds
      return res.status(429).json({ success: false, message: 'Please wait before requesting another code.' });
    }

    // Generate secure OTP
    const rawOtp = generateSecureOtp();
    const otpHash = await hashSensitiveValue(rawOtp);
    const destinationHash = fastHash(destination);
    const requestIpHash = fastHash(req.ip || 'unknown');

    // Invalidate older active OTPs for this user
    await PasswordResetOtp.deleteMany({ user: user._id, purpose: OtpPurpose.PASSWORD_RESET });

    // Store new OTP
    await PasswordResetOtp.create({
      user: user._id,
      purpose: OtpPurpose.PASSWORD_RESET,
      channel,
      destinationHash,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      attemptCount: 0,
      maxAttempts: MAX_OTP_ATTEMPTS,
      requestIpHash,
    });

    // Send OTP asynchronously
    if (channel === OtpChannel.EMAIL) {
      await sendPasswordResetOtpEmail(destination, rawOtp, OTP_EXPIRY_MINUTES);
    } else {
      await sendPasswordResetOtpSms(destination, rawOtp, OTP_EXPIRY_MINUTES);
    }

    // Audit log
    await AuditLog.create({
      user: user._id,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      resource: 'User',
      resourceId: user._id,
      ipAddress: requestIpHash, // Storing hashed IP in audit log for privacy
    });

    return res.status(200).json({ success: true, message: genericSuccessMessage });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Handle POST /api/auth/verify-password-reset-otp
 */
export const verifyOtp = async (req: Request, res: Response) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ success: false, message: 'Identifier and OTP are required.' });
  }

  try {
    const isEmail = identifier.includes('@');
    const normalizedPhone = !isEmail ? normalizeSriLankanPhoneNumber(identifier) : null;
    
    const query = isEmail 
      ? { email: identifier.toLowerCase().trim() }
      : { phone: normalizedPhone || identifier };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid OTP or expired.' });
    }

    // Find the active OTP for this user
    const activeOtp = await PasswordResetOtp.findOne({ 
      user: user._id, 
      purpose: OtpPurpose.PASSWORD_RESET,
      usedAt: { $exists: false }
    }).sort({ createdAt: -1 });

    if (!activeOtp || activeOtp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'This verification code is expired or invalid. Request a new code.' });
    }

    if (activeOtp.attemptCount >= activeOtp.maxAttempts) {
      // Invalidate the OTP
      activeOtp.usedAt = new Date();
      await activeOtp.save();
      return res.status(400).json({ success: false, message: 'Too many incorrect attempts. This verification code is no longer valid. Request a new code.' });
    }

    // Increment attempt count
    activeOtp.attemptCount += 1;
    await activeOtp.save();

    // Verify OTP
    const isValid = await verifySensitiveValue(otp.toString(), activeOtp.otpHash);
    
    if (!isValid) {
      await AuditLog.create({
        user: user._id,
        action: AuditAction.OTP_VERIFICATION_FAILED,
        resource: 'User',
        resourceId: user._id,
      });
      return res.status(400).json({ success: false, message: 'Incorrect verification code.' });
    }

    // Mark OTP as used
    activeOtp.usedAt = new Date();
    await activeOtp.save();

    // Generate secure short-lived reset token
    const rawToken = generateResetToken();
    const tokenHash = await hashSensitiveValue(rawToken);

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000),
    });

    await AuditLog.create({
      user: user._id,
      action: AuditAction.OTP_VERIFIED,
      resource: 'User',
      resourceId: user._id,
    });

    return res.status(200).json({ 
      success: true, 
      resetToken: `${user._id}:${rawToken}`
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Handle POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  if (newPassword.length < 12) {
    return res.status(400).json({ success: false, message: 'Password must be at least 12 characters long.' });
  }

  // Prevent obviously weak passwords
  const weakPasswords = ['password123', '123456789', 'lankacare123', 'qwertyuiop', '000000000000'];
  if (weakPasswords.includes(newPassword.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'This password is too weak or commonly used.' });
  }

  try {
    // Find an unused valid token for any user (since we only receive the raw token from client)
    // Actually, we must search all active tokens. Wait, bcrypt comparison requires us to have the hash, so we cannot just search tokenHash natively unless we pass userId or email.
    // Wait: If resetToken is purely random and long (32 hex bytes = 64 chars), we can store the SHA256 of it as an indexable field, and bcrypt the actual token just to be super safe. 
    // OR we can just store the token's SHA-256 in the DB directly, as it has 256-bit entropy, so it cannot be reversed.
    // Let's adjust this: if we only pass `resetToken`, we can't efficiently `bcrypt.compare` against all DB tokens. We need to look it up by the SHA-256 hash.
    
    const tokenSha256 = fastHash(resetToken);
    
    // We didn't change the token model to store tokenSha256, but we can do that right now. In previous step we stored bcrypt hash, which is unsearchable. 
    // Wait, let's fix it: Since resetToken is 256-bit secure random string, SHA-256 is entirely secure to store (unlike passwords).
    // Let's assume PasswordResetToken stores tokenSha256 instead of bcrypt hash. Let's query by it.
    
    // Actually, earlier I wrote `hashSensitiveValue(rawToken)` which uses bcrypt.
    // Let me update how we query: Since we need to query by token, the client needs to pass the identifier too, OR we just store SHA-256 for the token.
    // Let's assume we store bcrypt. To avoid O(N) bcrypt compares, the client MUST pass the identifier (email/phone) in the reset request, OR we change the token strategy.
    // Let's change the token strategy: the token returned to client can be `userId:rawToken`. Then we can extract userId.
    
    const parts = resetToken.split(':');
    if (parts.length !== 2) {
      return res.status(400).json({ success: false, message: 'Invalid reset token format.' });
    }
    
    const [userIdHex, rawRandomToken] = parts;
    
    if (!mongoose.Types.ObjectId.isValid(userIdHex)) {
      return res.status(400).json({ success: false, message: 'Invalid token.' });
    }

    const userId = new mongoose.Types.ObjectId(userIdHex);

    const activeTokens = await PasswordResetToken.find({ 
      user: userId, 
      used: false,
      expiresAt: { $gt: new Date() } 
    });

    if (activeTokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    let matchedToken = null;
    for (const token of activeTokens) {
      if (await verifySensitiveValue(rawRandomToken, token.tokenHash)) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    // Token verified.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is suspended or disabled.' });
    }

    // Update password
    user.password = newPassword; 
    // Mongoose schema pre('save') hook handles hashing for User model
    // We also invalidate existing sessions by regenerating the refreshToken or updating passwordChangedAt
    user.refreshToken = undefined;
    await user.save();

    // Mark token as used
    matchedToken.used = true;
    await matchedToken.save();

    // Delete all other active reset tokens and OTPs to clean up
    await PasswordResetToken.deleteMany({ user: user._id, used: false });
    await PasswordResetOtp.deleteMany({ user: user._id, usedAt: { $exists: false } });

    // Audit log
    await AuditLog.create({
      user: user._id,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      resource: 'User',
      resourceId: user._id,
    });

    // Notify user
    if (user.email) {
      await sendPasswordChangeNotificationEmail(user.email);
    } else if (user.phone) {
      await sendPasswordChangeNotificationSms(user.phone);
    }

    return res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
