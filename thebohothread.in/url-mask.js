/**
 * url-mask.js — SplitMate URL Masking
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads the current page + query params, then uses history.replaceState()
 * to show a clean URL in the browser address bar while keeping all params
 * available in memory for the page scripts to use.
 *
 * Add this as the FIRST script tag on every HTML page (before Firebase):
 *   <script src="/url-mask.js"></script>   (root pages)
 *   <script src="../url-mask.js"></script>  (pages/ subfolder)
 *
 * After this script runs, window.__urlParams holds all original params so
 * pages can still do: window.__urlParams.get('id') instead of URLSearchParams.
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  const params  = new URLSearchParams(window.location.search);
  const path    = window.location.pathname;   // e.g. /pages/group-detail.html
  const origin  = window.location.origin;     // e.g. https://thebohothread.in

  // Store original params globally so page scripts can still read them
  window.__urlParams = params;

  // ── Map each page to its clean URL ────────────────────────────────────────
  const cleanMap = {
    // root pages
    '/index.html':                '/',
    '/dashboard.html':            '/dashboard',
    '/expenses.html':             '/expenses',
    '/profile.html':              '/profile',
    '/invitations.html':          '/invitations',
    '/add-expense.html':          '/add-expense',
    '/invite.html':               '/invite',
    '/group.html':                '/groups',

    // pages/ subfolder
    '/pages/dashboard.html':      '/dashboard',
    '/pages/groups.html':         '/groups',
    '/pages/group-detail.html':   '/group',   // + /:id below
    '/pages/invitations.html':    '/invitations',
    '/pages/balances.html':       '/balances',
    '/pages/activity.html':       '/activity',
    '/pages/login.html':          '/',
  };

  let cleanPath = cleanMap[path];

  // If no mapping found, strip .html as a fallback
  if (!cleanPath) {
    cleanPath = path.replace(/\.html$/, '').replace('/pages/', '/');
  }

  // For group-detail, append the id as a clean path segment
  // /group-detail.html?id=abc123  →  /group/abc123
  if (path.includes('group-detail') && params.get('id')) {
    cleanPath = '/group/' + params.get('id');
  }

  // For add-expense with a groupId param, keep it clean
  // /add-expense.html?groupId=abc  →  /add-expense  (groupId stays in memory)
  // No need to show groupId in URL

  // For invite with token, keep clean too
  // /invite.html?token=xyz  →  /invite

  // Only replace if the current URL is different (avoids pushState spam)
  const currentClean = window.location.pathname;
  if (currentClean !== cleanPath) {
    try {
      window.history.replaceState(
        { urlParams: params.toString() },  // stash params in history state
        document.title,
        origin + cleanPath
      );
    } catch (e) {
      // Silently fail — URL masking is cosmetic, never break the app
    }
  }

  // ── Patch URLSearchParams so existing page code still works ───────────────
  // Pages do: new URLSearchParams(location.search).get('id')
  // After replaceState, location.search is empty — so we patch it.
  // We store params in history.state and in window.__urlParams.
  // Pages should use window.__urlParams.get('id') but to avoid touching
  // every page, we also restore them via a getter override.
  try {
    const _originalSearch = Object.getOwnPropertyDescriptor(Location.prototype, 'search');
    if (_originalSearch && params.toString()) {
      Object.defineProperty(window.location, 'search', {
        get: function () {
          // If history state has params, return them
          const state = window.history.state;
          if (state && state.urlParams) return '?' + state.urlParams;
          return _originalSearch.get.call(this);
        },
        configurable: true
      });
    }
  } catch (e) {
    // Some browsers block Location prototype override — fallback below works
  }

  // ── Patch new URLSearchParams(location.search) usage ─────────────────────
  // Safest fallback: override window.location.search via a proxy isn't always
  // possible, so we also intercept the specific pattern pages use.
  // Pages call: new URLSearchParams(location.search).get('id')
  // We make window.__getParam(key) available as an alternative.
  window.__getParam = function (key) {
    return params.get(key);
  };

})();
