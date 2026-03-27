function getContent() {
  return document.getElementById("content");
}

function safeId(text) {
  return text.replace(/\s+/g, "_").replace(/[^\w]/g, "");
}

// =======================
// 🔐 LOGIN
// =======================
const USER = "pcg";
const PASS = "josias8090";

function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");

  if (user === USER && pass === PASS) {
    localStorage.setItem("session", "active");

    if (loginError) loginError.style.display = "none";
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";

    getContent().innerHTML = `
      <h1>Dashboard</h1>
      <p>Bienvenido a Punta Cana Going</p>
    `;
  } else {
    if (loginError) loginError.style.display = "block";
  }
}

function logout() {
  localStorage.removeItem("session");

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

function guardarProducto(e) {
  e.preventDefault();

  const producto = {
    nombre: document.getElementById("nombreExcursion").value.trim(),
    adulto: parseFloat(document.getElementById("precioAdulto").value) || 0,
    nino: parseFloat(document.getElementById("precioNino").value) || 0
  };

  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  productos.push(producto);

  localStorage.setItem("productos", JSON.stringify(productos));

  alert("Excursión guardada ✅");
  document.getElementById("productoForm").reset();
}

function editarProductos() {
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

function crearHotel() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];

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

function guardarHotel(e) {
  e.preventDefault();

  let productos = JSON.parse(localStorage.getItem("productos")) || [];

  let hotel = {
    nombre: document.getElementById("nombreHotel").value.trim(),
    pickups: {}
  };

  productos.forEach(p => {
    let id = safeId(p.nombre);
    hotel.pickups[p.nombre] =
      document.getElementById(`pickup_${id}`).value || "";
  });

  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];
  hoteles.push(hotel);

  localStorage.setItem("hoteles", JSON.stringify(hoteles));

  alert("Hotel guardado ✅");
  menuHoteles();
}

function verHoteles() {
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

function eliminarHotel(index) {
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];

  if (confirm("¿Eliminar hotel?")) {
    hoteles.splice(index, 1);
    localStorage.setItem("hoteles", JSON.stringify(hoteles));
    verHoteles();
  }
}

// =======================
// 🧾 FORMULARIO RESERVA
// =======================
function loadForm() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];

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

function autoDatos() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];

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

function guardarReserva(e) {
  e.preventDefault();

  const reserva = {
    cliente: document.getElementById("cliente").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    email: document.getElementById("email").value.trim(),
    hotel: document.getElementById("hotel").value,
    excursion: document.getElementById("excursion").value,
    adultos: document.getElementById("adultos").value,
    ninos: document.getElementById("ninos").value || 0,
    pickup: document.getElementById("pickup").value,
    fecha: document.getElementById("fecha").value,
    precio: document.getElementById("precio").value,
    descuento: document.getElementById("descuento").value || 0
  };

  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  reservas.push(reserva);
  localStorage.setItem("reservas", JSON.stringify(reservas));

  alert("Reserva guardada ✅");
  mostrarReservas();
}

// =======================
// 📊 MOSTRAR RESERVAS
// =======================
function mostrarReservas() {
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

function eliminarReserva(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (confirm("¿Seguro que quieres eliminar esta reserva?")) {
    reservas.splice(index, 1);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    mostrarReservas();
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

function reporteVentas() {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (reservas.length === 0) {
    getContent().innerHTML = "<h2>No hay ventas aún</h2>";
    return;
  }

  let porMes = {};
  let porDia = {};
  let totalGeneral = 0;

  reservas.forEach(r => {
    let mes = r.fecha.slice(0, 7);
    let dia = r.fecha;
    let precio = parseFloat(r.precio) || 0;

    if (!porMes[mes]) porMes[mes] = 0;
    porMes[mes] += precio;

    if (!porDia[dia]) porDia[dia] = 0;
    porDia[dia] += precio;

    totalGeneral += precio;
  });

  let html = `<h2>📊 Reporte de Ventas</h2>`;
  html += `<h3>💰 Total General: $${totalGeneral}</h3>`;

  html += `<h4>📅 Ventas por Mes</h4><ul>`;
  for (let mes in porMes) {
    html += `<li>${mes} → $${porMes[mes]}</li>`;
  }
  html += `</ul>`;

  html += `<h4>📆 Ventas por Día</h4><ul>`;
  for (let dia in porDia) {
    html += `<li>${dia} → $${porDia[dia]}</li>`;
  }
  html += `</ul>`;

  html += `<button onclick="menuReportes()">⬅ Volver</button>`;

  getContent().innerHTML = html;
}

function verContactos() {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (reservas.length === 0) {
    getContent().innerHTML = "<h2>No hay contactos aún</h2>";
    return;
  }

  let contactos = [];

  reservas.forEach(r => {
    let existe = contactos.some(c => c.telefono === r.telefono);

    if (!existe) {
      contactos.push({
        nombre: r.cliente,
        telefono: r.telefono,
        email: r.email
      });
    }
  });

  let html = `<h2>👥 Contactos</h2><ul>`;

  contactos.forEach(c => {
    html += `
      <li>
        <strong>${c.nombre}</strong><br>
        📞 ${c.telefono}<br>
        ✉️ ${c.email}
      </li><br>
    `;
  });

  html += `</ul>
    <button onclick="menuReportes()">⬅ Volver</button>
  `;

  getContent().innerHTML = html;
}

// =======================
// 🎟️ VOUCHER
// =======================
function verVoucher(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  let r = reservas[index];

  getContent().innerHTML = `
    <div class="voucher-container">

      <div style="text-align:center; margin-bottom:10px;">
        <img src="assets/logo.png" class="voucher-logo">
        <p style="margin:3px 0; font-size:12px;">📞 +1 829-331-9938</p>
        <p style="margin:0; font-size:12px;">📧 info@puntacanagoing.com</p>
      </div>

      <h2 class="voucher-title">Punta Cana Going TOURS</h2>
      <p class="voucher-subtitle">Tour Voucher</p>

      <hr>

      <div class="voucher-info">
        <p><strong>Cliente:</strong> ${r.cliente}</p>
        <p><strong>Hotel:</strong> ${r.hotel}</p>
        <p><strong>Excursión:</strong> ${r.excursion}</p>
        <p><strong>Adultos:</strong> ${r.adultos} | <strong>Niños:</strong> ${r.ninos}</p>
        <p><strong>Pickup:</strong> ${r.pickup || "-"}</p>
        <p><strong>Fecha:</strong> ${r.fecha}</p>
        <p class="precio"><strong>Total:</strong> $${r.precio}</p>
      </div>

      <hr>

      <div class="voucher-policies">
        <h4>POLÍTICAS DE CANCELACIÓN Y REEMBOLSO</h4>
        <p>
        a) Cancelaciones/reembolsos proceden con más de 48 horas antes del inicio del tour...<br>
        b) Se requiere certificado médico...<br>
        c) No cambios el mismo día...<br>
        d) No reembolso por no show...<br>
        e) Descuentos no reembolsables...<br>
        f) No cancelaciones Cirque du Soleil.
        </p>

        <h4>CANCELLATION & REFUND POLICIES</h4>
        <p>
        a) Cancellation/refund proceeds with more than 48 hrs...<br>
        b) Medical certificate required...<br>
        c) No same-day changes...<br>
        d) No refunds for no-show...<br>
        e) Discounts non-refundable...<br>
        f) No cancellations Cirque du Soleil.
        </p>
      </div>

      <div class="voucher-actions">
        <button onclick="window.print()">🖨️ Imprimir</button>
        <button onclick="enviarWhatsApp(${index})">📲 WhatsApp</button>
        <button onclick="enviarEmail(${index})">✉️ Email</button>
      </div>

    </div>
  `;
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

// =======================
// 🔄 RESTAURAR SESIÓN
// =======================
window.onload = function () {
  if (localStorage.getItem("session") === "active") {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";

    getContent().innerHTML = `
      <h1>Dashboard</h1>
      <p>Bienvenido a Punta Cana Going</p>
    `;
  } else {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }
};
