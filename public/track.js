(function() {
  'use strict';

  // 1. Locate the tracking script element and retrieve site ID
  const script = document.currentScript ||
                 document.querySelector('script[data-site]') ||
                 document.querySelector('script[src*="track.js"]');

  const siteId = script?.getAttribute('data-site');
  const customApi = script?.getAttribute('data-api');

  if (!siteId) {
    console.warn("Spectr: No 'data-site' attribute found on script tag.");
    return;
  }

  // 2. Determine API tracking endpoint URL
  let apiUrl = customApi || 'https://spectr.subhashjha.me/api/track';
  if (!customApi) {
    try {
      if (script?.src) {
        apiUrl = `${new URL(script.src).origin}/api/track`;
      }
    } catch {
      // Fallback to default endpoint if URL parsing fails
    }
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
  function shouldTrackVisit(isHeartbeat) {
    const now = Date.now();
    const currentPage = window.location.href;
    const lastPage = sessionStorage.getItem(LAST_PAGE_KEY);
    const lastTrack = Number(sessionStorage.getItem(LAST_TRACK_KEY)) || 0;

    const pageChanged = lastPage !== currentPage;
    const isNewSessionOrExpired = !sessionStorage.getItem(SESSION_KEY) || (now - lastTrack) > 30 * 60 * 1000;
    
    // Heartbeat pings every 30s
    if (isHeartbeat) {
      if (now - lastTrack >= 25 * 1000) {
        sessionStorage.setItem(LAST_TRACK_KEY, now.toString());
        return true;
      }
      return false;
    }

    // Normal pageview or page changed
    if (pageChanged || isNewSessionOrExpired || (now - lastTrack) > 30 * 1000) {
      sessionStorage.setItem(LAST_PAGE_KEY, currentPage);
      sessionStorage.setItem(LAST_TRACK_KEY, now.toString());
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

    var utm = getUtmParams();
    var payload = {
      projectId: siteId,
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      sessionId: sessionStorage.getItem(SESSION_KEY) || '',
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