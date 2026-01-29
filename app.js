// app.js - moved from index.html

/* Global app namespace */
const app = {
  state: {
    user: { name: 'Felipe', status: 'En línea' },
    tokens: 0,
    capsules: []
  },

  // Load persisted data (minimal)
  loadDataFromLocalStorage() {
    try {
      const raw = localStorage.getItem('evoka:data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.user) this.state.user = parsed.user;
        if (typeof parsed.tokens === 'number') this.state.tokens = parsed.tokens;
        if (Array.isArray(parsed.capsules)) this.state.capsules = parsed.capsules;
      } else {
        // Defaults
        this.state.tokens = 0;
        this.state.capsules = [];
      }
    } catch (err) {
      console.warn('loadDataFromLocalStorage: error parsing localStorage', err);
    }

    // Reflect into DOM if elements present
    const tokenEl = document.getElementById('token-count');
    if (tokenEl) tokenEl.textContent = `Tokens: ${this.state.tokens}`;

    const userStatusEl = document.getElementById('user-status');
    if (userStatusEl) userStatusEl.textContent = this.state.user.status || 'En línea';
  },

  // Wire up static UI behaviors and listeners
  loadStaticUI() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = a.getAttribute('data-target');
        if (target) this.navigateTo(target);
      });
    });

    // Profile button toggles profile menu
    const profileButton = document.getElementById('profile-button');
    const profileMenu = document.getElementById('profile-menu');
    if (profileButton && profileMenu) {
      profileButton.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('hidden');
      });

      // Close on outside click
      document.addEventListener('click', () => {
        if (!profileMenu.classList.contains('hidden')) {
          profileMenu.classList.add('hidden');
        }
      });
    }

    // Save button
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Call finalize capsule save (implemented below)
        if (typeof finalizeCapsuleSave === 'function') {
          finalizeCapsuleSave();
        } else {
          console.warn('finalizeCapsuleSave not implemented');
        }
      });
    }

    // Executor selection button (calls stub)
    const execBtn = document.getElementById('executor-button');
    if (execBtn) {
      execBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof openExecutorSelectionModal === 'function') {
          openExecutorSelectionModal();
        } else {
          console.warn('openExecutorSelectionModal not implemented');
        }
      });
    }

    // Record button (calls stub toggleRecording)
    const recordBtn = document.getElementById('record-button');
    if (recordBtn) {
      recordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof toggleRecording === 'function') {
          toggleRecording();
        } else {
          console.warn('toggleRecording not implemented');
        }
      });
    }

    // Capsule input placeholder behavior: save cursor state, etc.
    const capsuleInput = document.getElementById('capsule-input');
    if (capsuleInput) {
      capsuleInput.addEventListener('input', () => {
        // Optionally update tokens estimate (not changing copy)
        const tokenEl = document.getElementById('token-count');
        if (tokenEl) {
          // lightweight estimate: 1 token per 4 chars (approx)
          const est = Math.max(0, Math.ceil(capsuleInput.value.length / 4));
          tokenEl.textContent = `Tokens: ${est}`;
        }
      });
    }

    // Populate capsules list if present
    this.renderCapsulesList();
  },

  // Simple view navigation: show view with given id and hide others
  navigateTo(viewId = 'home') {
    const views = document.querySelectorAll('#views .view');
    views.forEach(v => {
      if (v.id === viewId) {
        v.classList.remove('hidden');
      } else {
        v.classList.add('hidden');
      }
    });

    // If navigating to capsules, refresh list
    if (viewId === 'capsules') {
      this.renderCapsulesList();
    }
  },

  // Render list of saved capsules
  renderCapsulesList() {
    const listEl = document.getElementById('capsules-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!Array.isArray(this.state.capsules) || this.state.capsules.length === 0) {
      const p = document.createElement('p');
      p.className = 'text-sm text-gray-600';
      p.textContent = 'No hay cápsulas guardadas.';
      listEl.appendChild(p);
      return;
    }

    this.state.capsules.forEach((c, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'p-3 bg-white border rounded';
      const txt = document.createElement('div');
      txt.className = 'text-sm text-gray-800';
      txt.textContent = c.text || '';
      wrap.appendChild(txt);

      const meta = document.createElement('div');
      meta.className = 'text-xs text-gray-500 mt-2';
      meta.textContent = `Guardada: ${new Date(c.createdAt).toLocaleString()}`;
      wrap.appendChild(meta);

      listEl.appendChild(wrap);
    });
  },

  // Persist state
  saveStateToLocalStorage() {
    try {
      const toSave = {
        user: this.state.user,
        tokens: this.state.tokens,
        capsules: this.state.capsules
      };
      localStorage.setItem('evoka:data', JSON.stringify(toSave));
    } catch (err) {
      console.warn('saveStateToLocalStorage error', err);
    }
  }
};

/* EXPORTS: functions that may be referenced elsewhere or by existing code */

/**
 * finalizeCapsuleSave
 * Minimal implementation: reads #capsule-input, saves capsule to app.state.capsules,
 * shows #confirmation-message temporarily and persists to localStorage.
 */
function finalizeCapsuleSave() {
  const input = document.getElementById('capsule-input');
  const confirm = document.getElementById('confirmation-message');
  if (!input) {
    console.warn('finalizeCapsuleSave: #capsule-input not found');
    return;
  }

  const text = input.value.trim();
  if (text.length === 0) {
    // show a brief message (keeps copy unchanged; use same element)
    if (confirm) {
      confirm.textContent = 'Nada para guardar';
      confirm.classList.remove('hidden');
      setTimeout(() => {
        if (confirm) confirm.classList.add('hidden');
      }, 1500);
    }
    return;
  }

  const capsule = {
    id: `c_${Date.now()}`,
    text,
    createdAt: Date.now()
  };

  app.state.capsules = app.state.capsules || [];
  app.state.capsules.unshift(capsule);

  // Persist
  app.saveStateToLocalStorage();

  // Clear input and show confirmation
  input.value = '';
  const tokenEl = document.getElementById('token-count');
  if (tokenEl) tokenEl.textContent = `Tokens: ${app.state.tokens}`;

  if (confirm) {
    confirm.textContent = 'Guardado';
    confirm.classList.remove('hidden');
    setTimeout(() => {
      if (confirm) confirm.classList.add('hidden');
    }, 2000);
  }

  // Re-render capsules list if visible
  app.renderCapsulesList();
}

/**
 * openExecutorSelectionModal
 * Stub required by rules: keep minimal, non-breaking, with TODO and console.warn
 */
function openExecutorSelectionModal() {
  console.warn('openExecutorSelectionModal: stub called - TODO: implementar selección de ejecutor');
  // Minimal non-blocking behavior: show a small alert or no-op
  // In future implement modal open logic
}

/**
 * toggleRecording
 * Stub for recording toggle (e.g., audio). Minimal behavior.
 */
function toggleRecording() {
  console.warn('toggleRecording: stub called - TODO: implementar grabación');
  // Toggle a simple visual state on the record button
  const btn = document.getElementById('record-button');
  if (!btn) return;
  btn.classList.toggle('bg-red-500');
  btn.classList.toggle('text-white');
  // Do not implement actual recording here
}

/* DOMContentLoaded bootstrap */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize app
  app.loadDataFromLocalStorage();
  app.loadStaticUI();
  app.navigateTo('home');
});
