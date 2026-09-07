import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models/User';
import { AppError } from './errorMiddleware';
import { UserRole } from '../types/enums';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  organization?: string;
  hospitalId?: string;
  scopeLevel?: 'NATIONAL' | 'PROVINCE' | 'DISTRICT' | 'HOSPITAL';
  province?: string;
  district?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: UserRole;
      name: string;
      hospitalId?: string;
      organization?: string;
      district?: string;
      province?: string;
      scopeLevel?: 'NATIONAL' | 'PROVINCE' | 'DISTRICT' | 'HOSPITAL';
    };

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
      throw new AppError('User not found. Please log in again.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 401);
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      hospitalId: decoded.hospitalId || (user.hospitalId ? user.hospitalId.toString() : undefined),
      organization: decoded.organization || user.organization,
      district: decoded.district,
      province: decoded.province,
      scopeLevel: decoded.scopeLevel,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired. Please refresh your session.', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

/**
 * Section 84 & 94 Least-Privilege Scope Authorization
 * Checks: Role -> Permission -> Organization Scope -> Break-Glass Emergency
 */
export const authorizeClinicalPatientAccess = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  // Section 67 & 93: System Admins strictly denied clinical access
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next(
      new AppError(
        'System Administrators are strictly denied clinical patient access per Least Privilege Architecture (Section 67).',
        403
      )
    );
  }

  // Citizens can only access own record
  if (req.user.role === UserRole.CITIZEN) {
    const requestedPatientId = req.params.id || req.params.patientId;
    if (requestedPatientId && requestedPatientId !== req.user.id) {
      return next(
        new AppError('Citizens are forbidden from accessing other patient records.', 403)
      );
    }
  }

  // Doctor / Nurse cross-hospital check
  if (
    req.user.role === UserRole.DOCTOR ||
    req.user.role === UserRole.NURSE ||
    req.user.role === UserRole.HEALTH_WORKER
  ) {
    const targetHospitalId = req.headers['x-target-hospital-id'] as string;
    const breakGlassReason = req.headers['x-break-glass-reason'] as string;

    if (targetHospitalId && req.user.hospitalId && targetHospitalId !== req.user.hospitalId) {
      // Out of assigned hospital! Requires Break-Glass header
      if (!breakGlassReason) {
        return next(
          new AppError(
            'Cross-facility patient record access denied. Emergency Break-Glass justification required.',
            403
          )
        );
      }
    }
  }

  // Hospital Admin cross-hospital check
  if (req.user.role === UserRole.HOSPITAL_ADMIN) {
    const targetHospitalId = req.headers['x-target-hospital-id'] as string;
    if (targetHospitalId && req.user.hospitalId && targetHospitalId !== req.user.hospitalId) {
      return next(
        new AppError(
          'Hospital Administrators can only manage their assigned facility.',
          403
        )
      );
    }
  }

  // District Officer cross-district check
  if (req.user.role === UserRole.DISTRICT_ADMIN) {
    const targetDistrict = req.headers['x-target-district'] as string;
    if (targetDistrict && req.user.district && targetDistrict.toLowerCase() !== req.user.district.toLowerCase()) {
      return next(
        new AppError(
          'District Health Officers can only access authorized information within their assigned district.',
          403
        )
      );
    }
  }

  // Provincial Officer cross-province check
  if (req.user.role === UserRole.PROVINCIAL_ADMIN) {
    const targetProvince = req.headers['x-target-province'] as string;
    if (targetProvince && req.user.province && targetProvince.toLowerCase() !== req.user.province.toLowerCase()) {
      return next(
        new AppError(
          'Provincial Health Officers can only access authorized information within their assigned province.',
          403
        )
      );
    }
  }

  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
      req.user = decoded;
    }
    next();
  } catch {
    next();
  }
};
