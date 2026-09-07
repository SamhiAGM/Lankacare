import { registerSchema, loginSchema, changePasswordSchema } from '../validators/authValidator';
import { UserRole } from '../types/enums';

describe('Auth Validators (Zod Schemas)', () => {
  describe('registerSchema', () => {
    it('should validate a correct registration payload', () => {
      const validData = {
        name: 'Dr. John Doe',
        email: 'john.doe@moh.gov.lk',
        password: 'Password123!',
        phone: '+94771234567',
        role: UserRole.DOCTOR,
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid emails', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'Password123!',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email');
      }
    });

    it('should reject passwords shorter than 8 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject passwords without uppercase characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'PasswordOnly',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'admin@moh.gov.lk',
        password: 'SecretPassword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty passwords', () => {
      const result = loginSchema.safeParse({
        email: 'admin@moh.gov.lk',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate valid current and new passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword99',
      });
      expect(result.success).toBe(true);
    });

    it('should reject weak new passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPassword1',
        newPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });
});
