// 🔹 Función para IDs seguros
function safeId(text) {
  return text.replace(/\s+/g, "_").replace(/[^\w]/g, "");
}

// 🔹 SIEMPRE usa esto (clave del fix)
function getContent() {
  return document.getElementById("content");
}

// =======================
// 🚀 INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {

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
      item.addEventListener("click", () => {
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

    <div style="display:flex; gap:10px; margin-bottom:20px;">
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
    nombre: document.getElementById("nombreExcursion").value,
    adulto: parseFloat(document.getElementById("precioAdulto").value),
    nino: parseFloat(document.getElementById("precioNino").value)
  };

  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  productos.push(producto);

  localStorage.setItem("productos", JSON.stringify(productos));

  alert("Excursión guardada ✅");
  document.getElementById("productoForm").reset();
}

// =======================
// ✏️ EDITAR PRODUCTOS
// =======================
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
        <button onclick="actualizarProducto(${index})">💾</button>
        <button onclick="eliminarProducto(${index})">❌</button>
      </div>
    `;
  });

  html += `<button onclick="menuProductos()">⬅ Volver</button>`;
  getContent().innerHTML = html;
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

  html += `<button onclick="menuHoteles()">⬅ Volver</button>`;
  getContent().innerHTML = html;
}

function loadForm() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];

  let opcionesExc = productos.map(p =>
    `<option value="${p.nombre}">${p.nombre}</option>`
  ).join("");

  let opcionesHoteles = hoteles.map(h =>
    `<option value="${h.nombre}">${h.nombre}</option>`
  ).join("");

  content.innerHTML = `
    <h2>Nueva Reserva</h2>

    <form id="reservaForm">
      
      <!-- 👤 CLIENTE -->
      <input type="text" id="cliente" placeholder="Nombre del cliente" required>
      <input type="tel" id="telefono" placeholder="Teléfono" required>
      <input type="email" id="email" placeholder="Email" required>

      <!-- 🏨 HOTEL -->
      <select id="hotel" required>
        <option value="">Seleccionar hotel</option>
        ${opcionesHoteles}
      </select>

      <!-- 🌴 EXCURSIÓN -->
      <select id="excursion" required>
        <option value="">Seleccionar excursión</option>
        ${opcionesExc}
      </select>

      <!-- 👨‍👩‍👧 PASAJEROS -->
      <input type="number" id="adultos" placeholder="Adultos" min="1" required>
      <input type="number" id="ninos" placeholder="Niños" min="0">

      <!-- ⏰ PICKUP -->
      <label>Pick Up Time</label>
      <input type="time" id="pickup" readonly>

      <!-- 📅 FECHA -->
      <input type="date" id="fecha" required>

      <!-- 💰 PRECIO -->
      <input type="number" id="precio" placeholder="Precio total" readonly>

      <!-- 🔥 DESCUENTO -->
      <label>Descuento ($)</label>
      <input type="number" id="descuento" value="0" min="0">

      <button type="submit">Guardar Reserva</button>

    </form>
  `;

  // 🔥 EVENTOS (CLAVE)
  document.getElementById("excursion").addEventListener("change", autoDatos);
  document.getElementById("hotel").addEventListener("change", autoDatos);
  document.getElementById("adultos").addEventListener("input", autoDatos);
  document.getElementById("ninos").addEventListener("input", autoDatos);
  document.getElementById("descuento").addEventListener("input", autoDatos);

  document.getElementById("reservaForm")
    .addEventListener("submit", guardarReserva);
}


// =======================
// ⚡ AUTO DATOS (FIX CLAVE)
// =======================
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
  }

  let hotel = hoteles.find(h => h.nombre === hotelNombre);

  if (hotel && hotel.pickups) {
    document.getElementById("pickup").value =
      hotel.pickups[excursion] || "";
  }
}

// =======================
// 📊 MOSTRAR RESERVAS
// =======================
function mostrarReservas() {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (reservas.length === 0) {
    content.innerHTML = "<h2>No hay reservas aún</h2>";
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
  content.innerHTML = tabla;
}

// =======================
// ❌ ELIMINAR RESERVA
// =======================
function eliminarReserva(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (confirm("¿Seguro que quieres eliminar esta reserva?")) {
    reservas.splice(index, 1);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    mostrarReservas(); // refresca la tabla
  }
}

function menuReportes() {
  content.innerHTML = `
    <h2>📊 Reportes</h2>

    <div style="display:flex; gap:10px; margin-bottom:20px;">
      <button onclick="reporteVentas()">💰 Ventas por Mes</button>
      <button onclick="verContactos()">👥 Contactos</button>
    </div>
  `;
}

function reporteVentas() {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (reservas.length === 0) {
    content.innerHTML = "<h2>No hay ventas aún</h2>";
    return;
  }

  let resumen = {};

  reservas.forEach(r => {
    let mes = r.fecha.slice(0, 7); // YYYY-MM

    if (!resumen[mes]) resumen[mes] = 0;

    resumen[mes] += parseFloat(r.precio) || 0;
  });

  let html = `<h2>💰 Ventas por Mes</h2><ul>`;

  for (let mes in resumen) {
    html += `<li>${mes} → $${resumen[mes]}</li>`;
  }

  html += `</ul>
    <button onclick="menuReportes()">⬅ Volver</button>
  `;

  content.innerHTML = html;
}
// =======================
// 🎟️ VOUCHER
// =======================
function verVoucher(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  let r = reservas[index];

  content.innerHTML = `
    <div class="voucher-container">

      <div style="text-align:center; margin-bottom:10px;">
        <img src="assets/logo.png" class="voucher-logo">
        <p style="margin:3px 0; font-size:12px;">📞 +1 829-XXX-XXXX</p>
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
        a) Cancelaciones/reembolsos proceden con más de 48 horas antes del inicio del tour y es obligatorio presentar el recibo original.<br>
        b) Se requiere certificado médico para cancelaciones por razones de salud.<br>
        c) No se permiten cambios el mismo día de la excursión.<br>
        d) No hay reembolso por no presentarse.<br>
        e) Descuentos no son reembolsables.<br>
        f) No cancelaciones para excursiones de Cirque du Soleil.
        </p>

        <h4>CANCELLATION & REFUND POLICIES</h4>
        <p>
        a) Cancellation/refund proceeds with more than 48 hrs. prior to tour commencement and it is mandatory to return the original receipt.<br>
        b) Medical certificate is required for any cancellation due to health conditions.<br>
        c) No changes are allowed on the same day of the excursion.<br>
        d) No refunds will be issued for no-shows.<br>
        e) Discounts are non-refundable.<br>
        f) No cancellations for Cirque du Soleil excursions.
        </p>
      </div>

      <div class="voucher-actions">
        <button onclick="window.print()">🖨️ Imprimir</button>
        <button onclick="mostrarReservas()">⬅ Volver</button>
      </div>

    </div>
  `;
}

