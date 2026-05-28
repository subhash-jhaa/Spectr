(function() {
  'use strict';
  
  // Get the script tag to determine site ID and the API base URL
  // document.currentScript is null when loaded asynchronously (e.g., Next.js <Script>)
  let script = document.currentScript;
  
  // Fallback 1: find script with data-site attribute
  if (!script) {
    script = document.querySelector('script[data-site]');
  }
  
  // Fallback 2: find script by src pattern (handles frameworks that strip custom attributes)
  if (!script) {
    const allScripts = document.querySelectorAll('script[src*="track.js"]');
    for (const s of allScripts) {
      if (s.getAttribute('data-site')) {
        script = s;
        break;
      }
    }
  }

  // Fallback 3: find any script with src containing our tracking path
  if (!script) {
    script = document.querySelector('script[src*="track.js"][data-site]') || 
             document.querySelector('script[src*="/track.js"]');
  }

  // Extract site ID - check the script tag first, then check for global override
  let siteId = null;
  if (script) {
    siteId = script.getAttribute('data-site');
  }
  
  // Fallback: check if Next.js or another framework set data attributes on the script differently
  if (!siteId) {
    // Search ALL script tags for data-site (some frameworks re-create script elements)
    const allScripts = document.querySelectorAll('script[data-site]');
    if (allScripts.length > 0) {
      siteId = allScripts[0].getAttribute('data-site');
      script = allScripts[0];
    }
  }

  if (!siteId) {
    console.warn("Spectr: No 'data-site' attribute found on any script tag. Make sure to add data-site to your tracking script.");
    return;
  }
  
  // Determine the base URL from the script's own src to ensure correct API endpoint
  let apiUrl;
  try {
    const scriptSrc = new URL(script.src);
    const baseUrl = scriptSrc.origin;
    apiUrl = `${baseUrl}/api/track`;
  } catch (e) {
    // If we can't parse the script src (e.g., inline script), try to infer from known domains
    apiUrl = 'https://spectr.subhashjha.me/api/track';
    console.debug('Spectr: Could not determine API URL from script src, using default:', apiUrl);
  }
  
  // Session management to prevent duplicate tracking
  const sessionKey = `wvm_session_${siteId}`;
  const lastTrackKey = `wvm_last_track_${siteId}`;
  const lastPageKey = `wvm_last_page_${siteId}`;
  
  // Check if we should track this visit
  function shouldTrack() {
    const now = Date.now();
    const lastTrack = sessionStorage.getItem(lastTrackKey);
    const sessionId = sessionStorage.getItem(sessionKey);
    
    // If no session exists, create one
    if (!sessionId) {
      const newSessionId = `${siteId}_${now}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(sessionKey, newSessionId);
      sessionStorage.setItem(lastTrackKey, now.toString());
      return true;
    }
    
    // If last track was more than 30 minutes ago, treat as new session
    if (lastTrack && (now - parseInt(lastTrack)) > 30 * 60 * 1000) {
      const newSessionId = `${siteId}_${now}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(sessionKey, newSessionId);
      sessionStorage.setItem(lastTrackKey, now.toString());
      return true;
    }
    
    // If we tracked in the last 5 minutes, don't track again
    if (lastTrack && (now - parseInt(lastTrack)) < 5 * 60 * 1000) {
      return false;
    }
    
    // Update last track time
    sessionStorage.setItem(lastTrackKey, now.toString());
    return true;
  }
  
  // Check if page has changed
  function hasPageChanged() {
    const currentPage = window.location.href;
    const lastPage = sessionStorage.getItem(lastPageKey);
    
    if (lastPage !== currentPage) {
      sessionStorage.setItem(lastPageKey, currentPage);
      return true;
    }
    
    return false;
  }
  
  // Get visitor information
  function getVisitorInfo() {
    const sessionId = sessionStorage.getItem(sessionKey);
    return {
      projectId: siteId,
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      sessionId: sessionId || '',
      ip: '', // Will be detected server-side
      country: 'Unknown', // Will be detected server-side
      city: 'Unknown' // Will be detected server-side
    };
  }
  
  // Send tracking data
  function track() {
    // Track if we should OR if the page has changed
    if (!shouldTrack() && !hasPageChanged()) {
      return;
    }
    
    const data = getVisitorInfo();
    
    // Send to our absolute tracking endpoint
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).catch(error => {
      // Silently fail to not affect user experience
      console.debug('Who\'s Viewing Me: Tracking failed', error);
    });
  }
  
  // Track on page load only
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', track);
  } else {
    track();
  }
  
  // Track on page visibility change only if it's been more than 5 minutes
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      const now = Date.now();
      const lastTrack = sessionStorage.getItem(lastTrackKey);
      
      // Only track if it's been more than 5 minutes since last track
      if (!lastTrack || (now - parseInt(lastTrack)) > 5 * 60 * 1000) {
        track();
      }
    }
  });
  
  // Track on popstate (browser back/forward)
  window.addEventListener('popstate', function() {
    // Small delay to ensure URL has updated
    setTimeout(track, 100);
  });
  
  // Track on pushstate/replacestate (programmatic navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    setTimeout(track, 100);
  };
  
  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    setTimeout(track, 100);
  };
  
  // For SPAs, also listen to hash changes
  window.addEventListener('hashchange', function() {
    setTimeout(track, 100);
  });
  
})(); 