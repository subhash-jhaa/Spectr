(function() {
  'use strict';

  // 1. Locate the tracking script element and retrieve site configuration
  function getScriptElement() {
    return document.currentScript ||
           document.querySelector('script[data-site]') ||
           document.querySelector('script[src*="track.js"]') ||
           document.querySelector('script[src*="track.v1.js"]');
  }

  const script = getScriptElement();
  const siteId = script?.getAttribute('data-site');
  const customApi = script?.getAttribute('data-api');

  if (!siteId) {
    console.warn("Spectr: No 'data-site' attribute found on script tag.");
    return;
  }

  // 2. Determine API tracking endpoint URL
  let apiUrl = customApi;
  if (!apiUrl && script?.src) {
    try {
      const parsedUrl = new URL(script.src, window.location.href);
      if (parsedUrl.origin && parsedUrl.origin !== 'null') {
        apiUrl = `${parsedUrl.origin}/api/track`;
      }
    } catch (e) {}
  }
  if (!apiUrl) {
    apiUrl = 'https://spectr.subhashjha.me/api/track';
  }

  // 3. Safe Storage Helpers (protects against incognito/iframe restrictions)
  const SESSION_KEY = `spectr_session_${siteId}`;
  const LAST_TRACK_KEY = `spectr_last_track_${siteId}`;
  const LAST_PAGE_KEY = `spectr_last_page_${siteId}`;

  function safeGetItem(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetItem(key, val) {
    try {
      sessionStorage.setItem(key, val);
    } catch (e) {}
  }

  // Helper to generate or fetch a valid session ID
  function getOrCreateSessionId(now) {
    let sessionId = safeGetItem(SESSION_KEY);
    const lastTrack = Number(safeGetItem(LAST_TRACK_KEY)) || 0;

    // Reset session if missing or inactive for more than 30 minutes
    if (!sessionId || (now - lastTrack) > 30 * 60 * 1000) {
      sessionId = `${siteId}_${now}_${Math.random().toString(36).slice(2, 11)}`;
      safeSetItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  // Check whether we should track (rate limiting & page change detection)
  function shouldTrackVisit(isHeartbeat) {
    const now = Date.now();
    const currentPage = window.location.href;
    const lastPage = safeGetItem(LAST_PAGE_KEY);
    const lastTrack = Number(safeGetItem(LAST_TRACK_KEY)) || 0;

    const pageChanged = lastPage !== currentPage;
    const isNewSessionOrExpired = !safeGetItem(SESSION_KEY) || (now - lastTrack) > 30 * 60 * 1000;
    
    // Heartbeat pings every 30s; minimum 20s gap ensures we stay within the 3-min active window
    if (isHeartbeat) {
      if (now - lastTrack >= 20 * 1000) {
        safeSetItem(LAST_TRACK_KEY, now.toString());
        return true;
      }
      return false;
    }

    // Normal pageview or page changed
    if (pageChanged || isNewSessionOrExpired || (now - lastTrack) > 30 * 1000) {
      safeSetItem(LAST_PAGE_KEY, currentPage);
      safeSetItem(LAST_TRACK_KEY, now.toString());
      getOrCreateSessionId(now);
      return true;
    }

    return false;
  }

  // Parse UTM parameters from current URL
  function getUtmParams() {
    try {
      var params = new URLSearchParams(window.location.search);
      return {
        utm_source:   params.get('utm_source')   || params.get('ref') || params.get('source') || '',
        utm_medium:   params.get('utm_medium')   || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term:     params.get('utm_term')     || '',
        utm_content:  params.get('utm_content')  || ''
      };
    } catch(e) { return {}; }
  }

  // Send tracking beacon
  function track(isHeartbeat) {
    if (!shouldTrackVisit(isHeartbeat)) return;

    var timezone = '';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch(e) {}

    var locale = navigator.language || '';
    var utm = getUtmParams();

    var payload = {
      projectId: siteId,
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent || '',
      sessionId: safeGetItem(SESSION_KEY) || '',
      timezone: timezone,
      locale: locale,
      utm: utm
    };

    var payloadStr = JSON.stringify(payload);
    if (typeof fetch === 'function') {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadStr,
        keepalive: true
      }).catch(function(error) {
        console.debug('Spectr: Tracking request failed', error);
      });
    } else if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl, payloadStr);
    }
  }

  // Initial load tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { track(false); });
  } else {
    track(false);
  }

  // Live visitor heartbeat every 30 seconds while tab is active
  setInterval(function() {
    if (!document.hidden) {
      track(true);
    }
  }, 30 * 1000);

  // Visibility tracking (when user returns to tab)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      track(false);
    }
  });

  // SPA navigation handling (History API & hashchange)
  const scheduleTrack = () => setTimeout(function() { track(false); }, 100);

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