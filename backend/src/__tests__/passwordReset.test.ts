import mongoose from 'mongoose';
import { User } from '../models/User';
import { PasswordResetOtp, OtpPurpose, OtpChannel } from '../models/PasswordResetOtp';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { AuditLog } from '../models/AuditLog';
import {
  requestPasswordReset,
  verifyOtp,
  resetPassword,
} from '../controllers/passwordResetController';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

describe('Password Reset & OTP Flow', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let resJsonMock: jest.Mock;
  let resStatusMock: jest.Mock;

  beforeEach(() => {
    resJsonMock = jest.fn();
    resStatusMock = jest.fn().mockReturnValue({ json: resJsonMock });
    mockReq = {
      body: {},
      ip: '127.0.0.1',
    };
    mockRes = {
      status: resStatusMock,
    };
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('requestPasswordReset', () => {
    it('should return success but not reveal if user does not exist', async () => {
      // Mock User.findOne to return null
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

      mockReq.body = { identifier: 'unknown@example.com' };

      await requestPasswordReset(mockReq as Request, mockRes as Response);

      expect(resStatusMock).toHaveBeenCalledWith(200);
      expect(resJsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'If an account exists for the information provided, a verification code will be sent.',
      });
    });

    it('should create an OTP and AuditLog if user exists', async () => {
      const mockUser = { _id: new mongoose.Types.ObjectId(), email: 'valid@example.com' };
      
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(PasswordResetOtp, 'findOne').mockReturnValueOnce({
        sort: jest.fn().mockResolvedValueOnce(null)
      } as any); // No recent OTP
      jest.spyOn(PasswordResetOtp, 'deleteMany').mockResolvedValueOnce({} as any);
      jest.spyOn(PasswordResetOtp, 'create').mockResolvedValueOnce({} as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValueOnce({} as any);

      mockReq.body = { identifier: 'valid@example.com' };

      await requestPasswordReset(mockReq as Request, mockRes as Response);

      expect(PasswordResetOtp.create).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalled();
      expect(resStatusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('verifyOtp', () => {
    it('should reject invalid or expired OTP', async () => {
      const mockUser = { _id: new mongoose.Types.ObjectId(), email: 'valid@example.com' };
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser as any);
      
      // Mock no active OTP found
      jest.spyOn(PasswordResetOtp, 'findOne').mockReturnValueOnce({
        sort: jest.fn().mockResolvedValueOnce(null)
      } as any);

      mockReq.body = { identifier: 'valid@example.com', otp: '123456' };

      await verifyOtp(mockReq as Request, mockRes as Response);

      expect(resStatusMock).toHaveBeenCalledWith(400);
      expect(resJsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'This verification code is expired or invalid. Request a new code.',
      });
    });

    it('should successfully verify OTP and return token', async () => {
      const mockUser = { _id: new mongoose.Types.ObjectId(), email: 'valid@example.com' };
      const rawOtp = '123456';
      const otpHash = await bcrypt.hash(rawOtp, 10);
      
      const mockOtp = {
        _id: new mongoose.Types.ObjectId(),
        user: mockUser._id,
        otpHash,
        expiresAt: new Date(Date.now() + 50000),
        attemptCount: 0,
        maxAttempts: 5,
        save: jest.fn().mockResolvedValueOnce(true)
      };

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(PasswordResetOtp, 'findOne').mockReturnValueOnce({
        sort: jest.fn().mockResolvedValueOnce(mockOtp)
      } as any);
      jest.spyOn(PasswordResetToken, 'create').mockResolvedValueOnce({} as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValueOnce({} as any);

      mockReq.body = { identifier: 'valid@example.com', otp: rawOtp };

      await verifyOtp(mockReq as Request, mockRes as Response);

      expect(mockOtp.save).toHaveBeenCalled();
      expect(PasswordResetToken.create).toHaveBeenCalled();
      expect(resStatusMock).toHaveBeenCalledWith(200);
      expect(resJsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          resetToken: expect.any(String),
        })
      );
    });
  });

  describe('resetPassword', () => {
    it('should reject mismatched passwords', async () => {
      mockReq.body = {
        resetToken: '123',
        newPassword: 'Password123!',
        confirmPassword: 'Password456!'
      };

      await resetPassword(mockReq as Request, mockRes as Response);

      expect(resStatusMock).toHaveBeenCalledWith(400);
      expect(resJsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Passwords do not match.',
      });
    });

    it('should reject weak passwords', async () => {
      mockReq.body = {
        resetToken: '123',
        newPassword: 'password123',
        confirmPassword: 'password123'
      };

      await resetPassword(mockReq as Request, mockRes as Response);

      expect(resStatusMock).toHaveBeenCalledWith(400);
      expect(resJsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Password must be at least 12 characters long.',
      });
    });
  });
});
