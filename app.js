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

    if (text === "Nueva Reserva") loadForm();
    else if (text === "Reservas") mostrarReservas();
    else if (text === "Nuevo Producto") menuProductos();
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
// 🏨 HOTELES (NUEVO 🔥)
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

  let inputs = productos.map(p => `
    <label>${p.nombre}</label>
    <input type="time" id="pickup_${p.nombre}">
  `).join("");

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
    hotel.pickups[p.nombre] =
      document.getElementById(`pickup_${p.nombre}`).value || "";
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
      <button onclick="eliminarHotel(${index})">❌ Eliminar</button>
      <hr>`;
  });

  html += `<button onclick="menuHoteles()">⬅ Volver</button>`;
  content.innerHTML = html;
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

      <button type="submit">Guardar Reserva</button>
    </form>
  `;

  document.getElementById("excursion").addEventListener("change", autoDatos);
  document.getElementById("hotel").addEventListener("change", autoDatos);
  document.getElementById("adultos").addEventListener("input", autoDatos);
  document.getElementById("ninos").addEventListener("input", autoDatos);

  document.getElementById("reservaForm")
    .addEventListener("submit", guardarReserva);
}


// =======================
// ⚡ AUTO PRECIO + PICKUP
// =======================
function autoDatos() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let hoteles = JSON.parse(localStorage.getItem("hoteles")) || [];

  let exc = document.getElementById("excursion").value;
  let hotelNombre = document.getElementById("hotel").value;

  let adultos = parseInt(document.getElementById("adultos").value) || 0;
  let ninos = parseInt(document.getElementById("ninos").value) || 0;

  let producto = productos.find(p => p.nombre === exc);
  let hotel = hoteles.find(h => h.nombre === hotelNombre);

  if (producto) {
    let total = (adultos * producto.adulto) + (ninos * producto.nino);
    document.getElementById("precio").value = total;
  }

  if (hotel && hotel.pickups[exc]) {
    document.getElementById("pickup").value = hotel.pickups[exc];
  }
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
