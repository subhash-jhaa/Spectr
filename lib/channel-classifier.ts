/**
 * Channel Classifier Module
 * Categorizes traffic sources and UTM parameters into industry-standard Marketing Channels.
 */

export function classifyChannel(source: string, utmMedium?: string | null): string {
  const medium = (utmMedium || '').toLowerCase().trim();
  const src = (source || '').toLowerCase().trim();

  // Paid Channels
  if (['cpc', 'ppc', 'paidsearch', 'adwords', 'search_ad'].includes(medium)) {
    return 'Paid Search';
  }
  if (['paid_social', 'paidsocial', 'social_paid', 'social_ad'].includes(medium)) {
    return 'Paid Social';
  }
  if (['email', 'newsletter', 'edm'].includes(medium)) {
    return 'Email';
  }

  // AI Search & LLM Engines
  const aiSources = ['chatgpt', 'claude', 'perplexity', 'copilot', 'gemini', 'you.com', 'phind'];
  if (aiSources.some((ai) => src.includes(ai))) {
    return 'AI Search';
  }

  // Organic Search Engines
  const searchSources = [
    'google', 'bing', 'duckduckgo', 'brave search', 'ecosia', 'kagi',
    'qwant', 'yahoo', 'baidu', 'yandex', 'naver', 'sogou'
  ];
  if (searchSources.some((s) => src.includes(s))) {
    return 'Organic Search';
  }

  // Social Networks
  const socialSources = [
    'x (twitter)', 'twitter', 'threads', 'bluesky', 'mastodon', 'linkedin',
    'facebook', 'instagram', 'youtube', 'reddit', 'tiktok', 'pinterest',
    'discord', 'slack', 'whatsapp', 'telegram', 'snapchat'
  ];
  if (socialSources.some((soc) => src.includes(soc))) {
    return 'Social';
  }

  // Direct Traffic
  if (src === 'direct' || src === '') {
    return 'Direct';
  }

  // External Website Referrals
  return 'Referral';
}
