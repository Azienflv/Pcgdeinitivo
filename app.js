function getContent() {
  return document.getElementById("content");
}

function safeId(text) {
  return String(text || "").replace(/\s+/g, "_").replace(/[^\w]/g, "");
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
// 🔐 LOGIN / LOGOUT
// =======================
async function login() {
  const user = document.getElementById("username")?.value.trim();
  const pass = document.getElementById("password")?.value.trim();
  const loginError = document.getElementById("loginError");

  try {
    if (!supabaseClient) throw new Error("Supabase no está conectado");

    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("*")
      .eq("username", user)
      .eq("password", pass)
      .single();

    if (error || !data) {
      if (loginError) loginError.style.display = "block";
      return;
    }

    localStorage.setItem("session", "active");
    localStorage.setItem("currentUser", JSON.stringify(data));

    if (loginError) loginError.style.display = "none";
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";

    getContent().innerHTML = `
      <h1>Dashboard</h1>
      <p>Bienvenido, ${data.username}</p>
    `;
  } catch (err) {
    console.error("Error en login:", err);
    if (loginError) loginError.style.display = "block";
  }
}

function logout() {
  localStorage.removeItem("session");
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
window.onload = function () {
  const session = localStorage.getItem("session");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (session === "active" && currentUser) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";

    getContent().innerHTML = `
      <h1>Dashboard</h1>
      <p>Bienvenido, ${currentUser.username}</p>
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
function loadProducto() {
  getContent().innerHTML = `
    <h2>Nueva Excursión</h2>

    <form id="productoForm">
      <input type="text" id="nombreExcursion" placeholder="Nombre de la excursión" required>
      <input type="number" id="precioAdulto" placeholder="Precio Adulto" required>
      <input type="number" id="precioNino" placeholder="Precio Niño" required>

      <button type="submit">Guardar Producto</button>
      <button type="button" onclick="menuProductos()">⬅ Volver</button>
    </form>
  `;

  document.getElementById("productoForm")
    .addEventListener("submit", guardarProducto);
}

async function guardarProducto(e) {
  e.preventDefault();

  const producto = {
    nombre: document.getElementById("nombreExcursion").value.trim(),
    adulto: parseFloat(document.getElementById("precioAdulto").value) || 0,
    nino: parseFloat(document.getElementById("precioNino").value) || 0
  };

  try {
    const { error } = await supabaseClient
      .from("productos")
      .insert([producto]);

    if (error) {
      console.error("Supabase error productos:", error);
      throw error;
    }

    alert("Excursión guardada en la nube ✅");
    document.getElementById("productoForm").reset();

  } catch (err) {
    console.error("Error guardando producto:", err);
    alert("No se pudo guardar el producto: " + (err.message || "Error desconocido") + " ⚠️");
  }
}

async function editarProductos() {
  try {
    const productos = await fetchProductos();

    if (productos.length === 0) {
      getContent().innerHTML = `
        <h2>No hay productos aún</h2>
        <button onclick="menuProductos()">⬅ Volver</button>
      `;
      return;
    }

    let html = `<h2>Editar Productos</h2>`;

    productos.forEach((p) => {
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:8px;">
          <input type="text" value="${p.nombre}" id="nombre-${p.id}">
          <input type="number" value="${p.adulto}" id="adulto-${p.id}">
          <input type="number" value="${p.nino}" id="nino-${p.id}">
          <br><br>
          <button onclick="actualizarProducto(${p.id})">💾 Guardar</button>
          <button onclick="eliminarProducto(${p.id})">❌ Eliminar</button>
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

  try {
    const { error } = await supabaseClient
      .from("productos")
      .update({ nombre, adulto, nino })
      .eq("id", id);

    if (error) throw error;

    alert("Producto actualizado ✅");
    editarProductos();
  } catch (err) {
    console.error("Error actualizando producto:", err);
    alert("No se pudo actualizar el producto ⚠️");
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
      let id = safeId(p.nombre);
      return `
        <div style="margin-bottom:16px; padding:10px; border:1px solid #334155; border-radius:8px;">
          <label style="display:block; margin-bottom:8px;"><strong>${p.nombre}</strong></label>

          <input type="time" id="pickup1_${id}" placeholder="Pickup 1">
          <input type="time" id="pickup2_${id}" placeholder="Pickup 2">
          <input type="time" id="pickup3_${id}" placeholder="Pickup 3">
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
      let id = safeId(p.nombre);

      let horarios = [
        document.getElementById(`pickup1_${id}`).value,
        document.getElementById(`pickup2_${id}`).value,
        document.getElementById(`pickup3_${id}`).value
      ].filter(h => h && h.trim() !== "");

      hotel.pickups[p.nombre] = horarios;
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
      let pid = safeId(p.nombre);

      let horariosGuardados = hotel.pickups?.[p.nombre] || [];

      if (!Array.isArray(horariosGuardados)) {
        horariosGuardados = horariosGuardados ? [horariosGuardados] : [];
      }

      return `
        <div style="margin-bottom:16px; padding:10px; border:1px solid #334155; border-radius:8px;">
          <label style="display:block; margin-bottom:8px;"><strong>${p.nombre}</strong></label>

          <input type="time" id="edit_pickup1_${pid}" value="${horariosGuardados[0] || ""}">
          <input type="time" id="edit_pickup2_${pid}" value="${horariosGuardados[1] || ""}">
          <input type="time" id="edit_pickup3_${pid}" value="${horariosGuardados[2] || ""}">
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
      let pid = safeId(p.nombre);

      let horarios = [
        document.getElementById(`edit_pickup1_${pid}`).value,
        document.getElementById(`edit_pickup2_${pid}`).value,
        document.getElementById(`edit_pickup3_${pid}`).value
      ].filter(h => h && h.trim() !== "");

      pickups[p.nombre] = horarios;
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
      `<option value="${p.nombre}">${p.nombre}</option>`
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

        <input type="number" id="adultos" placeholder="Adultos" min="1" required>
        <input type="number" id="ninos" placeholder="Niños" min="0">

        <label>Pick Up Time</label>
        <select id="pickup" required>
          <option value="">Seleccionar pickup</option>
        </select>

        <input type="date" id="fecha" required>

        <input type="number" id="precio" placeholder="Precio total" readonly>

        <label>Descuento ($)</label>
        <input type="number" id="descuento" value="0" min="0">

        <button type="submit">Guardar Reserva</button>
      </form>
    `;

    document.getElementById("excursion").addEventListener("change", autoDatos);
    document.getElementById("hotel").addEventListener("change", autoDatos);
    document.getElementById("adultos").addEventListener("input", autoDatos);
    document.getElementById("ninos").addEventListener("input", autoDatos);
    document.getElementById("descuento").addEventListener("input", autoDatos);

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

    const producto = productos.find(p => p.nombre === excursion);

    if (producto) {
      let total = (adultos * producto.adulto) + (ninos * producto.nino);
      total = Math.max(0, total - descuento);
      document.getElementById("precio").value = total;
    } else {
      document.getElementById("precio").value = "";
    }

    const pickupSelect = document.getElementById("pickup");
    pickupSelect.innerHTML = `<option value="">Seleccionar pickup</option>`;

    const hotel = hoteles.find(h => h.nombre === hotelNombre);

    if (hotel && hotel.pickups && hotel.pickups[excursion]) {
      let horarios = hotel.pickups[excursion];

      // Compatibilidad con hoteles viejos
      if (!Array.isArray(horarios)) {
        horarios = horarios ? [horarios] : [];
      }

      horarios = horarios.filter(h => h && h.trim() !== "");

      horarios.forEach(hora => {
        pickupSelect.innerHTML += `<option value="${hora}">${hora}</option>`;
      });

      // Si solo hay uno, lo selecciona automático
      if (horarios.length === 1) {
        pickupSelect.value = horarios[0];
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
    const reservas = await fetchReservas();

    if (reservas.length === 0) {
      getContent().innerHTML = "<h2>No hay reservas aún</h2>";
      return;
    }

    let tabla = `
      <h2>Reservas</h2>
      <table border="1" style="width:100%; border-collapse: collapse;">
        <tr>
          <th>Cliente</th>
          <th>Hotel</th>
          <th>Excursión</th>
          <th>Pickup</th>
          <th>Fecha</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
    `;

    reservas.forEach((r) => {
      tabla += `
        <tr>
          <td>${r.cliente}</td>
          <td>${r.hotel}</td>
          <td>${r.excursion}</td>
          <td>${r.pickup || "-"}</td>
          <td>${r.fecha}</td>
          <td>$${r.precio}</td>
          <td>
            <button onclick="verVoucher(${r.id})">📄</button>
            <button onclick="eliminarReserva(${r.id})">❌</button>
          </td>
        </tr>
      `;
    });

    tabla += "</table>";
    getContent().innerHTML = tabla;
  } catch (err) {
    console.error("Error cargando reservas:", err);
    alert("No se pudieron cargar las reservas ⚠️");
  }
}

async function eliminarReserva(id) {
  if (!confirm("¿Seguro que quieres eliminar esta reserva?")) return;

  try {
    const { error } = await supabaseClient
      .from("reservas")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Reserva eliminada ✅");
    mostrarReservas();
  } catch (err) {
    console.error("Error eliminando reserva:", err);
    alert("No se pudo eliminar la reserva ⚠️");
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
    const { data, error } = await supabaseClient
      .from("reservas")
      .select("cliente, telefono, email, fecha")
      .order("fecha", { ascending: false });

    if (error) throw error;

    const reservas = data || [];

    if (reservas.length === 0) {
      getContent().innerHTML = "<h2>No hay contactos aún</h2>";
      return;
    }

    const contactosMap = new Map();

    reservas.forEach(r => {
      const key = (r.telefono || r.email || r.cliente || "").trim().toLowerCase();
      if (!key) return;

      if (!contactosMap.has(key)) {
        contactosMap.set(key, {
          nombre: r.cliente || "",
          telefono: r.telefono || "",
          email: r.email || "",
          fecha: r.fecha || ""
        });
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

// =======================
// 📄 PDF
// =======================
async function generarPDFFromElement(element) {
  const { jsPDF } = window.jspdf;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 10;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 5;

  pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
  heightLeft -= (pageHeight - 10);

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 5;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 10);
  }

  return {
    pdf,
    blob: pdf.output("blob")
  };
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
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
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

  if (!currentUser || currentUser.role !== "admin") {
    getContent().innerHTML = `
      <h2>Acceso denegado</h2>
      <p>Solo el administrador puede gestionar usuarios.</p>
    `;
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("*")
      .order("username", { ascending: true });

    if (error) throw error;

    let html = `
      <h2>Usuarios</h2>

      <form id="userForm" style="margin-bottom:20px;">
        <input type="text" id="newUsername" placeholder="Nuevo usuario" required>
        <input type="password" id="newPassword" placeholder="Contraseña" required>

        <select id="newRole">
          <option value="seller">Vendedor</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit">Agregar usuario</button>
      </form>

      <h3>Lista de usuarios</h3>
    `;

    (data || []).forEach((u) => {
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:8px;">
          <strong>${u.username}</strong> — ${u.role}
          <div style="margin-top:10px;">
            <button onclick="eliminarUsuario(${u.id})">❌ Eliminar</button>
          </div>
        </div>
      `;
    });

    getContent().innerHTML = html;

    document.getElementById("userForm").addEventListener("submit", guardarUsuario);

  } catch (err) {
    console.error("Error cargando usuarios:", err);
    alert("No se pudieron cargar los usuarios ⚠️");
  }
}

async function guardarUsuario(e) {
  e.preventDefault();

  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const role = document.getElementById("newRole").value;

  try {
    const { data: existing, error: existingError } = await supabaseClient
      .from("usuarios")
      .select("*")
      .eq("username", username);

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      alert("Ese usuario ya existe");
      return;
    }

    const { error } = await supabaseClient
      .from("usuarios")
      .insert([{ username, password, role }]);

    if (error) throw error;

    alert("Usuario creado ✅");
    menuUsuarios();
  } catch (err) {
    console.error("Error creando usuario:", err);
    alert("No se pudo crear el usuario ⚠️");
  }
}

async function eliminarUsuario(id) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!confirm("¿Eliminar este usuario?")) return;

  try {
    const { data, error: userError } = await supabaseClient
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (userError) throw userError;

    if (currentUser && data.username === currentUser.username) {
      alert("No puedes eliminar tu propio usuario mientras estás logueado");
      return;
    }

    const { error } = await supabaseClient
      .from("usuarios")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Usuario eliminado ✅");
    menuUsuarios();
  } catch (err) {
    console.error("Error eliminando usuario:", err);
    alert("No se pudo eliminar el usuario ⚠️");
  }
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
