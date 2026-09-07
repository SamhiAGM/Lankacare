import { authorize, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';
import { Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorMiddleware';

describe('Authorization Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should call next() if user has the authorized role', () => {
    mockRequest.user = {
      id: 'user123',
      email: 'doctor@moh.gov.lk',
      role: UserRole.DOCTOR,
      name: 'Dr. Fernando',
    };

    const middleware = authorize(UserRole.DOCTOR, UserRole.MINISTRY_ADMIN);
    middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should call next(AppError 403) if user role is not authorized', () => {
    mockRequest.user = {
      id: 'user456',
      email: 'citizen@example.com',
      role: UserRole.CITIZEN,
      name: 'Citizen Jane',
    };

    const middleware = authorize(UserRole.DOCTOR, UserRole.MINISTRY_ADMIN);
    middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(403);
  });

  it('should call next(AppError 401) if user is not attached to request', () => {
    mockRequest.user = undefined;

    const middleware = authorize(UserRole.SUPER_ADMIN);
    middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });
});
