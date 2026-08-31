// Map common IANA timezones to ISO 2-letter country codes
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Asia
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP',
  'Asia/Dhaka': 'BD',
  'Asia/Karachi': 'PK',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Singapore': 'SG',
  'Asia/Hong_Kong': 'HK',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN',
  'Asia/Bangkok': 'TH',
  'Asia/Jakarta': 'ID',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Manila': 'PH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Taipei': 'TW',
  'Asia/Jerusalem': 'IL',
  'Asia/Beirut': 'LB',

  // Americas
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Los_Angeles': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Detroit': 'US',
  'America/Indiana/Indianapolis': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Mexico_City': 'MX',
  'America/Cancun': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Buenos_Aires': 'AR',
  'America/Bogota': 'CO',
  'America/Lima': 'PE',
  'America/Santiago': 'CL',

  // Europe
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Dublin': 'IE',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Athens': 'GR',
  'Europe/Lisbon': 'PT',
  'Europe/Istanbul': 'TR',
  'Europe/Kyiv': 'UA',
  'Europe/Moscow': 'RU',

  // Oceania
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
  'Pacific/Auckland': 'NZ',

  // Africa
  'Africa/Cairo': 'EG',
  'Africa/Johannesburg': 'ZA',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Casablanca': 'MA',
};

// ISO 2-letter country codes to canonical English country names
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  CA: 'Canada',
  NL: 'Netherlands',
  AU: 'Australia',
  BR: 'Brazil',
  JP: 'Japan',
  CN: 'China',
  SG: 'Singapore',
  AE: 'United Arab Emirates',
  ES: 'Spain',
  IT: 'Italy',
  SE: 'Sweden',
  CH: 'Switzerland',
  PL: 'Poland',
  MX: 'Mexico',
  RU: 'Russia',
  KR: 'South Korea',
  ID: 'Indonesia',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Philippines',
  NZ: 'New Zealand',
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  NP: 'Nepal',
  LK: 'Sri Lanka',
  SA: 'Saudi Arabia',
  IL: 'Israel',
  TR: 'Turkey',
  IE: 'Ireland',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  BE: 'Belgium',
  AT: 'Austria',
  PT: 'Portugal',
  GR: 'Greece',
  CZ: 'Czechia',
  RO: 'Romania',
  HU: 'Hungary',
  UA: 'Ukraine',
  AR: 'Argentina',
  CO: 'Colombia',
  CL: 'Chile',
  PE: 'Peru',
};

// Reverse lookup map
const COUNTRY_NAME_TO_CODE: Record<string, string> = Object.entries(COUNTRY_CODE_TO_NAME).reduce(
  (acc, [code, name]) => {
    acc[name.toLowerCase()] = code;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Returns the ISO 2-letter country code for a given timezone (e.g. 'Asia/Kolkata' -> 'IN')
 */
export function getCountryFromTimezone(timezone?: string | null): string | null {
  if (!timezone) return null;
  const direct = TIMEZONE_TO_COUNTRY[timezone];
  if (direct) return direct;

  // Fallback prefix heuristic (e.g. 'Asia/Calcutta' or partial matching)
  const normalized = timezone.trim();
  for (const [tz, code] of Object.entries(TIMEZONE_TO_COUNTRY)) {
    if (normalized.toLowerCase() === tz.toLowerCase()) {
      return code;
    }
  }

  return null;
}

/**
 * Returns the ISO 2-letter country code from browser locale (e.g. 'en-IN' -> 'IN', 'pt-BR' -> 'BR')
 */
export function getCountryFromLocale(locale?: string | null): string | null {
  if (!locale) return null;
  const parts = locale.split(/[-_]/);
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 1].toUpperCase();
    if (candidate.length === 2 && COUNTRY_CODE_TO_NAME[candidate]) {
      return candidate;
    }
  }
  return null;
}

/**
 * Resolves standard 2-letter ISO code to full country name (e.g. 'IN' -> 'India')
 */
export function getCountryName(countryCodeOrName: string): string {
  if (!countryCodeOrName || countryCodeOrName === 'Unknown') return 'Unknown';

  const upper = countryCodeOrName.toUpperCase().trim();
  if (upper.length === 2 && COUNTRY_CODE_TO_NAME[upper]) {
    return COUNTRY_CODE_TO_NAME[upper];
  }

  const codeLookup = COUNTRY_NAME_TO_CODE[countryCodeOrName.toLowerCase().trim()];
  if (codeLookup && COUNTRY_CODE_TO_NAME[codeLookup]) {
    return COUNTRY_CODE_TO_NAME[codeLookup];
  }

  return countryCodeOrName;
}

/**
 * Resolves country name or code to 2-letter ISO code (e.g. 'India' -> 'IN', 'IN' -> 'IN')
 */
export function getCountryCode(countryCodeOrName: string): string {
  if (!countryCodeOrName || countryCodeOrName === 'Unknown') return 'UN';

  const upper = countryCodeOrName.toUpperCase().trim();
  if (upper.length === 2) {
    return upper;
  }

  const code = COUNTRY_NAME_TO_CODE[countryCodeOrName.toLowerCase().trim()];
  return code || 'UN';
}

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  // South Asia
  IN: [20.5937, 78.9629],
  NP: [28.3949, 84.1240], // Nepal
  BD: [23.6850, 90.3563], // Bangladesh
  PK: [30.3753, 69.3451], // Pakistan
  LK: [7.8731, 80.7718],  // Sri Lanka
  BT: [27.5142, 90.4336], // Bhutan
  MV: [3.2028, 73.2207],  // Maldives
  AF: [33.9391, 67.7100], // Afghanistan

  // North America
  US: [37.0902, -95.7129],
  CA: [56.1304, -106.3468],
  MX: [23.6345, -102.5528],

  // Europe
  GB: [55.3781, -3.4360],
  DE: [51.1657, 10.4515],
  FR: [46.2276, 2.2137],
  NL: [52.1326, 5.2913],
  IT: [41.8719, 12.5674],
  ES: [40.4637, -3.7492],
  SE: [60.1282, 18.6435],
  CH: [46.8182, 8.2275],
  PL: [51.9194, 19.1451],
  IE: [53.1424, -7.6921],
  NO: [60.4720, 8.4689],
  DK: [56.2639, 9.5018],
  FI: [61.9241, 25.7482],
  BE: [50.5039, 4.4699],
  AT: [47.5162, 14.5501],
  PT: [39.3999, -8.2245],
  GR: [39.0742, 21.8243],
  CZ: [49.8175, 15.4730],
  RO: [45.9432, 24.9668],
  HU: [47.1625, 19.5033],
  UA: [48.3794, 31.1656],
  RU: [61.5240, 105.3188],
  TR: [38.9637, 35.2433],

  // East & Southeast Asia
  JP: [36.2048, 138.2529],
  CN: [35.8617, 104.1954],
  KR: [35.9078, 127.7669],
  SG: [1.3521, 103.8198],
  ID: [-0.7893, 113.9213],
  MY: [4.2105, 101.9758],
  TH: [15.8700, 100.9925],
  VN: [14.0583, 108.2772],
  PH: [12.8797, 121.7740],
  TW: [23.6978, 120.9605],
  HK: [22.3193, 114.1694],

  // Middle East
  AE: [23.4241, 53.8478],
  SA: [23.8859, 45.0792],
  IL: [31.0461, 34.8516],
  QA: [25.3548, 51.1839],
  KW: [29.3117, 47.4818],
  OM: [21.4735, 55.9754],

  // Oceania
  AU: [-25.2744, 133.7751],
  NZ: [-40.9006, 174.8860],

  // South America
  BR: [-14.2350, -51.9253],
  AR: [-38.4161, -63.6167],
  CO: [4.5709, -74.2973],
  CL: [-35.6751, -71.5430],
  PE: [-9.1900, -75.0152],

  // Africa
  ZA: [-30.5595, 22.9375],
  EG: [26.8206, 30.8025],
  NG: [9.0820, 8.6753],
  KE: [-0.0236, 37.9062],
  MA: [31.7917, -7.0926],
};

export function getCountryCoordinates(countryCodeOrName: string): [number, number] {
  if (!countryCodeOrName || countryCodeOrName === 'Unknown') {
    return [20.5937, 78.9629];
  }
  const code = getCountryCode(countryCodeOrName);
  return COUNTRY_COORDINATES[code] || [20.5937, 78.9629];
}
