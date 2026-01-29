// Add-to-app.js: Ensure clicking the EVOKA logo navigates to Home.
// - Logo element id: "evoka-logo"
// - Calls app.navigateTo("home") if available, otherwise falls back to window.location.hash = "#home"
// - No new globals introduced. Safe to append to existing app.js.

(function () {
  function navigateHomeFallback() {
    if (window.app && typeof window.app.navigateTo === 'function') {
      try {
        window.app.navigateTo('home');
        return;
      } catch (err) {
        console.warn('app.navigateTo threw an error:', err);
      }
    }
    // fallback
    try {
      window.location.hash = '#home';
    } catch (err) {
      console.warn('Could not set location.hash for fallback navigation', err);
    }
  }

  function onLogoActivate(e) {
    // support click and keyboard activation
    if (e) e.preventDefault();
    navigateHomeFallback();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var logo = document.getElementById('evoka-logo');
    if (!logo) return;

    // Make sure logo is keyboard accessible (does not override existing attributes)
    if (!logo.hasAttribute('role')) logo.setAttribute('role', 'button');
    if (!logo.hasAttribute('tabindex')) logo.setAttribute('tabindex', '0');
    // set pointer cursor visually (non-invasive)
    try { logo.style.cursor = logo.style.cursor || 'pointer'; } catch (e) { /* noop */ }

    logo.addEventListener('click', onLogoActivate);

    // keyboard activation (Enter or Space)
    logo.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        onLogoActivate(ev);
      }
    });
  });
})();
