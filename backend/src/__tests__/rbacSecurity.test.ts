import {
  authorize,
  authorizeClinicalPatientAccess,
  AuthRequest,
} from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';
import { Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorMiddleware';

describe('🇱🇰 Section 92 Security Matrix: Role-Based Access & Scoping Tests', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      params: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  // TEST 1: Citizen trying to access administrative API -> DENIED (403)
  it('1. Citizen attempting to access Hospital Admin / Ministry route should be DENIED with 403', () => {
    mockRequest.user = {
      id: 'citizen-101',
      email: 'citizen@example.com',
      role: UserRole.CITIZEN,
      name: 'Sunil Wickramasinghe',
    };

    const adminGuard = authorize(UserRole.HOSPITAL_ADMIN, UserRole.MINISTRY_ADMIN);
    adminGuard(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const err = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
  });

  // TEST 2: Citizen trying to access another citizen's patient record -> DENIED (403)
  it('2. Citizen attempting to access another patient record should be DENIED with 403', () => {
    mockRequest.user = {
      id: 'citizen-101',
      email: 'citizen@example.com',
      role: UserRole.CITIZEN,
      name: 'Sunil Wickramasinghe',
    };
    mockRequest.params = { id: 'patient-999' }; // Other patient

    authorizeClinicalPatientAccess(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const err = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('Citizens are forbidden from accessing other patient records');
  });

  // TEST 3: Doctor from Hospital A trying to access Patient in Hospital B -> DENIED (403) without Break-Glass
  it('3. Doctor from Hospital A accessing Patient in Hospital B without break-glass should be DENIED with 403', () => {
    mockRequest.user = {
      id: 'doc-001',
      email: 'dr.bandara@kinniya.health.gov.lk',
      role: UserRole.DOCTOR,
      name: 'Dr. Amara Bandara',
      hospitalId: 'hosp-kinniya',
    };
    // Target is in NHSL Colombo (hosp-001)
    mockRequest.headers = {
      'x-target-hospital-id': 'hosp-001',
    };

    authorizeClinicalPatientAccess(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const err = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('Emergency Break-Glass justification required');
  });

  // TEST 4: Doctor with verified Break-Glass justification -> ALLOWED
  it('4. Doctor with verified Break-Glass emergency justification should be GRANTED access', () => {
    mockRequest.user = {
      id: 'doc-001',
      email: 'dr.bandara@kinniya.health.gov.lk',
      role: UserRole.DOCTOR,
      name: 'Dr. Amara Bandara',
      hospitalId: 'hosp-kinniya',
    };
    mockRequest.headers = {
      'x-target-hospital-id': 'hosp-001',
      'x-break-glass-reason': 'Emergency resus in ETU: Unconscious polytrauma victim',
    };

    authorizeClinicalPatientAccess(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(); // Next called without error
  });

  // TEST 5: Hospital Admin from Hospital A modifying Hospital B -> DENIED (403)
  it('5. Hospital Admin from Kinniya attempting to modify Colombo hospital should be DENIED with 403', () => {
    mockRequest.user = {
      id: 'admin-kinniya',
      email: 'ms@kinniya.health.gov.lk',
      role: UserRole.HOSPITAL_ADMIN,
      name: 'Dr. K. M. Nafeel',
      hospitalId: 'hosp-kinniya',
    };
    mockRequest.headers = {
      'x-target-hospital-id': 'hosp-001', // Colombo NHSL
    };

    authorizeClinicalPatientAccess(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const err = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('Hospital Administrators can only manage their assigned facility');
  });

  // TEST 6: District Officer Trincomalee accessing Colombo District Private Data -> DENIED (403)
  it('6. District Health Officer Trincomalee accessing Colombo private data should be DENIED with 403', () => {
    mockRequest.user = {
      id: 'dho-trinco',
      email: 'rdhs@trincomalee.health.gov.lk',
      role: UserRole.DISTRICT_ADMIN,
      name: 'Dr. Ruwan Gunawardana',
      district: 'Trincomalee',
    };
    mockRequest.headers = {
      'x-target-district': 'Colombo',
    };

    authorizeClinicalPatientAccess(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const err = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('District Health Officers can only access authorized information within their assigned district');
  });

  // TEST 7: Provincial Officer Eastern managing Western Province -> DENIED (403)
  it('7. Provincial Health Officer Eastern managing Western Province should be DENIED with 403', () => {
    mockRequest.user = {
      id: 'pho-eastern',
      email: 'pdhs@eastern.health.gov.lk',
      role: UserRole.PROVINCIAL_ADMIN,
      name: 'Dr. Chandani Jayaratne',
      province: 'EASTERN',
    };
    mockRequest.headers = {
      'x-target-province': 'WESTERN',
    };

    authorizeClinicalPatientAccess(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const err = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('Provincial Health Officers can only access authorized information within their assigned province');
  });

  // TEST 8: System Admin accessing clinical patient records -> DENIED (403) (Sections 67 & 93)
  it('8. System Administrator accessing clinical patient data should be STRICTLY DENIED with 403', () => {
    mockRequest.user = {
      id: 'sysadmin-root',
      email: 'superadmin@health.gov.lk',
      role: UserRole.SUPER_ADMIN,
      name: 'Dinesh Alahakoon',
    };

    authorizeClinicalPatientAccess(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const err = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('System Administrators are strictly denied clinical patient access per Least Privilege Architecture');
  });
});
