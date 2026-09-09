import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Returns the raw OTP string.
 */
export const generateSecureOtp = (): string => {
  // Generate a random number between 100000 and 999999
  const randomBuffer = crypto.randomBytes(4);
  const randomNumber = randomBuffer.readUInt32BE(0);
  const otp = (randomNumber % 900000) + 100000;
  return otp.toString();
};

/**
 * Generate a cryptographically secure random token for password resets.
 * Returns a hex string.
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a sensitive value (like an OTP or Token) for database storage.
 * Uses bcrypt for OTPs/tokens to resist database compromise.
 * Cost factor 10 is sufficient for short-lived tokens/OTPs while being fast enough for rate-limited endpoints.
 */
export const hashSensitiveValue = async (value: string): Promise<string> => {
  return bcrypt.hash(value, 10);
};

/**
 * Verify a raw value against its stored hash.
 */
export const verifySensitiveValue = async (rawValue: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(rawValue, hash);
};

/**
 * Perform a fast SHA-256 hash for identifiers (like IP or destination phone) 
 * where we don't need bcrypt overhead but want to obscure raw PII.
 */
export const fastHash = (value: string): string => {
  return crypto.createHash('sha256').update(value).digest('hex');
};
