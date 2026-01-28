// ----------------------------------------------------
// EVOKA MVP1 - app.js (EVOKA theme + no emojis + sidebar collapsible)
// ----------------------------------------------------

window.app = window.app || {};

let capsulesData = [];
let userData = { theme: "dark", sidebarCollapsed: false };
let isSidebarOpenMobile = false;

const LS_KEYS = {
  CAPSULES: "evoka_capsules_v2",
  USER: "evoka_user_v2",
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
    if (profileButton && profileMenu) {
      if (!profileButton.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.add("hidden");
      }
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
    userData = storedUser ? JSON.parse(storedUser) : { theme: "dark", sidebarCollapsed: false };

    if (!Array.isArray(capsulesData)) capsulesData = [];
    if (!userData || typeof userData !== "object") userData = { theme: "dark", sidebarCollapsed: false };
    if (!userData.theme) userData.theme = "dark";
    if (typeof userData.sidebarCollapsed !== "boolean") userData.sidebarCollapsed = false;

    document.documentElement.setAttribute("data-theme", userData.theme);
  } catch {
    capsulesData = [];
    userData = { theme: "dark", sidebarCollapsed: false };
    document.documentElement.setAttribute("data-theme", "dark");
  }
};

app.saveDataToLocalStorage = function () {
  localStorage.setItem(LS_KEYS.CAPSULES, JSON.stringify(capsulesData));
  localStorage.setItem(LS_KEYS.USER, JSON.stringify(userData));
  app.updateCounters();
};

app.loadStaticUI = function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const collapseToggle = document.getElementById("collapse-toggle");

  const profileButton = document.getElementById("profile-button");
  const profileMenu = document.getElementById("profile-menu");
  const themeToggle = document.getElementById("themeToggle");
  const resetData = document.getElementById("resetData");

  // Apply persisted collapsed state (desktop only)
  if (sidebar && window.innerWidth > 768) {
    sidebar.classList.toggle("collapsed", userData.sidebarCollapsed);
  }

  // Mobile open/close
  function openMobileSidebar() {
    if (!sidebar || !overlay) return;
    isSidebarOpenMobile = true;
    sidebar.classList.add("active");
    overlay.classList.add("active");
  }
  function closeMobileSidebar() {
    if (!sidebar || !overlay) return;
    isSidebarOpenMobile = false;
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        isSidebarOpenMobile ? closeMobileSidebar() : openMobileSidebar();
      } else {
        // Desktop: same button toggles collapsed too (practical)
        app.toggleCollapse();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => closeMobileSidebar());
  }

  // Desktop collapse control
  if (collapseToggle) {
    collapseToggle.addEventListener("click", () => {
      app.toggleCollapse();
    });
  }

  // Profile menu
  if (profileButton && profileMenu) {
    profileButton.addEventListener("click", () => {
      profileMenu.classList.toggle("hidden");
    });
  }

  // Theme
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      userData.theme = userData.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", userData.theme);
      app.saveDataToLocalStorage();
    });
  }

  // Reset
  if (resetData) {
    resetData.addEventListener("click", () => {
      const ok = confirm("Esto borrará todas tus memorias guardadas en este navegador. ¿Continuar?");
      if (!ok) return;
      capsulesData = [];
      app.saveDataToLocalStorage();
      location.hash = "home";
    });
  }

  // Nav items
  document.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const route = el.getAttribute("data-route");
      if (!route) return;

      if (window.innerWidth <= 768) closeMobileSidebar();

      location.hash = route;
      e.preventDefault();
    });
  });

  // Window resize: keep behavior sane
  window.addEventListener("resize", () => {
    if (!sidebar) return;

    if (window.innerWidth <= 768) {
      // On mobile we don't keep collapsed state visually
      sidebar.classList.remove("collapsed");
      if (!isSidebarOpenMobile) {
        sidebar.classList.remove("active");
        overlay?.classList.remove("active");
      }
    } else {
      // On desktop restore collapsed state
      sidebar.classList.toggle("collapsed", userData.sidebarCollapsed);
      overlay?.classList.remove("active");
      sidebar.classList.remove("active");
      isSidebarOpenMobile = false;
    }
  });

  app.updateCounters();
};

app.toggleCollapse = function () {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  if (window.innerWidth <= 768) return; // no collapse on mobile

  userData.sidebarCollapsed = !userData.sidebarCollapsed;
  sidebar.classList.toggle("collapsed", userData.sidebarCollapsed);
  app.saveDataToLocalStorage();
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
  const titles = { home: "Inicio", memories: "Memorias", new: "Nueva memoria", settings: "Settings" };
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

  app.bindViewActions(route);
};

app.bindViewActions = function (route) {
  if (route === "home") {
    const evokeBtn = document.getElementById("evokeBtn");
    const evokeText = document.getElementById("evokeText");
    if (evokeBtn && evokeText) {
      evokeBtn.addEventListener("click", () => {
        const text = (evokeText.value || "").trim();
        if (!text) return;

        // Pre-llenado para "Nueva memoria" vía sessionStorage
        sessionStorage.setItem("evoka_draft_summary", text);
        location.hash = "new";
      });
    }
  }

  if (route === "new") {
    const draft = sessionStorage.getItem("evoka_draft_summary");
    if (draft) {
      const sum = document.getElementById("m_summary");
      if (sum && !sum.value) sum.value = draft;
      sessionStorage.removeItem("evoka_draft_summary");
    }

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
        alert("Falta el título.");
        return;
      }

      capsulesData.unshift(data);
      app.saveDataToLocalStorage();
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
      const ok = confirm("¿Borrar esta memoria?");
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
      <div class="h1">Bienvenido a EVOKA</div>
      <div class="p">
        Este espacio existe para que tus recuerdos no se pierdan: se ordenan, se entienden y se transforman en legado.
      </div>

      <div class="row">
        <span class="badge">Memorias: ${capsulesData.length}</span>
        <span class="badge">Tema: ${app.escapeHtml(userData.theme)}</span>
      </div>

      <div class="item stack">
        <div class="item-title">Evocar</div>
        <div class="p">Escribe una escena, una frase, una emoción. Luego la convertimos en memoria.</div>
        <textarea id="evokeText" class="textarea" placeholder="Escribe aquí..."></textarea>
        <div class="row">
          <button id="evokeBtn" class="btn btn-primary" type="button">Continuar</button>
          <button class="btn" type="button" onclick="location.hash='new'">Nueva memoria</button>
        </div>
      </div>

      ${last ? `
        <div class="item">
          <div class="item-title">Última memoria</div>
          <div class="item-meta">${app.escapeHtml(`#${last.id} — ${last.title}`)}</div>
          <div class="item-meta">${app.escapeHtml([last.date, last.place, last.song].filter(Boolean).join(" · ") || "Sin metadata")}</div>
        </div>
      ` : ``}
    </div>
  `;
};

app.renderMemories = function () {
  if (!capsulesData.length) {
    return `
      <div class="card stack">
        <div class="h1">Memorias</div>
        <div class="p">No hay memorias guardadas todavía.</div>
        <button class="btn btn-primary" onclick="location.hash='new'">Crear memoria</button>
      </div>
    `;
  }

  const items = capsulesData.map((m) => `
    <div class="item">
      <div class="item-title">${app.escapeHtml(`#${m.id} — ${m.title}`)}</div>
      <div class="item-meta">${app.escapeHtml([m.date, m.time, m.place].filter(Boolean).join(" · ") || "Sin fecha/ubicación")}</div>
      <div class="item-meta">${app.escapeHtml([m.song, m.protagonists].filter(Boolean).join(" · ") || "Sin detalles")}</div>
      <div style="margin-top:10px;">
        <button class="btn" data-open="${m.id}" type="button">Ver</button>
      </div>
    </div>
  `).join("");

  return `
    <div class="card stack">
      <div class="row" style="justify-content:space-between; align-items:center;">
        <div class="h1">Memorias</div>
        <button class="btn btn-primary" onclick="location.hash='new'">Nueva</button>
      </div>
      <div class="list">${items}</div>
    </div>
  `;
};

app.renderNewMemory = function () {
  return `
    <div class="card stack">
      <div class="h1">Nueva memoria</div>
      <div class="p">Estructura EVOKA: resumen, análisis psicológico, análisis Prime, consejo Prime, palabras para hijos.</div>

      <form id="memoryForm" class="stack">
        <div class="row">
          <input class="input" id="m_title" placeholder="Título (obligatorio)" />
          <input class="input" id="m_date" placeholder="Fecha simbólica" />
        </div>

        <div class="row">
          <input class="input" id="m_time" placeholder="Hora emocional" />
          <input class="input" id="m_place" placeholder="Lugar" />
        </div>

        <div class="row">
          <input class="input" id="m_song" placeholder="Canción emocional" />
          <input class="input" id="m_prot" placeholder="Protagonistas" />
        </div>

        <textarea class="textarea" id="m_summary" placeholder="Resumen"></textarea>
        <textarea class="textarea" id="m_psy" placeholder="Análisis psicológico"></textarea>
        <textarea class="textarea" id="m_primeA" placeholder="Análisis Prime"></textarea>
        <textarea class="textarea" id="m_primeC" placeholder="Consejo Prime"></textarea>
        <textarea class="textarea" id="m_kids" placeholder="Palabras para tus hijos"></textarea>

        <div class="row">
          <button class="btn btn-primary" type="submit">Guardar</button>
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
        <div class="h1">${app.escapeHtml(`#${m.id} — ${m.title}`)}</div>
        <div class="row">
          <button class="btn" id="backToList" type="button">Volver</button>
          <button class="btn" id="deleteMemory" type="button">Borrar</button>
        </div>
      </div>

      <div class="row">
        <span class="badge">${app.escapeHtml(m.date || "Sin fecha")}</span>
        <span class="badge">${app.escapeHtml(m.time || "Sin hora")}</span>
        <span class="badge">${app.escapeHtml(m.place || "Sin lugar")}</span>
      </div>

      <div class="p">${app.escapeHtml([m.song, m.protagonists].filter(Boolean).join(" · ") || "")}</div>

      ${app.section("Resumen", m.summary)}
      ${app.section("Análisis psicológico", m.psychological)}
      ${app.section("Análisis Prime", m.primeAnalysis)}
      ${app.section("Consejo Prime", m.primeAdvice)}
      ${app.section("Palabras para hijos", m.kidsAdvice)}
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
      <div class="p">Tema actual: <b>${app.escapeHtml(userData.theme)}</b></div>

      <div class="row">
        <button class="btn btn-primary" type="button" onclick="document.getElementById('themeToggle').click()">Cambiar tema</button>
        <button class="btn" type="button" onclick="document.getElementById('resetData').click()">Reset datos</button>
      </div>

      <div class="p">
        Este MVP guarda datos en este navegador. Si abres en otro dispositivo, no verá tus memorias.
      </div>
    </div>
  `;
};

app.renderNotFound = function () {
  return `
    <div class="card stack">
      <div class="h1">Ruta no encontrada</div>
      <div class="p">Vuelve al inicio.</div>
      <button class="btn btn-primary" onclick="location.hash='home'">Inicio</button>
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
