/**
 * Classifies a referrer URL into a canonical traffic source name.
 *
 * Examples:
 *   "https://www.google.com/search?q=hello" → "Google"
 *   "https://chatgpt.com/"                  → "ChatGPT"
 *   "https://claude.ai/"                    → "Claude"
 *   "https://threads.net/"                  → "Threads"
 *   "https://bsky.app/"                     → "Bluesky"
 *   "https://mysite.com/page-1"             → "Direct" (Same-domain internal navigation)
 *   ""                                      → "Direct"
 */

interface SourceRule {
  /** Substring(s) to match against the referrer hostname or UTM source (lowercased). */
  patterns: string[];
  /** Canonical source label. */
  label: string;
}

export const SOURCE_RULES: SourceRule[] = [
  // AI Search & LLMs
  { patterns: ['chatgpt', 'openai'],                            label: 'ChatGPT' },
  { patterns: ['claude', 'anthropic'],                         label: 'Claude' },
  { patterns: ['perplexity'],                                  label: 'Perplexity' },
  { patterns: ['copilot'],                                     label: 'Copilot' },
  { patterns: ['gemini'],                                      label: 'Gemini' },
  { patterns: ['you.com'],                                     label: 'You.com' },
  { patterns: ['phind'],                                       label: 'Phind' },

  // Search Engines
  { patterns: ['google'],                                      label: 'Google' },
  { patterns: ['bing'],                                        label: 'Bing' },
  { patterns: ['duckduckgo', 'ddg.gg'],                        label: 'DuckDuckGo' },
  { patterns: ['brave', 'search.brave.com'],                   label: 'Brave Search' },
  { patterns: ['ecosia'],                                      label: 'Ecosia' },
  { patterns: ['kagi'],                                        label: 'Kagi' },
  { patterns: ['qwant'],                                       label: 'Qwant' },
  { patterns: ['yahoo'],                                       label: 'Yahoo' },
  { patterns: ['baidu'],                                       label: 'Baidu' },
  { patterns: ['yandex'],                                      label: 'Yandex' },
  { patterns: ['naver'],                                       label: 'Naver' },
  { patterns: ['sogou'],                                       label: 'Sogou' },

  // Social & Community Networks
  { patterns: ['twitter', 'x.com', 't.co'],                    label: 'X (Twitter)' },
  { patterns: ['threads'],                                     label: 'Threads' },
  { patterns: ['bluesky', 'bsky'],                             label: 'Bluesky' },
  { patterns: ['mastodon', 'mstdn'],                           label: 'Mastodon' },
  { patterns: ['linkedin', 'lnkd.in'],                         label: 'LinkedIn' },
  { patterns: ['facebook', 'fb.com', 'fb.me', 'fbcdn'],        label: 'Facebook' },
  { patterns: ['instagram', 'instagr.am'],                     label: 'Instagram' },
  { patterns: ['youtube', 'youtu.be'],                         label: 'YouTube' },
  { patterns: ['reddit', 'redd.it'],                           label: 'Reddit' },
  { patterns: ['tiktok'],                                      label: 'TikTok' },
  { patterns: ['pinterest', 'pin.it'],                         label: 'Pinterest' },
  { patterns: ['discord'],                                     label: 'Discord' },
  { patterns: ['slack'],                                       label: 'Slack' },
  { patterns: ['whatsapp', 'wa.me'],                           label: 'WhatsApp' },
  { patterns: ['telegram', 't.me'],                            label: 'Telegram' },
  { patterns: ['snapchat'],                                    label: 'Snapchat' },

  // Tech, Developer & Creator Platforms
  { patterns: ['news.ycombinator.com', 'hacker-news', 'hackernews'], label: 'Hacker News' },
  { patterns: ['github'],                                      label: 'GitHub' },
  { patterns: ['gitlab'],                                      label: 'GitLab' },
  { patterns: ['stackoverflow', 'stackexchange'],              label: 'Stack Overflow' },
  { patterns: ['producthunt'],                                 label: 'Product Hunt' },
  { patterns: ['medium'],                                      label: 'Medium' },
  { patterns: ['substack'],                                    label: 'Substack' },
  { patterns: ['dev.to', 'devto'],                             label: 'Dev.to' },
  { patterns: ['hashnode'],                                    label: 'Hashnode' },
  { patterns: ['dribbble'],                                    label: 'Dribbble' },
  { patterns: ['behance'],                                     label: 'Behance' },
];

/**
 * Extracts and cleans hostname from a URL string (strips protocol and leading www).
 */
function cleanHostname(urlStr: string): string {
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return urlStr.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

/**
 * Given a raw referrer string and optionally pageUrl, returns a canonical source label.
 * 1. Checks UTM parameters (utm_source, ref, source) first.
 * 2. Checks if referrer is internal (same-domain), returning "Direct".
 * 3. Matches referrer against known search engines, AI tools, social networks.
 * 4. Returns clean hostname for unknown external referrers.
 */
export function classifySource(referrer?: string | null, pageUrl?: string | null): string {
  // 1. Check URL query parameters (e.g. ?utm_source=chatgpt, ?ref=producthunt)
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
        // Capitalize custom source (e.g. "newsletter" -> "Newsletter")
        return rawSource.charAt(0).toUpperCase() + rawSource.slice(1);
      }
    } catch {
      // Ignore URL parse error
    }
  }

  // 2. Check referrer header / URL
  if (referrer && referrer.trim() !== '') {
    const referrerHost = cleanHostname(referrer);
    if (!referrerHost) return 'Direct';

    // Same-Domain Referrer Bug Fix:
    // If referrer domain matches the current page domain, it's internal navigation -> Direct
    if (pageUrl) {
      const pageHost = cleanHostname(pageUrl);
      if (pageHost && (referrerHost === pageHost || referrerHost.endsWith(`.${pageHost}`))) {
        return 'Direct';
      }
    }

    // Match against known source rules
    for (const rule of SOURCE_RULES) {
      if (rule.patterns.some(pattern => referrerHost.includes(pattern))) {
        return rule.label;
      }
    }

    // Return clean hostname for unknown external referrers (e.g. "blog.example.com")
    return referrerHost;
  }

  return 'Direct';
}

