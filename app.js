// Minimal app bootstrap for EVOKA base layout.
// This file intentionally contains only light initialization logic required by the layout.
// It provides the functions the rest of the project expects to exist (stubs where appropriate)
// and wires a simple navigation placeholder. No business logic or routing is implemented here.

window.app = window.app || {};

/* Minimal persisted state loader (safe no-op if nothing saved) */
app.loadDataFromLocalStorage = function() {
  try {
    const saved = localStorage.getItem('evoka:data');
    if (saved) {
      app._data = JSON.parse(saved);
    } else {
      app._data = {};
    }
  } catch (err) {
    console.warn('app.loadDataFromLocalStorage: error reading localStorage', err);
    app._data = {};
  }

  // Ensure DOM tokens/status exist and reflect any saved values if present
  const tokenEl = document.getElementById('token-count');
  if (tokenEl && app._data.tokens !== undefined) tokenEl.textContent = String(app._data.tokens);

  const statusEl = document.getElementById('user-status');
  if (statusEl && app._data.userStatus) statusEl.textContent = String(app._data.userStatus);
};

/* Wire static UI elements: attach: logo click, nav buttons click (placeholder), collapse visual toggle */
app.loadStaticUI = function() {
  // Logo navigates to home placeholder
  const logo = document.getElementById('logo-button');
  if (logo) {
    logo.addEventListener('click', function() {
      app.navigateTo('home');
    });
  }

  // Simple nav buttons (no routing implemented yet). They call navigateTo for placeholder content.
  document.querySelectorAll('#side-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = btn.getAttribute('data-page') || 'home';
      app.navigateTo(page);
    });
  });

  // Collapse control toggles a visual class on the sidebar (no persisted state)
  const collapse = document.getElementById('collapse-button');
  const sidebar = document.getElementById('nav-rail');
  const mainWrapper = document.querySelector('.main-wrapper');
  if (collapse && sidebar && mainWrapper) {
    collapse.addEventListener('click', () => {
      sidebar.classList.toggle('expanded');
      // mirror main-wrapper margin by toggling stylesheet-aware class (the CSS handles expanded sibling)
      // No further JS is required.
    });
  }

  // Profile button toggles profile menu visibility (keeps DOM element present for compatibility)
  const profileBtn = document.getElementById('profile-button');
  const profileMenu = document.getElementById('profile-menu');
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('hidden');
      const expanded = profileBtn.getAttribute('aria-expanded') === 'true';
      profileBtn.setAttribute('aria-expanded', String(!expanded));
    });

    // Close on outside click
    document.addEventListener('click', () => {
      if (!profileMenu.classList.contains('hidden')) profileMenu.classList.add('hidden');
      if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
    });
  }
};

/* Minimal navigateTo that updates the main-content placeholder text.
   Keeps the function name available for other modules to call. */
app.navigateTo = function(pageId) {
  const main = document.getElementById('main-content');
  if (!main) return;

  // Keep a minimal, neutral placeholder content (no business logic)
  main.innerHTML = ''; // clear existing content

  const container = document.createElement('section');
  container.className = 'route-placeholder';
  container.setAttribute('aria-live', 'polite');

  const heading = document.createElement('h1');
  heading.textContent = (pageId === 'home') ? 'Hola Felipe' : `Página: ${pageId}`;
  heading.style.margin = '0 0 0.5rem 0';
  heading.style.fontSize = '1.5rem';
  heading.style.fontWeight = '700';
  heading.style.color = 'var(--evoka-text)';

  const para = document.createElement('p');
  para.textContent = 'Contenido en construcción.';
  para.style.color = 'rgba(229,231,235,0.85)';
  para.style.margin = '0';

  container.appendChild(heading);
  container.appendChild(para);
  main.appendChild(container);

  // focus the main content area for accessibility
  main.focus && main.focus();
};

/* Stubs required by other modules (do not remove) */
app.openExecutorSelectionModal = app.openExecutorSelectionModal || function() {
  console.warn('openExecutorSelectionModal: stub - TODO implement modal');
};

app.finalizeCapsuleSave = app.finalizeCapsuleSave || function() {
  console.warn('finalizeCapsuleSave: stub - TODO implement save flow');
};

app.toggleRecording = app.toggleRecording || function() {
  console.warn('toggleRecording: stub - TODO implement recording');
};

/* Boot sequence on DOMContentLoaded as requested */
document.addEventListener('DOMContentLoaded', function() {
  app.loadDataFromLocalStorage();
  app.loadStaticUI();
  app.navigateTo('home');
});
