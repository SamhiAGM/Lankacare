import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Hospital } from '../models/Hospital';
import { Medicine, MedicineInventory } from '../models/Medicine';
import { HospitalServiceAvailability } from '../models/HospitalServiceAvailability';
import { HospitalStaffAssignment } from '../models/HospitalStaffAssignment';
import { DataCorrectionReport } from '../models/DataCorrectionReport';
import { AppError } from '../middleware/errorMiddleware';
import { FreshnessStatus, MedicineStatus, VerificationStatus } from '../types/enums';

// ── Freshness configuration (configurable per deployment) ────────────────────
const FRESHNESS_THRESHOLDS_MS = {
  CURRENT: 30 * 60 * 1000,      // 30 minutes
  RECENT: 4 * 60 * 60 * 1000,   // 4 hours
  TODAY: 24 * 60 * 60 * 1000,   // 24 hours
};

function calculateFreshness(lastUpdatedAt: Date | null | undefined): FreshnessStatus {
  if (!lastUpdatedAt) return FreshnessStatus.UNKNOWN;
  const ageMs = Date.now() - new Date(lastUpdatedAt).getTime();
  if (ageMs < FRESHNESS_THRESHOLDS_MS.CURRENT) return FreshnessStatus.CURRENT;
  if (ageMs < FRESHNESS_THRESHOLDS_MS.RECENT) return FreshnessStatus.RECENT;
  if (ageMs < FRESHNESS_THRESHOLDS_MS.TODAY) return FreshnessStatus.TODAY;
  return FreshnessStatus.STALE;
}

// ── Safe public hospital projection — never returns private fields ────────────
const PUBLIC_HOSPITAL_PROJECTION = {
  facilityCode: 1,
  officialName: 1,
  displayName: 1,
  alternativeNames: 1,
  nameSi: 1,
  nameTa: 1,
  officialCategory: 1,
  ownershipType: 1,
  province: 1,
  district: 1,
  rdhsArea: 1,
  mohArea: 1,
  town: 1,
  address: 1,
  coordinates: 1,
  telephoneNumbers: 1,
  publicEmail: 1,
  officialWebsite: 1,
  departments: 1,
  publicServices: 1,
  emergencyAvailable: 1,
  emergencyServiceStatus: 1,
  publishedBedStrength: 1,
  publishedBedReportingYear: 1,
  status: 1,
  verificationStatus: 1,
  sourceName: 1,
  sourceUrl: 1,
  lastVerifiedAt: 1,
  lastImportedAt: 1,
  createdAt: 1,
  updatedAt: 1,
  // NEVER include: adminUser, privatePhone, internalNotes, etc.
};

/**
 * GET /api/public/hospitals
 * Public hospital search — no authentication required
 */
export const getPublicHospitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      province,
      district,
      category,
      service,
      emergency,
      verifiedOnly,
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (province) query.province = province.toUpperCase();
    if (district) query.district = district;
    if (category) query.officialCategory = category;
    if (service) query.publicServices = { $in: [new RegExp(service, 'i')] };
    if (emergency === 'true') query.emergencyAvailable = true;
    if (verifiedOnly === 'true') query.verificationStatus = VerificationStatus.VERIFIED;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [hospitals, total] = await Promise.all([
      Hospital.find(query, PUBLIC_HOSPITAL_PROJECTION)
        .skip(skip)
        .limit(limitNum)
        .sort({ officialName: 1 })
        .lean(),
      Hospital.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: hospitals,
      meta: {
        dataSource: 'Ministry of Health Sri Lanka — Annual Health Statistics 2023',
        disclaimer: 'Information sourced from official Ministry of Health publications. Contact individual facilities to confirm current service availability.',
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/hospitals/:id
 * Public hospital detail — no authentication required
 */
export const getPublicHospitalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId
      ? { _id: id }
      : { facilityCode: id };

    const hospital = await Hospital.findOne(query, PUBLIC_HOSPITAL_PROJECTION).lean();
    if (!hospital) throw new AppError('Healthcare facility not found.', 404);

    // Service availability (UNKNOWN by default if hospital doesn't provide updates)
    const serviceAvailability = await HospitalServiceAvailability.find(
      { hospital: hospital._id },
      { serviceId: 1, serviceName: 1, status: 1, schedule: 1, lastUpdated: 1, source: 1 }
    ).lean();

    // Public staff assignments (only publicly-approved, no private info)
    const staffAssignments = await HospitalStaffAssignment.find(
      { hospital: hospital._id, isPubliclyVisible: true, employmentStatus: 'ACTIVE' },
      { department: 1, role: 1, clinicDays: 1, clinicStartTime: 1, clinicEndTime: 1 }
    )
      .populate('practitioner', 'fullName qualifications specialistDiscipline registrationStatus verificationStatus')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...hospital,
        serviceAvailability,
        publicStaff: staffAssignments,
      },
      meta: {
        dataSource: hospital.sourceName ?? 'Ministry of Health Sri Lanka',
        sourceUrl: hospital.sourceUrl,
        lastVerifiedAt: hospital.lastVerifiedAt,
        disclaimer: 'This information is from official Ministry of Health publications. Service availability may change. Contact the facility for confirmation.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/hospitals/near
 * Find hospitals near a geographic point (verified coordinates only)
 */
export const getHospitalsNear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lat, lng, radius = '10', limit = '20', service, emergency } = req.query as Record<string, string>;

    if (!lat || !lng) {
      throw new AppError('Latitude and longitude are required for geo search.', 400);
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusKm = Math.min(100, Math.max(1, parseFloat(radius)));

    // Validate Sri Lanka bounding box (rough check)
    if (latNum < 5.8 || latNum > 9.9 || lngNum < 79.5 || lngNum > 82.0) {
      throw new AppError('Coordinates must be within Sri Lanka.', 400);
    }

    const query: Record<string, unknown> = {
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lngNum, latNum] },
          $maxDistance: radiusKm * 1000, // Convert km to metres
        },
      },
    };

    if (service) query.publicServices = { $in: [new RegExp(service, 'i')] };
    if (emergency === 'true') query.emergencyAvailable = true;

    const hospitals = await Hospital.find(query, PUBLIC_HOSPITAL_PROJECTION)
      .limit(Math.min(50, parseInt(limit)))
      .lean();

    res.status(200).json({
      success: true,
      data: hospitals,
      meta: {
        searchPoint: { lat: latNum, lng: lngNum },
        radiusKm,
        note: 'Only facilities with verified GPS coordinates are shown in geo search results.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/districts
 * All 25 Sri Lankan districts with province information
 */
export const getDistricts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Add hospital count per district
    const hospitalCounts = await Hospital.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    hospitalCounts.forEach((d: any) => { countMap[d._id] = d.count; });

    const districts = Object.entries(SRI_LANKA_DISTRICTS).map(([key, info]) => ({
      ...info,
      hospitalCount: countMap[key] ?? 0,
    }));

    res.status(200).json({ success: true, data: districts });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/provinces
 * All 9 Sri Lankan provinces with district lists
 */
export const getProvinces = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hospitalCountsByProvince = await Hospital.aggregate([
      { $group: { _id: '$province', count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    hospitalCountsByProvince.forEach((p: any) => { countMap[p._id] = p.count; });

    const provinces = Object.entries(SRI_LANKA_PROVINCES).map(([key, info]) => ({
      ...info,
      hospitalCount: countMap[key] ?? 0,
    }));

    res.status(200).json({ success: true, data: provinces });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/medicine-availability?name=paracetamol
 * Cross-hospital medicine search — public, no patient data
 *
 * Returns only: hospital name, district, availability status, freshness, contact
 * NEVER returns: patient data, internal inventory details, stock quantities
 */
export const getMedicineAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, district, province, limit = '20' } = req.query as Record<string, string>;

    if (!name || name.trim().length < 2) {
      throw new AppError('Medicine name must be at least 2 characters.', 400);
    }

    // Find matching medicines in the master catalogue
    const medicines = await Medicine.find({
      $text: { $search: name },
    })
      .limit(5)
      .lean();

    if (medicines.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        searchTerm: name,
        message: 'No matching medicine found in the national medicine catalogue.',
        disclaimer: 'If you believe this medicine should be listed, please contact LankaCare.',
      });
      return;
    }

    const medicineIds = medicines.map(m => m._id);

    // Find inventory records
    const inventoryQuery: Record<string, unknown> = { medicine: { $in: medicineIds } };
    // No patient or private data in this query

    const inventoryRecords = await MedicineInventory.find(inventoryQuery)
      .populate('hospital', 'officialName displayName district province coordinates telephoneNumbers verificationStatus')
      .populate('medicine', 'genericName name dosageForm strength')
      .lean();

    // Build hospital filter if requested
    const hospitalFilter = (h: any) => {
      if (district && h.district !== district) return false;
      if (province && h.province !== province.toUpperCase()) return false;
      return true;
    };

    const results = inventoryRecords
      .filter((inv: any) => inv.hospital && hospitalFilter(inv.hospital))
      .map((inv: any) => ({
        hospital: {
          id: inv.hospital._id,
          officialName: inv.hospital.officialName,
          displayName: inv.hospital.displayName,
          district: inv.hospital.district,
          province: inv.hospital.province,
          // Only include phone for contact info (public)
          telephone: inv.hospital.telephoneNumbers?.[0] ?? null,
          verificationStatus: inv.hospital.verificationStatus,
        },
        medicine: {
          genericName: inv.medicine.genericName,
          name: inv.medicine.name,
          dosageForm: inv.medicine.dosageForm,
          strength: inv.medicine.strength,
        },
        // Return status but NEVER return exact quantity to citizens
        availabilityStatus: inv.status,
        freshness: calculateFreshness(inv.lastUpdatedAt),
        lastUpdated: inv.lastUpdatedAt ?? null,
      }))
      .slice(0, Math.min(50, parseInt(limit)));

    res.status(200).json({
      success: true,
      searchTerm: name,
      matchedMedicines: medicines.map(m => ({ id: m._id, genericName: m.genericName, name: m.name })),
      data: results,
      disclaimer: 'Availability may change before you arrive. Contact the healthcare facility if confirmation is required.',
      meta: {
        note: 'Facilities showing UNKNOWN status have not provided current inventory data. This does not mean the medicine is unavailable.',
        freshnessKey: {
          CURRENT: 'Updated within 30 minutes',
          RECENT: 'Updated within 4 hours',
          TODAY: 'Updated today',
          STALE: 'Not updated today',
          UNKNOWN: 'No update information available',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/public/data-corrections
 * Citizen submits an incorrect-information report
 * NEVER modifies official data directly — creates a review workflow
 */
export const submitDataCorrection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      targetType, targetId, targetName, reportedField,
      currentValue, reportedCorrectValue, description, issueType,
      submitterEmail,
    } = req.body;

    if (!targetType || !targetId || !description || !issueType) {
      throw new AppError('targetType, targetId, description, and issueType are required.', 400);
    }

    // Validate target exists
    if (targetType === 'HOSPITAL') {
      const hospital = await Hospital.findById(targetId);
      if (!hospital) throw new AppError('Referenced hospital not found.', 404);
    }

    const report = await DataCorrectionReport.create({
      targetType,
      targetId,
      targetName: targetName ?? 'Unknown',
      reportedField,
      currentValue,
      reportedCorrectValue,
      description,
      issueType,
      submittedBy: (req as any).user?.id ?? null,
      submitterEmail: submitterEmail ?? null,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your report. A data administrator will review this information against official sources.',
      reportId: report._id,
      note: 'Your report does not directly modify official data. All corrections go through a verification process.',
    });
  } catch (error) {
    next(error);
  }
};

// ── Inline geo constants (avoids frontend-only import) ────────────────────────
const SRI_LANKA_PROVINCES: Record<string, any> = {
  WESTERN: { key: 'WESTERN', name: 'Western Province', districts: ['Colombo', 'Gampaha', 'Kalutara'] },
  CENTRAL: { key: 'CENTRAL', name: 'Central Province', districts: ['Kandy', 'Matale', 'Nuwara Eliya'] },
  SOUTHERN: { key: 'SOUTHERN', name: 'Southern Province', districts: ['Galle', 'Matara', 'Hambantota'] },
  NORTHERN: { key: 'NORTHERN', name: 'Northern Province', districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'] },
  EASTERN: { key: 'EASTERN', name: 'Eastern Province', districts: ['Trincomalee', 'Batticaloa', 'Ampara'] },
  NORTH_WESTERN: { key: 'NORTH_WESTERN', name: 'North Western Province', districts: ['Kurunegala', 'Puttalam'] },
  NORTH_CENTRAL: { key: 'NORTH_CENTRAL', name: 'North Central Province', districts: ['Anuradhapura', 'Polonnaruwa'] },
  UVA: { key: 'UVA', name: 'Uva Province', districts: ['Badulla', 'Monaragala'] },
  SABARAGAMUWA: { key: 'SABARAGAMUWA', name: 'Sabaragamuwa Province', districts: ['Ratnapura', 'Kegalle'] },
};

const SRI_LANKA_DISTRICTS: Record<string, any> = {
  Colombo: { name: 'Colombo', provinceKey: 'WESTERN' },
  Gampaha: { name: 'Gampaha', provinceKey: 'WESTERN' },
  Kalutara: { name: 'Kalutara', provinceKey: 'WESTERN' },
  Kandy: { name: 'Kandy', provinceKey: 'CENTRAL' },
  Matale: { name: 'Matale', provinceKey: 'CENTRAL' },
  'Nuwara Eliya': { name: 'Nuwara Eliya', provinceKey: 'CENTRAL' },
  Galle: { name: 'Galle', provinceKey: 'SOUTHERN' },
  Matara: { name: 'Matara', provinceKey: 'SOUTHERN' },
  Hambantota: { name: 'Hambantota', provinceKey: 'SOUTHERN' },
  Jaffna: { name: 'Jaffna', provinceKey: 'NORTHERN' },
  Kilinochchi: { name: 'Kilinochchi', provinceKey: 'NORTHERN' },
  Mannar: { name: 'Mannar', provinceKey: 'NORTHERN' },
  Mullaitivu: { name: 'Mullaitivu', provinceKey: 'NORTHERN' },
  Vavuniya: { name: 'Vavuniya', provinceKey: 'NORTHERN' },
  Trincomalee: { name: 'Trincomalee', provinceKey: 'EASTERN' },
  Batticaloa: { name: 'Batticaloa', provinceKey: 'EASTERN' },
  Ampara: { name: 'Ampara', provinceKey: 'EASTERN' },
  Kurunegala: { name: 'Kurunegala', provinceKey: 'NORTH_WESTERN' },
  Puttalam: { name: 'Puttalam', provinceKey: 'NORTH_WESTERN' },
  Anuradhapura: { name: 'Anuradhapura', provinceKey: 'NORTH_CENTRAL' },
  Polonnaruwa: { name: 'Polonnaruwa', provinceKey: 'NORTH_CENTRAL' },
  Badulla: { name: 'Badulla', provinceKey: 'UVA' },
  Monaragala: { name: 'Monaragala', provinceKey: 'UVA' },
  Ratnapura: { name: 'Ratnapura', provinceKey: 'SABARAGAMUWA' },
  Kegalle: { name: 'Kegalle', provinceKey: 'SABARAGAMUWA' },
};
