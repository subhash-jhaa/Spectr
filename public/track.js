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
  const exclusionKey = `spectr_excluded_${siteId}`;
  const configuration = new URLSearchParams(window.location.search || '');
  const testToken = configuration.get('spectr_test');
  let excluded = false;
  try { excluded = localStorage.getItem(exclusionKey) === '1'; } catch (e) { try { excluded = sessionStorage.getItem(exclusionKey) === '1'; } catch (e) {} }
  function setExcluded(value) {
    excluded = value;
    try { localStorage.setItem(exclusionKey, value ? '1' : '0'); } catch (e) { try { sessionStorage.setItem(exclusionKey, value ? '1' : '0'); } catch (e) {} }
  }
  window.spectr = { track: function() { return false; }, isExcluded: function() { return excluded; }, optOut: function() { setExcluded(true); }, optIn: function() { setExcluded(false); } };
  const configuring = configuration.get('spectr_exclude') === siteId || configuration.get('spectr_include') === siteId;
  if (configuring) {
    setExcluded(configuration.get('spectr_exclude') === siteId);
    const notice = function() {
      if (!document.createElement || !document.body) return;
      const element = document.createElement('div');
      element.textContent = excluded ? 'Spectr: this browser is excluded from analytics on this website.' : 'Spectr: tracking is enabled for this browser. Remove the configuration parameter or open a normal page to resume.';
      element.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;z-index:2147483647;padding:16px;background:#111827;color:white;border-radius:12px;font:14px system-ui';
      element.setAttribute('role', 'status');
      element.addEventListener('click', function() { element.remove(); });
      document.body.appendChild(element);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', notice); else notice();
    return;
  }
  if (excluded && !testToken) return;

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
  const TRACKER_VERSION = '2.1.1';
  const pending = new Map();
  let currentPageview = null;
  let acknowledgedView = null;
  const acceptedViews = new Set();
  const deliveryId = payload => payload.eventId || payload.pageViewId;
  // Four total attempts, at most 20 pending pageviews, and a ten-minute lifetime.
  // Keep payloads in memory so URL data is not persisted in browser storage.
  function deliver(entry) {
    if (excluded && entry.payload.type !== 'test' || pending.get(deliveryId(entry.payload)) !== entry) return;
    if (entry.payload.type === 'custom' && !acceptedViews.has(entry.payload.pageViewId)) return;
    if (entry.inFlight || entry.attempts >= 4) return;
    if (Date.now() < entry.retryAt) return;
    if (Date.now() - entry.createdAt >= 600000) { pending.delete(deliveryId(entry.payload)); return; }
    const destination = entry.payload.type === 'custom' ? (/\/api\/track\/?$/.test(apiUrl) ? apiUrl.replace(/\/api\/track\/?$/, '/api/events') : apiUrl.replace(/\/[^/]*$/, '/events')) : apiUrl;
    if (typeof fetch !== 'function') {
      const queued = navigator.sendBeacon && navigator.sendBeacon(destination, JSON.stringify(entry.payload));
      pending.delete(deliveryId(entry.payload));
      if (queued && currentPageview && currentPageview.pageViewId === entry.payload.pageViewId) acknowledgedView = entry.payload.pageViewId;
      return;
    }
    entry.inFlight = true;
    entry.attempts++;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 8000) : null;
    const retry = (response) => {
      if (pending.get(deliveryId(entry.payload)) !== entry) return;
      if (entry.attempts >= 4) return;
      let delay = [1000, 3000, 10000][entry.attempts - 1] + Math.floor(Math.random() * 500);
      const retryAfter = response && response.headers && response.headers.get('Retry-After');
      if (retryAfter) {
        const seconds = Number(retryAfter);
        const requested = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now();
        if (Number.isFinite(requested)) delay = Math.max(delay, requested);
      }
      if (Date.now() + delay - entry.createdAt >= 600000) return;
      entry.retryAt = Date.now() + delay;
      entry.timer = setTimeout(() => { entry.timer = null; deliver(entry); }, delay);
    };
    fetch(destination, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry.payload), keepalive: true,
      ...(controller ? { signal: controller.signal } : {}) })
      .then(response => {
        if (response.ok) {
          pending.delete(deliveryId(entry.payload));
          if (entry.payload.type === 'pageview') {
            acceptedViews.add(entry.payload.pageViewId);
            if (acceptedViews.size > 50) acceptedViews.delete(acceptedViews.values().next().value);
            if (currentPageview && currentPageview.pageViewId === entry.payload.pageViewId) acknowledgedView = entry.payload.pageViewId;
            for (const queued of pending.values()) if (queued.payload.type === 'custom' && queued.payload.pageViewId === entry.payload.pageViewId) deliver(queued);
          }
        } else if (response.status === 408 || response.status === 429 || response.status >= 500 || response.status === 409 && entry.payload.type === 'custom') retry(response);
        else pending.delete(deliveryId(entry.payload));
      }, () => retry())
      .finally(() => { entry.inFlight = false; if (timeout !== null) clearTimeout(timeout); });
  }
  function queuePageview(payload) {
    for (const [id, entry] of pending) if (Date.now() - entry.createdAt >= 600000) { if (entry.timer) clearTimeout(entry.timer); pending.delete(id); }
    if (pending.has(deliveryId(payload))) return;
    if (pending.size >= 20) { const first = pending.keys().next().value; const entry = pending.get(first); if (entry.timer) clearTimeout(entry.timer); pending.delete(first); }
    const entry = { payload, createdAt: Date.now(), attempts: 0, inFlight: false, timer: null, retryAt: 0 };
    pending.set(deliveryId(payload), entry);
    deliver(entry);
  }
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
    if (excluded) return;
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
      trackerVersion: TRACKER_VERSION,
      occurredAt: Date.now(),
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent || '',
      sessionId: safeGetItem(SESSION_KEY) || '',
      timezone: timezone,
      locale: locale,
      utm: utm
    };

    if (!isHeartbeat) { currentPageview = payload; queuePageview(payload); return; }
    // Do not send heartbeats until the initial pageview has been accepted.
    if (acknowledgedView !== pageViewId) return;
    var payloadStr = JSON.stringify(payload);
    if (typeof fetch === 'function') {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadStr,
        keepalive: true
      }).then(function(response) {
        if (response.status === 409 && currentPageview && currentPageview.pageViewId === payload.pageViewId) {
          acknowledgedView = null;
          queuePageview(currentPageview);
        }
      }).catch(function(error) {
        console.debug('Spectr: Tracking request failed', error);
      });
    } else if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl, payloadStr);
    }
  }
  window.spectr.track = function(eventName, properties) {
    if (excluded || testToken || typeof fetch !== 'function' || typeof eventName !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_.:-]{0,63}$/.test(eventName)) return false;
    if (properties === undefined) properties = {};
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return false;
    const keys = Object.keys(properties);
    if (keys.length > 10) return false;
    const snapshot = {};
    for (const key of keys) {
      const value = properties[key];
      if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key) || /email|password|token|secret|address|phone|user_?id|^ip$/i.test(key)) return false;
      if (!(typeof value === 'string' && value.length <= 200 || typeof value === 'number' && Number.isFinite(value) || typeof value === 'boolean')) return false;
      snapshot[key] = value;
    }
    track(true);
    if (!currentPageview) return false;
    queuePageview({ projectId: siteId, type: 'custom', eventId: makeId(), eventName: eventName,
      sessionId: currentPageview.sessionId, pageViewId: currentPageview.pageViewId, occurredAt: Date.now(), properties: snapshot });
    return true;
  };

  // A test URL sends only an installation probe, never pageviews or Web Vitals.
  if (testToken) {
    queuePageview({ projectId: siteId, type: 'test', testToken: testToken, pageViewId: makeId(), pageUrl: window.location.href,
      trackerVersion: TRACKER_VERSION });
    return;
  }

  window.addEventListener('online', function() {
    for (const entry of pending.values()) {
      if (Date.now() < entry.retryAt) continue;
      if (entry.timer) { clearTimeout(entry.timer); entry.timer = null; }
      deliver(entry);
    }
  });

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
    let sampleRevision = 0;

    function sendVitals() {
      if (excluded) return;
      if (vitals.lcp === null && vitals.inp === null && !vitals.cls) return;

      const snapshot = JSON.stringify({
        projectId: siteId,
        sampleId: sampleId,
        pageUrl: measuredPageUrl,
        lcp: vitals.lcp,
        inp: vitals.inp,
        cls: vitals.cls,
        device: getDeviceType(),
      });

      if (snapshot === lastSentPayload) return;
      lastSentPayload = snapshot;
      const payload = JSON.stringify({ ...JSON.parse(snapshot), sampleRevision: ++sampleRevision });

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
