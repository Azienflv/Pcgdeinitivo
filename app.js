// Sidebar toggle
// 🔹 Función para generar IDs seguros
function safeId(text) {
  return text.replace(/\s+/g, "_").replace(/[^\w]/g, "");
}

// Aquí empieza tu código
document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const toggleBtn = document.getElementById("toggleBtn");
  const menuItems = document.querySelectorAll(".menu-item");
  window.content = document.getElementById("content");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      main.classList.toggle("shift");
    });
  }

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const text = item.textContent.trim();

      if (text === "Nueva Reserva") loadForm();
      else if (text === "Reservas") mostrarReservas();
      else if (text === "Nuevo Producto") menuProductos();
    });
  });

});


// =======================
// =======================
// 📦 MENÚ PRODUCTOS
// =======================
function menuProductos() {
  content.innerHTML = `
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
  content.innerHTML = `
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
    content.innerHTML = `
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
  content.innerHTML = html;
}

function actualizarProducto(index) {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];

  productos[index].nombre = document.getElementById(`nombre-${index}`).value;
  productos[index].adulto = parseFloat(document.getElementById(`adulto-${index}`).value);
  productos[index].nino = parseFloat(document.getElementById(`nino-${index}`).value);

  localStorage.setItem("productos", JSON.stringify(productos));
  alert("Producto actualizado ✅");
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
  content.innerHTML = `
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

  content.innerHTML = `
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
    nombre: document.getElementById("nombreHotel").value,
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
    content.innerHTML = `<h2>No hay hoteles</h2>`;
    return;
  }

  let html = `<h2>Hoteles</h2>`;

  hoteles.forEach((h, index) => {
    html += `<h4>${h.nombre}</h4><ul>`;

    for (let exc in h.pickups) {
      html += `<li>${exc} → ${h.pickups[exc] || "Sin horario"}</li>`;
    }

    html += `</ul>
      <button onclick="editarHotel(${index})">✏️ Editar</button>
<button onclick="eliminarHotel(${index})">❌ Eliminar</button>
  });

  html += `<button onclick="menuHoteles()">⬅ Volver</button>`;
  content.innerHTML = html;
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

  content.innerHTML = `
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

  // actualizar nombre
  hotel.nombre = document.getElementById("edit_nombreHotel").value;

  // actualizar pickups (CON safeId)
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

  content.innerHTML = `
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
      <input type="number" id="descuento" placeholder="Ej: 10" min="0" value="0">

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


// =======================
// ⚡ AUTO PRECIO + PICKUP
// =======================
function autoDatos() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];

  let excursion = document.getElementById("excursion").value;
  let hotelNombre = document.getElementById("hotel").value;

  let adultos = parseInt(document.getElementById("adultos").value) || 0;
  let ninos = parseInt(document.getElementById("ninos").value) || 0;
  let descuento = parseFloat(document.getElementById("descuento").value) || 0;

  // ✅ PRODUCTO (usa adulto/nino correctamente)
  let producto = productos.find(p => p.nombre === excursion);

  if (producto) {
    let total = (adultos * producto.adulto) + (ninos * producto.nino);

    // ✅ aplicar descuento SIN romper
    total = total - descuento;
    if (total < 0) total = 0;

    document.getElementById("precio").value = total;
  } else {
    document.getElementById("precio").value = "";
  }

  // ✅ PICKUP (estructura correcta)
  let hotel = hoteles.find(h => h.nombre === hotelNombre);

  if (hotel && hotel.pickups && hotel.pickups[excursion]) {
    document.getElementById("pickup").value = hotel.pickups[excursion];
  } else {
    document.getElementById("pickup").value = "";
  }
}
// =======================
// 💾 GUARDAR RESERVA
// =======================
function guardarReserva(e) {
  e.preventDefault();

  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  let precioFinal = parseFloat(document.getElementById("precio").value) || 0;
  let descuento = parseFloat(document.getElementById("descuento").value) || 0;

  let nuevaReserva = {
    cliente: document.getElementById("cliente").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
    hotel: document.getElementById("hotel").value,
    excursion: document.getElementById("excursion").value,
    adultos: document.getElementById("adultos").value,
    ninos: document.getElementById("ninos").value,
    pickup: document.getElementById("pickup").value,
    fecha: document.getElementById("fecha").value,
    precio: precioFinal,
    descuento: descuento
  };

  reservas.push(nuevaReserva);
  localStorage.setItem("reservas", JSON.stringify(reservas));

  alert("Reserva guardada correctamente");
  mostrarReservas();
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

