// Sidebar toggle
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const toggleBtn = document.getElementById("toggleBtn");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  main.classList.toggle("shift");
});

// Menú + navegación
const menuItems = document.querySelectorAll(".menu-item");
const content = document.getElementById("content");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const text = item.textContent.trim();

    if (text === "Nueva Reserva") {
      loadForm();
    } else if (text === "Reservas") {
      mostrarReservas();
    } else if (text === "Nuevo Producto") {
      menuProductos();
    }
  });
});


// =======================
// 📦 MENÚ PRODUCTOS
// =======================
function menuProductos() {
  content.innerHTML = `
    <h2>Gestión de Productos</h2>

    <div style="display:flex; gap:10px; margin-bottom:20px;">
      <button onclick="loadProducto()">➕ Excursiones</button>
      <button onclick="editarProductos()">✏️ Editar Productos</button>
    </div>

    <p>Selecciona una opción</p>
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

  document
    .getElementById("productoForm")
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
// ✏️ EDITAR PRODUCTOS (PRO 🔥)
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

  let html = `
    <h2>Editar Productos</h2>
  `;

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
// 🧾 FORMULARIO RESERVA
// =======================
function loadForm() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];

  let opciones = productos.map(p => 
    `<option value="${p.nombre}">${p.nombre}</option>`
  ).join("");

  content.innerHTML = `
    <h2>Nueva Reserva</h2>

    <form id="reservaForm">
      <input type="text" id="cliente" placeholder="Nombre del cliente" required>

      <input type="tel" id="telefono" placeholder="Teléfono" required>
      <input type="email" id="email" placeholder="Email" required>

      <input type="text" id="hotel" placeholder="Hotel" required>

      <select id="excursion" required>
        <option value="">Seleccionar excursión</option>
        ${opciones}
      </select>

      <input type="number" id="adultos" placeholder="Adultos" min="1" required>
      <input type="number" id="ninos" placeholder="Niños" min="0">

      <label>Pick Up Time</label>
      <input type="time" id="pickup" required>

      <input type="date" id="fecha" required>

      <input type="number" id="precio" placeholder="Precio total" readonly>

      <button type="submit">Guardar Reserva</button>
    </form>
  `;

  document.getElementById("excursion").addEventListener("change", calcularPrecio);
  document.getElementById("adultos").addEventListener("input", calcularPrecio);
  document.getElementById("ninos").addEventListener("input", calcularPrecio);

  document
    .getElementById("reservaForm")
    .addEventListener("submit", guardarReserva);
}


// =======================
// 💰 CALCULAR PRECIO
// =======================
function calcularPrecio() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];

  let nombre = document.getElementById("excursion").value;
  let adultos = parseInt(document.getElementById("adultos").value) || 0;
  let ninos = parseInt(document.getElementById("ninos").value) || 0;

  let producto = productos.find(p => p.nombre === nombre);

  if (!producto) return;

  let total = (adultos * producto.adulto) + (ninos * producto.nino);

  document.getElementById("precio").value = total;
}


// =======================
// 💾 GUARDAR RESERVA
// =======================
function guardarReserva(e) {
  e.preventDefault();

  const reserva = {
    cliente: document.getElementById("cliente").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
    hotel: document.getElementById("hotel").value,
    excursion: document.getElementById("excursion").value,
    adultos: document.getElementById("adultos").value,
    ninos: document.getElementById("ninos").value || 0,
    pickup: document.getElementById("pickup").value,
    fecha: document.getElementById("fecha").value,
    precio: document.getElementById("precio").value
  };

  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  reservas.push(reserva);

  localStorage.setItem("reservas", JSON.stringify(reservas));

  alert("Reserva guardada ✅");
  document.getElementById("reservaForm").reset();
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
        <th>Excursión</th>
        <th>Precio</th>
        <th>Acciones</th>
      </tr>
  `;

  reservas.forEach((r, index) => {
    tabla += `
      <tr>
        <td>${r.cliente}</td>
        <td>${r.excursion}</td>
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
        <p><strong>Pickup:</strong> ${r.pickup}</p>
        <p><strong>Fecha:</strong> ${r.fecha}</p>
        <p class="precio"><strong>Total:</strong> $${r.precio}</p>
      </div>

      <div class="voucher-actions">
        <button onclick="window.print()">🖨️ Imprimir</button>
        <button onclick="mostrarReservas()">⬅ Volver</button>
      </div>

    </div>
  `;
}


// =======================
// ❌ ELIMINAR RESERVA
// =======================
function eliminarReserva(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (confirm("¿Eliminar reserva?")) {
    reservas.splice(index, 1);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    mostrarReservas();
  }
}
