(function() {
  'use strict';

  // 1. Locate the tracking script element and retrieve site ID
  const script = document.currentScript ||
                 document.querySelector('script[data-site]') ||
                 document.querySelector('script[src*="track.js"]');

  const siteId = script?.getAttribute('data-site');

  if (!siteId) {
    console.warn("Spectr: No 'data-site' attribute found on script tag.");
    return;
  }

  // 2. Determine API tracking endpoint URL
  let apiUrl = 'https://spectr.subhashjha.me/api/track';
  try {
    if (script?.src) {
      apiUrl = `${new URL(script.src).origin}/api/track`;
    }
  } catch {
    // Fallback to default endpoint if URL parsing fails
  }

  // 3. Storage keys
  const SESSION_KEY = `wvm_session_${siteId}`;
  const LAST_TRACK_KEY = `wvm_last_track_${siteId}`;
  const LAST_PAGE_KEY = `wvm_last_page_${siteId}`;

  // Helper to generate or fetch a valid session ID
  function getOrCreateSessionId(now) {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    const lastTrack = Number(sessionStorage.getItem(LAST_TRACK_KEY)) || 0;

    // Reset session if missing or inactive for more than 30 minutes
    if (!sessionId || (now - lastTrack) > 30 * 60 * 1000) {
      sessionId = `${siteId}_${now}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  // Check whether we should track (rate limiting & page change detection)
  function shouldTrackVisit() {
    const now = Date.now();
    const currentPage = window.location.href;
    const lastPage = sessionStorage.getItem(LAST_PAGE_KEY);
    const lastTrack = Number(sessionStorage.getItem(LAST_TRACK_KEY)) || 0;

    const pageChanged = lastPage !== currentPage;
    const isNewSessionOrExpired = !sessionStorage.getItem(SESSION_KEY) || (now - lastTrack) > 30 * 60 * 1000;
    const isDebounced = (now - lastTrack) < 5 * 60 * 1000;

    // Track if page URL changed, or session is fresh/expired, or 5 min debounce window passed
    if (pageChanged || isNewSessionOrExpired || !isDebounced) {
      sessionStorage.setItem(LAST_PAGE_KEY, currentPage);
      sessionStorage.setItem(LAST_TRACK_KEY, now.toString());
      getOrCreateSessionId(now);
      return true;
    }

    return false;
  }

  // Send tracking beacon
  function track() {
    if (!shouldTrackVisit()) return;

    const payload = {
      projectId: siteId,
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      sessionId: sessionStorage.getItem(SESSION_KEY) || ''
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(error => {
      console.debug('Spectr: Tracking request failed', error);
    });
  }

  // Initial load tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', track);
  } else {
    track();
  }

  // Visibility tracking (when user returns to tab after 5+ mins)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      const lastTrack = Number(sessionStorage.getItem(LAST_TRACK_KEY)) || 0;
      if (Date.now() - lastTrack > 5 * 60 * 1000) {
        track();
      }
    }
  });

  // SPA navigation handling (History API & hashchange)
  const scheduleTrack = () => setTimeout(track, 100);

  window.addEventListener('popstate', scheduleTrack);
  window.addEventListener('hashchange', scheduleTrack);

  const wrapHistoryMethod = (type) => {
    const original = history[type];
    history[type] = function() {
      const result = original.apply(this, arguments);
      scheduleTrack();
      return result;
    };
  };

  wrapHistoryMethod('pushState');
  wrapHistoryMethod('replaceState');
})(); 