// EVOKA App - Navigation and Memories CRUD with localStorage persistence

(function () {
  'use strict';

  // ===== STORAGE LAYER (Pure functions) =====
  var STORAGE_KEY = 'evoka.memories.v1';

  function loadMemories() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      var parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Failed to load memories:', err);
      return [];
    }
  }

  function saveMemories(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('Failed to save memories:', err);
    }
  }

  function createMemory(text) {
    return {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      text: text,
      tags: [],
      mood: null,
      people: []
    };
  }

  function updateMemory(id, patch) {
    var memories = loadMemories();
    var index = memories.findIndex(function (m) { return m.id === id; });
    if (index === -1) return null;
    memories[index] = Object.assign({}, memories[index], patch);
    saveMemories(memories);
    return memories[index];
  }

  function deleteMemory(id) {
    var memories = loadMemories();
    var filtered = memories.filter(function (m) { return m.id !== id; });
    if (filtered.length === memories.length) return false;
    saveMemories(filtered);
    return true;
  }

  function getMemoryById(id) {
    var memories = loadMemories();
    return memories.find(function (m) { return m.id === id; }) || null;
  }

  // ===== NAVIGATION SYSTEM =====
  var currentPage = 'home';

  function renderPage(page) {
    var mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    currentPage = page;

    // Update active nav button
    var navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(function (btn) {
      if (btn.getAttribute('data-page') === page) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Render page content
    if (page === 'memories') {
      renderMemoriesPage(mainContent);
    } else {
      mainContent.innerHTML = '<div class="placeholder">Aquí se mostrará el contenido de la aplicación.</div>';
    }
  }

  function renderMemoriesPage(container) {
    var memories = loadMemories();
    // Sort by createdAt descending
    memories.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    var html = '<div class="placeholder">';
    
    if (memories.length === 0) {
      html += '<p>No tienes memorias guardadas. Escribe algo en el cuadro de abajo y guárdalo.</p>';
    } else {
      html += '<div style="margin-bottom: 1rem;"><strong>Tus Memorias (' + memories.length + ')</strong></div>';
      memories.forEach(function (memory) {
        var date = new Date(memory.createdAt).toLocaleString('es-ES');
        var textPreview = memory.text.length > 100 ? memory.text.substring(0, 100) + '...' : memory.text;
        html += '<div style="margin-bottom: 1rem; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem;">';
        html += '<div style="font-size: 0.75rem; opacity: 0.7; margin-bottom: 0.25rem;">' + date + '</div>';
        html += '<div style="margin-bottom: 0.5rem;" id="memory-text-' + memory.id + '">' + escapeHtml(textPreview) + '</div>';
        html += '<div>';
        html += '<button class="save-button" onclick="window.app.viewMemory(\'' + memory.id + '\')" style="font-size: 0.875rem; padding: 0.25rem 0.5rem; margin-right: 0.5rem;">Ver</button>';
        html += '<button class="save-button" onclick="window.app.editMemory(\'' + memory.id + '\')" style="font-size: 0.875rem; padding: 0.25rem 0.5rem; margin-right: 0.5rem;">Editar</button>';
        html += '<button class="save-button" onclick="window.app.deleteMemoryConfirm(\'' + memory.id + '\')" style="font-size: 0.875rem; padding: 0.25rem 0.5rem;">Eliminar</button>';
        html += '</div>';
        html += '</div>';
      });
    }
    
    html += '</div>';
    container.innerHTML = html;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== CRUD OPERATIONS =====
  function saveNewMemory() {
    var input = document.getElementById('capsule-input');
    if (!input) return;

    var text = input.value.trim();
    if (!text) return;

    var memory = createMemory(text);
    var memories = loadMemories();
    memories.push(memory);
    saveMemories(memories);

    // Clear input
    input.value = '';

    // Show confirmation
    showConfirmation();

    // If on memories page, refresh
    if (currentPage === 'memories') {
      var mainContent = document.getElementById('main-content');
      if (mainContent) renderMemoriesPage(mainContent);
    }
  }

  function showConfirmation() {
    var msg = document.getElementById('confirmation-message');
    if (!msg) return;
    msg.classList.remove('hidden');
    setTimeout(function () {
      msg.classList.add('hidden');
    }, 3000);
  }

  function viewMemory(id) {
    var memory = getMemoryById(id);
    if (!memory) return;
    alert('Memoria completa:\n\n' + memory.text + '\n\nCreada: ' + new Date(memory.createdAt).toLocaleString('es-ES'));
  }

  function editMemory(id) {
    var memory = getMemoryById(id);
    if (!memory) return;
    
    var newText = prompt('Editar memoria:', memory.text);
    if (newText === null) return; // Cancelled
    
    newText = newText.trim();
    if (!newText) {
      alert('El texto no puede estar vacío');
      return;
    }

    updateMemory(id, { text: newText });
    
    // Refresh page
    if (currentPage === 'memories') {
      var mainContent = document.getElementById('main-content');
      if (mainContent) renderMemoriesPage(mainContent);
    }
  }

  function deleteMemoryConfirm(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta memoria?')) return;
    
    deleteMemory(id);
    
    // Refresh page
    if (currentPage === 'memories') {
      var mainContent = document.getElementById('main-content');
      if (mainContent) renderMemoriesPage(mainContent);
    }
  }

  function navigateTo(page) {
    renderPage(page);
  }

  // ===== INITIALIZATION =====
  document.addEventListener('DOMContentLoaded', function () {
    // Setup window.app object
    window.app = {
      navigateTo: navigateTo,
      viewMemory: viewMemory,
      editMemory: editMemory,
      deleteMemoryConfirm: deleteMemoryConfirm
    };

    // Setup navigation buttons
    var navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var page = this.getAttribute('data-page');
        if (page) navigateTo(page);
      });
    });

    // Setup logo button
    var logoBtn = document.getElementById('logo-button');
    if (logoBtn) {
      logoBtn.addEventListener('click', function () {
        navigateTo('home');
      });
    }

    // Setup save button
    var saveBtn = document.getElementById('save-button');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveNewMemory);
    }

    // Initial render
    renderPage('home');
  });
})();
