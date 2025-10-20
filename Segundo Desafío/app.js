// =========================
// Utilidades
// =========================
const $ = s => document.querySelector(s);
const two = n => Number(n).toFixed(2);
const fmt = (n) => (Number(n) >= 0 ? `+ ${two(n)}` : `- ${two(Math.abs(n))}`);

const estado = {
  ingresos: [], // {desc, monto}
  egresos: []  // {desc, monto}
};

// =========================
// Inicialización de cabecera
// =========================
// Fecha actual usada por la cabecera (mes/año seleccionados)
let fechaActual = new Date();

// Devuelve nombre del mes y año (usa fechaActual por defecto)
function nombreMes(fecha = fechaActual) {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const m = meses[fecha.getMonth()];
  const y = fecha.getFullYear();
  const mesCap = m.charAt(0).toUpperCase() + m.slice(1);
  return `${mesCap} ${y}`;
}

// Fija la fecha actual y actualiza la UI
function setFecha(fecha) {
  fechaActual = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  // Actualiza selects/inputs si existen
  const sel = $('#mesSelect');
  const yinput = $('#yearInput');
  if (sel) sel.value = String(fechaActual.getMonth());
  if (yinput) yinput.value = String(fechaActual.getFullYear());
  // Re-render de cabecera (y listas si en el futuro dependieran de la fecha)
  renderCabecera();
}

// Cambia mes por delta (puede ser negativo)
function cambiarMes(delta) {
  const f = new Date(fechaActual);
  f.setMonth(f.getMonth() + delta);
  setFecha(f);
}

// Cambia año por delta
function cambiarAno(delta) {
  const f = new Date(fechaActual);
  f.setFullYear(f.getFullYear() + delta);
  setFecha(f);
}

// Inicializa controles para cambiar mes/año (si existen en el DOM)
function initControlesMes() {
  // Botones prev/next (ids: mesPrev, mesNext)
  const prev = $('#mesPrev');
  const next = $('#mesNext');
  if (prev) prev.addEventListener('click', () => cambiarMes(-1));
  if (next) next.addEventListener('click', () => cambiarMes(1));

  // Select de meses (id: mesSelect) - opciones 0..11
  const sel = $('#mesSelect');
  if (sel) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    sel.innerHTML = meses.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    sel.value = String(fechaActual.getMonth());
    sel.addEventListener('change', (e) => {
      const newMonth = Number(e.target.value);
      const f = new Date(fechaActual);
      f.setMonth(newMonth);
      setFecha(f);
    });
  }

  // Input de año (id: yearInput)
  const yinput = $('#yearInput');
  if (yinput) {
    yinput.value = String(fechaActual.getFullYear());
    yinput.addEventListener('change', (e) => {
      const y = parseInt(e.target.value, 10);
      if (Number.isFinite(y)) {
        const f = new Date(fechaActual);
        f.setFullYear(y);
        setFecha(f);
      }
    });
  }

  // Click en el título para cambiar mes/año por prompt (fallback)
  const titulo = $('#tituloMes');
  if (titulo) {
    titulo.addEventListener('click', () => {
      const entrada = prompt('Ingrese mes y año en formato MM-YYYY (ej: 04-2025):', `${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${fechaActual.getFullYear()}`);
      if (!entrada) return;
      const m = entrada.split('-').map(s => s.trim());
      if (m.length === 2) {
        const mm = parseInt(m[0], 10);
        const yy = parseInt(m[1], 10);
        if (Number.isFinite(mm) && Number.isFinite(yy) && mm >= 1 && mm <= 12) {
          setFecha(new Date(yy, mm - 1, 1));
        } else {
          alert('Formato inválido.');
        }
      } else {
        alert('Formato inválido.');
      }
    });
  }

  // Render inicial de cabecera para sincronizar texto/controles
  renderCabecera();
}

// Inicializar controles cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initControlesMes);

function renderCabecera() {
  // Título
  $('#tituloMes').textContent = `Presupuesto de ${nombreMes()}`;

  // Totales
  const totalIng = totalIngresos();
  const totalEgr = totalEgresos();
  const presupuesto = totalIng - totalEgr;

  // Ingresos
  const totalIngElem = $('#totalIngresos');
  totalIngElem.textContent = fmt(totalIng);
  totalIngElem.className = `font-weight-bold ${totalIng >= 0 ? 'text-info' : 'text-danger'}`;

  // Egresos
  const totalEgrElem = $('#totalEgresos');
  totalEgrElem.textContent = fmt(-totalEgr);
  totalEgrElem.className = `font-weight-bold ${totalEgr >= 0 ? 'text-warning' : 'text-danger'}`;

 // Presupuesto
  const presElem = $('#presupuestoTotal');
  presElem.textContent = (presupuesto > 0 ? '+ ' : presupuesto < 0 ? '- ' : '') + two(Math.abs(presupuesto));
  presElem.className = `display-4 font-weight-bold ${presupuesto > 0 ? 'text-success' :
      presupuesto < 0 ? 'text-danger' :
        'text-white'  
    }`;



  // % Gastos = Egresos * 100 / Ingresos
  let pct = 0;
  if (totalIng > 0) pct = Math.round((totalEgr * 100) / totalIng);
  $('#porcentajeGastos').textContent = `${isFinite(pct) ? pct : 0}%`;
}

// =========================
// Totales
// =========================
const totalIngresos = () => estado.ingresos.reduce((acc, t) => acc + Number(t.monto), 0);
const totalEgresos = () => estado.egresos.reduce((acc, t) => acc + Number(t.monto), 0);

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

  if (tipo === 'ingreso') estado.ingresos.unshift(tx);
  if (tipo === 'egreso') estado.egresos.unshift(tx);

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
