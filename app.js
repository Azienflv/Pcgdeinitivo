function getContent() {
  return document.getElementById("content");
}

function safeId(text) {
  return String(text || "").replace(/\s+/g, "_").replace(/[^\w]/g, "");
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Lista de líneas no vacías, a partir de un textarea (una por línea)
function lineasA(texto) {
  return String(texto || "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);
}

// Lista separada por comas
function comasA(texto) {
  return String(texto || "")
    .split(",")
    .map(l => l.trim())
    .filter(Boolean);
}

// Párrafos separados por línea en blanco
function parrafosA(texto) {
  return String(texto || "")
    .split(/\n\s*\n/)
    .map(l => l.trim())
    .filter(Boolean);
}

// =======================
// 📝 CAMPOS DE CONTENIDO (para plantilla dinámica tour.html)
// =======================
function renderContenidoFields(prefix, c) {
  c = c && typeof c === "object" ? c : {};
  return `
    <div style="border-top:1px dashed #334155; margin-top:14px; padding-top:14px;">
      <h4 style="margin:0 0 10px 0; color:#e2e8f0;">📝 Contenido de la página (web)</h4>

      <label style="font-size:13px; color:#94a3b8;">Subtítulo</label>
      <input type="text" id="c-subtitulo-${prefix}" value="${(c.subtitulo || "").replace(/"/g, "&quot;")}" placeholder="Frase corta debajo del título">

      <label style="font-size:13px; color:#94a3b8;">Aviso de urgencia</label>
      <input type="text" id="c-urgency-${prefix}" value="${(c.urgency || "").replace(/"/g, "&quot;")}" placeholder="Ej: ⚠️ Cupos limitados">

      <div style="display:grid; grid-template-columns:1fr 2fr; gap:10px;">
        <div>
          <label style="font-size:13px; color:#94a3b8;">Calificación (1-5)</label>
          <input type="number" step="0.1" min="0" max="5" id="c-rating-${prefix}" value="${c.rating || ""}" placeholder="Ej: 4.5">
        </div>
        <div>
          <label style="font-size:13px; color:#94a3b8;">Texto junto a la calificación</label>
          <input type="text" id="c-rating-label-${prefix}" value="${(c.rating_label || "").replace(/"/g, "&quot;")}" placeholder="Ej: (popular choice)">
        </div>
      </div>

      <label style="font-size:13px; color:#94a3b8;">Insignias (separadas por coma)</label>
      <input type="text" id="c-badges-${prefix}" value="${(Array.isArray(c.badges) ? c.badges.join(", ") : "")}" placeholder="Ej: 🔥 Best Seller, 🌴 Most Popular">

      <label style="font-size:13px; color:#94a3b8;">Info rápida (separada por coma)</label>
      <input type="text" id="c-quickinfo-${prefix}" value="${(Array.isArray(c.quick_info) ? c.quick_info.join(", ") : "")}" placeholder="Ej: ⏱ Full day, 🚐 Hotel pickup included">

      <label style="font-size:13px; color:#94a3b8;">Highlights (uno por línea)</label>
      <textarea id="c-highlights-${prefix}" rows="4" placeholder="Un punto destacado por línea">${(Array.isArray(c.highlights) ? c.highlights.join("\n") : "")}</textarea>

      <label style="font-size:13px; color:#94a3b8;">Descripción / About (párrafos separados por línea en blanco)</label>
      <textarea id="c-about-${prefix}" rows="5" placeholder="Un párrafo, línea en blanco, otro párrafo...">${(Array.isArray(c.about) ? c.about.join("\n\n") : "")}</textarea>

      <label style="font-size:13px; color:#94a3b8;">Qué incluye (uno por línea)</label>
      <textarea id="c-incluye-${prefix}" rows="4" placeholder="Un ítem por línea">${(Array.isArray(c.incluye) ? c.incluye.join("\n") : "")}</textarea>

      <label style="font-size:13px; color:#94a3b8;">No incluye (uno por línea)</label>
      <textarea id="c-no-incluye-${prefix}" rows="3" placeholder="Un ítem por línea">${(Array.isArray(c.no_incluye) ? c.no_incluye.join("\n") : "")}</textarea>

      <label style="font-size:13px; color:#94a3b8;">Good to know (uno por línea)</label>
      <textarea id="c-good-${prefix}" rows="3" placeholder="Un ítem por línea">${(Array.isArray(c.good_to_know) ? c.good_to_know.join("\n") : "")}</textarea>
    </div>
  `;
}

// Lee los campos de contenido del formulario y arma el objeto "contenido".
// whyBookExistente se conserva tal cual (esa sección no tiene UI propia todavía).
function leerContenidoFields(prefix, whyBookExistente) {
  const rating = parseFloat(document.getElementById(`c-rating-${prefix}`)?.value);
  return {
    subtitulo: document.getElementById(`c-subtitulo-${prefix}`)?.value.trim() || "",
    urgency: document.getElementById(`c-urgency-${prefix}`)?.value.trim() || "",
    rating: isNaN(rating) ? null : rating,
    rating_label: document.getElementById(`c-rating-label-${prefix}`)?.value.trim() || "",
    badges: comasA(document.getElementById(`c-badges-${prefix}`)?.value),
    quick_info: comasA(document.getElementById(`c-quickinfo-${prefix}`)?.value),
    highlights: lineasA(document.getElementById(`c-highlights-${prefix}`)?.value),
    about: parrafosA(document.getElementById(`c-about-${prefix}`)?.value),
    incluye: lineasA(document.getElementById(`c-incluye-${prefix}`)?.value),
    no_incluye: lineasA(document.getElementById(`c-no-incluye-${prefix}`)?.value),
    good_to_know: lineasA(document.getElementById(`c-good-${prefix}`)?.value),
    why_book: Array.isArray(whyBookExistente) ? whyBookExistente : []
  };
}

// =======================
// ☁️ SUPABASE
// =======================
const SUPABASE_URL = "https://gqurgezuuytxrcmudnik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXJnZXp1dXl0eHJjbXVkbmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTAyMjIsImV4cCI6MjA5MDE4NjIyMn0.1EW73snm3LvXPW0jK-g_-Klze0FyIbXI4dzv0J2XGr4";

let supabaseClient = null;

if (typeof supabase !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase conectado ✅");
} else {
  console.warn("Supabase no está configurado.");
}

// =======================
// 📧 NOTIFICACIONES POR CORREO (Zoho, vía Edge Function)
// =======================
// No detiene ni rompe el guardado si el correo falla: solo avisa en consola.
async function notificarCliente(tipo, datos) {
  try {
    if (!datos.to) {
      console.warn("No se envió notificación: la reserva no tiene email.");
      return;
    }
    const { data, error } = await supabaseClient.functions.invoke("notificar-reserva", {
      body: { tipo, ...datos }
    });
    if (error) throw error;
    console.log("Notificación enviada:", data);
  } catch (err) {
    console.error("No se pudo enviar la notificación al cliente:", err);
  }
}

// =======================
// 🔐 LOGIN / LOGOUT
// =======================
async function login() {
  // El campo "username" del formulario ahora debe contener el EMAIL
  // (el que se usó para crear la cuenta en Supabase Auth).
  const email = document.getElementById("username")?.value.trim();
  const pass = document.getElementById("password")?.value.trim();
  const loginError = document.getElementById("loginError");

  try {
    if (!supabaseClient) throw new Error("Supabase no está conectado");

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError || !authData?.user) {
      if (loginError) loginError.style.display = "block";
      return;
    }

    const { data: perfil, error: perfilError } = await supabaseClient
      .from("perfiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (perfilError || !perfil) {
      // Tiene cuenta en Auth pero no tiene perfil asignado -> sin acceso al panel
      await supabaseClient.auth.signOut();
      if (loginError) {
        loginError.style.display = "block";
        loginError.textContent = "Esta cuenta no tiene acceso al panel.";
      }
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(perfil));

    if (loginError) loginError.style.display = "none";
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";

    getContent().innerHTML = `
      <h1>Dashboard</h1>
      <p>Bienvenido, ${perfil.nombre}</p>
    `;
  } catch (err) {
    console.error("Error en login:", err);
    if (loginError) loginError.style.display = "block";
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  localStorage.removeItem("currentUser");

  document.getElementById("app").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";

  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const loginError = document.getElementById("loginError");

  if (username) username.value = "";
  if (password) password.value = "";
  if (loginError) loginError.style.display = "none";
}

// =======================
// 📱 HELPERS UI
// =======================
function isMobile() {
  return window.innerWidth <= 768;
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const overlay = document.getElementById("mobileOverlay");

  if (!sidebar || !main) return;

  if (isMobile()) {
    sidebar.classList.add("active");
    main.classList.remove("shift");
    if (overlay) overlay.classList.add("active");
  } else {
    sidebar.classList.toggle("active");
    main.classList.toggle("shift");
  }
}

function closeSidebarMobile() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const overlay = document.getElementById("mobileOverlay");

  if (!isMobile()) return;
  if (sidebar) sidebar.classList.remove("active");
  if (main) main.classList.remove("shift");
  if (overlay) overlay.classList.remove("active");
}

// =======================
// 🚀 INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  console.log("App cargada correctamente ✅");

  // 🆕 Inyectar nuevos ítems de menú (Catálogo / Proveedores) sin tocar index.html
  const sidebarEl = document.getElementById("sidebar");
  if (sidebarEl && !sidebarEl.querySelector('[data-menu="catalogo"]')) {
    const logoutBtn = sidebarEl.querySelector("button");

    const catalogoLink = document.createElement("a");
    catalogoLink.href = "#";
    catalogoLink.className = "menu-item";
    catalogoLink.dataset.menu = "catalogo";
    catalogoLink.textContent = "Catálogo (Beta)";

    const proveedoresLink = document.createElement("a");
    proveedoresLink.href = "#";
    proveedoresLink.className = "menu-item";
    proveedoresLink.dataset.menu = "proveedores";
    proveedoresLink.textContent = "Proveedores";

    if (logoutBtn) {
      sidebarEl.insertBefore(catalogoLink, logoutBtn);
      sidebarEl.insertBefore(proveedoresLink, logoutBtn);
    } else {
      sidebarEl.appendChild(catalogoLink);
      sidebarEl.appendChild(proveedoresLink);
    }
  }

  const toggleBtn = document.getElementById("toggleBtn");
  const menuItems = document.querySelectorAll(".menu-item");
  const overlay = document.getElementById("mobileOverlay");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      openSidebar();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      closeSidebarMobile();
    });
  }

  if (menuItems.length > 0) {
    menuItems.forEach(item => {
      item.addEventListener("click", async (e) => {
        e.preventDefault();

        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const text = item.textContent.trim();

        if (text === "Nueva Reserva") await loadForm();
        else if (text === "Reportes") await menuReportes();
        else if (text === "Reservas") await mostrarReservas();
        else if (text === "Nuevo Producto") menuProductos();
        else if (text === "Usuarios") await menuUsuarios();
        else if (text === "Reviews") await menuReviews();
        else if (item.dataset.menu === "catalogo") await menuCatalogoReservas();
        else if (item.dataset.menu === "proveedores") await menuProveedores();

        closeSidebarMobile();
      });
    });
  }

  window.addEventListener("resize", () => {
    if (isMobile()) {
      const main = document.getElementById("main");
      if (main) main.classList.remove("shift");
    } else {
      const overlayEl = document.getElementById("mobileOverlay");
      if (overlayEl) overlayEl.classList.remove("active");
    }
  });
});

// =======================
// 🔄 RESTAURAR SESIÓN
// =======================
window.onload = async function () {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    const { data: perfil, error: perfilError } = await supabaseClient
      .from("perfiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (perfilError || !perfil) {
      // Sesión válida en Auth pero sin perfil de panel -> se cierra la sesión
      await supabaseClient.auth.signOut();
      document.getElementById("loginScreen").style.display = "flex";
      document.getElementById("app").style.display = "none";
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(perfil));
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";

    getContent().innerHTML = `
      <h1>Dashboard</h1>
      <p>Bienvenido, ${perfil.nombre}</p>
    `;
  } else {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }
};

// =======================
// 🧰 HELPERS DATA
// =======================
async function fetchProductos() {
  const { data, error } = await supabaseClient
    .from("productos")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchProveedores() {
  const { data, error } = await supabaseClient
    .from("proveedores")
    .select("*")
    .order("nombre", { ascending: tr
