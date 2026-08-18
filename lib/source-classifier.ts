/**
 * Classifies a referrer URL into a canonical traffic source name.
 *
 * Examples:
 *   "https://www.google.com/search?q=hello" → "Google"
 *   "https://linkedin.com/feed"             → "LinkedIn"
 *   ""                                      → "Direct"
 */

interface SourceRule {
  /** Substring(s) to match against the referrer hostname or UTM source (lowercased). */
  patterns: string[];
  /** Canonical source label. */
  label: string;
}

const SOURCE_RULES: SourceRule[] = [
  { patterns: ['google'],               label: 'Google' },
  { patterns: ['bing'],                 label: 'Bing' },
  { patterns: ['duckduckgo'],           label: 'DuckDuckGo' },
  { patterns: ['yahoo'],                label: 'Yahoo' },
  { patterns: ['baidu'],                label: 'Baidu' },
  { patterns: ['yandex'],               label: 'Yandex' },
  { patterns: ['linkedin', 'lnkd.in'],  label: 'LinkedIn' },
  { patterns: ['facebook', 'fb.com', 'fb.me', 'fbcdn'],  label: 'Facebook' },
  { patterns: ['instagram'],            label: 'Instagram' },
  { patterns: ['twitter', 't.co', 'x.com', 'x'],          label: 'X (Twitter)' },
  { patterns: ['youtube', 'youtu.be'],  label: 'YouTube' },
  { patterns: ['reddit'],               label: 'Reddit' },
  { patterns: ['github'],               label: 'GitHub' },
  { patterns: ['pinterest'],            label: 'Pinterest' },
  { patterns: ['tiktok'],               label: 'TikTok' },
  { patterns: ['whatsapp'],             label: 'WhatsApp' },
  { patterns: ['telegram', 't.me'],     label: 'Telegram' },
  { patterns: ['producthunt'],          label: 'Product Hunt' },
  { patterns: ['medium'],               label: 'Medium' },
  { patterns: ['stackoverflow'],        label: 'Stack Overflow' },
];

/**
 * Given a raw referrer string and optionally pageUrl, returns a canonical source label.
 * Checks UTM parameters (utm_source, ref, source) first, then referrer URL.
 * Returns "Direct" if neither exists.
 */
export function classifySource(referrer?: string | null, pageUrl?: string | null): string {
  // 1. Check URL query parameters (e.g. ?utm_source=linkedin, ?ref=google, ?source=twitter)
  if (pageUrl) {
    try {
      const url = new URL(pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`);
      const utmSource = url.searchParams.get('utm_source') || 
                        url.searchParams.get('ref') || 
                        url.searchParams.get('source') ||
                        url.searchParams.get('utm_medium');
      
      if (utmSource && utmSource.trim()) {
        const rawSource = utmSource.trim().toLowerCase();
        for (const rule of SOURCE_RULES) {
          if (rule.patterns.some(p => rawSource === p || rawSource.includes(p))) {
            return rule.label;
          }
        }
        // Capitalize unknown custom source (e.g. "newsletter" -> "Newsletter")
        return rawSource.charAt(0).toUpperCase() + rawSource.slice(1);
      }
    } catch {
      // Ignore URL parse error
    }
  }

  // 2. Check referrer header / URL
  if (referrer && referrer.trim() !== '') {
    let hostname: string;
    try {
      hostname = new URL(referrer.startsWith('http') ? referrer : `https://${referrer}`).hostname.toLowerCase();
    } catch {
      hostname = referrer.toLowerCase();
    }

    for (const rule of SOURCE_RULES) {
      if (rule.patterns.some(pattern => hostname.includes(pattern))) {
        return rule.label;
      }
    }

    // Return hostname for unknown external domains
    return hostname;
  }

  return 'Direct';
}

