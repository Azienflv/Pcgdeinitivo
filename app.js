function getContent() {
  return document.getElementById("content");
}

function safeId(text) {
  return text.replace(/\s+/g, "_").replace(/[^\w]/g, "");
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
  console.warn("Supabase no está configurado todavía.");
}

// =======================
// 🔐 LOGIN
// =======================
async function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");

  try {
    if (!supabaseClient) {
      throw new Error("Supabase no está conectado");
    }

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
// 🚀 INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  console.log("App cargada correctamente ✅");

  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const toggleBtn = document.getElementById("toggleBtn");
  const menuItems = document.querySelectorAll(".menu-item");

  if (toggleBtn && sidebar && main) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      main.classList.toggle("shift");
    });
  }

  if (menuItems.length > 0) {
    menuItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const text = item.textContent.trim();

        if (text === "Nueva Reserva") loadForm();
        else if (text === "Reportes") menuReportes();
        else if (text === "Reservas") mostrarReservas();
        else if (text === "Nuevo Producto") menuProductos();
        else if (text === "Usuarios") menuUsuarios();
      });
    });
  }
});

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
// ➕ CREAR EXCURSIONES
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
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from("productos")
        .insert([producto]);

      if (error) throw error;
    }

    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    productos.push(producto);
    localStorage.setItem("productos", JSON.stringify(productos));

    alert(supabaseClient ? "Excursión guardada en la nube ✅" : "Excursión guardada localmente ✅");
    document.getElementById("productoForm").reset();
  } catch (err) {
    console.error("Error guardando producto:", err);

    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    productos.push(producto);
    localStorage.setItem("productos", JSON.stringify(productos));

    alert("Excursión guardada localmente ⚠️");
    document.getElementById("productoForm").reset();
  }
}

async function editarProductos() {
  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        getContent().innerHTML = `
          <h2>No hay productos aún</h2>
          <button onclick="menuProductos()">⬅ Volver</button>
        `;
        return;
      }

      let html = `<h2>Editar Productos</h2>`;

      data.forEach((p) => {
        html += `
          <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:8px;">
            <input type="text" value="${p.nombre}" id="nombre-${p.id}">
            <input type="number" value="${p.adulto}" id="adulto-${p.id}">
            <input type="number" value="${p.nino}" id="nino-${p.id}">
            <br><br>
            <button onclick="actualizarProductoDesdeNube(${p.id})">💾 Guardar</button>
            <button onclick="eliminarProductoDesdeNube(${p.id})">❌ Eliminar</button>
          </div>
        `;
      });

      html += `<button onclick="menuProductos()">⬅ Volver</button>`;
      getContent().innerHTML = html;
      return;
    }

    throw new Error("Supabase no configurado");
  } catch (err) {
    console.warn("Cargando productos desde localStorage ⚠️", err);

    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    if (productos.length === 0) {
      getContent().innerHTML = `
        <h2>No hay productos aún</h2>
        <button onclick="menuProductos()">⬅ Volver</button>
      `;
      return;
    }

    let html = `<h2>Editar Productos</h2>`;

    productos.forEach((p, index) => {
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:8px;">
          <input type="text" value="${p.nombre}" id="nombre-${index}">
          <input type="number" value="${p.adulto}" id="adulto-${index}">
          <input type="number" value="${p.nino}" id="nino-${index}">
          <br><br>
          <button onclick="actualizarProducto(${index})">💾 Guardar</button>
          <button onclick="eliminarProducto(${index})">❌ Eliminar</button>
        </div>
      `;
    });

    html += `<button onclick="menuProductos()">⬅ Volver</button>`;
    getContent().innerHTML = html;
  }
}

function actualizarProducto(index) {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];

  productos[index].nombre = document.getElementById(`nombre-${index}`).value.trim();
  productos[index].adulto = parseFloat(document.getElementById(`adulto-${index}`).value) || 0;
  productos[index].nino = parseFloat(document.getElementById(`nino-${index}`).value) || 0;

  localStorage.setItem("productos", JSON.stringify(productos));
  alert("Producto actualizado ✅");
  editarProductos();
}

function eliminarProducto(index) {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];

  if (confirm("¿Eliminar este producto?")) {
    productos.splice(index, 1);
    localStorage.setItem("productos", JSON.stringify(productos));
    editarProductos();
  }
}

async function actualizarProductoDesdeNube(id) {
  const nombre = document.getElementById(`nombre-${id}`).value.trim();
  const adulto = parseFloat(document.getElementById(`adulto-${id}`).value) || 0;
  const nino = parseFloat(document.getElementById(`nino-${id}`).value) || 0;

  try {
    const { error } = await supabaseClient
      .from("productos")
      .update({ nombre, adulto, nino })
      .eq("id", id);

    if (error) throw error;

    alert("Producto actualizado en la nube ✅");
    editarProductos();
  } catch (err) {
    console.error("Error actualizando producto en la nube:", err);
    alert("No se pudo actualizar en la nube ⚠️");
  }
}

async function eliminarProductoDesdeNube(id) {
  if (!confirm("¿Eliminar este producto?")) return;

  try {
    const { error } = await supabaseClient
      .from("productos")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Producto eliminado de la nube ✅");
    editarProductos();
  } catch (err) {
    console.error("Error eliminando producto en la nube:", err);
    alert("No se pudo eliminar en la nube ⚠️");
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
  let productos = [];

  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      productos = data || [];
    } else {
      productos = JSON.parse(localStorage.getItem("productos")) || [];
    }
  } catch (err) {
    console.warn("Productos desde localStorage ⚠️", err);
    productos = JSON.parse(localStorage.getItem("productos")) || [];
  }

  let inputs = productos.map(p => {
    let id = safeId(p.nombre);
    return `
      <label>${p.nombre}</label>
      <input type="time" id="pickup_${id}">
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
}

async function guardarHotel(e) {
  e.preventDefault();

  let productos = [];
  let hotel = {
    nombre: document.getElementById("nombreHotel").value.trim(),
    pickups: {}
  };

  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      productos = data || [];
    } else {
      productos = JSON.parse(localStorage.getItem("productos")) || [];
    }
  } catch (err) {
    console.warn("Productos desde localStorage ⚠️", err);
    productos = JSON.parse(localStorage.getItem("productos")) || [];
  }

  productos.forEach(p => {
    let id = safeId(p.nombre);
    hotel.pickups[p.nombre] =
      document.getElementById(`pickup_${id}`).value || "";
  });

  try {
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from("hoteles")
        .insert([hotel]);

      if (error) throw error;
    }

    let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
    hoteles.push(hotel);
    localStorage.setItem("hoteles", JSON.stringify(hoteles));

    alert(supabaseClient ? "Hotel guardado en la nube ✅" : "Hotel guardado localmente ✅");
    menuHoteles();
  } catch (err) {
    console.error("Error guardando hotel:", err);

    let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
    hoteles.push(hotel);
    localStorage.setItem("hoteles", JSON.stringify(hoteles));

    alert("Hotel guardado localmente ⚠️");
    menuHoteles();
  }
}

async function verHoteles() {
  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("hoteles")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        getContent().innerHTML = `<h2>No hay hoteles</h2>`;
        return;
      }

      let html = `<h2>Hoteles</h2>`;

      data.forEach((h) => {
        html += `<h4>${h.nombre}</h4><ul>`;

        for (let exc in h.pickups) {
          html += `<li>${exc} → ${h.pickups[exc] || "Sin horario"}</li>`;
        }

        html += `</ul>
          <button onclick="editarHotelDesdeNube(${h.id})">✏️</button>
          <button onclick="eliminarHotelDesdeNube(${h.id})">❌</button>
        `;
      });

      html += `<br><button onclick="menuHoteles()">⬅ Volver</button>`;
      getContent().innerHTML = html;
      return;
    }

    throw new Error("Supabase no configurado");
  } catch (err) {
    console.warn("Hoteles desde localStorage ⚠️", err);

    let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];

    if (hoteles.length === 0) {
      getContent().innerHTML = `<h2>No hay hoteles</h2>`;
      return;
    }

    let html = `<h2>Hoteles</h2>`;

    hoteles.forEach((h, index) => {
      html += `<h4>${h.nombre}</h4><ul>`;

      for (let exc in h.pickups) {
        html += `<li>${exc} → ${h.pickups[exc] || "Sin horario"}</li>`;
      }

      html += `</ul>
        <button onclick="editarHotel(${index})">✏️</button>
        <button onclick="eliminarHotel(${index})">❌</button>
      `;
    });

    html += `<br><button onclick="menuHoteles()">⬅ Volver</button>`;
    getContent().innerHTML = html;
  }
}

function editarHotel(index) {
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let hotel = hoteles[index];

  let inputs = productos.map(p => {
    let id = safeId(p.nombre);
    let valor = hotel.pickups[p.nombre] || "";

    return `
      <label>${p.nombre}</label>
      <input type="time" id="edit_pickup_${id}" value="${valor}">
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
      guardarEdicionHotel(index);
    });
}

async function editarHotelDesdeNube(id) {
  try {
    const { data: hotel, error: hotelError } = await supabaseClient
      .from("hoteles")
      .select("*")
      .eq("id", id)
      .single();

    if (hotelError) throw hotelError;

    const { data: productos, error: productosError } = await supabaseClient
      .from("productos")
      .select("*")
      .order("nombre", { ascending: true });

    if (productosError) throw productosError;

    let inputs = (productos || []).map(p => {
      let pid = safeId(p.nombre);
      let valor = hotel.pickups?.[p.nombre] || "";

      return `
        <label>${p.nombre}</label>
        <input type="time" id="edit_pickup_${pid}" value="${valor}">
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
        guardarEdicionHotelDesdeNube(id);
      });

  } catch (err) {
    console.error("Error cargando hotel desde nube:", err);
    alert("No se pudo cargar el hotel desde la nube ⚠️");
  }
}

function guardarEdicionHotel(index) {
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let hotel = hoteles[index];

  hotel.nombre = document.getElementById("edit_nombreHotel").value.trim();

  productos.forEach(p => {
    let id = safeId(p.nombre);
    hotel.pickups[p.nombre] =
      document.getElementById(`edit_pickup_${id}`).value || "";
  });

  localStorage.setItem("hoteles", JSON.stringify(hoteles));

  alert("Hotel actualizado ✅");
  verHoteles();
}

async function guardarEdicionHotelDesdeNube(id) {
  try {
    const { data: productos, error: productosError } = await supabaseClient
      .from("productos")
      .select("*")
      .order("nombre", { ascending: true });

    if (productosError) throw productosError;

    let pickups = {};

    (productos || []).forEach(p => {
      let pid = safeId(p.nombre);
      pickups[p.nombre] = document.getElementById(`edit_pickup_${pid}`).value || "";
    });

    const nombre = document.getElementById("edit_nombreHotel").value.trim();

    const { error } = await supabaseClient
      .from("hoteles")
      .update({ nombre, pickups })
      .eq("id", id);

    if (error) throw error;

    alert("Hotel actualizado en la nube ✅");
    verHoteles();
  } catch (err) {
    console.error("Error actualizando hotel en nube:", err);
    alert("No se pudo actualizar el hotel en la nube ⚠️");
  }
}

function eliminarHotel(index) {
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];

  if (confirm("¿Eliminar hotel?")) {
    hoteles.splice(index, 1);
    localStorage.setItem("hoteles", JSON.stringify(hoteles));
    verHoteles();
  }
}

async function eliminarHotelDesdeNube(id) {
  if (!confirm("¿Eliminar hotel?")) return;

  try {
    const { error } = await supabaseClient
      .from("hoteles")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Hotel eliminado de la nube ✅");
    verHoteles();
  } catch (err) {
    console.error("Error eliminando hotel en nube:", err);
    alert("No se pudo eliminar el hotel de la nube ⚠️");
  }
}

// =======================
// 🧾 FORMULARIO RESERVA
// =======================
async function loadForm() {
  let productos = [];
  let hoteles = [];

  try {
    if (supabaseClient) {
      const [{ data: productosData, error: productosError }, { data: hotelesData, error: hotelesError }] =
        await Promise.all([
          supabaseClient.from("productos").select("*").order("nombre", { ascending: true }),
          supabaseClient.from("hoteles").select("*").order("nombre", { ascending: true })
        ]);

      if (productosError) throw productosError;
      if (hotelesError) throw hotelesError;

      productos = productosData || [];
      hoteles = hotelesData || [];
    } else {
      productos = JSON.parse(localStorage.getItem("productos")) || [];
      hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
    }
  } catch (err) {
    console.warn("Form desde localStorage ⚠️", err);
    productos = JSON.parse(localStorage.getItem("productos")) || [];
    hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
  }

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
      <input type="time" id="pickup" readonly>

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
}

async function autoDatos() {
  let productos = [];
  let hoteles = [];

  try {
    if (supabaseClient) {
      const [{ data: productosData, error: productosError }, { data: hotelesData, error: hotelesError }] =
        await Promise.all([
          supabaseClient.from("productos").select("*"),
          supabaseClient.from("hoteles").select("*")
        ]);

      if (productosError) throw productosError;
      if (hotelesError) throw hotelesError;

      productos = productosData || [];
      hoteles = hotelesData || [];
    } else {
      productos = JSON.parse(localStorage.getItem("productos")) || [];
      hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
    }
  } catch (err) {
    console.warn("AutoDatos desde localStorage ⚠️", err);
    productos = JSON.parse(localStorage.getItem("productos")) || [];
    hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
  }

  let excursion = document.getElementById("excursion").value;
  let hotelNombre = document.getElementById("hotel").value;

  let adultos = parseInt(document.getElementById("adultos").value) || 0;
  let ninos = parseInt(document.getElementById("ninos").value) || 0;
  let descuento = parseFloat(document.getElementById("descuento").value) || 0;

  let producto = productos.find(p => p.nombre === excursion);

  if (producto) {
    let total = (adultos * producto.adulto) + (ninos * producto.nino);
    total = Math.max(0, total - descuento);
    document.getElementById("precio").value = total;
  } else {
    document.getElementById("precio").value = "";
  }

  let hotel = hoteles.find(h => h.nombre === hotelNombre);

  if (hotel && hotel.pickups) {
    document.getElementById("pickup").value = hotel.pickups[excursion] || "";
  } else {
    document.getElementById("pickup").value = "";
  }
}

// =======================
// 🧾 GUARDAR RESERVA
// =======================
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
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from("reservas")
        .insert([reserva]);

      if (error) throw error;
    }

    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservas.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    alert(supabaseClient ? "Reserva guardada en la nube ✅" : "Reserva guardada localmente ✅");
    mostrarReservas();
  } catch (err) {
    console.error("Error guardando reserva:", err);

    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservas.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    alert("Reserva guardada localmente ⚠️");
    mostrarReservas();
  }
}

// =======================
// 📊 MOSTRAR RESERVAS
// =======================
async function mostrarReservas() {
  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("reservas")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
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

      data.forEach((r) => {
        tabla += `
          <tr>
            <td>${r.cliente}</td>
            <td>${r.hotel}</td>
            <td>${r.excursion}</td>
            <td>${r.pickup || "-"}</td>
            <td>${r.fecha}</td>
            <td>$${r.precio}</td>
            <td>
              <button onclick="verVoucherDesdeNube(${r.id})">📄</button>
<button onclick="eliminarReservaDesdeNube(${r.id})">❌</button>
            </td>
          </tr>
        `;
      });

      tabla += "</table>";
      getContent().innerHTML = tabla;
      return;
    }

    throw new Error("Supabase no configurado");
  } catch (err) {
    console.warn("Cargando reservas desde localStorage ⚠️", err);

    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

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

    reservas.forEach((r, index) => {
      tabla += `
        <tr>
          <td>${r.cliente}</td>
          <td>${r.hotel}</td>
          <td>${r.excursion}</td>
          <td>${r.pickup || "-"}</td>
          <td>${r.fecha}</td>
          <td>$${r.precio}</td>
          <td>
            <button onclick="verVoucher(${index})">📄</button>
            <button onclick="eliminarReserva(${index})">❌</button>
          </td>
        </tr>
      `;
    });

    tabla += "</table>";
    getContent().innerHTML = tabla;
  }
}
async function eliminarReservaDesdeNube(id) {
  if (!confirm("¿Seguro que quieres eliminar esta reserva?")) return;

  try {
    const { error } = await supabaseClient
      .from("reservas")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Reserva eliminada de la nube ✅");
    mostrarReservas();

  } catch (err) {
    console.error("Error eliminando reserva:", err);
    alert("No se pudo eliminar la reserva ⚠️");
  }
}

// =======================
// 📊 REPORTES
// =======================
function menuReportes() {
  getContent().innerHTML = `
    <h2>📊 Reportes</h2>

    <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
      <button onclick="reporteVentas()">💰 Ventas</button>
      <button onclick="verContactos()">👥 Contactos</button>
    </div>
  `;
}

async function reporteVentas() {
  let reservas = [];

  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("reservas")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;
      reservas = data || [];
    } else {
      reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    }
  } catch (err) {
    console.warn("Reporte desde localStorage ⚠️", err);
    reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  }

  if (reservas.length === 0) {
    getContent().innerHTML = "<h2>No hay ventas aún</h2>";
    return;
  }

  let porMes = {};
  let porDia = {};
  let totalGeneral = 0;

  reservas.forEach(r => {
    let mes = (r.fecha || "").slice(0, 7);
    let dia = r.fecha || "";
    let precio = parseFloat(r.precio) || 0;

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
}

async function verContactos() {
  let reservas = [];

  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("reservas")
        .select("cliente, telefono, email, fecha")
        .order("fecha", { ascending: false });

      if (error) throw error;
      reservas = data || [];
    } else {
      reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    }
  } catch (err) {
    console.warn("Contactos desde localStorage ⚠️", err);
    reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  }

  if (reservas.length === 0) {
    getContent().innerHTML = "<h2>No hay contactos aún</h2>";
    return;
  }

  let contactosMap = new Map();

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
}

// =======================
// 🎟️ VOUCHERS
// =======================
function verVoucher(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  let r = reservas[index];

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
        <button onclick="enviarWhatsApp(${index})">📲 WhatsApp</button>
        <button onclick="enviarEmail(${index})">✉️ Email</button>
      </div>
    </div>
  `;
}

async function verVoucherDesdeNube(id) {
  try {
    const { data, error } = await supabaseClient
      .from("reservas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const r = data;

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
          <button onclick="enviarWhatsAppDesdeNube(${r.id})">📲 WhatsApp</button>
          <button onclick="enviarEmailDesdeNube(${r.id})">✉️ Email</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error cargando voucher desde nube:", err);
    alert("No se pudo cargar el voucher desde la nube ⚠️");
  }
}

// =======================
// 📲 / 📧 ENVÍOS
// =======================
function enviarWhatsApp(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  let r = reservas[index];

  let telefono = (r.telefono || "").replace(/\D/g, "");
  let mensaje = `Hola ${r.cliente},
Tu reserva está confirmada ✅

Excursión: ${r.excursion}
Hotel: ${r.hotel}
Fecha: ${r.fecha}
Pickup: ${r.pickup}
Total: $${r.precio}

Punta Cana Going 🌴`;

  let url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

function enviarEmail(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  let r = reservas[index];

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
}

async function enviarWhatsAppDesdeNube(id) {
  try {
    const { data, error } = await supabaseClient
      .from("reservas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    let r = data;
    let telefono = (r.telefono || "").replace(/\D/g, "");

    let mensaje = `Hola ${r.cliente},
Tu reserva está confirmada ✅

Excursión: ${r.excursion}
Hotel: ${r.hotel}
Fecha: ${r.fecha}
Pickup: ${r.pickup}
Total: $${r.precio}

Punta Cana Going 🌴`;

    let url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Error enviando WhatsApp desde nube:", err);
  }
}

async function enviarEmailDesdeNube(id) {
  try {
    const { data, error } = await supabaseClient
      .from("reservas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    let r = data;
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
    console.error("Error enviando email desde nube:", err);
  }
}

// =======================
// 👥 MULTI USUARIO
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
            <button onclick="eliminarUsuarioDesdeNube(${u.id})">❌ Eliminar</button>
          </div>
        </div>
      `;
    });

    getContent().innerHTML = html;

    document.getElementById("userForm").addEventListener("submit", guardarUsuarioDesdeNube);

  } catch (err) {
    console.error("Error cargando usuarios:", err);
    alert("No se pudieron cargar los usuarios ⚠️");
  }
}

async function guardarUsuarioDesdeNube(e) {
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

async function eliminarUsuarioDesdeNube(id) {
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
// 📦 SERVICE WORKER
// =======================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service Worker registrado ✅"))
      .catch(error => console.log("Error registrando Service Worker ❌", error));
  });
}
