// Sidebar toggle
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const toggleBtn = document.getElementById("toggleBtn");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  main.classList.toggle("shift");
});

// Menú activo + navegación
const menuItems = document.querySelectorAll(".menu-item");
const content = document.getElementById("content");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // Activar selección visual
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const text = item.textContent.trim();

    if (text === "Nueva Reserva") {
      loadForm();
    }
  });
});

// Cargar formulario
function loadForm() {
  content.innerHTML = `
    <h2>Nueva Reserva</h2>

    <form id="reservaForm">
      <input type="text" id="cliente" placeholder="Nombre del cliente" required><br><br>
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

// Guardar reserva
function guardarReserva(e) {
  e.preventDefault();

  const reserva = {
    cliente: document.getElementById("cliente").value,
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

  // Limpiar formulario
  document.getElementById("reservaForm").reset();
}
