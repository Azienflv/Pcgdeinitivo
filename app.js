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
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchHoteles() {
  const { data, error } = await supabaseClient
    .from("hoteles")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchReservas() {
  const { data, error } = await supabaseClient
    .from("reservas")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchReservaById(id) {
  const { data, error } = await supabaseClient
    .from("reservas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

async function fetchWebReservations() {
  const { data, error } = await supabaseClient
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchWebReservationById(id) {
  const { data, error } = await supabaseClient
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

function normalizeVoucherData(reserva, tipo = "panel") {
  if (tipo === "panel") {
    return {
      cliente: reserva.cliente || "-",
      telefono: reserva.telefono || "-",
      email: reserva.email || "-",
      hotel: reserva.hotel || "-",
      excursion: reserva.excursion || "-",
      pickup: reserva.pickup || "-",
      fecha: reserva.fecha || "-",
      adultos: reserva.adultos || 0,
      ninos: reserva.ninos || 0,
      precio: reserva.precio || 0
    };
  }

  return {
    cliente: reserva.client_name || "-",
    telefono: reserva.phone || "-",
    email: reserva.email || "-",
    hotel: reserva.hotel_name || "-",
    excursion: reserva.tour_name || reserva.tour_slug || "-",
    pickup: reserva.pickup_time || "-",
    fecha: reserva.selected_date || "-",
    adultos: reserva.adults || 0,
    ninos: reserva.children || 0,
    precio: reserva.total || 0
  };
}

function getEstadoBadge(estado) {
  const value = (estado || "").toLowerCase();

  if (value === "pending_cash") {
    return `<span class="badge badge-cash">Pending Cash</span>`;
  }

  if (value === "pending_payment") {
    return `<span class="badge badge-payment">Pending Payment</span>`;
  }

  if (value === "paid") {
    return `<span class="badge badge-paid">Paid</span>`;
  }

  if (value === "confirmed") {
    return `<span class="badge badge-confirmed">Confirmed</span>`;
  }

  if (value === "manual") {
    return `<span class="badge badge-manual">Manual</span>`;
  }

  return `<span class="badge badge-default">${estado || "-"}</span>`;
}

function getFuenteBadge(fuente) {
  const value = (fuente || "").toLowerCase();

  if (value === "web") {
    return `<span class="badge badge-web">Web</span>`;
  }

  if (value === "panel") {
    return `<span class="badge badge-panel">Panel</span>`;
  }

  return `<span class="badge badge-default">${fuente || "-"}</span>`;
}

// =======================
// 📦 MENÚ PRODUCTOS
// =======================
function menuProductos() {
  getContent().innerHTML = `
    <h2>Gestión de Productos</h2>

    <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
      <button onclick="loadProducto()">➕ Excursiones</button>
      <button onclick="editarProductos()">✏️ Editar Productos</button>
      <button onclick="menuHoteles()">🏨 Hoteles</button>
    </div>
  `;
}

// =======================
// ➕ CREAR PRODUCTO
// =======================
async function loadProducto() {
  let familiasExistentes = [];
  try {
    const productos = await fetchProductos();
    familiasExistentes = [...new Set(productos.map(p => p.family).filter(Boolean))];
  } catch (err) {
    console.warn("No se pudieron cargar familias existentes:", err);
  }

  getContent().innerHTML = `
    <h2>Nueva Excursión</h2>
    <p style="color:#94a3b8; font-size:13px;">
      Esto crea una excursión nueva, completa, que va a aparecer en la web usando la plantilla
      dinámica (tour.html). Después de guardarla podrás subirle imágenes desde "Editar Productos".
    </p>

    <form id="productoForm">
      <label style="font-size:13px; color:#94a3b8;">Nombre visible</label>
      <input type="text" id="nombreExcursion" placeholder="Ej: Saona Premium" required oninput="
        document.getElementById('slugExcursion').value = slugify(this.value);
      ">

      <label style="font-size:13px; color:#94a3b8;">Slug (URL, se genera solo, puedes editarlo)</label>
      <input type="text" id="slugExcursion" placeholder="Ej: saona-premium" required>

      <label style="font-size:13px; color:#94a3b8;">Familia (agrupa variantes, ej: "saona"). ${familiasExistentes.length ? "Ya existen: " + familiasExistentes.join(", ") : ""}</label>
      <input type="text" id="familyExcursion" list="familiasList" placeholder="Ej: saona">
      <datalist id="familiasList">
        ${familiasExistentes.map(f => `<option value="${f}">`).join("")}
      </datalist>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label style="font-size:13px; color:#94a3b8;">Precio adulto</label>
          <input type="number" id="precioAdulto" placeholder="Precio Adulto" required>
        </div>
        <div>
          <label style="font-size:13px; color:#94a3b8;">Precio niño</label>
          <input type="number" id="precioNino" placeholder="Precio Niño" required>
        </div>
      </div>

      <label style="font-size:13px; color:#94a3b8;">Capacidad máxima</label>
      <input type="number" id="capacidadExcursion" placeholder="Ej: 20">

      <label style="font-size:13px; color:#94a3b8;">Horarios disponibles (separados por coma)</label>
      <input type="text" id="horariosExcursion" placeholder="Ej: 7:00 AM, 8:20 AM, 9:45 AM">

      <label style="display:flex; align-items:center; gap:8px; font-size:14px; margin-top:6px;">
        <input type="checkbox" id="activoExcursion" checked style="width:auto; margin:0;">
        Activa en la web
      </label>

      ${renderContenidoFields("nuevo", {})}

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
        <button type="submit">💾 Guardar Excursión</button>
        <button type="button" onclick="menuProductos()">⬅ Volver</button>
      </div>
    </form>
  `;

  document.getElementById("productoForm")
    .addEventListener("submit", guardarProducto);
}

async function guardarProducto(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombreExcursion").value.trim();
  const slug = slugify(document.getElementById("slugExcursion").value) || slugify(nombre);
  const family = document.getElementById("familyExcursion").value.trim() || null;
  const adulto = parseFloat(document.getElementById("precioAdulto").value) || 0;
  const nino = parseFloat(document.getElementById("precioNino").value) || 0;
  const capacidad_maxima = parseInt(document.getElementById("capacidadExcursion").value) || 0;
  const activo_web = document.getElementById("activoExcursion").checked;

  const horariosInput = document.getElementById("horariosExcursion").value.trim();
  const horarios = horariosInput ? comasA(horariosInput) : [];

  const contenido = leerContenidoFields("nuevo", []);

  const producto = {
    nombre,
    slug,
    family,
    adulto,
    nino,
    capacidad_maxima,
    activo_web,
    horarios,
    contenido
  };

  try {
    const { error } = await supabaseClient
      .from("productos")
      .insert([producto]);

    if (error) {
      console.error("Supabase error productos:", error);
      throw error;
    }

    alert("Excursión guardada ✅ Ahora puedes subirle imágenes desde 'Editar Productos'.");
    editarProductos();

  } catch (err) {
    console.error("Error guardando producto:", err);
    alert("No se pudo guardar el producto: " + (err.message || "Error desconocido") + " ⚠️");
  }
}

async function editarProductos() {
  try {
    const [productos, proveedores] = await Promise.all([
      fetchProductos(),
      fetchProveedores()
    ]);

    if (productos.length === 0) {
      getContent().innerHTML = `
        <h2>No hay productos aún</h2>
        <button onclick="menuProductos()">⬅ Volver</button>
      `;
      return;
    }

    let html = `<h2>Editar Excursiones Web</h2>`;

    window.__productosCache = {};
    productos.forEach(p => { window.__productosCache[p.id] = p; });

    productos.forEach((p) => {
      const horariosTexto = Array.isArray(p.horarios)
        ? p.horarios.join(", ")
        : "";

      const diasDisponibles = Array.isArray(p.dias_disponibles)
        ? p.dias_disponibles
        : [];

      const fechasBloqueadasTexto = Array.isArray(p.fechas_bloqueadas)
        ? p.fechas_bloqueadas.join(", ")
        : "";

      const diasSemana = [
        ["monday", "Monday"],
        ["tuesday", "Tuesday"],
        ["wednesday", "Wednesday"],
        ["thursday", "Thursday"],
        ["friday", "Friday"],
        ["saturday", "Saturday"],
        ["sunday", "Sunday"]
      ];

      html += `
        <div style="border:1px solid #334155; padding:14px; margin-bottom:14px; border-radius:10px; background:#111827;">
          <div style="display:grid; gap:10px;">

            <label style="font-size:13px; color:#94a3b8;">Nombre visible</label>
            <input type="text" value="${p.nombre || ""}" id="nombre-${p.id}">

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:13px; color:#94a3b8;">Precio adulto</label>
                <input type="number" value="${p.adulto || 0}" id="adulto-${p.id}">
              </div>

              <div>
                <label style="font-size:13px; color:#94a3b8;">Precio niño</label>
                <input type="number" value="${p.nino || 0}" id="nino-${p.id}">
              </div>
            </div>

            <label style="display:flex; align-items:center; gap:8px; font-size:14px; margin-top:6px;">
              <input type="checkbox" id="promo-${p.id}" ${p.en_promocion ? "checked" : ""} style="width:auto; margin:0;">
              🔥 En promoción
            </label>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:13px; color:#94a3b8;">Precio promo adulto</label>
                <input type="number" value="${p.precio_promo_adulto || ""}" id="promo-adulto-${p.id}" placeholder="Ej: 69">
              </div>

              <div>
                <label style="font-size:13px; color:#94a3b8;">Precio promo niño</label>
                <input type="number" value="${p.precio_promo_nino || ""}" id="promo-nino-${p.id}" placeholder="Ej: 35">
              </div>
            </div>

            <label style="font-size:13px; color:#94a3b8;">Capacidad máxima</label>
            <input
            type="number"
           id="capacidad-${p.id}"
            value="${p.capacidad_maxima || 0}"
            placeholder="Ej: 20"
            />
           
            <label style="font-size:13px; color:#94a3b8;">Horarios disponibles</label>
            <input
              type="text"
              value="${horariosTexto}"
              id="horarios-${p.id}"
              placeholder="Ej: 7:00 AM, 8:20 AM, 9:45 AM"
            >

            <label style="font-size:13px; color:#94a3b8;">Available days</label>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
              ${diasSemana.map(([value, label]) => `
                <label style="display:flex; align-items:center; gap:8px; font-size:14px;">
                  <input
                    type="checkbox"
                    id="dia-${value}-${p.id}"
                    ${diasDisponibles.includes(value) ? "checked" : ""}
                    style="width:auto; margin:0;"
                  >
                  ${label}
                </label>
              `).join("")}
            </div>

            <label style="font-size:13px; color:#94a3b8;">Booking cut-off time</label>
            <input
              type="time"
              id="hora-limite-${p.id}"
              value="${p.hora_limite_reserva || ""}"
            >

            <label style="font-size:13px; color:#94a3b8;">Blocked dates</label>
            <input
              type="text"
              id="fechas-bloqueadas-${p.id}"
              value="${fechasBloqueadasTexto}"
              placeholder="Ej: 2026-05-10, 2026-05-18"
            >

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:13px; color:#94a3b8;">Slug (solo lectura)</label>
                <input type="text" value="${p.slug || ""}" readonly style="background:#1f2937; color:#9ca3af;">
              </div>

              <div>
                <label style="font-size:13px; color:#94a3b8;">Family (solo lectura)</label>
                <input type="text" value="${p.family || ""}" readonly style="background:#1f2937; color:#9ca3af;">
              </div>
            </div>

            <label style="font-size:13px; color:#94a3b8;">Proveedor</label>
            <select id="proveedor-${p.id}">
              <option value="">Sin proveedor asignado</option>
              ${proveedores.map(prov => `
                <option value="${prov.id}" ${p.proveedor_id === prov.id ? "selected" : ""}>
                  ${prov.nombre}
                </option>
              `).join("")}
            </select>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:13px; color:#94a3b8;">Costo neto adulto (a proveedor)</label>
                <input type="number" step="0.01" min="0" id="costo-neto-adulto-${p.id}" value="${p.costo_neto_adulto ?? ""}" placeholder="Ej: 45">
              </div>

              <div>
                <label style="font-size:13px; color:#94a3b8;">Costo neto niño (a proveedor)</label>
                <input type="number" step="0.01" min="0" id="costo-neto-nino-${p.id}" value="${p.costo_neto_nino ?? ""}" placeholder="Ej: 25">
              </div>
            </div>

            <label style="display:flex; align-items:center; gap:8px; font-size:14px;">
              <input type="checkbox" id="activo-${p.id}" ${p.activo_web ? "checked" : ""} style="width:auto; margin:0;">
              Activa en la web
            </label>

            ${renderContenidoFields(p.id, p.contenido)}

           <div style="
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top:10px;
  margin-bottom:10px;
">
  ${
    Array.isArray(p.imagenes_urls)
      ? p.imagenes_urls.map(img => `
        <div style="position:relative;">
          <img
            src="${img}"
            style="
              width:120px;
              height:90px;
              object-fit:cover;
              border-radius:10px;
              border:1px solid #334155;
            "
          >
        </div>
      `).join("")
      : ""
  }
</div>

<input 
  type="file" 
  id="imagen-${p.id}" 
  accept="image/*"
  style="margin-top:10px;"
>

<div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
  <button type="button" onclick="subirImagenProducto(${p.id})">
    📸 Subir Imagen
  </button>

  <button type="button" onclick="actualizarProducto(${p.id})">
    💾 Guardar
  </button>

  <button type="button" onclick="eliminarProducto(${p.id})">
    ❌ Eliminar
  </button>
</div>
            </div>
          </div>
        </div>
      `;
    });

    html += `<button onclick="menuProductos()">⬅ Volver</button>`;
    getContent().innerHTML = html;

  } catch (err) {
    console.error("Error cargando productos:", err);
    alert("No se pudieron cargar los productos ⚠️");
  }
}
async function actualizarProducto(id) {
  const nombre = document.getElementById(`nombre-${id}`).value.trim();
  const adulto = parseFloat(document.getElementById(`adulto-${id}`).value) || 0;
  const nino = parseFloat(document.getElementById(`nino-${id}`).value) || 0;
  const activo_web = document.getElementById(`activo-${id}`).checked;
  const en_promocion = document.getElementById(`promo-${id}`).checked;
  const precio_promo_adulto = parseFloat(document.getElementById(`promo-adulto-${id}`).value) || null;
  const precio_promo_nino = parseFloat(document.getElementById(`promo-nino-${id}`).value) || null;

  const horariosInput = document.getElementById(`horarios-${id}`).value.trim();

  const horarios = horariosInput
    ? horariosInput
        .split(",")
        .map(h => h.trim())
        .filter(Boolean)
    : [];

const diasSemana = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

const dias_disponibles = diasSemana.filter((dia) => {
  const checkbox = document.getElementById(`dia-${dia}-${id}`);
  return checkbox && checkbox.checked;
});

const hora_limite_reserva =
  document.getElementById(`hora-limite-${id}`)?.value || null;

const fechasInput =
  document.getElementById(`fechas-bloqueadas-${id}`)?.value.trim() || "";

const fechas_bloqueadas = fechasInput
  ? fechasInput.split(",").map(f => f.trim()).filter(Boolean)
  : [];

const capacidad_maxima =
  parseInt(document.getElementById(`capacidad-${id}`)?.value) || 0;

const whyBookExistente = window.__productosCache?.[id]?.contenido?.why_book || [];
const contenido = leerContenidoFields(id, whyBookExistente);

const proveedorSelect = document.getElementById(`proveedor-${id}`)?.value || "";
const proveedor_id = proveedorSelect ? parseInt(proveedorSelect) : null;

const costoNetoAdultoInput = document.getElementById(`costo-neto-adulto-${id}`)?.value;
const costoNetoNinoInput = document.getElementById(`costo-neto-nino-${id}`)?.value;

const costo_neto_adulto = costoNetoAdultoInput !== "" && costoNetoAdultoInput != null
  ? parseFloat(costoNetoAdultoInput)
  : null;

const costo_neto_nino = costoNetoNinoInput !== "" && costoNetoNinoInput != null
  ? parseFloat(costoNetoNinoInput)
  : null;

try {
  const { error } = await supabaseClient
    .from("productos")
    .update({
      nombre,
      adulto,
      nino,
      horarios,
      activo_web,
      dias_disponibles,
      hora_limite_reserva,
      fechas_bloqueadas,
      capacidad_maxima,
      en_promocion,
      precio_promo_adulto,
      precio_promo_nino,
      contenido,
      proveedor_id,
      costo_neto_adulto,
      costo_neto_nino
    })
    .eq("id", id);

  if (error) throw error;

  alert("Excursión actualizada ✅");
  editarProductos();

} catch (err) {
  console.error("Error actualizando producto:", err);

  alert(
    "No se pudo actualizar la excursión ⚠️\n\n" +
    "Error: " + (err.message || JSON.stringify(err))
  );
}
}  
async function eliminarProducto(id) {
  if (!confirm("¿Eliminar este producto?")) return;

  try {
    const { error } = await supabaseClient
      .from("productos")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Producto eliminado ✅");
    editarProductos();
  } catch (err) {
    console.error("Error eliminando producto:", err);
    alert("No se pudo eliminar el producto ⚠️");
  }
}

// =======================
// 🏨 HOTELES
// =======================
function menuHoteles() {
  getContent().innerHTML = `
    <h2>Hoteles</h2>

    <button onclick="crearHotel()">➕ Crear Hotel</button>
    <button onclick="verHoteles()">📋 Ver Hoteles</button>
    <br><br>
    <button onclick="menuProductos()">⬅ Volver</button>
  `;
}

async function crearHotel() {
  try {
    const productos = await fetchProductos();

    let inputs = productos.map(p => {
  const id = safeId(p.slug || p.nombre);
  const horarios = Array.isArray(p.horarios) && p.horarios.length
    ? p.horarios
    : ["default"];

  return `
    <div style="margin-bottom:16px; padding:12px; border:1px solid #334155; border-radius:10px;">
      <label style="display:block; margin-bottom:10px;">
        <strong>${p.nombre}</strong>
      </label>

      ${horarios.map((hora, index) => `
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:13px; color:#94a3b8; margin-bottom:5px;">
            ${hora === "default" ? "Pickup" : `Pickup for ${hora}`}
          </label>

          <input
            type="time"
            id="pickup_${id}_${index}"
            data-tour-key="${p.slug || p.nombre}"
            data-tour-time="${hora}"
          >
        </div>
      `).join("")}
    </div>
  `;
}).join("");

    getContent().innerHTML = `
      <h2>Nuevo Hotel</h2>

      <form id="hotelForm">
        <input type="text" id="nombreHotel" placeholder="Nombre del hotel" required>

        <h4>Horarios por excursión</h4>
        ${inputs}

        <button type="submit">Guardar Hotel</button>
        <button type="button" onclick="menuHoteles()">⬅ Volver</button>
      </form>
    `;

    document.getElementById("hotelForm")
      .addEventListener("submit", guardarHotel);

  } catch (err) {
    console.error("Error cargando productos para hotel:", err);
    alert("No se pudieron cargar los productos ⚠️");
  }
}

async function guardarHotel(e) {
  e.preventDefault();

  try {
    const productos = await fetchProductos();

    const hotel = {
      nombre: document.getElementById("nombreHotel").value.trim(),
      pickups: {}
    };

    productos.forEach(p => {
  const key = p.slug || p.nombre;
  const id = safeId(key);
  const horarios = Array.isArray(p.horarios) && p.horarios.length
    ? p.horarios
    : ["default"];

  hotel.pickups[key] = {};

  horarios.forEach((hora, index) => {
    const input = document.getElementById(`pickup_${id}_${index}`);
    const pickupValue = input?.value || "";

    if (pickupValue) {
      hotel.pickups[key][hora] = pickupValue;
    }
  });
});

    const { error } = await supabaseClient
      .from("hoteles")
      .insert([hotel]);

    if (error) throw error;

    alert("Hotel guardado ✅");
    menuHoteles();

  } catch (err) {
    console.error("Error guardando hotel:", err);
    alert("No se pudo guardar el hotel ⚠️");
  }
}

async function verHoteles() {
  try {
    const hoteles = await fetchHoteles();

    if (hoteles.length === 0) {
      getContent().innerHTML = `<h2>No hay hoteles</h2>`;
      return;
    }

    let html = `<h2>Hoteles</h2>`;

    hoteles.forEach((h) => {
      html += `<h4>${h.nombre}</h4><ul>`;

      for (let exc in h.pickups) {
        html += `<li>${exc} → ${h.pickups[exc] || "Sin horario"}</li>`;
      }

      html += `</ul>
        <button onclick="editarHotel(${h.id})">✏️</button>
        <button onclick="eliminarHotel(${h.id})">❌</button>
      `;
    });

    html += `<br><button onclick="menuHoteles()">⬅ Volver</button>`;
    getContent().innerHTML = html;
  } catch (err) {
    console.error("Error cargando hoteles:", err);
    alert("No se pudieron cargar los hoteles ⚠️");
  }
}

async function editarHotel(id) {
  try {
    const { data: hotel, error: hotelError } = await supabaseClient
      .from("hoteles")
      .select("*")
      .eq("id", id)
      .single();

    if (hotelError) throw hotelError;

    const productos = await fetchProductos();

    let inputs = productos.map(p => {
  const key = p.slug || p.nombre;
  const pid = safeId(key);

  const horariosProducto = Array.isArray(p.horarios) && p.horarios.length
    ? p.horarios
    : ["default"];

  const savedBySlug = hotel.pickups?.[p.slug];
  const savedByName = hotel.pickups?.[p.nombre];
  const savedPickup = savedBySlug || savedByName || {};

  function getSavedPickup(hora, index) {
    if (Array.isArray(savedPickup)) {
      return savedPickup[index] || "";
    }

    if (typeof savedPickup === "object" && savedPickup !== null) {
      return savedPickup[hora] || savedPickup.default || "";
    }

    return savedPickup || "";
  }

  return `
    <div style="margin-bottom:16px; padding:12px; border:1px solid #334155; border-radius:10px;">
      <label style="display:block; margin-bottom:10px;">
        <strong>${p.nombre}</strong>
      </label>

      ${horariosProducto.map((hora, index) => `
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:13px; color:#94a3b8; margin-bottom:5px;">
            ${hora === "default" ? "Pickup" : `Pickup for ${hora}`}
          </label>

          <input
            type="time"
            id="edit_pickup_${pid}_${index}"
            value="${getSavedPickup(hora, index)}"
          >
        </div>
      `).join("")}
    </div>
  `;
}).join("");

    getContent().innerHTML = `
      <h2>Editar Hotel</h2>

      <form id="editHotelForm">
        <input type="text" id="edit_nombreHotel" value="${hotel.nombre}" required>

        <h4>Horarios por excursión</h4>
        ${inputs}

        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" onclick="verHoteles()">⬅ Volver</button>
      </form>
    `;

    document.getElementById("editHotelForm")
      .addEventListener("submit", function(e) {
        e.preventDefault();
        guardarEdicionHotel(id);
      });

  } catch (err) {
    console.error("Error cargando hotel:", err);
    alert("No se pudo cargar el hotel ⚠️");
  }
}

async function guardarEdicionHotel(id) {
  try {
    const productos = await fetchProductos();

    let pickups = {};

productos.forEach(p => {
  const key = p.slug || p.nombre;
  const pid = safeId(key);

  const horariosProducto = Array.isArray(p.horarios) && p.horarios.length
    ? p.horarios
    : ["default"];

  pickups[key] = {};

  horariosProducto.forEach((hora, index) => {
    const input = document.getElementById(`edit_pickup_${pid}_${index}`);
    const value = input?.value || "";

    if (value) {
      pickups[key][hora] = value;
    }
  });
});

    const nombre = document.getElementById("edit_nombreHotel").value.trim();

    const { error } = await supabaseClient
      .from("hoteles")
      .update({ nombre, pickups })
      .eq("id", id);

    if (error) throw error;

    alert("Hotel actualizado ✅");
    verHoteles();

  } catch (err) {
    console.error("Error actualizando hotel:", err);
    alert("No se pudo actualizar el hotel ⚠️");
  }
}

async function eliminarHotel(id) {
  if (!confirm("¿Eliminar hotel?")) return;

  try {
    const { error } = await supabaseClient
      .from("hoteles")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Hotel eliminado ✅");
    verHoteles();
  } catch (err) {
    console.error("Error eliminando hotel:", err);
    alert("No se pudo eliminar el hotel ⚠️");
  }
}

// =======================
// 🧾 FORMULARIO RESERVA
// =======================
async function loadForm() {
  try {
    const productos = await fetchProductos();
    const hoteles = await fetchHoteles();

    let opcionesExc = productos.map(p =>
      `<option value="${p.slug || p.nombre}">${p.nombre}</option>`
    ).join("");

    let opcionesHoteles = hoteles.map(h =>
      `<option value="${h.nombre}">${h.nombre}</option>`
    ).join("");

    getContent().innerHTML = `
      <h2>Nueva Reserva</h2>

      <form id="reservaForm">
        <input type="text" id="cliente" placeholder="Nombre del cliente" required>
        <input type="tel" id="telefono" placeholder="Teléfono" required>
        <input type="email" id="email" placeholder="Email" required>

        <select id="hotel" required>
          <option value="">Seleccionar hotel</option>
          ${opcionesHoteles}
        </select>

        <select id="excursion" required>
          <option value="">Seleccionar excursión</option>
          ${opcionesExc}
        </select>

        <input type="number" id="adultos" placeholder="Adultos" min="1" value="1" required>
        <input type="number" id="ninos" placeholder="Niños" min="0" value="0">

        <label>Pick Up Time</label>
        <select id="pickup" required>
          <option value="">Seleccionar pickup</option>
        </select>

        <input type="date" id="fecha" required>

        <label>Descuento ($)</label>
        <input type="number" id="descuento" value="0" min="0">

        <input type="number" id="precio" placeholder="Precio total" min="0" step="0.01">

        <label style="display:flex; align-items:center; gap:8px; font-size:14px;">
          <input type="checkbox" id="precioManual" style="width:auto;">
          🔒 Precio manual
        </label>

        <button type="submit">Guardar Reserva</button>
      </form>
    `;

    document.getElementById("excursion").addEventListener("change", autoDatos);
    document.getElementById("hotel").addEventListener("change", autoDatos);
    document.getElementById("adultos").addEventListener("input", autoDatos);
    document.getElementById("ninos").addEventListener("input", autoDatos);
    document.getElementById("descuento").addEventListener("input", autoDatos);
    document.getElementById("precioManual").addEventListener("change", autoDatos);

    document.getElementById("reservaForm")
      .addEventListener("submit", guardarReserva);

  } catch (err) {
    console.error("Error cargando formulario:", err);
    alert("No se pudo cargar el formulario ⚠️");
  }
}

async function autoDatos() {
  try {
    const productos = await fetchProductos();
    const hoteles = await fetchHoteles();

    const excursion = document.getElementById("excursion").value;
    const hotelNombre = document.getElementById("hotel").value;

    const adultos = parseInt(document.getElementById("adultos").value) || 0;
    const ninos = parseInt(document.getElementById("ninos").value) || 0;
    const descuento = parseFloat(document.getElementById("descuento").value) || 0;
    const precioManual = document.getElementById("precioManual")?.checked;

    const precioInput = document.getElementById("precio");
    const pickupSelect = document.getElementById("pickup");

    const producto = productos.find(p => (p.slug || p.nombre) === excursion);

    if (!precioManual) {
      if (producto) {
        let total = (adultos * (parseFloat(producto.adulto) || 0)) + (ninos * (parseFloat(producto.nino) || 0));
        total = Math.max(0, total - descuento);
        precioInput.value = total;
      } else {
        precioInput.value = "";
      }
    }

    pickupSelect.innerHTML = `<option value="">Seleccionar pickup</option>`;

    const hotel = hoteles.find(h => h.nombre === hotelNombre);

    if (hotel && hotel.pickups && hotel.pickups[excursion]) {
      const horariosObj = hotel.pickups[excursion];

      if (horariosObj && typeof horariosObj === "object" && !Array.isArray(horariosObj)) {
        Object.entries(horariosObj).forEach(([horaTour, pickup]) => {
          if (pickup && String(pickup).trim() !== "") {
            pickupSelect.innerHTML += `
              <option value="${pickup}">
                ${horaTour === "default" ? pickup : `${horaTour} → ${pickup}`}
              </option>
            `;
          }
        });
      }

      if (pickupSelect.options.length === 2) {
        pickupSelect.selectedIndex = 1;
      }
    }

  } catch (err) {
    console.error("Error calculando datos:", err);
  }
}

async function guardarReserva(e) {
  e.preventDefault();

  const reserva = {
    cliente: document.getElementById("cliente").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    email: document.getElementById("email").value.trim(),
    hotel: document.getElementById("hotel").value,
    excursion: document.getElementById("excursion").value,
    adultos: parseInt(document.getElementById("adultos").value) || 1,
    ninos: parseInt(document.getElementById("ninos").value) || 0,
    pickup: document.getElementById("pickup").value,
    fecha: document.getElementById("fecha").value,
    precio: parseFloat(document.getElementById("precio").value) || 0,
    descuento: parseFloat(document.getElementById("descuento").value) || 0
  };

  try {
    const { error } = await supabaseClient
      .from("reservas")
      .insert([reserva]);

    if (error) throw error;

    alert("Reserva guardada en la nube ✅");
    mostrarReservas();
  } catch (err) {
    console.error("Error guardando reserva:", err);
    alert("No se pudo guardar la reserva ⚠️");
  }
}

async function mostrarReservas() {
  try {
    const [reservasPanel, reservasWeb] = await Promise.all([
      fetchReservas(),
      fetchWebReservations()
    ]);

    const reservasNormalizadas = [
      ...(reservasPanel || []).map(normalizePanelReservation),
      ...(reservasWeb || []).map(normalizeWebReservation)
    ];

    reservasNormalizadas.sort((a, b) => {
      const fechaA = new Date(a.fecha || 0).getTime();
      const fechaB = new Date(b.fecha || 0).getTime();
      return fechaB - fechaA;
    });

    if (reservasNormalizadas.length === 0) {
      getContent().innerHTML = "<h2>No hay reservas aún</h2>";
      return;
    }

    getContent().innerHTML = `
      <h2>Reservas</h2>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
        <select id="filterFuente">
          <option value="">Todas las fuentes</option>
          <option value="panel">Panel</option>
          <option value="web">Web</option>
        </select>

        <select id="filterEstado">
          <option value="">Todos los estados</option>
          <option value="manual">Manual</option>
          <option value="pending_cash">Pending Cash</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="paid">Paid</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </div>

      <div id="reservasTablaWrap"></div>
    `;

    const filterFuente = document.getElementById("filterFuente");
    const filterEstado = document.getElementById("filterEstado");
    const tablaWrap = document.getElementById("reservasTablaWrap");

    function renderTabla(data) {
      if (!data.length) {
        tablaWrap.innerHTML = "<p>No hay reservas con ese filtro.</p>";
        return;
      }

      let tabla = `
        <table class="reservations-table">
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Hotel</th>
            <th>Habitación</th>
            <th>Excursión</th>
            <th>Pickup</th>
            <th>Fecha</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Fuente</th>
            <th>Acciones</th>
          </tr>
      `;

      data.forEach((r) => {
        let acciones = "";

        if (r.tipo === "panel") {
          acciones = `
            <button onclick="verVoucher(${r.id})">📄</button>
            <button onclick="editarReserva(${r.id})">✏️</button>
            <button onclick="eliminarReserva(${r.id})">❌</button>
          `;
        } else {
          acciones = `
            <button onclick="verVoucherWeb(${r.id})">📄</button>
            <button onclick="editarReservaWeb(${r.id})">✏️</button>
            <button onclick="abrirWhatsAppReservaWeb(${r.id})">💬</button>
          `;
        }

        tabla += `
          <tr>
            <td>${r.cliente}</td>
            <td>${r.telefono}</td>
            <td>${r.hotel}</td>
            <td>${r.habitacion}</td>
            <td>${r.excursion}</td>
            <td>${r.pickup}</td>
            <td>${r.fecha}</td>
            <td>$${r.precio}</td>
            <td>${getEstadoBadge(r.estado)}</td>
            <td>${getFuenteBadge(r.fuente)}</td>
            <td>${acciones}</td>
          </tr>
        `;
      });

      tabla += `</table>`;
      tablaWrap.innerHTML = tabla;
    }

    function applyFilters() {
      const fuente = filterFuente.value;
      const estado = filterEstado.value;

      let filtradas = [...reservasNormalizadas];

      if (fuente) {
        filtradas = filtradas.filter(r => (r.fuente || "").toLowerCase() === fuente.toLowerCase());
      }

      if (estado) {
        filtradas = filtradas.filter(r => (r.estado || "").toLowerCase() === estado.toLowerCase());
      }

      renderTabla(filtradas);
    }

    filterFuente.addEventListener("change", applyFilters);
    filterEstado.addEventListener("change", applyFilters);

    renderTabla(reservasNormalizadas);

  } catch (err) {
    console.error("Error cargando reservas:", err);
    alert("No se pudieron cargar las reservas ⚠️");
  }
}

// =======================
// ✏️ EDITAR RESERVA
// =======================
async function editarReserva(id) {
  try {
    const reserva = await fetchReservaById(id);
    const productos = await fetchProductos();
    const hoteles = await fetchHoteles();

    let opcionesExc = productos.map(p =>
  `<option value="${p.slug || p.nombre}">${p.nombre}</option>`
).join("");

    let opcionesHoteles = hoteles.map(h =>
      `<option value="${h.nombre}" ${h.nombre === reserva.hotel ? "selected" : ""}>${h.nombre}</option>`
    ).join("");

    getContent().innerHTML = `
      <h2>Editar Reserva</h2>

      <form id="editReservaForm">
        <input type="text" id="edit_cliente" placeholder="Nombre del cliente" value="${reserva.cliente || ""}" required>
        <input type="tel" id="edit_telefono" placeholder="Teléfono" value="${reserva.telefono || ""}" required>
        <input type="email" id="edit_email" placeholder="Email" value="${reserva.email || ""}" required>

        <select id="edit_hotel" required>
          <option value="">Seleccionar hotel</option>
          ${opcionesHoteles}
        </select>

        <select id="edit_excursion" required>
          <option value="">Seleccionar excursión</option>
          ${opcionesExc}
        </select>

        <input type="number" id="edit_adultos" placeholder="Adultos" min="1" value="${reserva.adultos || 1}" required>
        <input type="number" id="edit_ninos" placeholder="Niños" min="0" value="${reserva.ninos || 0}">

        <label>Pick Up Time</label>
        <select id="edit_pickup" required>
          <option value="">Seleccionar pickup</option>
        </select>

        <input type="date" id="edit_fecha" value="${reserva.fecha || ""}" required>

        <input type="number" id="edit_precio" placeholder="Precio total" value="${reserva.precio || 0}" min="0" step="0.01">

<label style="display:flex; align-items:center; gap:8px; font-size:14px;">
  <input type="checkbox" id="edit_precioManual" style="width:auto;">
  🔒 Precio manual
</label>

        <label>Descuento ($)</label>
        <input type="number" id="edit_descuento" value="${reserva.descuento || 0}" min="0">

        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" onclick="mostrarReservas()">⬅ Volver</button>
      </form>
    `;

    document.getElementById("edit_excursion").addEventListener("change", () => autoDatosEdicion(reserva.pickup));
    document.getElementById("edit_hotel").addEventListener("change", () => autoDatosEdicion(reserva.pickup));
    document.getElementById("edit_adultos").addEventListener("input", () => autoDatosEdicion(reserva.pickup));
    document.getElementById("edit_ninos").addEventListener("input", () => autoDatosEdicion(reserva.pickup));
    document.getElementById("edit_descuento").addEventListener("input", () => autoDatosEdicion(reserva.pickup));

    await autoDatosEdicion(reserva.pickup);

    document.getElementById("editReservaForm")
      .addEventListener("submit", function(e) {
        e.preventDefault();
        guardarEdicionReserva(id);
      });

  } catch (err) {
    console.error("Error cargando reserva para editar:", err);
    alert("No se pudo cargar la reserva ⚠️");
  }
}

async function fetchWebReservations() {
  const { data, error } = await supabaseClient
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchWebReservationById(id) {
  const { data, error } = await supabaseClient
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

function normalizePanelReservation(r) {
  return {
    id: r.id,
    tipo: "panel",
    cliente: r.cliente || "-",
    telefono: r.telefono || "-",
    email: r.email || "-",
    hotel: r.hotel || "-",
    habitacion: r.habitacion || "-",
    excursion: r.excursion || "-",
    pickup: r.pickup || "-",
    fecha: r.fecha || "-",
    adultos: r.adultos || 0,
    ninos: r.ninos || 0,
    precio: r.precio || 0,
    estado: "manual",
    fuente: "panel"
  };
}

function normalizeWebReservation(r) {
  return {
    id: r.id,
    tipo: "web",
    cliente: r.client_name || "-",
    telefono: r.phone || "-",
    email: r.email || "-",
    hotel: r.hotel_name || "-",
    habitacion: r.room_number || r.habitacion || "-",
    excursion: r.tour_name || r.tour_slug || "-",
    pickup: r.pickup_time || "-",
    fecha: r.selected_date || "-",
    adultos: r.adults || 0,
    ninos: r.children || 0,
    precio: r.total || 0,
    estado: r.status || "pending",
    fuente: r.source || "web"
  };
}

// =======================
// ⚡ AUTO DATOS EDICIÓN
// =======================
async function autoDatosEdicion(pickupActual = "") {
  try {
    const productos = await fetchProductos();
    const hoteles = await fetchHoteles();

    const excursion = document.getElementById("edit_excursion").value;
    const hotelNombre = document.getElementById("edit_hotel").value;

    const adultos = parseInt(document.getElementById("edit_adultos").value) || 0;
    const ninos = parseInt(document.getElementById("edit_ninos").value) || 0;
    const descuento = parseFloat(document.getElementById("edit_descuento").value) || 0;

    // ✅ IMPORTANTE: buscar por slug o nombre
    const producto = productos.find(p => (p.slug || p.nombre) === excursion);

    // =====================
    // 💰 CALCULAR PRECIO
    // =====================
    if (producto) {
      let total = (adultos * producto.adulto) + (ninos * producto.nino);
      total = Math.max(0, total - descuento);
      document.getElementById("edit_precio").value = total;
    } else {
      document.getElementById("edit_precio").value = "";
    }

    // =====================
    // 🚐 PICKUPS
    // =====================
    const pickupSelect = document.getElementById("edit_pickup");
    pickupSelect.innerHTML = `<option value="">Seleccionar pickup</option>`;

    const hotel = hoteles.find(h => h.nombre === hotelNombre);

    if (hotel && hotel.pickups && hotel.pickups[excursion]) {
      const horariosObj = hotel.pickups[excursion];

      if (horariosObj && typeof horariosObj === "object" && !Array.isArray(horariosObj)) {
        Object.entries(horariosObj).forEach(([horaTour, pickup]) => {
          if (pickup && pickup.trim() !== "") {
            pickupSelect.innerHTML += `
              <option value="${pickup}">
                ${horaTour} → ${pickup}
              </option>
            `;
          }
        });
      }

      // ✅ Mantener seleccionado el pickup actual
      if (pickupActual) {
        pickupSelect.value = pickupActual;
      }
    }

  } catch (err) {
    console.error("Error recalculando edición:", err);
  }
}

// =======================
// 💾 GUARDAR EDICIÓN RESERVA
// =======================
async function guardarEdicionReserva(id) {
  try {
    const reservaActualizada = {
      cliente: document.getElementById("edit_cliente").value.trim(),
      telefono: document.getElementById("edit_telefono").value.trim(),
      email: document.getElementById("edit_email").value.trim(),
      hotel: document.getElementById("edit_hotel").value,
      excursion: document.getElementById("edit_excursion").value,
      adultos: parseInt(document.getElementById("edit_adultos").value) || 1,
      ninos: parseInt(document.getElementById("edit_ninos").value) || 0,
      pickup: document.getElementById("edit_pickup").value,
      fecha: document.getElementById("edit_fecha").value,
      precio: parseFloat(document.getElementById("edit_precio").value) || 0,
      descuento: parseFloat(document.getElementById("edit_descuento").value) || 0
    };

    const { error } = await supabaseClient
      .from("reservas")
      .update(reservaActualizada)
      .eq("id", id);

    if (error) throw error;

    notificarCliente("editada", {
      to: reservaActualizada.email,
      cliente: reservaActualizada.cliente,
      excursion: reservaActualizada.excursion,
      fecha: reservaActualizada.fecha,
      hotel: reservaActualizada.hotel,
      adultos: reservaActualizada.adultos,
      ninos: reservaActualizada.ninos,
      precio: reservaActualizada.precio
    });

    alert("Reserva actualizada ✅");
    mostrarReservas();

  } catch (err) {
    console.error("Error actualizando reserva:", err);
    alert("No se pudo actualizar la reserva ⚠️");
  }
}

async function editarReservaWeb(id) {
  try {
    const reserva = await fetchWebReservationById(id);

    getContent().innerHTML = `
      <h2>Editar Reserva Web</h2>

      <form id="editReservaWebForm">
        <input type="text" id="edit_web_cliente" placeholder="Nombre del cliente" value="${reserva.client_name || ""}" required>
        <input type="tel" id="edit_web_telefono" placeholder="Teléfono" value="${reserva.phone || ""}" required>
        <input type="email" id="edit_web_email" placeholder="Email" value="${reserva.email || ""}" required>

        <input type="text" id="edit_web_hotel" placeholder="Hotel" value="${reserva.hotel_name || ""}" required>
        <input type="text" id="edit_web_excursion" placeholder="Excursión" value="${reserva.tour_name || reserva.tour_slug || ""}" required>
        <input type="text" id="edit_web_pickup" placeholder="Pickup" value="${reserva.pickup_time || ""}">

        <input type="date" id="edit_web_fecha" value="${reserva.selected_date || ""}" required>
        <input type="text" id="edit_web_hora" placeholder="Hora" value="${reserva.selected_time || ""}" required>

        <input type="number" id="edit_web_adultos" placeholder="Adultos" min="1" value="${reserva.adults || 1}" required>
        <input type="number" id="edit_web_ninos" placeholder="Niños" min="0" value="${reserva.children || 0}" required>

        <input type="number" id="edit_web_total" placeholder="Total" value="${reserva.total || 0}" required>

        <select id="edit_web_status">
          <option value="pending_cash" ${(reserva.status || "") === "pending_cash" ? "selected" : ""}>Pending Cash</option>
          <option value="pending_payment" ${(reserva.status || "") === "pending_payment" ? "selected" : ""}>Pending Payment</option>
          <option value="paid" ${(reserva.status || "") === "paid" ? "selected" : ""}>Paid</option>
          <option value="confirmed" ${(reserva.status || "") === "confirmed" ? "selected" : ""}>Confirmed</option>
          <option value="cancelled" ${(reserva.status || "") === "cancelled" ? "selected" : ""}>Cancelled</option>
        </select>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
          <button type="submit">💾 Guardar Cambios</button>
          <button type="button" onclick="mostrarReservas()">⬅ Volver</button>
        </div>
      </form>
    `;

    document.getElementById("editReservaWebForm")
      .addEventListener("submit", function(e) {
        e.preventDefault();
        guardarEdicionReservaWeb(id, reserva.tour_slug);
      });

  } catch (err) {
    console.error("Error cargando reserva web para editar:", err);
    alert("No se pudo cargar la reserva web ⚠️");
  }
}

async function guardarEdicionReservaWeb(id, originalTourSlug) {
  try {
    const reservaActualizada = {
      client_name: document.getElementById("edit_web_cliente").value.trim(),
      phone: document.getElementById("edit_web_telefono").value.trim(),
      email: document.getElementById("edit_web_email").value.trim(),
      hotel_name: document.getElementById("edit_web_hotel").value.trim(),
      tour_name: document.getElementById("edit_web_excursion").value.trim(),
      pickup_time: document.getElementById("edit_web_pickup").value.trim(),
      selected_date: document.getElementById("edit_web_fecha").value,
      selected_time: document.getElementById("edit_web_hora").value.trim(),
      adults: parseInt(document.getElementById("edit_web_adultos").value) || 1,
      children: parseInt(document.getElementById("edit_web_ninos").value) || 0,
      total: parseFloat(document.getElementById("edit_web_total").value) || 0,
      status: document.getElementById("edit_web_status").value,
      tour_slug: originalTourSlug
    };

    const { error } = await supabaseClient
      .from("reservations")
      .update(reservaActualizada)
      .eq("id", id);

    if (error) throw error;

    notificarCliente(
      reservaActualizada.status === "cancelled" ? "cancelada" : "editada",
      {
        to: reservaActualizada.email,
        cliente: reservaActualizada.client_name,
        excursion: reservaActualizada.tour_name,
        fecha: reservaActualizada.selected_date,
        hotel: reservaActualizada.hotel_name,
        adultos: reservaActualizada.adults,
        ninos: reservaActualizada.children,
        precio: reservaActualizada.total
      }
    );

    alert("Reserva web actualizada ✅");
    mostrarReservas();

  } catch (err) {
    console.error("Error actualizando reserva web:", err);
    alert("No se pudo actualizar la reserva web ⚠️");
  }
}

async function eliminarReserva(id) {
  if (!confirm("¿Seguro que quieres eliminar esta reserva?")) return;

  try {
    const { data: reservaAEliminar } = await supabaseClient
      .from("reservas")
      .select("*")
      .eq("id", id)
      .single();

    const { error } = await supabaseClient
      .from("reservas")
      .delete()
      .eq("id", id);

    if (error) throw error;

    if (reservaAEliminar) {
      notificarCliente("cancelada", {
        to: reservaAEliminar.email,
        cliente: reservaAEliminar.cliente
      });
    }

    alert("Reserva eliminada ✅");
    mostrarReservas();
  } catch (err) {
    console.error("Error eliminando reserva:", err);
    alert("No se pudo eliminar la reserva ⚠️");
  }
}

async function abrirWhatsAppReservaWeb(id) {
  try {
    const r = await fetchWebReservationById(id);

    const message =
      `Hola ${r.client_name || ""}, te escribimos de Punta Cana Going.\n\n` +
      `Tu reserva fue recibida correctamente:\n` +
      `Tour: ${r.tour_name || r.tour_slug || "-"}\n` +
      `Fecha: ${r.selected_date || "-"}\n` +
      `Hora: ${r.selected_time || "-"}\n` +
      `Hotel: ${r.hotel_name || "-"}\n` +
      `Adultos: ${r.adults || 0}\n` +
      `Niños: ${r.children || 0}\n` +
      `Total: $${r.total || 0} USD`;

    const phone = (r.phone || "").replace(/[^\d]/g, "");

    if (!phone) {
      alert("Esta reserva no tiene teléfono ⚠️");
      return;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

  } catch (err) {
    console.error("Error abriendo WhatsApp:", err);
    alert("No se pudo abrir WhatsApp ⚠️");
  }
}

async function abrirWhatsAppReservaWeb(id) {
  try {
    const r = await fetchWebReservationById(id);

    const message =
      `Hola ${r.client_name || ""}, te escribimos de Punta Cana Going.\n\n` +
      `Tu reserva fue recibida correctamente:\n` +
      `Tour: ${r.tour_name || r.tour_slug || "-"}\n` +
      `Fecha: ${r.selected_date || "-"}\n` +
      `Hora: ${r.selected_time || "-"}\n` +
      `Hotel: ${r.hotel_name || "-"}\n` +
      `Adultos: ${r.adults || 0}\n` +
      `Niños: ${r.children || 0}\n` +
      `Total: $${r.total || 0} USD`;

    const phone = (r.phone || "").replace(/[^\d]/g, "");

    if (!phone) {
      alert("Esta reserva no tiene teléfono ⚠️");
      return;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

  } catch (err) {
    console.error("Error abriendo WhatsApp:", err);
    alert("No se pudo abrir WhatsApp ⚠️");
  }
}

// =======================
// 📊 REPORTES
// =======================
async function menuReportes() {
  getContent().innerHTML = `
    <h2>📊 Reportes</h2>

    <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
      <button onclick="reporteVentas()">💰 Ventas</button>
      <button onclick="verContactos()">👥 Contactos</button>
    </div>
  `;
}

async function reporteVentas() {
  try {
    const reservas = await fetchReservas();

    if (reservas.length === 0) {
      getContent().innerHTML = "<h2>No hay ventas aún</h2>";
      return;
    }

    let porMes = {};
    let porDia = {};
    let totalGeneral = 0;

    reservas.forEach(r => {
      const mes = (r.fecha || "").slice(0, 7);
      const dia = r.fecha || "";
      const precio = parseFloat(r.precio) || 0;

      if (!porMes[mes]) porMes[mes] = 0;
      porMes[mes] += precio;

      if (!porDia[dia]) porDia[dia] = 0;
      porDia[dia] += precio;

      totalGeneral += precio;
    });

    let html = `<h2>📊 Reporte de Ventas</h2>`;
    html += `<h3>💰 Total General: $${totalGeneral.toFixed(2)}</h3>`;

    html += `<h4>📅 Ventas por Mes</h4><ul>`;
    Object.keys(porMes).sort().reverse().forEach(mes => {
      html += `<li>${mes} → $${porMes[mes].toFixed(2)}</li>`;
    });
    html += `</ul>`;

    html += `<h4>📆 Ventas por Día</h4><ul>`;
    Object.keys(porDia).sort().reverse().forEach(dia => {
      html += `<li>${dia} → $${porDia[dia].toFixed(2)}</li>`;
    });
    html += `</ul>`;

    html += `<button onclick="menuReportes()">⬅ Volver</button>`;
    getContent().innerHTML = html;
  } catch (err) {
    console.error("Error generando reporte:", err);
    alert("No se pudo generar el reporte ⚠️");
  }
}

async function verContactos() {
  try {
    const [{ data: reservasPanel, error: errorPanel }, { data: reservasWeb, error: errorWeb }] =
      await Promise.all([
        supabaseClient
          .from("reservas")
          .select("cliente, telefono, email, fecha")
          .order("fecha", { ascending: false }),
        supabaseClient
          .from("reservations")
          .select("client_name, phone, email, selected_date")
          .order("selected_date", { ascending: false }),
      ]);

    if (errorPanel) throw errorPanel;
    if (errorWeb) throw errorWeb;

    // Normalizamos ambas fuentes al mismo formato antes de juntarlas
    const todas = [
      ...(reservasPanel || []).map(r => ({
        nombre: r.cliente || "",
        telefono: r.telefono || "",
        email: r.email || "",
        fecha: r.fecha || "",
      })),
      ...(reservasWeb || []).map(r => ({
        nombre: r.client_name || "",
        telefono: r.phone || "",
        email: r.email || "",
        fecha: r.selected_date || "",
      })),
    ];

    if (todas.length === 0) {
      getContent().innerHTML = "<h2>No hay contactos aún</h2>";
      return;
    }

    // Ordenamos por fecha más reciente primero (juntando ambas fuentes)
    todas.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

    const contactosMap = new Map();

    todas.forEach(r => {
      const key = (r.telefono || r.email || r.nombre || "").trim().toLowerCase();
      if (!key) return;

      // Como ya viene ordenado por fecha desc, el primero que aparece
      // por cada contacto es su reserva más reciente
      if (!contactosMap.has(key)) {
        contactosMap.set(key, r);
      }
    });

    const contactos = Array.from(contactosMap.values());

    let html = `<h2>👥 Contactos</h2><ul>`;

    contactos.forEach(c => {
      html += `
        <li style="margin-bottom:12px;">
          <strong>${c.nombre}</strong><br>
          📞 ${c.telefono || "-"}<br>
          ✉️ ${c.email || "-"}<br>
          📅 Última reserva: ${c.fecha || "-"}
        </li>
      `;
    });

    html += `</ul>
      <button onclick="menuReportes()">⬅ Volver</button>
    `;

    getContent().innerHTML = html;
  } catch (err) {
    console.error("Error cargando contactos:", err);
    alert("No se pudieron cargar los contactos ⚠️");
  }
}

// =======================
// 🎟️ VOUCHER
// =======================
async function verVoucher(id) {
  try {
    const r = await fetchReservaById(id);

    getContent().innerHTML = `
      <div class="voucher-container premium-voucher">

        <div class="voucher-header">
          <img src="assets/logo.png" class="voucher-logo">
          <p class="voucher-tagline">Premium Tours & Experiences</p>
          <p class="voucher-contact">📞 +1 829-331-9938 &nbsp;|&nbsp; 📧 info@puntacanagoing.com</p>
        </div>

        <div class="voucher-topbar">
          <div>
            <h2 class="voucher-title">Reservation Voucher</h2>
            <p class="voucher-subtitle">Punta Cana Going Tours</p>
          </div>
          <div class="voucher-status">CONFIRMED</div>
        </div>

        <div class="voucher-card">
          <h3>Client Information</h3>
          <div class="voucher-grid">
            <div><span>Client</span><strong>${r.cliente}</strong></div>
            <div><span>Hotel</span><strong>${r.hotel}</strong></div>
            <div><span>Date</span><strong>${r.fecha}</strong></div>
            <div><span>Pick Up</span><strong>${r.pickup || "-"}</strong></div>
          </div>
        </div>

        <div class="voucher-card voucher-highlight">
          <h3>Tour Details</h3>
          <div class="voucher-grid">
            <div><span>Excursion</span><strong>${r.excursion}</strong></div>
            <div><span>Adults</span><strong>${r.adultos}</strong></div>
            <div><span>Children</span><strong>${r.ninos}</strong></div>
            <div><span>Total</span><strong class="voucher-total">$${r.precio}</strong></div>
          </div>
        </div>

        <div class="voucher-card">
          <h3>Cancellation & Refund Policies</h3>
          <div class="voucher-policies">
            <h4>ES</h4>
            <p>
              a) Cancelaciones/reembolsos proceden con más de 48 horas antes del inicio del tour.<br>
              b) Se requiere certificado médico en caso de enfermedad.<br>
              c) No se permiten cambios el mismo día del tour.<br>
              d) No hay reembolso por no presentación (no show).<br>
              e) Descuentos aplicados no son reembolsables.<br>
              f) No cancelaciones para eventos especiales como Cirque du Soleil.
            </p>

            <h4>EN</h4>
            <p>
              a) Cancellation/refund is valid if requested 48 hours before the tour.<br>
              b) Medical certificate required if applicable.<br>
              c) No same-day changes allowed.<br>
              d) No refund for no-show.<br>
              e) Discounts are non-refundable.<br>
              f) No cancellations for special events such as Cirque du Soleil.
            </p>
          </div>
        </div>

        <div class="voucher-footer">
          <p>Thank you for choosing <strong>Punta Cana Going Tours</strong></p>
        </div>

        <div class="voucher-actions">
          <button onclick="window.print()">🖨️ Imprimir</button>
          <button onclick="enviarEmail(${r.id})">✉️ Email</button>
          <button onclick="descargarPDF(${r.id})">📄 Descargar PDF</button>
          <button onclick="compartirPDF(${r.id})">📲 Compartir PDF</button>
          <button onclick="compartirImagen(${r.id})">🖼️ Compartir Imagen</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error cargando voucher:", err);
    alert("No se pudo cargar el voucher ⚠️");
  }
}

async function verVoucherWeb(id) {
  try {
    const reservaWeb = await fetchWebReservationById(id);
    const r = normalizeVoucherData(reservaWeb, "web");

    getContent().innerHTML = `
      <div class="voucher-container premium-voucher">

        <div class="voucher-header">
          <img src="assets/logo.png" class="voucher-logo">
          <p class="voucher-tagline">Premium Tours & Experiences</p>
          <p class="voucher-contact">📞 +1 829-331-9938 &nbsp;|&nbsp; 📧 info@puntacanagoing.com</p>
        </div>

        <div class="voucher-topbar">
          <div>
            <h2 class="voucher-title">Reservation Voucher</h2>
            <p class="voucher-subtitle">Punta Cana Going Tours</p>
          </div>
          <div class="voucher-status">PENDING</div>
        </div>

        <div class="voucher-card">
          <h3>Client Information</h3>
          <div class="voucher-grid">
            <div><span>Client</span><strong>${r.cliente}</strong></div>
            <div><span>Hotel</span><strong>${r.hotel}</strong></div>
            <div><span>Date</span><strong>${r.fecha}</strong></div>
            <div><span>Pick Up</span><strong>${r.pickup || "-"}</strong></div>
          </div>
        </div>

        <div class="voucher-card voucher-highlight">
          <h3>Tour Details</h3>
          <div class="voucher-grid">
            <div><span>Excursion</span><strong>${r.excursion}</strong></div>
            <div><span>Adults</span><strong>${r.adultos}</strong></div>
            <div><span>Children</span><strong>${r.ninos}</strong></div>
            <div><span>Total</span><strong class="voucher-total">$${r.precio}</strong></div>
          </div>
        </div>

        <div class="voucher-card">
          <h3>Cancellation & Refund Policies</h3>
          <div class="voucher-policies">
            <h4>ES</h4>
            <p>
              a) Cancelaciones/reembolsos proceden con más de 48 horas antes del inicio del tour.<br>
              b) Se requiere certificado médico en caso de enfermedad.<br>
              c) No se permiten cambios el mismo día del tour.<br>
              d) No hay reembolso por no presentación (no show).<br>
              e) Descuentos aplicados no son reembolsables.<br>
              f) No cancelaciones para eventos especiales como Cirque du Soleil.
            </p>

            <h4>EN</h4>
            <p>
              a) Cancellation/refund is valid if requested 48 hours before the tour.<br>
              b) Medical certificate required if applicable.<br>
              c) No same-day changes allowed.<br>
              d) No refund for no-show.<br>
              e) Discounts are non-refundable.<br>
              f) No cancellations for special events such as Cirque du Soleil.
            </p>
          </div>
        </div>

        <div class="voucher-footer">
          <p>Thank you for choosing <strong>Punta Cana Going Tours</strong></p>
        </div>

        <div class="voucher-actions">
          <button onclick="window.print()">🖨️ Imprimir</button>
          <button onclick="enviarEmailWeb(${reservaWeb.id})">✉️ Email</button>
          <button onclick="descargarPDFWeb(${reservaWeb.id})">📄 Descargar PDF</button>
          <button onclick="compartirPDFWeb(${reservaWeb.id})">📲 Compartir PDF</button>
          <button onclick="compartirImagenWeb(${reservaWeb.id})">🖼️ Compartir Imagen</button>
          <button onclick="mostrarReservas()">⬅ Volver</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error cargando voucher web:", err);
    alert("No se pudo cargar el voucher web ⚠️");
  }
}
// =======================
// ✉️ EMAIL
// =======================
async function enviarEmail(id) {
  try {
    const r = await fetchReservaById(id);

    let asunto = "Confirmación de Reserva - Punta Cana Going";
    let cuerpo = `Hola ${r.cliente},

Tu reserva está confirmada:

Excursión: ${r.excursion}
Hotel: ${r.hotel}
Fecha: ${r.fecha}
Pickup: ${r.pickup}
Total: $${r.precio}

Gracias por elegir Punta Cana Going 🌴`;

    let mailto = `mailto:${r.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.open(mailto);
  } catch (err) {
    console.error("Error enviando email:", err);
    alert("No se pudo abrir el email ⚠️");
  }
}

async function enviarEmailWeb(id) {
  try {
    const reservaWeb = await fetchWebReservationById(id);
    const r = normalizeVoucherData(reservaWeb, "web");

    let asunto = "Confirmación de Reserva - Punta Cana Going";
    let cuerpo = `Hola ${r.cliente},

Tu reserva está confirmada:

Excursión: ${r.excursion}
Hotel: ${r.hotel}
Fecha: ${r.fecha}
Pickup: ${r.pickup}
Total: $${r.precio}

Gracias por elegir Punta Cana Going 🌴`;

    let mailto = `mailto:${r.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.open(mailto);
  } catch (err) {
    console.error("Error enviando email web:", err);
    alert("No se pudo abrir el email ⚠️");
  }
}

// =======================
// 📄 PDF
// =======================
async function generarPDFFromElement(element) {
  const { jsPDF } = window.jspdf;

  element.classList.add("export-mode");

  const actions = element.querySelector(".voucher-actions");
  const oldDisplay = actions ? actions.style.display : "";
  if (actions) actions.style.display = "none";

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 6;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Si cabe en una sola hoja, lo mete en una sola hoja
    if (imgHeight <= usableHeight) {
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    } else {
      // Si no cabe, lo divide, pero sin capturar botones
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
        heightLeft -= usableHeight;
      }
    }

    return {
      pdf,
      blob: pdf.output("blob")
    };
  } finally {
    element.classList.remove("export-mode");
    if (actions) actions.style.display = oldDisplay;
  }
}

async function descargarPDF(id) {
  try {
    const r = await fetchReservaById(id);
    const voucher = document.querySelector(".premium-voucher");
    if (!voucher) return alert("No se encontró el voucher.");

    const { pdf } = await generarPDFFromElement(voucher);
    const nombre = (r?.cliente || "voucher").replace(/\s+/g, "_");
    pdf.save(`Voucher_${nombre}.pdf`);
  } catch (err) {
    console.error("Error descargando PDF:", err);
    alert("No se pudo generar el PDF ⚠️");
  }
}

async function descargarPDFWeb(id) {
  try {
    const r = await fetchWebReservationById(id);
    const voucher = document.querySelector(".premium-voucher");
    if (!voucher) return alert("No se encontró el voucher.");

    const { pdf } = await generarPDFFromElement(voucher);
    const nombre = (r?.client_name || "voucher").replace(/\s+/g, "_");
    pdf.save(`Voucher_${nombre}.pdf`);
  } catch (err) {
    console.error("Error descargando PDF web:", err);
    alert("No se pudo generar el PDF ⚠️");
  }
}

async function compartirPDFWeb(id) {
  try {
    const r = await fetchWebReservationById(id);
    const voucher = document.querySelector(".premium-voucher");
    if (!voucher) return alert("No se encontró el voucher.");

    const { blob } = await generarPDFFromElement(voucher);
    const nombre = (r?.client_name || "voucher").replace(/\s+/g, "_");
    const file = new File([blob], `Voucher_${nombre}.pdf`, { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Voucher Punta Cana Going",
        text: `Voucher de ${r?.client_name || "cliente"}`,
        files: [file]
      });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Voucher_${nombre}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      alert("Tu navegador no permite compartir PDF directamente. Se descargó el archivo.");
    }
  } catch (err) {
    console.error("Error compartiendo PDF web:", err);
    alert("No se pudo compartir el PDF ⚠️");
  }
}

async function compartirImagenWeb(id) {
  try {
    const r = await fetchWebReservationById(id);
    const voucher = document.querySelector(".premium-voucher");
    if (!voucher) return alert("No se encontró el voucher.");

    const blob = await generarImagenVoucher(voucher);
    const nombre = (r?.client_name || "voucher").replace(/\s+/g, "_");
    const file = new File([blob], `Voucher_${nombre}.png`, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Voucher Punta Cana Going",
        text: `Voucher de ${r?.client_name || "cliente"}`,
        files: [file]
      });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Voucher_${nombre}.png`;
      a.click();
      URL.revokeObjectURL(url);
      alert("Tu navegador no permite compartir imagen directamente. Se descargó.");
    }
  } catch (err) {
    console.error("Error compartiendo imagen web:", err);
    alert("No se pudo compartir la imagen ⚠️");
  }
}

async function compartirPDF(id) {
  try {
    const r = await fetchReservaById(id);
    const voucher = document.querySelector(".premium-voucher");
    if (!voucher) return alert("No se encontró el voucher.");

    const { blob } = await generarPDFFromElement(voucher);
    const nombre = (r?.cliente || "voucher").replace(/\s+/g, "_");
    const file = new File([blob], `Voucher_${nombre}.pdf`, { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Voucher Punta Cana Going",
        text: `Voucher de ${r?.cliente || "cliente"}`,
        files: [file]
      });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Voucher_${nombre}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      alert("Tu navegador no permite compartir PDF directamente. Se descargó el archivo.");
    }
  } catch (err) {
    console.error("Error compartiendo PDF:", err);
    alert("No se pudo compartir el PDF ⚠️");
  }
}

// =======================
// 🖼️ IMAGEN
// =======================
async function generarImagenVoucher(element) {
  element.classList.add("export-mode");

  const actions = element.querySelector(".voucher-actions");
  const oldDisplay = actions ? actions.style.display : "";
  if (actions) actions.style.display = "none";

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  } finally {
    element.classList.remove("export-mode");
    if (actions) actions.style.display = oldDisplay;
  }
}
async function compartirImagen(id) {
  try {
    const r = await fetchReservaById(id);
    const voucher = document.querySelector(".premium-voucher");
    if (!voucher) return alert("No se encontró el voucher.");

    const blob = await generarImagenVoucher(voucher);
    const nombre = (r?.cliente || "voucher").replace(/\s+/g, "_");
    const file = new File([blob], `Voucher_${nombre}.png`, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Voucher Punta Cana Going",
        text: `Voucher de ${r?.cliente || "cliente"}`,
        files: [file]
      });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Voucher_${nombre}.png`;
      a.click();
      URL.revokeObjectURL(url);
      alert("Tu navegador no permite compartir imagen directamente. Se descargó.");
    }
  } catch (err) {
    console.error("Error compartiendo imagen:", err);
    alert("No se pudo compartir la imagen ⚠️");
  }
}

// =======================
// 👥 USUARIOS
// =======================
async function menuUsuarios() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser || currentUser.rol !== "admin") {
    getContent().innerHTML = `
      <h2>Acceso denegado</h2>
      <p>Solo el administrador puede gestionar usuarios.</p>
    `;
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("perfiles")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) throw error;

    let html = `
      <h2>Usuarios del panel</h2>
      <p style="color:#666; font-size:0.9em;">
        Para agregar a alguien nuevo: créale la cuenta en Supabase
        (Authentication → Users → Add user) y pídeme que le asigne perfil.
      </p>

      <h3>Lista de usuarios</h3>
    `;

    (data || []).forEach((u) => {
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:8px;">
          <strong>${u.nombre}</strong> — ${u.rol === "admin" ? "Administrador" : "Vendedor"}
          <div style="margin-top:10px;">
            <button onclick="eliminarUsuario('${u.id}')">❌ Quitar acceso</button>
          </div>
        </div>
      `;
    });

    getContent().innerHTML = html;

  } catch (err) {
    console.error("Error cargando usuarios:", err);
    alert("No se pudieron cargar los usuarios ⚠️");
  }
}

async function eliminarUsuario(id) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!confirm("¿Quitar el acceso al panel de este usuario?")) return;

  if (currentUser && id === currentUser.id) {
    alert("No puedes quitarte el acceso a ti mismo mientras estás logueado");
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("perfiles")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Acceso eliminado ✅");
    menuUsuarios();
  } catch (err) {
    console.error("Error eliminando usuario:", err);
    alert("No se pudo quitar el acceso ⚠️");
  }
}

async function loadReservationsFromSupabase() {
  if (!supabaseClient) {
    console.error("Supabase client not available");
    return [];
  }

  const { data, error } = await supabaseClient
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading reservations:", error);
    return [];
  }

  return data || [];
}

// =======================
// 📦 SERVICE WORKER
// =======================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service Worker registrado ✅"))
      .catch(error => console.log("Error registrando Service Worker ❌", error));
  });
}

// =======================
// reviwrs
// =======================


async function fetchPendingReviews() {
  const { data, error } = await supabaseClient
    .from("reviews")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchApprovedReviews() {
  const { data, error } = await supabaseClient
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function menuReviews() {
  try {
    const pending = await fetchPendingReviews();
    const approved = await fetchApprovedReviews();

    let html = `
      <h2>Reviews</h2>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
        <button type="button" onclick="menuReviews()">🔄 Refresh</button>
      </div>
    `;

    html += `<h3>Pending Reviews</h3>`;

    if (!pending.length) {
      html += `<p>No pending reviews.</p>`;
    } else {
      pending.forEach((review) => {
        html += `
          <div style="border:1px solid #334155; padding:14px; border-radius:10px; margin-bottom:12px; background:#111827;">
            <div style="margin-bottom:8px;">
              <strong>${review.client_name || "Traveler"}</strong>
              <span style="color:#94a3b8;"> — ${review.tour_slug || "-"}</span>
            </div>

            <div style="margin-bottom:8px; color:#facc15;">
              ${"⭐".repeat(review.rating || 0)}
            </div>

            <div style="margin-bottom:8px; color:#e5e7eb;">
              ${review.comment || ""}
            </div>

            <div style="margin-bottom:12px; color:#94a3b8; font-size:13px;">
              ${review.client_email || "-"}<br>
              ${review.created_at || ""}
            </div>

            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" onclick="aprobarReview(${review.id})">✅ Approve</button>
              <button type="button" onclick="eliminarReview(${review.id})">❌ Delete</button>
            </div>
          </div>
        `;
      });
    }

    html += `<h3 style="margin-top:30px;">Approved Reviews</h3>`;

    if (!approved.length) {
      html += `<p>No approved reviews yet.</p>`;
    } else {
      approved.forEach((review) => {
        html += `
          <div style="border:1px solid #334155; padding:14px; border-radius:10px; margin-bottom:12px; background:#0f172a;">
            <div style="margin-bottom:8px;">
              <strong>${review.client_name || "Traveler"}</strong>
              <span style="color:#94a3b8;"> — ${review.tour_slug || "-"}</span>
            </div>

            <div style="margin-bottom:8px; color:#facc15;">
              ${"⭐".repeat(review.rating || 0)}
            </div>

            <div style="margin-bottom:8px; color:#e5e7eb;">
              ${review.comment || ""}
            </div>

            <div style="margin-bottom:12px; color:#94a3b8; font-size:13px;">
              ${review.client_email || "-"}<br>
              ${review.created_at || ""}
            </div>

            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" onclick="eliminarReview(${review.id})">🗑️ Delete</button>
            </div>
          </div>
        `;
      });
    }

    getContent().innerHTML = html;
  } catch (err) {
    console.error("Error loading reviews:", err);
    alert("Could not load reviews ⚠️");
  }
}

async function aprobarReview(id) {
  try {
    const { error } = await supabaseClient
      .from("reviews")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) throw error;

    alert("Review approved ✅");
    menuReviews();
  } catch (err) {
    console.error("Error approving review:", err);
    alert("Could not approve review ⚠️");
  }
}

async function eliminarReview(id) {
  if (!confirm("Delete this review?")) return;

  try {
    const { error } = await supabaseClient
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Review deleted ✅");
    menuReviews();
  } catch (err) {
    console.error("Error deleting review:", err);
    alert("Could not delete review ⚠️");
  }
}


// =======================
// SubirImagen 
// =======================

async function subirImagenProducto(productoId) {
  try {
    const input = document.getElementById(`imagen-${productoId}`);
    const file = input.files[0];

    if (!file) {
      alert("Selecciona una imagen");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `producto-${productoId}-${Date.now()}.${fileExt}`;

    // subir imagen
    const { error: uploadError } = await supabaseClient.storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // obtener url pública
    const { data } = supabaseClient.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    // buscar producto actual
    const { data: productoActual, error: fetchError } =
      await supabaseClient
        .from("productos")
        .select("imagenes_urls")
        .eq("id", productoId)
        .single();

    if (fetchError) throw fetchError;

    const galeriaActual =
      Array.isArray(productoActual.imagenes_urls)
        ? productoActual.imagenes_urls
        : [];

    // agregar nueva imagen
    const nuevaGaleria = [...galeriaActual, imageUrl];

    // actualizar producto
    const { error: updateError } = await supabaseClient
      .from("productos")
      .update({
        imagen_url: imageUrl,
        imagenes_urls: nuevaGaleria
      })
      .eq("id", productoId);

    if (updateError) throw updateError;

    alert("Imagen agregada a la galería ✅");

    editarProductos();

  } catch (err) {
    console.error("Error subiendo imagen:", err);
    alert(
      "No se pudo subir la imagen ⚠️\n\n" +
      "Error: " + (err.message || JSON.stringify(err))
    );
  }
}

// =======================
// 🚚 PROVEEDORES
// =======================
async function menuProveedores() {
  getContent().innerHTML = `
    <h2>Proveedores</h2>

    <button onclick="crearProveedor()">➕ Crear Proveedor</button>
    <button onclick="verProveedores()">📋 Ver Proveedores</button>
    <button onclick="reporteProveedores()">📊 Reporte de Proveedores</button>
  `;
}

function formularioProveedorHTML(p = {}) {
  return `
    <div style="display:grid; gap:10px; max-width:500px;">
      <label style="font-size:13px; color:#94a3b8;">Nombre *</label>
      <input type="text" id="prov-nombre" value="${p.nombre || ""}" placeholder="Ej: Island Action Tours" required>

      <label style="font-size:13px; color:#94a3b8;">Teléfono</label>
      <input type="text" id="prov-telefono" value="${p.telefono || ""}" placeholder="Ej: +1 809 000 0000">

      <label style="font-size:13px; color:#94a3b8;">WhatsApp</label>
      <input type="text" id="prov-whatsapp" value="${p.whatsapp || ""}" placeholder="Ej: +1 809 000 0000">

      <label style="font-size:13px; color:#94a3b8;">Email</label>
      <input type="email" id="prov-email" value="${p.email || ""}" placeholder="contacto@proveedor.com">

      <label style="font-size:13px; color:#94a3b8;">Términos de pago</label>
      <input type="text" id="prov-terminos" value="${p.terminos_pago || ""}" placeholder="Ej: Se paga semanal, los lunes">

      <label style="font-size:13px; color:#94a3b8;">Notas internas</label>
      <textarea id="prov-notas" rows="3" placeholder="Notas internas sobre este proveedor">${p.notas || ""}</textarea>

      <label style="display:flex; align-items:center; gap:8px; font-size:14px;">
        <input type="checkbox" id="prov-activo" ${p.id ? (p.activo ? "checked" : "") : "checked"} style="width:auto; margin:0;">
        Proveedor activo
      </label>
    </div>
  `;
}

function crearProveedor() {
  getContent().innerHTML = `
    <h2>Nuevo Proveedor</h2>

    <form id="proveedorForm">
      ${formularioProveedorHTML()}

      <br>
      <button type="submit">Guardar Proveedor</button>
      <button type="button" onclick="menuProveedores()">⬅ Volver</button>
    </form>
  `;

  document.getElementById("proveedorForm")
    .addEventListener("submit", guardarProveedor);
}

function leerFormularioProveedor() {
  return {
    nombre: document.getElementById("prov-nombre").value.trim(),
    telefono: document.getElementById("prov-telefono").value.trim() || null,
    whatsapp: document.getElementById("prov-whatsapp").value.trim() || null,
    email: document.getElementById("prov-email").value.trim() || null,
    terminos_pago: document.getElementById("prov-terminos").value.trim() || null,
    notas: document.getElementById("prov-notas").value.trim() || null,
    activo: document.getElementById("prov-activo").checked
  };
}

async function guardarProveedor(e) {
  e.preventDefault();

  const proveedor = leerFormularioProveedor();

  if (!proveedor.nombre) {
    alert("El nombre del proveedor es obligatorio");
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("proveedores")
      .insert([proveedor]);

    if (error) throw error;

    alert("Proveedor guardado ✅");
    menuProveedores();
  } catch (err) {
    console.error("Error guardando proveedor:", err);
    alert(
      "No se pudo guardar el proveedor ⚠️\n\n" +
      "Error: " + (err.message || JSON.stringify(err))
    );
  }
}

async function verProveedores() {
  try {
    const proveedores = await fetchProveedores();

    if (proveedores.length === 0) {
      getContent().innerHTML = `
        <h2>No hay proveedores aún</h2>
        <button onclick="menuProveedores()">⬅ Volver</button>
      `;
      return;
    }

    let html = `<h2>Proveedores</h2>`;

    proveedores.forEach((p) => {
      html += `
        <div style="border:1px solid #334155; padding:14px; margin-bottom:12px; border-radius:10px; background:#111827;">
          <h4 style="margin:0 0 6px 0;">
            ${p.nombre} ${p.activo ? "" : "<span style='color:#f87171; font-size:12px;'>(inactivo)</span>"}
          </h4>
          <p style="margin:2px 0; font-size:13px; color:#94a3b8;">
            📞 ${p.telefono || "—"} &nbsp; 💬 ${p.whatsapp || "—"} &nbsp; ✉️ ${p.email || "—"}
          </p>
          ${p.terminos_pago ? `<p style="margin:2px 0; font-size:13px; color:#94a3b8;">💰 ${p.terminos_pago}</p>` : ""}
          ${p.notas ? `<p style="margin:2px 0; font-size:13px; color:#94a3b8;">📝 ${p.notas}</p>` : ""}

          <div style="margin-top:8px;">
            <button onclick="editarProveedor(${p.id})">✏️ Editar</button>
            <button onclick="eliminarProveedor(${p.id})">❌ Eliminar</button>
          </div>
        </div>
      `;
    });

    html += `<button onclick="menuProveedores()">⬅ Volver</button>`;
    getContent().innerHTML = html;
  } catch (err) {
    console.error("Error cargando proveedores:", err);
    alert("No se pudieron cargar los proveedores ⚠️");
  }
}

async function editarProveedor(id) {
  try {
    const { data: proveedor, error } = await supabaseClient
      .from("proveedores")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    getContent().innerHTML = `
      <h2>Editar Proveedor</h2>

      <form id="proveedorForm">
        ${formularioProveedorHTML(proveedor)}

        <br>
        <button type="submit">Guardar Cambios</button>
        <button type="button" onclick="verProveedores()">⬅ Volver</button>
      </form>
    `;

    document.getElementById("proveedorForm")
      .addEventListener("submit", (e) => actualizarProveedor(e, id));

  } catch (err) {
    console.error("Error cargando proveedor:", err);
    alert("No se pudo cargar el proveedor ⚠️");
  }
}

async function actualizarProveedor(e, id) {
  e.preventDefault();

  const proveedor = leerFormularioProveedor();

  if (!proveedor.nombre) {
    alert("El nombre del proveedor es obligatorio");
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("proveedores")
      .update(proveedor)
      .eq("id", id);

    if (error) throw error;

    alert("Proveedor actualizado ✅");
    verProveedores();
  } catch (err) {
    console.error("Error actualizando proveedor:", err);
    alert(
      "No se pudo actualizar el proveedor ⚠️\n\n" +
      "Error: " + (err.message || JSON.stringify(err))
    );
  }
}

async function eliminarProveedor(id) {
  if (!confirm("¿Eliminar este proveedor? Los productos que lo tengan asignado quedarán sin proveedor.")) return;

  try {
    const { error } = await supabaseClient
      .from("proveedores")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Proveedor eliminado ✅");
    verProveedores();
  } catch (err) {
    console.error("Error eliminando proveedor:", err);
    alert("No se pudo eliminar el proveedor ⚠️");
  }
}

// =======================
// 📊 REPORTE DE PROVEEDORES
// =======================

// Encuentra el producto asociado a una reserva del panel (tabla "reservas")
function matchProductoReservaPanel(r, productos) {
  if (r.producto_id) {
    const porId = productos.find(p => p.id === r.producto_id);
    if (porId) return porId;
  }
  return productos.find(p => (p.slug || p.nombre) === r.excursion) || null;
}

// Encuentra el producto asociado a una reserva web (tabla "reservations")
function matchProductoReservaWeb(r, productos) {
  return productos.find(p => p.slug === r.tour_slug) || null;
}

async function reporteProveedores() {
  try {
    getContent().innerHTML = `<h2>Reporte de Proveedores</h2><p>Cargando datos...</p>`;

    const [productos, proveedores, reservasPanel, reservasWeb] = await Promise.all([
      fetchProductos(),
      fetchProveedores(),
      fetchReservas(),
      fetchWebReservations()
    ]);

    getContent().innerHTML = `
      <h2>Reporte de Proveedores</h2>

      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin-bottom:20px;">
        <div>
          <label style="display:block; font-size:13px; color:#94a3b8;">Desde</label>
          <input type="date" id="rep-prov-desde">
        </div>
        <div>
          <label style="display:block; font-size:13px; color:#94a3b8;">Hasta</label>
          <input type="date" id="rep-prov-hasta">
        </div>
        <button type="button" onclick="renderReporteProveedores()">🔍 Filtrar</button>
        <button type="button" onclick="reporteProveedores()">↺ Limpiar</button>
      </div>

      <div id="reporteProveedoresWrap">Cargando...</div>
    `;

    window.__reporteProveedoresData = { productos, proveedores, reservasPanel, reservasWeb };
    renderReporteProveedores();

  } catch (err) {
    console.error("Error generando reporte de proveedores:", err);
    getContent().innerHTML = `<h2>Reporte de Proveedores</h2><p>⚠️ No se pudo generar el reporte.</p>`;
  }
}

function renderReporteProveedores() {
  const wrap = document.getElementById("reporteProveedoresWrap");
  if (!wrap) return;

  const { productos, proveedores, reservasPanel, reservasWeb } = window.__reporteProveedoresData || {};
  if (!productos) return;

  const desde = document.getElementById("rep-prov-desde")?.value || "";
  const hasta = document.getElementById("rep-prov-hasta")?.value || "";

  const dentroDeRango = (fechaStr) => {
    if (!fechaStr) return true;
    if (desde && fechaStr < desde) return false;
    if (hasta && fechaStr > hasta) return false;
    return true;
  };

  // Bucket por proveedor (incluye un bucket especial "sin_proveedor")
  const buckets = {};

  const getBucket = (proveedorId, nombre) => {
    const key = proveedorId ?? "sin_proveedor";
    if (!buckets[key]) {
      buckets[key] = {
        nombre: nombre || "Sin proveedor asignado",
        reservas: 0,
        adultos: 0,
        ninos: 0,
        totalVendido: 0,
        totalAPagar: 0
      };
    }
    return buckets[key];
  };

  (reservasPanel || []).forEach((r) => {
    if (!dentroDeRango(r.fecha)) return;

    const producto = matchProductoReservaPanel(r, productos);
    const proveedor = producto?.proveedor_id
      ? proveedores.find(p => p.id === producto.proveedor_id)
      : null;

    const bucket = getBucket(producto?.proveedor_id, proveedor?.nombre);
    const adultos = Number(r.adultos) || 0;
    const ninos = Number(r.ninos) || 0;

    bucket.reservas += 1;
    bucket.adultos += adultos;
    bucket.ninos += ninos;
    bucket.totalVendido += Number(r.precio) || 0;

    if (producto) {
      bucket.totalAPagar +=
        (adultos * (Number(producto.costo_neto_adulto) || 0)) +
        (ninos * (Number(producto.costo_neto_nino) || 0));
    }
  });

  (reservasWeb || []).forEach((r) => {
    if (!dentroDeRango(r.selected_date)) return;

    const producto = matchProductoReservaWeb(r, productos);
    const proveedor = producto?.proveedor_id
      ? proveedores.find(p => p.id === producto.proveedor_id)
      : null;

    const bucket = getBucket(producto?.proveedor_id, proveedor?.nombre);
    const adultos = Number(r.adults) || 0;
    const ninos = Number(r.children) || 0;

    bucket.reservas += 1;
    bucket.adultos += adultos;
    bucket.ninos += ninos;
    bucket.totalVendido += Number(r.total) || 0;

    if (producto) {
      bucket.totalAPagar +=
        (adultos * (Number(producto.costo_neto_adulto) || 0)) +
        (ninos * (Number(producto.costo_neto_nino) || 0));
    }
  });

  const filas = Object.entries(buckets)
    .sort(([, a], [, b]) => b.totalVendido - a.totalVendido);

  if (filas.length === 0) {
    wrap.innerHTML = "<p>No hay reservas en este rango de fechas.</p>";
    return;
  }

  let totalVendidoGeneral = 0;
  let totalAPagarGeneral = 0;

  let tabla = `
    <table class="reservations-table">
      <tr>
        <th>Proveedor</th>
        <th>Reservas</th>
        <th>Adultos</th>
        <th>Niños</th>
        <th>Total Vendido</th>
        <th>Total a Pagar</th>
        <th>Margen</th>
      </tr>
  `;

  filas.forEach(([key, b]) => {
    const margen = b.totalVendido - b.totalAPagar;
    totalVendidoGeneral += b.totalVendido;
    totalAPagarGeneral += b.totalAPagar;

    tabla += `
      <tr ${key === "sin_proveedor" ? 'style="opacity:0.7;"' : ""}>
        <td>${b.nombre}</td>
        <td>${b.reservas}</td>
        <td>${b.adultos}</td>
        <td>${b.ninos}</td>
        <td>$${b.totalVendido.toFixed(2)}</td>
        <td>$${b.totalAPagar.toFixed(2)}</td>
        <td>$${margen.toFixed(2)}</td>
      </tr>
    `;
  });

  tabla += `
      <tr style="font-weight:bold; border-top:2px solid #334155;">
        <td colspan="4">Total general</td>
        <td>$${totalVendidoGeneral.toFixed(2)}</td>
        <td>$${totalAPagarGeneral.toFixed(2)}</td>
        <td>$${(totalVendidoGeneral - totalAPagarGeneral).toFixed(2)}</td>
      </tr>
    </table>
  `;

  wrap.innerHTML = tabla;
}

// =======================
// 🗂️ CATÁLOGO DE RESERVAS (Beta, estilo NexusGo)
// =======================
async function menuCatalogoReservas() {
  try {
    getContent().innerHTML = `<h2>Catálogo de Excursiones</h2><p>Cargando...</p>`;

    const productos = await fetchProductos();
    window.__catalogoProductos = productos;

    if (productos.length === 0) {
      getContent().innerHTML = `<h2>Catálogo de Excursiones</h2><p>No hay excursiones creadas aún.</p>`;
      return;
    }

    getContent().innerHTML = `
      <h2>Catálogo de Excursiones</h2>
      <input type="text" id="catalogo-buscar" placeholder="🔍 Buscar excursión..." style="margin-bottom:16px; max-width:320px;">
      <div id="catalogoGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:14px;"></div>
    `;

    document.getElementById("catalogo-buscar").addEventListener("input", renderCatalogoGrid);
    renderCatalogoGrid();

  } catch (err) {
    console.error("Error cargando catálogo:", err);
    getContent().innerHTML = `<h2>Catálogo de Excursiones</h2><p>⚠️ No se pudo cargar el catálogo.</p>`;
  }
}

function renderCatalogoGrid() {
  const grid = document.getElementById("catalogoGrid");
  if (!grid) return;

  const productos = window.__catalogoProductos || [];
  const filtro = (document.getElementById("catalogo-buscar")?.value || "").toLowerCase().trim();

  const filtrados = filtro
    ? productos.filter(p => (p.nombre || "").toLowerCase().includes(filtro))
    : productos;

  if (filtrados.length === 0) {
    grid.innerHTML = "<p>No se encontraron excursiones.</p>";
    return;
  }

  grid.innerHTML = filtrados.map(p => {
    const horarios = Array.isArray(p.horarios) && p.horarios.length ? p.horarios : [];
    const horaBadge = horarios[0] || "Horario libre";
    const img = p.imagen_url || (Array.isArray(p.imagenes_urls) && p.imagenes_urls[0]) || "";

    return `
      <div class="catalogo-card" onclick="abrirReservaCatalogo(${p.id})" style="
        cursor:pointer;
        border:1px solid #334155;
        border-radius:12px;
        overflow:hidden;
        background:#111827;
      ">
        <div style="
          height:110px;
          background:${img ? `url('${img}') center/cover no-repeat` : "#1f2937"};
          position:relative;
        ">
          <span style="
            position:absolute; top:8px; left:8px;
            background:#ea580c; color:#fff; font-size:12px;
            padding:3px 8px; border-radius:6px;
          ">🕐 ${horaBadge}</span>
        </div>

        <div style="padding:10px;">
          <h4 style="margin:0 0 8px 0; font-size:15px;">${p.nombre}</h4>
          <div style="display:flex; justify-content:space-between; font-size:13px; color:#94a3b8;">
            <span>Adulto: <strong style="color:#e2e8f0;">$${p.adulto ?? 0}</strong></span>
            <span>Niño: <strong style="color:#e2e8f0;">$${p.nino ?? 0}</strong></span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function abrirReservaCatalogo(productoId) {
  try {
    const producto = (window.__catalogoProductos || []).find(p => p.id === productoId);
    if (!producto) {
      alert("No se encontró la excursión seleccionada");
      return;
    }

    const hoteles = await fetchHoteles();
    window.__catalogoHoteles = hoteles;
    window.__catalogoProductoActual = producto;

    const opcionesHoteles = hoteles.map(h => `<option value="${h.nombre}">${h.nombre}</option>`).join("");

    const horariosProducto = Array.isArray(producto.horarios) && producto.horarios.length
      ? producto.horarios
      : [];

    const turnoHTML = horariosProducto.length > 0 ? `
      <label style="font-size:13px; color:#94a3b8;">Turno / Horario</label>
      <select id="cat-turno">
        ${horariosProducto.map(h => `<option value="${h}">${h}</option>`).join("")}
      </select>
    ` : "";

    getContent().innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
        <button type="button" onclick="menuCatalogoReservas()">⬅ Volver al catálogo</button>
        <h2 style="margin:0;">${producto.nombre}</h2>
      </div>

      <form id="catalogoReservaForm" style="display:grid; gap:10px; max-width:520px;">
        <input type="text" id="cat-cliente" placeholder="Nombre del cliente" required>
        <input type="tel" id="cat-telefono" placeholder="Teléfono" required>
        <input type="email" id="cat-email" placeholder="Email" required>

        <select id="cat-hotel" required>
          <option value="">Seleccionar hotel</option>
          ${opcionesHoteles}
        </select>

        <label style="font-size:13px; color:#94a3b8;">Número de habitación</label>
        <input type="text" id="cat-habitacion" placeholder="Ej: 1204">

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="font-size:13px; color:#94a3b8;">Adultos</label>
            <input type="number" id="cat-adultos" min="1" value="1" required>
          </div>
          <div>
            <label style="font-size:13px; color:#94a3b8;">Niños</label>
            <input type="number" id="cat-ninos" min="0" value="0">
          </div>
        </div>

        ${turnoHTML}

        <label style="font-size:13px; color:#94a3b8;">Pickup guardado para este hotel</label>
        <select id="cat-pickup-guardados">
          <option value="">— Elegir uno guardado o escribir nuevo abajo —</option>
        </select>

        <label style="font-size:13px; color:#94a3b8;">Pick Up Time</label>
        <input type="text" id="cat-pickup" placeholder="Ej: 7:15 AM Lobby" required>
        <small id="cat-pickup-hint" style="color:#64748b; font-size:12px; margin-top:-4px;"></small>

        <label style="font-size:13px; color:#94a3b8;">Fecha</label>
        <input type="date" id="cat-fecha" required>

        <label style="font-size:13px; color:#94a3b8;">Descuento ($)</label>
        <input type="number" id="cat-descuento" value="0" min="0">

        <label style="font-size:13px; color:#94a3b8;">Precio total</label>
        <input type="number" id="cat-precio" min="0" step="0.01">

        <label style="display:flex; align-items:center; gap:8px; font-size:14px;">
          <input type="checkbox" id="cat-precioManual" style="width:auto;">
          🔒 Precio manual
        </label>

        <div style="font-size:18px; font-weight:bold; margin-top:6px;">
          Total: $<span id="cat-total-preview">0.00</span>
        </div>

        <button type="submit">💾 Guardar Reserva</button>
      </form>
    `;

    document.getElementById("cat-hotel").addEventListener("change", () => {
      autoDatosCatalogo();
      sugerirPickupCatalogo();
    });
    document.getElementById("cat-adultos").addEventListener("input", autoDatosCatalogo);
    document.getElementById("cat-ninos").addEventListener("input", autoDatosCatalogo);
    document.getElementById("cat-descuento").addEventListener("input", autoDatosCatalogo);
    document.getElementById("cat-precioManual").addEventListener("change", autoDatosCatalogo);

    document.getElementById("cat-turno")?.addEventListener("change", sugerirPickupCatalogo);

    document.getElementById("cat-pickup-guardados").addEventListener("change", (e) => {
      if (e.target.value) {
        document.getElementById("cat-pickup").value = e.target.value;
      }
    });

    document.getElementById("catalogoReservaForm")
      .addEventListener("submit", guardarReservaCatalogo);

    autoDatosCatalogo();

  } catch (err) {
    console.error("Error abriendo formulario de catálogo:", err);
    alert("No se pudo abrir el formulario ⚠️");
  }
}

function autoDatosCatalogo() {
  const producto = window.__catalogoProductoActual;
  const hoteles = window.__catalogoHoteles || [];
  if (!producto) return;

  const hotelNombre = document.getElementById("cat-hotel")?.value || "";
  const adultos = parseInt(document.getElementById("cat-adultos")?.value) || 0;
  const ninos = parseInt(document.getElementById("cat-ninos")?.value) || 0;
  const descuento = parseFloat(document.getElementById("cat-descuento")?.value) || 0;
  const precioManual = document.getElementById("cat-precioManual")?.checked;

  const precioInput = document.getElementById("cat-precio");
  const totalPreview = document.getElementById("cat-total-preview");

  let total = (adultos * (parseFloat(producto.adulto) || 0)) + (ninos * (parseFloat(producto.nino) || 0));
  total = Math.max(0, total - descuento);

  if (!precioManual && precioInput) {
    precioInput.value = total;
  }

  if (totalPreview) {
    const totalMostrado = precioManual ? (parseFloat(precioInput?.value) || 0) : total;
    totalPreview.textContent = totalMostrado.toFixed(2);
  }
}

// Devuelve el turno seleccionado en el formulario, o "default" si la
// excursión no tiene turnos/horarios configurados
function getTurnoActualCatalogo() {
  return document.getElementById("cat-turno")?.value || "default";
}

// Busca el pickup recordado para hotel + excursión + turno específico
// (se guarda automáticamente cada vez que se hace una reserva manual)
function obtenerPickupRecordado(hotel, excursionKey, turno) {
  if (!hotel || !hotel.pickups || !hotel.pickups[excursionKey]) return "";

  const guardado = hotel.pickups[excursionKey];
  if (!guardado || typeof guardado !== "object") return "";

  if (guardado[turno]) return guardado[turno];

  // Compatibilidad: si no hay nada para este turno pero sí un "default"
  // (reservas hechas antes de tener turnos), lo usamos como respaldo
  if (turno !== "default" && guardado.default) return guardado.default;

  return "";
}

// Rellena el desplegable de pickups guardados (todos los turnos de este
// hotel+excursión) y sugiere el que corresponde al turno seleccionado.
// El usuario puede sobreescribirlo a mano antes de guardar.
function sugerirPickupCatalogo() {
  const producto = window.__catalogoProductoActual;
  const hoteles = window.__catalogoHoteles || [];
  const pickupInput = document.getElementById("cat-pickup");
  const pickupGuardados = document.getElementById("cat-pickup-guardados");
  const hint = document.getElementById("cat-pickup-hint");
  if (!producto || !pickupInput) return;

  const hotelNombre = document.getElementById("cat-hotel")?.value || "";
  const excursionKey = producto.slug || producto.nombre;
  const turno = getTurnoActualCatalogo();
  const hotel = hoteles.find(h => h.nombre === hotelNombre);

  // Lista de pickups guardados para cualquier turno de esta combinación
  if (pickupGuardados) {
    const guardado = (hotel?.pickups && hotel.pickups[excursionKey]) || {};
    const entradas = Object.entries(guardado).filter(([, v]) => v && String(v).trim() !== "");

    pickupGuardados.innerHTML = `<option value="">— Elegir uno guardado o escribir nuevo abajo —</option>` +
      entradas.map(([t, v]) => `
        <option value="${v}">${t === "default" ? v : `${t} → ${v}`}</option>
      `).join("");
  }

  const recordado = obtenerPickupRecordado(hotel, excursionKey, turno);

  if (recordado) {
    pickupInput.value = recordado;
    if (hint) hint.textContent = `📌 Pickup guardado para ${hotelNombre}${turno !== "default" ? ` (${turno})` : ""}: "${recordado}" — edítalo si cambió`;
  } else {
    pickupInput.value = "";
    if (hint) hint.textContent = hotelNombre ? "Sin pickup guardado aún para este turno, escríbelo y se recordará." : "";
  }
}

async function guardarReservaCatalogo(e) {
  e.preventDefault();

  const producto = window.__catalogoProductoActual;
  if (!producto) return;

  const reserva = {
    cliente: document.getElementById("cat-cliente").value.trim(),
    telefono: document.getElementById("cat-telefono").value.trim(),
    email: document.getElementById("cat-email").value.trim(),
    hotel: document.getElementById("cat-hotel").value,
    habitacion: document.getElementById("cat-habitacion").value.trim() || null,
    excursion: producto.slug || producto.nombre,
    producto_id: producto.id,
    adultos: parseInt(document.getElementById("cat-adultos").value) || 1,
    ninos: parseInt(document.getElementById("cat-ninos").value) || 0,
    pickup: document.getElementById("cat-pickup").value,
    fecha: document.getElementById("cat-fecha").value,
    precio: parseFloat(document.getElementById("cat-precio").value) || 0,
    descuento: parseFloat(document.getElementById("cat-descuento").value) || 0
  };

  try {
    const { error } = await supabaseClient
      .from("reservas")
      .insert([reserva]);

    if (error) throw error;

    // Recuerda el pickup escrito a mano para la próxima vez que se use
    // este mismo hotel + excursión + turno, hasta que alguien lo cambie manualmente.
    await recordarPickupCatalogo(reserva.hotel, reserva.excursion, getTurnoActualCatalogo(), reserva.pickup);

    alert("Reserva guardada en la nube ✅");
    mostrarReservas();
  } catch (err) {
    console.error("Error guardando reserva desde catálogo:", err);
    alert(
      "No se pudo guardar la reserva ⚠️\n\n" +
      "Error: " + (err.message || JSON.stringify(err))
    );
  }
}

// Guarda/actualiza en hoteles.pickups el pickup usado para hotel+excursión+turno,
// para que el próximo que reserve esa combinación (mismo turno) lo vea sugerido.
async function recordarPickupCatalogo(hotelNombre, excursionKey, turno, pickupValue) {
  if (!hotelNombre || !excursionKey || !pickupValue || !pickupValue.trim()) return;

  try {
    const hotel = (window.__catalogoHoteles || []).find(h => h.nombre === hotelNombre);
    if (!hotel) return;

    const pickupsActual = (hotel.pickups && typeof hotel.pickups === "object") ? hotel.pickups : {};
    const pickupsExcursion = (pickupsActual[excursionKey] && typeof pickupsActual[excursionKey] === "object")
      ? pickupsActual[excursionKey]
      : {};

    const nuevosPickups = {
      ...pickupsActual,
      [excursionKey]: {
        ...pickupsExcursion,
        [turno || "default"]: pickupValue.trim()
      }
    };

    const { error } = await supabaseClient
      .from("hoteles")
      .update({ pickups: nuevosPickups })
      .eq("id", hotel.id);

    if (error) throw error;

    // Actualiza la copia en memoria por si se hace otra reserva sin recargar
    hotel.pickups = nuevosPickups;

  } catch (err) {
    // No bloqueamos el flujo de reserva por esto, solo lo dejamos en consola
    console.error("No se pudo recordar el pickup para la próxima vez:", err);
  }
}
