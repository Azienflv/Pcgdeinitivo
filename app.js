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
    }
  });
});

// =============================
// 🔥 FORMULARIO AUTOMÁTICO
// =============================
function loadForm() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];

  let opciones = `<option value="">Seleccionar excursión</option>`;
  productos.forEach((p, index) => {
    opciones += `<option value="${index}">${p.nombre}</option>`;
  });

  content.innerHTML = `
    <h2>Nueva Reserva</h2>

    <form id="reservaForm">
      <input type="text" id="cliente" placeholder="Nombre del cliente" required>

      <input type="tel" id="telefono" placeholder="Teléfono" required>
      <input type="email" id="email" placeholder="Email" required>

      <input type="text" id="hotel" placeholder="Hotel" required>

      <select id="excursion" required>
        ${opciones}
      </select>

      <input type="number" id="adultos" placeholder="Adultos" min="1" required>
      <input type="number" id="ninos" placeholder="Niños" min="0">

      <label>Pick Up Time</label>
      <input type="time" id="pickup" required>

      <input type="date" id="fecha" required>

      <input type="number" id="precio" placeholder="Total" readonly>

      <button type="submit">Guardar Reserva</button>
    </form>
  `;

  // Eventos para calcular precio
  document.getElementById("excursion").addEventListener("change", calcularTotal);
  document.getElementById("adultos").addEventListener("input", calcularTotal);
  document.getElementById("ninos").addEventListener("input", calcularTotal);

  document
    .getElementById("reservaForm")
    .addEventListener("submit", guardarReserva);
}

// =============================
// 💰 CALCULAR TOTAL
// =============================
function calcularTotal() {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];

  let index = document.getElementById("excursion").value;
  let adultos = parseInt(document.getElementById("adultos").value) || 0;
  let ninos = parseInt(document.getElementById("ninos").value) || 0;

  if (index === "") return;

  let producto = productos[index];

  let total =
    adultos * parseFloat(producto.precioAdulto) +
    ninos * parseFloat(producto.precioNino);

  document.getElementById("precio").value = total;
}

// =============================
// 💾 GUARDAR
// =============================
function guardarReserva(e) {
  e.preventDefault();

  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let index = document.getElementById("excursion").value;
  let producto = productos[index];

  const reserva = {
    cliente: document.getElementById("cliente").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
    hotel: document.getElementById("hotel").value,
    excursion: producto.nombre,
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

// =============================
// 📋 MOSTRAR RESERVAS
// =============================
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
        <th>Teléfono</th>
        <th>Email</th>
        <th>Hotel</th>
        <th>Excursión</th>
        <th>Adultos</th>
        <th>Niños</th>
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
        <td>${r.telefono}</td>
        <td>${r.email}</td>
        <td>${r.hotel}</td>
        <td>${r.excursion}</td>
        <td>${r.adultos}</td>
        <td>${r.ninos}</td>
        <td>${r.pickup}</td>
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

// =============================
// 🗑️ ELIMINAR
// =============================
function eliminarReserva(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (confirm("¿Seguro que quieres eliminar esta reserva?")) {
    reservas.splice(index, 1);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    mostrarReservas();
  }
}
