/**
 * url-mask.js — SplitMate URL Masking
 * Hides ?id=, .html, /pages/ from the browser address bar.
 *
 * Strategy:
 *  - If URL has query params → save to sessionStorage keyed by page, then mask
 *  - If URL has no params → read from sessionStorage for this page (back/forward)
 *  - window.__urlParams always has the correct params for the current page
 */
(function () {

  const rawSearch = window.location.search;   // "?id=abc123" or ""
  const path      = window.location.pathname; // "/pages/group-detail.html"
  const origin    = window.location.origin;
  const storageKey = '__urlParams_' + path;   // unique per page path

  // ── 1. Determine params: prefer live URL, fallback to stored ─────────────
  let paramsStr;
  if (rawSearch && rawSearch.length > 1) {
    // Fresh navigation with real params — save them
    paramsStr = rawSearch;
    sessionStorage.setItem(storageKey, rawSearch);
  } else {
    // No params in URL (after replaceState or direct clean URL visit)
    paramsStr = sessionStorage.getItem(storageKey) || '';
  }

  const params = new URLSearchParams(paramsStr);

  // ── 2. Expose globally so all page scripts can use window.__urlParams ─────
  window.__urlParams = params;

  // ── 3. Helper function ────────────────────────────────────────────────────
  window.getParam = function (key) {
    return window.__urlParams.get(key);
  };

  // ── 4. Clean URL map ──────────────────────────────────────────────────────
  const cleanMap = {
    '/index.html':               '/',
    '/dashboard.html':           '/dashboard',
    '/expenses.html':            '/expenses',
    '/profile.html':             '/profile',
    '/invitations.html':         '/invitations',
    '/add-expense.html':         '/add-expense',
    '/invite.html':              '/invite',
    '/group.html':               '/groups',
    '/pages/dashboard.html':     '/dashboard',
    '/pages/groups.html':        '/groups',
    '/pages/group-detail.html':  '/group',
    '/pages/invitations.html':   '/invitations',
    '/pages/balances.html':      '/balances',
    '/pages/activity.html':      '/activity',
    '/pages/login.html':         '/',
  };

  let cleanPath = cleanMap[path];
  if (!cleanPath) {
    cleanPath = path.replace(/\.html$/, '').replace('/pages/', '/');
  }

  // Group detail gets the id as a path segment: /group/abc123
  if (path.includes('group-detail') && params.get('id')) {
    cleanPath = '/group/' + params.get('id');
  }

  // ── 5. Mask the URL (cosmetic only — page logic is unaffected) ────────────
  if (rawSearch && rawSearch.length > 1 && cleanPath) {
    try {
      window.history.replaceState(
        { urlParams: paramsStr, page: path },
        document.title,
        origin + cleanPath
      );
    } catch (e) { /* silently ignore */ }
  }

})();
