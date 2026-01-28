// ----------------------------------------------------
// EVOKA MVP1 - app.js
// Funciona 100% con localStorage (sin backend)
// ----------------------------------------------------

window.app = window.app || {};

let capsulesData = [];
let userData = { theme: "dark" };
let isSidebarOpen = false;

const LS_KEYS = {
  CAPSULES: "evoka_capsules_v1",
  USER: "evoka_user_v1",
};

document.addEventListener("DOMContentLoaded", () => {
  app.loadDataFromLocalStorage();
  app.loadStaticUI();
  app.navigateTo(app.getRouteFromHash() || "home");

  window.addEventListener("hashchange", () => {
    app.navigateTo(app.getRouteFromHash() || "home");
  });

  window.addEventListener("click", (e) => {
    const profileButton = document.getElementById("profile-button");
    const profileMenu = document.getElementById("profile-menu");
    if (!profileButton || !profileMenu) return;

    if (!profileButton.contains(e.target) && !profileMenu.contains(e.target)) {
      profileMenu.classList.add("hidden");
    }
  });
});

app.getRouteFromHash = function () {
  const h = (location.hash || "").replace("#", "").trim();
  return h || null;
};

app.loadDataFromLocalStorage = function () {
  try {
    const storedCaps = localStorage.getItem(LS_KEYS.CAPSULES);
    const storedUser = localStorage.getItem(LS_KEYS.USER);

    capsulesData = storedCaps ? JSON.parse(storedCaps) : [];
    userData = storedUser ? JSON.parse(storedUser) : { theme: "dark" };

    if (!Array.isArray(capsulesData)) capsulesData = [];
    if (!userData || typeof userData !== "object") userData = { theme: "dark" };
    if (!userData.theme) userData.theme = "dark";

    document.documentElement.setAttribute("data-theme", userData.theme);
  } catch (err) {
    capsulesData = [];
    userData = { theme: "dark" };
    document.documentElement.setAttribute("data-theme", "dark");
  }
};

app.saveDataToLocalStorage = function () {
  localStorage.setItem(LS_KEYS.CAPSULES, JSON.stringify(capsulesData));
  localStorage.setItem(LS_KEYS.USER, JSON.stringify(userData));
  app.updateCounters();
};

app.loadStaticUI = function () {
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  const profileButton = document.getElementById("profile-button");
  const profileMenu = document.getElementById("profile-menu");

  const themeToggle = document.getElementById("themeToggle");
  const resetData = document.getElementById("resetData");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      isSidebarOpen = !isSidebarOpen;
      sidebar.classList.toggle("active", isSidebarOpen);
    });
  }

  if (profileButton && profileMenu) {
    profileButton.addEventListener("click", () => {
      profileMenu.classList.toggle("hidden");
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      userData.theme = userData.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", userData.theme);
      app.saveDataToLocalStorage();
    });
  }

  if (resetData) {
    resetData.addEventListener("click", () => {
      const ok = confirm("¿Seguro? Esto borra todas las memorias guardadas en este navegador.");
      if (!ok) return;
      capsulesData = [];
      app.saveDataToLocalStorage();
      app.navigateTo("home");
    });
  }

  // Nav items
  document.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const route = el.getAttribute("data-route");
      if (!route) return;
      // Cierra sidebar en mobile
      if (window.innerWidth <= 768) {
        isSidebarOpen = false;
        sidebar?.classList.remove("active");
      }
      // Navega
      location.hash = route;
      e.preventDefault();
    });
  });

  app.updateCounters();
};

app.updateCounters = function () {
  const c = document.getElementById("memoryCounter");
  if (c) c.textContent = String(capsulesData.length);
};

app.setActiveNav = function (route) {
  document.querySelectorAll("[data-route]").forEach((el) => {
    el.classList.toggle("nav-item-active", el.getAttribute("data-route") === route);
  });

  const title = document.getElementById("topBarTitle");
  const titles = {
    home: "Inicio",
    memories: "Memorias",
    new: "Nueva memoria",
    settings: "Settings",
  };
  if (title) title.textContent = titles[route] || "EVOKA";
};

app.navigateTo = function (route) {
  app.setActiveNav(route);

  const area = document.getElementById("contentArea");
  if (!area) return;

  if (route === "home") area.innerHTML = app.renderHome();
  else if (route === "memories") area.innerHTML = app.renderMemories();
  else if (route === "new") area.innerHTML = app.renderNewMemory();
  else if (route === "settings") area.innerHTML = app.renderSettings();
  else area.innerHTML = app.renderNotFound();

  // Bind actions de la vista
  app.bindViewActions(route);
};

app.bindViewActions = function (route) {
  if (route === "new") {
    const form = document.getElementById("memoryForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        id: app.nextId(),
        title: (document.getElementById("m_title")?.value || "").trim(),
        date: (document.getElementById("m_date")?.value || "").trim(),
        time: (document.getElementById("m_time")?.value || "").trim(),
        place: (document.getElementById("m_place")?.value || "").trim(),
        song: (document.getElementById("m_song")?.value || "").trim(),
        protagonists: (document.getElementById("m_prot")?.value || "").trim(),
        summary: (document.getElementById("m_summary")?.value || "").trim(),
        psychological: (document.getElementById("m_psy")?.value || "").trim(),
        primeAnalysis: (document.getElementById("m_primeA")?.value || "").trim(),
        primeAdvice: (document.getElementById("m_primeC")?.value || "").trim(),
        kidsAdvice: (document.getElementById("m_kids")?.value || "").trim(),
        createdAt: new Date().toISOString(),
      };

      if (!data.title) {
        alert("Te faltó el título. No somos salvajes.");
        return;
      }

      capsulesData.unshift(data);
      app.saveDataToLocalStorage();

      // Navega a memorias
      location.hash = "memories";
    });
  }

  if (route === "memories") {
    document.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-open"));
        const cap = capsulesData.find((x) => x.id === id);
        if (!cap) return;

        const area = document.getElementById("contentArea");
        area.innerHTML = app.renderMemoryDetail(cap);
        app.bindDetailActions(cap.id);
      });
    });
  }
};

app.bindDetailActions = function (id) {
  const back = document.getElementById("backToList");
  if (back) back.addEventListener("click", () => (location.hash = "memories"));

  const del = document.getElementById("deleteMemory");
  if (del) {
    del.addEventListener("click", () => {
      const ok = confirm("¿Borrar esta memoria? No hay CTRL+Z en la vida.");
      if (!ok) return;
      capsulesData = capsulesData.filter((x) => x.id !== id);
      app.saveDataToLocalStorage();
      location.hash = "memories";
    });
  }
};

app.nextId = function () {
  const max = capsulesData.reduce((acc, x) => Math.max(acc, Number(x.id) || 0), 0);
  return max + 1;
};

// -------------------- RENDERS --------------------

app.renderHome = function () {
  const last = capsulesData[0];
  return `
    <div class="card stack">
      <div class="h1">EVOKA MVP1</div>
      <div class="p">
        Esto es un MVP funcional: guarda memorias en tu navegador (localStorage) y te deja navegar sin que se rompa todo.
      </div>

      <div class="row">
        <span class="badge">Memorias: ${capsulesData.length}</span>
        <span class="badge">Tema: ${userData.theme}</span>
      </div>

      ${last ? `
        <div class="item">
          <div class="item-title">Última memoria: #${last.id} — ${app.escapeHtml(last.title)}</div>
          <div class="item-meta">${app.escapeHtml(last.date || "sin fecha")} • ${app.escapeHtml(last.place || "sin lugar")} • ${app.escapeHtml(last.song || "sin canción")}</div>
        </div>
      ` : `
        <div class="item">
          <div class="item-title">Aún no hay memorias.</div>
          <div class="item-meta">Anda a “Nueva memoria” y crea la primera. Sí, ahora.</div>
        </div>
      `}
    </div>
  `;
};

app.renderMemories = function () {
  if (!capsulesData.length) {
    return `
      <div class="card stack">
        <div class="h1">Memorias</div>
        <div class="p">No hay nada guardado todavía. Crea una memoria y deja de prometerte cosas.</div>
        <button class="btn" onclick="location.hash='new'">➕ Crear memoria</button>
      </div>
    `;
  }

  const items = capsulesData.map((m) => `
    <div class="item">
      <div class="item-title">#${m.id} — ${app.escapeHtml(m.title)}</div>
      <div class="item-meta">${app.escapeHtml(m.date || "sin fecha")} • ${app.escapeHtml(m.time || "sin hora")} • ${app.escapeHtml(m.place || "sin lugar")}</div>
      <div class="item-meta">🎵 ${app.escapeHtml(m.song || "sin canción")} • 👤 ${app.escapeHtml(m.protagonists || "—")}</div>
      <div style="margin-top:10px;">
        <button class="btn" data-open="${m.id}">Ver detalle</button>
      </div>
    </div>
  `).join("");

  return `
    <div class="card stack">
      <div class="row" style="justify-content:space-between; align-items:center;">
        <div class="h1">Memorias</div>
        <button class="btn" onclick="location.hash='new'">➕ Nueva</button>
      </div>
      <div class="list">${items}</div>
    </div>
  `;
};

app.renderNewMemory = function () {
  return `
    <div class="card stack">
      <div class="h1">Nueva memoria</div>
      <div class="p">Formato EVOKA (resumen + análisis psicológico + Prime + consejo + hijos).</div>

      <form id="memoryForm" class="stack">
        <div class="row">
          <input class="input" id="m_title" placeholder="Título (obligatorio)" />
          <input class="input" id="m_date" placeholder="Fecha simbólica (ej: 22 julio 2025)" />
        </div>

        <div class="row">
          <input class="input" id="m_time" placeholder="Hora emocional (ej: 11:27)" />
          <input class="input" id="m_place" placeholder="Lugar (ej: Reñaca, Viña del Mar)" />
        </div>

        <div class="row">
          <input class="input" id="m_song" placeholder="Canción emocional (ej: El loco — Babasónicos)" />
          <input class="input" id="m_prot" placeholder="Protagonistas (ej: Felipe, Martina, Borja)" />
        </div>

        <textarea class="textarea" id="m_summary" placeholder="Resumen"></textarea>
        <textarea class="textarea" id="m_psy" placeholder="Análisis psicológico"></textarea>
        <textarea class="textarea" id="m_primeA" placeholder="Análisis Felipe Prime"></textarea>
        <textarea class="textarea" id="m_primeC" placeholder="Consejo Felipe Prime"></textarea>
        <textarea class="textarea" id="m_kids" placeholder="Palabras para tus hijos (si aplica)"></textarea>

        <div class="row">
          <button class="btn" type="submit">Guardar memoria</button>
          <button class="btn" type="button" onclick="location.hash='memories'">Cancelar</button>
        </div>
      </form>
    </div>
  `;
};

app.renderMemoryDetail = function (m) {
  return `
    <div class="card stack">
      <div class="row" style="justify-content:space-between; align-items:center;">
        <div class="h1">#${m.id} — ${app.escapeHtml(m.title)}</div>
        <div class="row">
          <button class="btn" id="backToList">⬅ Volver</button>
          <button class="btn" id="deleteMemory">🗑 Borrar</button>
        </div>
      </div>

      <div class="row">
        <span class="badge">📅 ${app.escapeHtml(m.date || "sin fecha")}</span>
        <span class="badge">🕐 ${app.escapeHtml(m.time || "sin hora")}</span>
        <span class="badge">📍 ${app.escapeHtml(m.place || "sin lugar")}</span>
      </div>

      <div class="p">🎵 ${app.escapeHtml(m.song || "sin canción")}<br/>👤 ${app.escapeHtml(m.protagonists || "—")}</div>

      ${app.section("Resumen", m.summary)}
      ${app.section("Análisis psicológico", m.psychological)}
      ${app.section("Análisis Felipe Prime", m.primeAnalysis)}
      ${app.section("Consejo Felipe Prime", m.primeAdvice)}
      ${app.section("Palabras para tus hijos", m.kidsAdvice)}
    </div>
  `;
};

app.section = function (title, text) {
  const safe = (text || "").trim();
  if (!safe) return "";
  return `
    <div class="item">
      <div class="item-title">${app.escapeHtml(title)}</div>
      <div class="p">${app.escapeHtml(safe).replace(/\n/g, "<br>")}</div>
    </div>
  `;
};

app.renderSettings = function () {
  return `
    <div class="card stack">
      <div class="h1">Settings</div>
      <div class="p">Tema actual: <b>${userData.theme}</b></div>

      <div class="row">
        <button class="btn" onclick="document.getElementById('themeToggle').click()">Cambiar tema</button>
        <button class="btn" onclick="document.getElementById('resetData').click()">Reset datos</button>
      </div>

      <div class="p">
        Tip: este MVP guarda datos en <b>este navegador</b>. Si abres en otro PC/celular, parte vacío.
      </div>
    </div>
  `;
};

app.renderNotFound = function () {
  return `
    <div class="card stack">
      <div class="h1">Ruta no encontrada</div>
      <div class="p">Esa sección no existe. Vuelve al inicio.</div>
      <button class="btn" onclick="location.hash='home'">🏠 Inicio</button>
    </div>
  `;
};

app.escapeHtml = function (str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

