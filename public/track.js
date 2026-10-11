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

  const memoryStorage = {};
  function safeGetItem(key) {
    try {
      return sessionStorage.getItem(key) || memoryStorage[key] || null;
    } catch (e) {
      return memoryStorage[key] || null;
    }
  }

  function safeSetItem(key, val) {
    memoryStorage[key] = val;
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

  const makeId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  let trackedPage = '';
  let pageViewId = makeId();

  // Check whether we should track (rate limiting & page change detection)
  function shouldTrackVisit(isHeartbeat) {
    const now = Date.now();
    const currentPage = window.location.href;
    const previousSession = safeGetItem(SESSION_KEY);
    const nowSession = getOrCreateSessionId(now);
    const sessionChanged = previousSession !== nowSession;
    const pageChanged = currentPage !== trackedPage;
    const lastTrack = Number(safeGetItem(LAST_TRACK_KEY)) || 0;
    if (isHeartbeat && !pageChanged && !sessionChanged && now - lastTrack < 20000) return false;
    if (!isHeartbeat && !pageChanged && !sessionChanged) return false;
    if (pageChanged || sessionChanged) { pageViewId = makeId(); trackedPage = currentPage; }
    safeSetItem(SESSION_KEY, nowSession);
    safeSetItem(LAST_TRACK_KEY, now.toString());
    return true;
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
    const previousView = pageViewId;
    if (!shouldTrackVisit(isHeartbeat)) return;
    isHeartbeat = isHeartbeat && previousView === pageViewId;

    var timezone = '';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch(e) {}

    var locale = navigator.language || '';
    var utm = getUtmParams();

    var payload = {
      projectId: siteId,
      type: isHeartbeat ? 'heartbeat' : 'pageview',
      pageViewId: pageViewId,
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
      track(true);
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

  // =========================================================================
  // Core Web Vitals Tracking (Native PerformanceObserver — zero dependencies)
  // =========================================================================
  (function initWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const vitals = { lcp: null, inp: null, cls: 0 };
    let vitalsUrl = apiUrl.replace(/\/api\/track\/?$/, '/api/vitals');
    if (vitalsUrl === apiUrl) {
      vitalsUrl = `${apiUrl.substring(0, apiUrl.lastIndexOf('/'))}/vitals`;
    }

    // ---------- 1. LCP (Largest Contentful Paint) ----------
    try {
      const lcpObserver = new PerformanceObserver(function(list) {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          vitals.lcp = Math.round(last.renderTime || last.loadTime);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      const stopLCP = function() {
        try { lcpObserver.disconnect(); } catch(e) {}
      };
      ['keydown', 'click', 'visibilitychange'].forEach(function(type) {
        window.addEventListener(type, stopLCP, { once: true, capture: true });
      });
    } catch (e) {}

    // ---------- 2. CLS (Session-Window Algorithm) ----------
    let sessionValue = 0;
    let sessionEntries = [];
    try {
      const clsObserver = new PerformanceObserver(function(list) {
        const entries = list.getEntries();
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.hadRecentInput) continue;

          const first = sessionEntries[0];
          const lastEntry = sessionEntries[sessionEntries.length - 1];

          if (
            sessionValue &&
            entry.startTime - lastEntry.startTime < 1000 &&
            entry.startTime - first.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > vitals.cls) {
            vitals.cls = Math.round(sessionValue * 1000) / 1000;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}

    // ---------- 3. INP (Interaction to Next Paint - 98th Percentile) ----------
    const interactionDurations = [];
    try {
      const inpObserver = new PerformanceObserver(function(list) {
        const entries = list.getEntries();
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.interactionId) {
            interactionDurations.push(entry.duration);
          }
        }
        if (interactionDurations.length) {
          const sorted = interactionDurations.slice().sort(function(a, b) { return a - b; });
          const idx = sorted.length < 50 ? sorted.length - 1 : Math.floor(sorted.length * 0.98);
          vitals.inp = Math.round(sorted[idx]);
        }
      });
      inpObserver.observe({ type: 'event', durationThreshold: 40, buffered: true });
    } catch (e) {}

    function getDeviceType() {
      return window.innerWidth < 768 ? 'Mobile' : 'Desktop';
    }

    const sampleId = makeId();
    const measuredPageUrl = window.location.href;
    let lastSentPayload = '';

    function sendVitals() {
      if (vitals.lcp === null && vitals.inp === null && !vitals.cls) return;

      const payload = JSON.stringify({
        projectId: siteId,
        sampleId: sampleId,
        pageUrl: measuredPageUrl,
        lcp: vitals.lcp,
        inp: vitals.inp,
        cls: vitals.cls,
        device: getDeviceType(),
      });

      if (payload === lastSentPayload) return;
      lastSentPayload = payload;

      if (navigator.sendBeacon) {
        try {
          const blob = new Blob([payload], { type: 'application/json' });
          if (navigator.sendBeacon(vitalsUrl, blob)) return;
        } catch (e) {}
      }

      if (typeof fetch === 'function') {
        fetch(vitalsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(function() {});
      }
    }

    // 1. Initial dispatch after 4 seconds of page load (captures fast LCP/CLS)
    setTimeout(function() {
      sendVitals();
    }, 4000);

    // 2. Final dispatch when user switches tabs or navigates away
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        sendVitals();
      }
    });

    window.addEventListener('pagehide', function() {
      sendVitals();
    });
  })();
})();
