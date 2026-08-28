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
