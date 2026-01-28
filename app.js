// EVOKA MVP1 UI (pantalla tipo referencia)
// - Sidebar activo por ruta
// - Contador simple (capsules) usando localStorage
// - "Enviar" guarda un borrador y lo cuenta como cápsula (MVP)

const LS_KEY = "evoka_capsules_count_v1";

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function loadCount() {
  const n = Number(localStorage.getItem(LS_KEY) || "0");
  return Number.isFinite(n) ? n : 0;
}

function saveCount(n) {
  localStorage.setItem(LS_KEY, String(n));
}

function setActive(route) {
  $all(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.route === route);
  });

  // Cambia el centro según sección (sin complicar MVP)
  const view = $("#view");
  if (!view) return;

  if (route === "home") {
    view.innerHTML = `
      <h1 class="hero-title">Hola Felipe</h1>
      <p class="hero-subtitle">¿Qué recuerdo quieres evocar hoy?</p>
    `;
  } else {
    const title = route === "chat" ? "Diálogo"
      : route === "calendar" ? "Calendario"
      : route === "vault" ? "Privado"
      : route === "settings" ? "Settings"
      : "EVOKA";
    view.innerHTML = `
      <h1 class="hero-title">${title}</h1>
      <p class="hero-subtitle">MVP visual. Aquí conectamos funciones después.</p>
    `;
  }
}

function bumpCount() {
  const current = loadCount();
  const next = current + 1;
  saveCount(next);
  const el = $("#capsuleCount");
  if (el) el.textContent = String(next);
}

function init() {
  // Set initial count
  const el = $("#capsuleCount");
  if (el) el.textContent = String(loadCount());

  // Nav clicks
  $all(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => setActive(btn.dataset.route));
  });

  // Autosize textarea
  const prompt = $("#prompt");
  if (prompt) {
    const resize = () => {
      prompt.style.height = "auto";
      prompt.style.height = Math.min(prompt.scrollHeight, 160) + "px";
    };
    prompt.addEventListener("input", resize);
    resize();
  }

  // Send button (MVP)
  const send = $("#sendBtn");
  if (send && prompt) {
    send.addEventListener("click", () => {
      const text = (prompt.value || "").trim();
      if (!text) return;

      // En este MVP: lo contamos como cápsula creada (visual + simple)
      bumpCount();

      // Limpia input y vuelve a Home
      prompt.value = "";
      prompt.dispatchEvent(new Event("input"));
      setActive("home");
    });
  }

  // Mic button (placeholder)
  const mic = $("#micBtn");
  if (mic) {
    mic.addEventListener("click", () => {
      // MVP: no hacemos audio real aún
      // Aquí luego conectas Web Speech API / MediaRecorder
      alert("MVP: micrófono aún no implementado.");
    });
  }

  // Default
  setActive("home");
}

document.addEventListener("DOMContentLoaded", init);
