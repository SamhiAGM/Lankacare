/**
 * 🇱🇰 SRI LANKA GEOGRAPHIC & ADMINISTRATIVE REFERENCE
 * Democratic Socialist Republic of Sri Lanka
 * 9 Provinces | 25 Districts
 * Authoritative administrative boundaries according to Department of Census and Statistics
 */

export interface DistrictInfo {
  name: string;
  nameSi: string;
  nameTa: string;
  provinceKey: string;
  provinceName: string;
  capital: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  populationEstimate: number; // 2024-2025 estimate
}

export interface ProvinceInfo {
  key: string;
  name: string;
  nameSi: string;
  nameTa: string;
  capital: string;
  districts: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const SRI_LANKA_PROVINCES: Record<string, ProvinceInfo> = {
  WESTERN: {
    key: 'WESTERN',
    name: 'Western Province',
    nameSi: 'බස්නාහිර පළාත',
    nameTa: 'மேல் மாகாணம்',
    capital: 'Colombo',
    districts: ['Colombo', 'Gampaha', 'Kalutara'],
    coordinates: { lat: 6.9271, lng: 79.8612 },
  },
  CENTRAL: {
    key: 'CENTRAL',
    name: 'Central Province',
    nameSi: 'මධ්‍යම පළාත',
    nameTa: 'மத்திய மாகாணம்',
    capital: 'Kandy',
    districts: ['Kandy', 'Matale', 'Nuwara Eliya'],
    coordinates: { lat: 7.2906, lng: 80.6337 },
  },
  SOUTHERN: {
    key: 'SOUTHERN',
    name: 'Southern Province',
    nameSi: 'දකුණු පළාත',
    nameTa: 'தென் மாகாணம்',
    capital: 'Galle',
    districts: ['Galle', 'Matara', 'Hambantota'],
    coordinates: { lat: 6.0535, lng: 80.221 },
  },
  NORTHERN: {
    key: 'NORTHERN',
    name: 'Northern Province',
    nameSi: 'උතුරු පළාත',
    nameTa: 'வட மாகாணம்',
    capital: 'Jaffna',
    districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
    coordinates: { lat: 9.6615, lng: 80.0255 },
  },
  EASTERN: {
    key: 'EASTERN',
    name: 'Eastern Province',
    nameSi: 'නැගෙනහිර පළාත',
    nameTa: 'கிழக்கு மாகாணம்',
    capital: 'Trincomalee',
    districts: ['Batticaloa', 'Ampara', 'Trincomalee'],
    coordinates: { lat: 8.5874, lng: 81.2152 },
  },
  NORTH_WESTERN: {
    key: 'NORTH_WESTERN',
    name: 'North Western Province',
    nameSi: 'වයඹ පළාත',
    nameTa: 'வடமேல் மாகாணம்',
    capital: 'Kurunegala',
    districts: ['Kurunegala', 'Puttalam'],
    coordinates: { lat: 7.4863, lng: 80.3623 },
  },
  NORTH_CENTRAL: {
    key: 'NORTH_CENTRAL',
    name: 'North Central Province',
    nameSi: 'උතුරු මැද පළාත',
    nameTa: 'வடமத்திய மாகாணம்',
    capital: 'Anuradhapura',
    districts: ['Anuradhapura', 'Polonnaruwa'],
    coordinates: { lat: 8.3114, lng: 80.4037 },
  },
  UVA: {
    key: 'UVA',
    name: 'Uva Province',
    nameSi: 'ඌව පළාත',
    nameTa: 'ஊவா மாகாணம்',
    capital: 'Badulla',
    districts: ['Badulla', 'Monaragala'],
    coordinates: { lat: 6.9934, lng: 81.055 },
  },
  SABARAGAMUWA: {
    key: 'SABARAGAMUWA',
    name: 'Sabaragamuwa Province',
    nameSi: 'සබරගමුව පළාත',
    nameTa: 'சப்ரகமுவ மாகாணம்',
    capital: 'Ratnapura',
    districts: ['Ratnapura', 'Kegalle'],
    coordinates: { lat: 6.6828, lng: 80.4009 },
  },
};

export const SRI_LANKA_DISTRICTS: Record<string, DistrictInfo> = {
  // Western Province
  Colombo: {
    name: 'Colombo',
    nameSi: 'කොළඹ',
    nameTa: 'கொழும்பு',
    provinceKey: 'WESTERN',
    provinceName: 'Western Province',
    capital: 'Colombo',
    coordinates: { lat: 6.9271, lng: 79.8612 },
    populationEstimate: 2326000,
  },
  Gampaha: {
    name: 'Gampaha',
    nameSi: 'ගම්පහ',
    nameTa: 'கம்பஹா',
    provinceKey: 'WESTERN',
    provinceName: 'Western Province',
    capital: 'Gampaha',
    coordinates: { lat: 7.084, lng: 79.9939 },
    populationEstimate: 2304000,
  },
  Kalutara: {
    name: 'Kalutara',
    nameSi: 'කළුතර',
    nameTa: 'களுத்துறை',
    provinceKey: 'WESTERN',
    provinceName: 'Western Province',
    capital: 'Kalutara',
    coordinates: { lat: 6.5854, lng: 79.9607 },
    populationEstimate: 1222000,
  },

  // Central Province
  Kandy: {
    name: 'Kandy',
    nameSi: 'මහනුවර',
    nameTa: 'கண்டி',
    provinceKey: 'CENTRAL',
    provinceName: 'Central Province',
    capital: 'Kandy',
    coordinates: { lat: 7.2906, lng: 80.6337 },
    populationEstimate: 1375000,
  },
  Matale: {
    name: 'Matale',
    nameSi: 'මාතලේ',
    nameTa: 'மாத்தளை',
    provinceKey: 'CENTRAL',
    provinceName: 'Central Province',
    capital: 'Matale',
    coordinates: { lat: 7.4675, lng: 80.6234 },
    populationEstimate: 485000,
  },
  'Nuwara Eliya': {
    name: 'Nuwara Eliya',
    nameSi: 'නුවරඑළිය',
    nameTa: 'நுவரெலியா',
    provinceKey: 'CENTRAL',
    provinceName: 'Central Province',
    capital: 'Nuwara Eliya',
    coordinates: { lat: 6.9497, lng: 80.7891 },
    populationEstimate: 711000,
  },

  // Southern Province
  Galle: {
    name: 'Galle',
    nameSi: 'ගාල්ල',
    nameTa: 'காலி',
    provinceKey: 'SOUTHERN',
    provinceName: 'Southern Province',
    capital: 'Galle',
    coordinates: { lat: 6.0535, lng: 80.221 },
    populationEstimate: 1063000,
  },
  Matara: {
    name: 'Matara',
    nameSi: 'මාතර',
    nameTa: 'மாத்தறை',
    provinceKey: 'SOUTHERN',
    provinceName: 'Southern Province',
    capital: 'Matara',
    coordinates: { lat: 5.9549, lng: 80.555 },
    populationEstimate: 814000,
  },
  Hambantota: {
    name: 'Hambantota',
    nameSi: 'හම්බන්තොට',
    nameTa: 'அம்பாந்தோட்டை',
    provinceKey: 'SOUTHERN',
    provinceName: 'Southern Province',
    capital: 'Hambantota',
    coordinates: { lat: 6.1248, lng: 81.1185 },
    populationEstimate: 600000,
  },

  // Northern Province
  Jaffna: {
    name: 'Jaffna',
    nameSi: 'යාපනය',
    nameTa: 'யாழ்ப்பாணம்',
    provinceKey: 'NORTHERN',
    provinceName: 'Northern Province',
    capital: 'Jaffna',
    coordinates: { lat: 9.6615, lng: 80.0255 },
    populationEstimate: 584000,
  },
  Kilinochchi: {
    name: 'Kilinochchi',
    nameSi: 'කිලිනොච්චිය',
    nameTa: 'கிளிநொச்சி',
    provinceKey: 'NORTHERN',
    provinceName: 'Northern Province',
    capital: 'Kilinochchi',
    coordinates: { lat: 9.3803, lng: 80.377 },
    populationEstimate: 113000,
  },
  Mannar: {
    name: 'Mannar',
    nameSi: 'මන්නාරම',
    nameTa: 'மன்னார்',
    provinceKey: 'NORTHERN',
    provinceName: 'Northern Province',
    capital: 'Mannar',
    coordinates: { lat: 8.981, lng: 79.9044 },
    populationEstimate: 99000,
  },
  Mullaitivu: {
    name: 'Mullaitivu',
    nameSi: 'මුලතිව්',
    nameTa: 'முல்லைத்தீவு',
    provinceKey: 'NORTHERN',
    provinceName: 'Northern Province',
    capital: 'Mullaitivu',
    coordinates: { lat: 9.2671, lng: 80.8142 },
    populationEstimate: 92000,
  },
  Vavuniya: {
    name: 'Vavuniya',
    nameSi: 'වවුනියාව',
    nameTa: 'வவுனியா',
    provinceKey: 'NORTHERN',
    provinceName: 'Northern Province',
    capital: 'Vavuniya',
    coordinates: { lat: 8.7514, lng: 80.4971 },
    populationEstimate: 172000,
  },

  // Eastern Province
  Batticaloa: {
    name: 'Batticaloa',
    nameSi: 'මඩකලපුව',
    nameTa: 'மட்டக்களப்பு',
    provinceKey: 'EASTERN',
    provinceName: 'Eastern Province',
    capital: 'Batticaloa',
    coordinates: { lat: 7.7102, lng: 81.6924 },
    populationEstimate: 526000,
  },
  Ampara: {
    name: 'Ampara',
    nameSi: 'අම්පාර',
    nameTa: 'அம்பாறை',
    provinceKey: 'EASTERN',
    provinceName: 'Eastern Province',
    capital: 'Ampara',
    coordinates: { lat: 7.2912, lng: 81.6747 },
    populationEstimate: 650000,
  },
  Trincomalee: {
    name: 'Trincomalee',
    nameSi: 'ත්‍රිකුණාමලය',
    nameTa: 'திருகோணமலை',
    provinceKey: 'EASTERN',
    provinceName: 'Eastern Province',
    capital: 'Trincomalee',
    coordinates: { lat: 8.5874, lng: 81.2152 },
    populationEstimate: 379000,
  },

  // North Western Province
  Kurunegala: {
    name: 'Kurunegala',
    nameSi: 'කුරුණෑගල',
    nameTa: 'குருநாகல்',
    provinceKey: 'NORTH_WESTERN',
    provinceName: 'North Western Province',
    capital: 'Kurunegala',
    coordinates: { lat: 7.4863, lng: 80.3623 },
    populationEstimate: 1618000,
  },
  Puttalam: {
    name: 'Puttalam',
    nameSi: 'පුත්තලම',
    nameTa: 'புத்தளம்',
    provinceKey: 'NORTH_WESTERN',
    provinceName: 'North Western Province',
    capital: 'Puttalam',
    coordinates: { lat: 8.0362, lng: 79.8283 },
    populationEstimate: 762000,
  },

  // North Central Province
  Anuradhapura: {
    name: 'Anuradhapura',
    nameSi: 'අනුරාධපුරය',
    nameTa: 'அனுராதபுரம்',
    provinceKey: 'NORTH_CENTRAL',
    provinceName: 'North Central Province',
    capital: 'Anuradhapura',
    coordinates: { lat: 8.3114, lng: 80.4037 },
    populationEstimate: 860000,
  },
  Polonnaruwa: {
    name: 'Polonnaruwa',
    nameSi: 'පොළොන්නරුව',
    nameTa: 'பொலன்னறுவை',
    provinceKey: 'NORTH_CENTRAL',
    provinceName: 'North Central Province',
    capital: 'Polonnaruwa',
    coordinates: { lat: 7.9403, lng: 81.0188 },
    populationEstimate: 406000,
  },

  // Uva Province
  Badulla: {
    name: 'Badulla',
    nameSi: 'බදුල්ල',
    nameTa: 'பதுளை',
    provinceKey: 'UVA',
    provinceName: 'Uva Province',
    capital: 'Badulla',
    coordinates: { lat: 6.9934, lng: 81.055 },
    populationEstimate: 815000,
  },
  Monaragala: {
    name: 'Monaragala',
    nameSi: 'මොනරාගල',
    nameTa: 'மொணராகலை',
    provinceKey: 'UVA',
    provinceName: 'Uva Province',
    capital: 'Monaragala',
    coordinates: { lat: 6.8728, lng: 81.3507 },
    populationEstimate: 451000,
  },

  // Sabaragamuwa Province
  Ratnapura: {
    name: 'Ratnapura',
    nameSi: 'රත්නපුර',
    nameTa: 'இரத்தினபுரி',
    provinceKey: 'SABARAGAMUWA',
    provinceName: 'Sabaragamuwa Province',
    capital: 'Ratnapura',
    coordinates: { lat: 6.6828, lng: 80.4009 },
    populationEstimate: 1088000,
  },
  Kegalle: {
    name: 'Kegalle',
    nameSi: 'කෑගල්ල',
    nameTa: 'கேகாலை',
    provinceKey: 'SABARAGAMUWA',
    provinceName: 'Sabaragamuwa Province',
    capital: 'Kegalle',
    coordinates: { lat: 7.2513, lng: 80.3464 },
    populationEstimate: 840000,
  },
};

export const ALL_DISTRICTS = Object.keys(SRI_LANKA_DISTRICTS);
export const ALL_PROVINCES = Object.values(SRI_LANKA_PROVINCES);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function getDistrictsByProvince(provinceKey: string): DistrictInfo[] {
  const normKey = provinceKey.toUpperCase().replace(/\s+/g, '_');
  const province = SRI_LANKA_PROVINCES[normKey];
  if (!province) return Object.values(SRI_LANKA_DISTRICTS);
  return province.districts
    .map((dName) => SRI_LANKA_DISTRICTS[dName])
    .filter(Boolean);
}

export function getProvinceByDistrict(districtName: string): ProvinceInfo | undefined {
  const district = SRI_LANKA_DISTRICTS[districtName];
  if (!district) return undefined;
  return SRI_LANKA_PROVINCES[district.provinceKey];
}

export function isValidDistrict(districtName: string): boolean {
  return districtName in SRI_LANKA_DISTRICTS;
}

export function isValidProvince(provinceKey: string): boolean {
  const normKey = provinceKey.toUpperCase().replace(/\s+/g, '_');
  return normKey in SRI_LANKA_PROVINCES;
}

/**
 * Validates Sri Lankan telephone numbers:
 * - Mobile / Landline format: +94 XX XXX XXXX, 0XX XXXXXXX
 * - Official 4-digit emergency hotlines: 1990, 1907, 1926, 1919, 119, 110
 */
export function validateSriLankanPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  // Emergency shortcodes
  if (/^(1990|1907|1926|1919|119|110)$/.test(clean)) return true;
  // +94 format: +947XXXXXXXX, +9411XXXXXXX, etc.
  if (/^\+94[1-9]\d{8}$/.test(clean)) return true;
  // Local 0XX format: 07XXXXXXXX, 011XXXXXXX, etc.
  if (/^0[1-9]\d{8}$/.test(clean)) return true;
  return false;
}

export function formatSriLankanPhone(phone: string): string {
  if (!phone) return 'Not available';
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (/^(1990|1907|1926|1919|119|110)$/.test(clean)) return clean;
  if (/^\+94([1-9]\d)(\d{3})(\d{4})$/.test(clean)) {
    return clean.replace(/^\+94([1-9]\d)(\d{3})(\d{4})$/, '+94 $1 $2 $3');
  }
  if (/^0([1-9]\d)(\d{3})(\d{4})$/.test(clean)) {
    return clean.replace(/^0([1-9]\d)(\d{3})(\d{4})$/, '0$1 $2 $3');
  }
  return phone;
}

/**
 * Formats timestamps in Asia/Colombo (UTC+5:30)
 */
export function formatSriLankanDate(
  dateInput: string | Date | number,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;
    if (isNaN(d.getTime())) return 'Invalid date';

    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat('en-LK', defaultOptions).format(d);
  } catch {
    return String(dateInput);
  }
}

export function formatSriLankanDateTime(dateInput: string | Date | number): string {
  return formatSriLankanDate(dateInput, {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Currency formatter for Sri Lankan Rupees (LKR / Rs.)
 */
export function formatLKR(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('LKR', 'Rs.');
}
