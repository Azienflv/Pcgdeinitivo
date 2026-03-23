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

// FORMULARIO
function loadForm() {
  content.innerHTML = `
    <h2>Nueva Reserva</h2>

    <form id="reservaForm">
      <input type="text" id="cliente" placeholder="Nombre del cliente" required><br><br>

      <input type="tel" id="telefono" placeholder="Teléfono" required><br><br>
      <input type="email" id="email" placeholder="Email" required><br><br>

      <input type="text" id="hotel" placeholder="Hotel" required><br><br>
      <input type="text" id="excursion" placeholder="Excursión" required><br><br>

      <input type="number" id="adultos" placeholder="Adultos" min="1" required><br><br>
      <input type="number" id="ninos" placeholder="Niños" min="0"><br><br>

      <label>Pick Up Time</label><br>
      <input type="time" id="pickup" required><br><br>

      <input type="date" id="fecha" required><br><br>
      <input type="number" id="precio" placeholder="Precio" required><br><br>

      <button type="submit">Guardar Reserva</button>
    </form>
  `;

  document
    .getElementById("reservaForm")
    .addEventListener("submit", guardarReserva);
}

// GUARDAR
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

// MOSTRAR RESERVAS
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

// VOUCHER
function verVoucher(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  let r = reservas[index];

  content.innerHTML = `
    <div class="voucher-container">

      <img src="assets/logo.png" class="voucher-logo">

      <h2 class="voucher-title">PCG TOURS</h2>
      <p class="voucher-subtitle">Tour Voucher</p>

      <hr>

      <div class="voucher-info">
        <p><strong>Cliente:</strong> ${r.cliente}</p>
        <p><strong>Teléfono:</strong> ${r.telefono}</p>
        <p><strong>Email:</strong> ${r.email}</p>
        <p><strong>Hotel:</strong> ${r.hotel}</p>
        <p><strong>Excursión:</strong> ${r.excursion}</p>
        <p><strong>Adultos:</strong> ${r.adultos} | <strong>Niños:</strong> ${r.ninos}</p>
        <p><strong>Pickup:</strong> ${r.pickup}</p>
        <p><strong>Fecha:</strong> ${r.fecha}</p>
        <p class="precio"><strong>Total:</strong> $${r.precio}</p>
      </div>

      <hr>

      <div class="voucher-policies">
        <h4>Políticas / Policies</h4>

        <p><strong>ES:</strong> Cancelaciones con 48 hrs de anticipación. 
        No se aceptan cambios el mismo día. No hay reembolsos por no presentarse. 
        No aplican reembolsos en promociones o paquetes.</p>

        <p><strong>EN:</strong> Cancellations must be made 48 hours in advance. 
        No same-day changes. No refunds for no-shows. 
        No refunds on discounted or package deals.</p>
      </div>

      <div class="voucher-actions">
        <button onclick="window.print()">🖨️ Imprimir / PDF</button>
        <button onclick="mostrarReservas()">⬅ Volver</button>
      </div>

    </div>
  `;
}

// ELIMINAR
function eliminarReserva(index) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (confirm("¿Seguro que quieres eliminar esta reserva?")) {
    reservas.splice(index, 1);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    mostrarReservas();
  }
}
