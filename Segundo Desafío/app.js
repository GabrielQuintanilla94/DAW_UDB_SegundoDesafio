// =========================
// Utilidades
// =========================
const $ = s => document.querySelector(s);
const two = n => Number(n).toFixed(2);
const fmt = (n) => (Number(n) >= 0 ? `+ ${two(n)}` : `- ${two(Math.abs(n))}`);

const estado = {
  ingresos: [], // {desc, monto}
  egresos : []  // {desc, monto}
};

// =========================
// Inicialización de cabecera
// =========================
function nombreMes(fecha = new Date()) {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const m = meses[fecha.getMonth()];
  const y = fecha.getFullYear();
  // Capitalizar (como en el mockup)
  const mesCap = m.charAt(0).toUpperCase() + m.slice(1);
  return `${mesCap} ${y}`;
}

function renderCabecera() {
  // Título
  $('#tituloMes').textContent = `Presupuesto de ${nombreMes()}`;

  // Totales
  const totalIng = totalIngresos();
  const totalEgr = totalEgresos();
  const presupuesto = totalIng - totalEgr;

  $('#totalIngresos').textContent = fmt(totalIng);
  $('#totalEgresos').textContent  = fmt(-totalEgr); // muestra con signo negativo
  $('#presupuestoTotal').textContent = (presupuesto >= 0 ? '+ ' : '- ') + two(Math.abs(presupuesto));

  // % Gastos = Egresos * 100 / Ingresos
  let pct = 0;
  if (totalIng > 0) pct = Math.round((totalEgr * 100) / totalIng);
  $('#porcentajeGastos').textContent = `${isFinite(pct) ? pct : 0}%`;
}

// =========================
// Totales
// =========================
const totalIngresos = () => estado.ingresos.reduce((acc, t) => acc + Number(t.monto), 0);
const totalEgresos  = () => estado.egresos.reduce((acc, t) => acc + Number(t.monto), 0);

// =========================
// Render de listas
// =========================
function renderIngresos() {
  const cont = $('#listaIngresos');
  if (!estado.ingresos.length) {
    cont.innerHTML = `<div class="text-muted small">No hay ingresos.</div>`;
    return;
  }
  cont.innerHTML = estado.ingresos.map(t => `
    <div class="item">
      <div>${t.desc}</div>
      <div class="text-success font-weight-bold">${fmt(t.monto)}</div>
    </div>
  `).join('');
}

function renderEgresos() {
  const cont = $('#listaEgresos');
  const ingresos = totalIngresos();
  if (!estado.egresos.length) {
    cont.innerHTML = `<div class="text-muted small">No hay egresos.</div>`;
    return;
  }
  cont.innerHTML = estado.egresos.map(t => {
    const pct = ingresos > 0 ? Math.round((Number(t.monto) * 100) / ingresos) : 0;
    return `
      <div class="item">
        <div>${t.desc}</div>
        <div class="d-flex align-items-center">
          <span class="mr-2 text-danger font-weight-bold">${fmt(-t.monto)}</span>
          <span class="badge-pill-dark">${pct}%</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderTodo() {
  renderCabecera();
  renderIngresos();
  renderEgresos();
}

// =========================
/* Tabs hechas con JS vanilla */
// =========================
function activarTab(tab) {
  const btnIng = $('#tabIngresos');
  const btnEgr = $('#tabEgresos');
  const listaIng = $('#listaIngresos');
  const listaEgr = $('#listaEgresos');

  if (tab === 'ingresos') {
    btnIng.classList.add('active'); btnEgr.classList.remove('active');
    listaIng.classList.remove('d-none'); listaEgr.classList.add('d-none');
  } else {
    btnEgr.classList.add('active'); btnIng.classList.remove('active');
    listaEgr.classList.remove('d-none'); listaIng.classList.add('d-none');
  }
}

// =========================
// Formulario
// =========================
$('#formTransaccion').addEventListener('submit', (e) => {
  e.preventDefault();

  const tipo = $('#tipo').value;           // ingreso | egreso
  const desc = $('#descripcion').value.trim();
  const monto = Number($('#monto').value);

  // Validaciones básicas
  if (!desc) { alert('Ingrese una descripción.'); return; }
  if (!Number.isFinite(monto) || monto <= 0) { alert('Ingrese un monto válido (> 0).'); return; }

  const tx = { desc, monto: Number(two(monto)) }; // redondeo con toFixed(2)

  if (tipo === 'ingreso')  estado.ingresos.unshift(tx);
  if (tipo === 'egreso')   estado.egresos.unshift(tx);

  // Render
  renderTodo();

  // Reset del form
  e.target.reset();
  $('#tipo').value = tipo; // deja seleccionado el último tipo usado
});

// =========================
// Eventos de tabs
// =========================
$('#tabIngresos').addEventListener('click', () => activarTab('ingresos'));
$('#tabEgresos').addEventListener('click', () => activarTab('egresos'));

// =========================
// Arranque
// =========================
document.addEventListener('DOMContentLoaded', () => {
  activarTab('ingresos'); // por defecto
  renderTodo();
});