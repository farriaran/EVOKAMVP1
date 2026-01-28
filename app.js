// ----------------------------
// app.js (extracted, UTF-8 encoded)
// ----------------------------

const app = window.app || {};
window.app = app;

let dailyTokens, executors, capsulesData, dialogueData, userData;
let dedicatedIndex, claimsData;
let tempCapsuleData = {};
let isRecording = false;

app.theme = 'dark';

document.addEventListener('DOMContentLoaded', () => {
  app.loadDataFromLocalStorage();
  app.loadTheme();
  app.loadStaticUI();
  app.navigateTo('home');

  window.addEventListener('click', function(e) {
    const profileButton = document.getElementById('profile-button');
    const profileMenu = document.getElementById('profile-menu');
    if (profileButton && !profileButton.contains(e.target) && profileMenu && !profileMenu.contains(e.target)) {
      profileMenu.classList.add('hidden');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  app.loadDataFromLocalStorage();
  app.loadTheme();
  app.loadStaticUI();
  app.navigateTo('home');

  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidebar.classList.toggle('collapsed');
    overlay.classList.toggle('active');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    sidebar.classList.remove('collapsed');
    overlay.classList.remove('active');
  });

  // Profile menu
  window.addEventListener('click', function(e) {
    const profileButton = document.getElementById('profile-button');
    const profileMenu = document.getElementById('profile-menu');
    if (profileButton && !profileButton.contains(e.target) && profileMenu && !profileMenu.contains(e.target)) {
      profileMenu.classList.add('hidden');
    }
  });
});
app.loadTheme = function() {
  const savedTheme = localStorage.getItem('evokaTheme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    app.theme = savedTheme;
  } else {
    app.theme = 'dark';
  }
  app.applyTheme(app.theme);
};

app.applyTheme = function(theme) {
  app.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('evokaTheme', theme);
};

app.setTheme = function(theme) {
  app.applyTheme(theme);
  const currentPage = document.querySelector('#side-nav a.bg-gray-700')?.getAttribute('data-page');
  if (currentPage === 'settings') {
    app.navigateTo('settings');
  }
};

app.saveDataToLocalStorage = function() {
  localStorage.setItem('evokaUserData', JSON.stringify(userData));
  localStorage.setItem('evokaCapsules', JSON.stringify(capsulesData));
  localStorage.setItem('evokaExecutors', JSON.stringify(executors));
  localStorage.setItem('evokaTokens', String(dailyTokens));
  localStorage.setItem('evokaDialogue', JSON.stringify(dialogueData));
  localStorage.setItem('evokaDedicatedIndex', JSON.stringify(dedicatedIndex));
  localStorage.setItem('evokaClaims', JSON.stringify(claimsData));
};

app.loadDataFromLocalStorage = function() {
  const savedUser = localStorage.getItem('evokaUserData');
  const savedCapsules = localStorage.getItem('evokaCapsules');
  const savedExecutors = localStorage.getItem('evokaExecutors');
  const savedTokens = localStorage.getItem('evokaTokens');
  const savedDialogue = localStorage.getItem('evokaDialogue');
  const savedDedicatedIndex = localStorage.getItem('evokaDedicatedIndex');
  const savedClaims = localStorage.getItem('evokaClaims');

  userData = savedUser ? JSON.parse(savedUser) : {
    fullName: "Felipe Arriarán",
    username: "@felipe",
    email: "felipe.a@email.com",
    phone: "+56912345678",
    birthDate: "1985-10-20",
    plan: 'free',
    aiSettings: { type: 'emotive', customPrompt: '' },
    progress: 5
  };

  try {
    const parsed = savedCapsules ? JSON.parse(savedCapsules) : [];
    capsulesData = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    capsulesData = [];
  }

  try {
    const parsed = savedExecutors ? JSON.parse(savedExecutors) : ['Gisselle', 'Agustín'];
    executors = Array.isArray(parsed) ? parsed : ['Gisselle', 'Agustín'];
  } catch (e) {
    executors = ['Gisselle', 'Agustín'];
  }

  const parsedTokens = savedTokens !== null ? parseInt(savedTokens, 10) : 1;
  dailyTokens = isNaN(parsedTokens) ? 1 : parsedTokens;

  try {
    const parsed = savedDialogue ? JSON.parse(savedDialogue) : { lastAnswered: null, answers: {} };
    dialogueData = (typeof parsed === 'object' && parsed !== null) ? parsed : { lastAnswered: null, answers: {} };
  } catch (e) {
    dialogueData = { lastAnswered: null, answers: {} };
  }

  try {
    const parsed = savedDedicatedIndex ? JSON.parse(savedDedicatedIndex) : [];
    dedicatedIndex = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    dedicatedIndex = [];
  }

  try {
    const parsed = savedClaims ? JSON.parse(savedClaims) : [];
    claimsData = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    claimsData = [];
  }
};

app.toggleProfileMenu = function() {
  document.getElementById('profile-menu').classList.toggle('hidden');
};

app.navigateTo = function(page) {
  const mainContent = document.getElementById('main-content');
  const actionBar = document.getElementById('action-bar');
  const navLinks = document.querySelectorAll('#side-nav a');

  navLinks.forEach(link => link.classList.toggle('bg-gray-700', link.getAttribute('data-page') === page));

  if (page === 'home') {
    mainContent.innerHTML = app.getHomeViewHTML();
    actionBar.innerHTML = app.getHomeActionBarHTML();
    app.updateTokenDisplay();
  } else if (page === 'dialogue') {
    mainContent.innerHTML = app.getDialogueViewHTML();
    actionBar.innerHTML = '';
  } else if (page === 'executors') {
    mainContent.innerHTML = app.getExecutorsViewHTML();
    actionBar.innerHTML = '';
  } else if (page === 'plans') {
    mainContent.innerHTML = app.getPlansViewHTML();
    actionBar.innerHTML = '';
  } else if (page === 'memories') {
    mainContent.innerHTML = app.getMemoriesViewHTML();
    actionBar.innerHTML = '';
    app.attachMemoriesListeners();
  } else if (page === 'discover') {
    mainContent.innerHTML = app.getDiscoverViewHTML();
    actionBar.innerHTML = '';
  } else if (page === 'claims') {
    mainContent.innerHTML = app.getClaimsViewHTML();
    actionBar.innerHTML = '';
  } else if (page === 'settings') {
    mainContent.innerHTML = app.getSettingsViewHTML();
    actionBar.innerHTML = '';
  } else {
    mainContent.innerHTML = `<div class="flex-grow flex items-center justify-center text-center p-4">
      <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
        Página de ${page} en construcción.
      </h1></div>`;
    actionBar.innerHTML = '';
  }
};

app.getMemoriesStats = function() {
  const list = Array.isArray(capsulesData) ? capsulesData : [];
  let total = list.length;
  let pub = 0;
  let priv = 0;

  for (let i = 0; i < list.length; i++) {
    const p = (list[i] && (list[i].privacy || list[i].privacidad)) || 'private';
    if (p === 'public') pub++;
    else priv++;
  }

  return { total, public: pub, private: priv };
};

app.getHomeViewHTML = function() {
  const stats = app.getMemoriesStats();
  return `
    <div class="flex-grow flex items-center justify-center text-center">
      <div>
        <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          Hola ${app.escapeHTML((userData.fullName || ''))}
        </h1>
        <p class="evoka-text-muted mt-2">¿Qué recuerdo quieres evocar hoy?</p>

        <div class="mt-4 evoka-text">
          <div>Total memorias: <span id="mem-stats-total">${stats.total}</span></div>
          <div>Públicas: <span id="mem-stats-public">${stats.public}</span></div>
          <div>Privadas: <span id="mem-stats-private">${stats.private}</span></div>
        </div>

        <div class="mt-6 p-4 evoka-surface rounded-lg inline-block evoka-border">
          <div class="text-sm evoka-text-muted">Tokens disponibles</div>
          <div class="text-3xl font-bold text-cyan-400" id="token-display">${dailyTokens}</div>
          <button onclick="window.app.refillTokens()" class="mt-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded">
            Recargar tokens
          </button>
        </div>
      </div>
    </div>
  `;
};

app.getHomeActionBarHTML = function() {
  return `
    <div class="evoka-surface rounded-2xl p-3 shadow-lg evoka-border">
      <div class="flex items-center justify-between px-3 pb-2">
        <button id="privacy-toggle" onclick="window.app.togglePrivacy(this)" data-privacy="private"
          class="flex items-center gap-2 text-xs evoka-text-muted evoka-hover transition">
          <svg id="privacy-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path id="privacy-path" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span id="privacy-text">Privada</span>
        </button>
        <a href="#" onclick="event.preventDefault(); window.app.navigateTo('memories')" class="text-xs evoka-text-muted hover:text-cyan-300 transition">
          Ver Memorias →
        </a>
      </div>

      <div class="relative">
        <textarea id="capsule-input" class="w-full h-14 bg-transparent evoka-text rounded-lg p-3 pr-24 border-none focus:ring-0 resize-none"
          placeholder="Escribe tu cápsula aquí..."></textarea>

        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <button onclick="window.app.toggleRecording()" id="record-button"
            class="p-2 evoka-hover rounded-full" title="Grabar audio">
            <svg class="w-6 h-6 evoka-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </button>

          <button id="save-button" onclick="window.app.saveCapsule()"
            class="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-full" title="Publicar Cápsula">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
};

app.getDialogueViewHTML = function() {
  return `<div class="p-4"><h2 class="text-2xl font-bold evoka-text">Diálogo</h2></div>`;
};

app.getExecutorsViewHTML = function() {
  return `<div class="p-4"><h2 class="text-2xl font-bold evoka-text">Ejecutores</h2></div>`;
};

app.getPlansViewHTML = function() {
  return `<div class="p-4"><h2 class="text-2xl font-bold evoka-text">Planes</h2></div>`;
};

app.getMemoriesViewHTML = function() {
  const list = Array.isArray(capsulesData) ? capsulesData : [];
  let html = `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold evoka-text">Memorias</h2>
        <div class="flex gap-2">
          <button onclick="window.app.exportMemories()" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">
            Exportar JSON
          </button>
          <button onclick="document.getElementById('import-file').click()" class="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded">
            Importar JSON
          </button>
          <input type="file" id="import-file" accept=".json" class="hidden">
          <button onclick="window.app.deleteAllMemories()" class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded">
            Borrar todo
          </button>
        </div>
      </div>
      <input type="text" id="mem-search" placeholder="Buscar memorias..." class="w-full mb-4 p-2 evoka-surface evoka-text rounded evoka-border focus:border-cyan-500 focus:outline-none">
      <div id="memories-list">
  `;
  
  if (list.length === 0) {
    html += `<div class="text-center evoka-text-muted">Aún no hay memorias.</div>`;
  } else {
    html += '<div class="space-y-3" id="memories-container">';
    for (let i = list.length - 1; i >= 0; i--) {
      const c = list[i];
      const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '';
      const p = (c.privacy || c.privacidad) || 'private';
      const privacy = p === 'public' ? 'Pública' : 'Privada';
      const text = app.escapeHTML(c.text || '');
      const searchText = (c.text || '').toLowerCase();
      html += `
        <div class="evoka-surface p-3 rounded-lg memory-item evoka-border" data-text="${app.escapeHTML(searchText)}">
          <div class="flex items-start justify-between">
            <div class="flex-grow">
              <div class="text-xs evoka-text-muted mb-1">${date} · ${privacy}</div>
              <div class="evoka-text">${text}</div>
            </div>
            <button onclick="window.app.deleteCapsule('${c.id}')" class="ml-2 p-1 text-red-400 hover:text-red-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }
    html += '</div><div id="no-results" class="text-center evoka-text-muted hidden">Sin resultados.</div>';
  }
  
  html += `
      </div>
    </div>
  `;
  return html;
};

app.getDiscoverViewHTML = function() {
  return `<div class="p-4"><h2 class="text-2xl font-bold evoka-text">Descubrir</h2></div>`;
};

app.getClaimsViewHTML = function() {
  return `<div class="p-4"><h2 class="text-2xl font-bold evoka-text">Reclamos</h2></div>`;
};

app.getSettingsViewHTML = function() {
  const isDark = app.theme === 'dark';
  return `
    <div class="p-4">
      <h2 class="text-2xl font-bold evoka-text mb-6">Configuración</h2>
      
      <div class="max-w-2xl">
        <div class="evoka-surface p-4 rounded-lg evoka-border mb-4">
          <h3 class="text-lg font-semibold evoka-text mb-3">Apariencia</h3>
          <div class="flex items-center justify-between">
            <div>
              <div class="evoka-text font-medium">Tema</div>
              <div class="text-sm evoka-text-muted">Selecciona el modo de visualización</div>
            </div>
            <button onclick="window.app.setTheme('${isDark ? 'light' : 'dark'}')" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${isDark ? 
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>' :
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>'
                }
              </svg>
              ${isDark ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </div>

        <div class="evoka-surface p-4 rounded-lg evoka-border">
          <h3 class="text-lg font-semibold evoka-text mb-3">Cuenta</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="evoka-text-muted">Nombre</span>
              <span class="evoka-text">${app.escapeHTML(userData.fullName)}</span>
            </div>
            <div class="flex justify-between">
              <span class="evoka-text-muted">Email</span>
              <span class="evoka-text">${app.escapeHTML(userData.email)}</span>
            </div>
            <div class="flex justify-between">
              <span class="evoka-text-muted">Plan</span>
              <span class="evoka-text capitalize">${app.escapeHTML(userData.plan)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

app.loadStaticUI = function() {
  const navLinks = document.querySelectorAll('#side-nav a');
  navLinks.forEach(link => {
    const page = link.getAttribute('data-page');
    if (page) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        app.navigateTo(page);
      });
    }
  });
};

app.updateTokenDisplay = function() {
  const tokenEl = document.getElementById('token-display');
  if (tokenEl) {
    tokenEl.textContent = dailyTokens;
  }
};

app.refillTokens = function() {
  const today = new Date().toISOString().split('T')[0];
  const lastRefill = localStorage.getItem('evokaLastRefill');
  
  if (lastRefill === today) {
    alert('Ya recargaste tus tokens hoy.');
    return;
  }
  
  dailyTokens = 5;
  localStorage.setItem('evokaLastRefill', today);
  app.saveDataToLocalStorage();
  app.updateTokenDisplay();
  alert('Tokens recargados a 5.');
};

app.togglePrivacy = function(btn) {
  const current = btn.getAttribute('data-privacy') || 'private';
  const next = current === 'private' ? 'public' : 'private';
  btn.setAttribute('data-privacy', next);
  const span = document.getElementById('privacy-text');
  const path = document.getElementById('privacy-path');
  if (span) {
    span.textContent = next === 'private' ? 'Privada' : 'Pública';
  }
  if (path) {
    if (next === 'private') {
      path.setAttribute('d', 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z');
    } else {
      path.setAttribute('d', 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z');
    }
  }
};

app.toggleRecording = function() {
  // Placeholder
};

app.saveCapsule = function() {
  const input = document.getElementById('capsule-input');
  const text = input ? input.value.trim() : '';
  if (!text) return;
  
  if (userData.plan === 'free') {
    if (dailyTokens <= 0) {
      alert('No tienes tokens disponibles. Recarga tus tokens para continuar.');
      return;
    }
  }
  
  const toggle = document.getElementById('privacy-toggle');
  const privacy = toggle ? toggle.getAttribute('data-privacy') || 'private' : 'private';
  const capsule = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
    text: text,
    privacy: privacy,
    createdAt: new Date().toISOString()
  };
  if (!Array.isArray(capsulesData)) capsulesData = [];
  capsulesData.push(capsule);
  
  if (userData.plan === 'free') {
    dailyTokens = Math.max(0, dailyTokens - 1);
  }
  
  app.saveDataToLocalStorage();
  input.value = '';
  app.updateHomeStats();
  app.updateTokenDisplay();
};

app.deleteCapsule = function(id) {
  if (!confirm('¿Eliminar esta memoria?')) return;
  if (!Array.isArray(capsulesData)) capsulesData = [];
  capsulesData = capsulesData.filter(c => c.id !== id);
  app.saveDataToLocalStorage();
  app.reloadMemoriesView();
  app.updateHomeStats();
};

app.deleteAllMemories = function() {
  if (!confirm('¿Borrar TODAS las memorias? Esta acción no se puede deshacer.')) return;
  capsulesData = [];
  app.saveDataToLocalStorage();
  app.reloadMemoriesView();
  app.updateHomeStats();
};

app.exportMemories = function() {
  if (!Array.isArray(capsulesData)) capsulesData = [];
  if (capsulesData.length === 0) {
    alert('No hay memorias para exportar.');
    return;
  }
  const normalized = capsulesData.map(c => ({
    id: c.id,
    text: c.text,
    privacy: (c.privacy || c.privacidad) || 'private',
    createdAt: c.createdAt
  }));
  const data = JSON.stringify(normalized, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'evoka_memories.json';
  a.click();
  URL.revokeObjectURL(url);
};

app.importMemories = function(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert('El archivo no contiene un array válido.');
        return;
      }
      if (!Array.isArray(capsulesData)) capsulesData = [];
      const existingIds = new Set(capsulesData.map(c => c.id));
      let addedCount = 0;
      let dupCount = 0;
      imported.forEach(item => {
        if (typeof item !== 'object' || item === null) return;
        const privacyValue = (item.privacy || item.privacidad) || 'private';
        const validItem = {
          id: item.id || Date.now().toString() + Math.random().toString(36).slice(2, 9),
          text: typeof item.text === 'string' ? item.text : '',
          privacy: privacyValue === 'public' ? 'public' : 'private',
          createdAt: item.createdAt || new Date().toISOString()
        };
        if (!existingIds.has(validItem.id)) {
          capsulesData.push(validItem);
          existingIds.add(validItem.id);
          addedCount++;
        } else {
          dupCount++;
        }
      });
      app.saveDataToLocalStorage();
      app.reloadMemoriesView();
      app.updateHomeStats();
      alert(`Importado: ${addedCount} nuevas, ${dupCount} ignoradas por duplicado.`);
    } catch (err) {
      alert('Error al importar: archivo JSON inválido.');
    }
  };
  reader.readAsText(file);
};

app.attachMemoriesListeners = function() {
  const searchInput = document.getElementById('mem-search');
  if (searchInput) {
    searchInput.oninput = function() {
      const query = this.value.toLowerCase().trim();
      const items = document.querySelectorAll('.memory-item');
      const noResults = document.getElementById('no-results');
      let visibleCount = 0;
      items.forEach(item => {
        const text = item.getAttribute('data-text') || '';
        if (text.includes(query)) {
          item.style.display = '';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });
      if (noResults) {
        if (visibleCount === 0 && items.length > 0) {
          noResults.classList.remove('hidden');
        } else {
          noResults.classList.add('hidden');
        }
      }
    };
  }
  const importFile = document.getElementById('import-file');
  if (importFile) {
    importFile.onchange = function() {
      if (this.files && this.files[0]) {
        app.importMemories(this.files[0]);
        this.value = '';
      }
    };
  }
};

app.reloadMemoriesView = function() {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.innerHTML = app.getMemoriesViewHTML();
    app.attachMemoriesListeners();
  }
};

app.updateHomeStats = function() {
  const totalEl = document.getElementById('mem-stats-total');
  const publicEl = document.getElementById('mem-stats-public');
  const privateEl = document.getElementById('mem-stats-private');
  if (totalEl || publicEl || privateEl) {
    const stats = app.getMemoriesStats();
    if (totalEl) totalEl.textContent = stats.total;
    if (publicEl) publicEl.textContent = stats.public;
    if (privateEl) privateEl.textContent = stats.private;
  }
};

app.escapeHTML = function(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};
