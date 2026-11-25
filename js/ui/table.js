import { tbody, openExportBtn } from './dom.js';
import { state } from '../state.js';
import { COLS, COLUMNS, FIXED_COLS, FLEX_COLS, FLEX_MIN_PX } from '../config.js';
import { cell, fmt, isSoloSku, utmSuffix } from '../utils.js';
import { FILTERS, renderSummary } from './filters.js';
import { focusRow } from './preview.js';
import { makeEditable } from './editable.js';
import { withCopy } from './copy.js';
import { syncManualButton, resetManualCheck } from '../feed/manual.js';

const TRASH_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>
</svg>`;

// Fila manual nueva, con la página de la fila de referencia.
function newManualRow(after) {
  const ref = state.rows[after] ?? state.rows[0];
  const page = ref?.pages?.[0] ?? 1;
  return {
    manual: true,
    activo: true,
    sku: '',
    feedCheck: undefined,   // undefined = sin revisar, 'found' = en feed, 'missing' = fuera de feed
    feedId: null, feedTitle: null, feedVia: null, feedError: null,
    title: 'n/a', titleFound: false,
    url: '',
    originalPrice: null, currentPrice: null, cashPrice: null, biweekly: null,
    flags: ['manual'],
    pages: [page],
    occurrences: 0,
    locs: [],
    boxes: []
  };
}

// Línea divisora entre filas. Clic = inserta una fila manual justo debajo de "after".
function gapRow(after) {
  const tr = document.createElement('tr');
  tr.className = 'gap';
  tr.title = 'Clic para añadir una fila manual aquí';
  const td = document.createElement('td');
  td.colSpan = COLS;
  tr.appendChild(td);

  tr.addEventListener('click', () => {
    const created = newManualRow(after);
    state.rows.splice(after + 1, 0, created);
    state.pendingEdit = created;
    renderTable();
  });
  return tr;
}

function rowClass(r) {
  const c = [];
  if (r.manual) {
    c.push('manual');
    if (r.feedCheck === 'found') c.push('manual-found');
    if (r.feedCheck === 'missing') c.push('manual-missing');
  } else {
    c.push('band-' + r.band);
    if (isSoloSku(r)) c.push('solo-sku');
    if (!r.titleFound) c.push('sin-titulo');
  }
  if (!r.activo) c.push('inactive');
  return c.join(' ');
}

function feedCell(r) {
  if (r.manual && r.feedCheck === undefined) return cell('pendiente de revisar', 'nofeed');
  if (r.feedError) return cell('feed no disponible', 'nofeed');
  if (!r.sku || r.sku === 'XXXXXX') return cell('—', 'nofeed');
  if (!r.feedId) return cell('no se encontró en feed', 'nofeed');
  return cell(r.feedId);
}

// Nombre en feed: con botón de copiar cuando hay texto.
function feedNameCell(r) {
  if (r.manual && r.feedCheck === undefined) return cell('pendiente de revisar', 'nofeed');
  if (r.feedError) return cell('feed no disponible', 'nofeed');
  if (!r.sku || r.sku === 'XXXXXX') return cell('—', 'nofeed');
  if (!r.feedTitle) return cell('no se encontró en feed', 'nofeed');
  const td = cell(r.feedTitle);
  return withCopy(td, () => r.feedTitle);
}

// URL editable. El UTM se muestra al final en otro color con CSS (data-utm).
function urlCell(r) {
  const td = cell(r.url || '', 'url-cell');
  td.dataset.utm = utmSuffix(r.url, state.utm);
  makeEditable(td, v => {
    r.url = v;
    renderTable();
  });
  return td;
}

// Construye una fila de la tabla. El orden de las celdas coincide con COLUMNS.
function buildRow(r, i) {
  const tr = document.createElement('tr');
  r.rowEl = tr;   // referencia a la fila en pantalla, para ir a ella desde la vista previa
  tr.className = rowClass(r);

  // Activo (automáticas) o papelera (manuales)
  const actTd = document.createElement('td');
  actTd.className = 'act';
  if (r.manual) {
    const del = document.createElement('button');
    del.className = 'trash-btn';
    del.title = 'Eliminar fila manual';
    del.setAttribute('aria-label', 'Eliminar fila manual');
    del.innerHTML = TRASH_SVG;
    del.addEventListener('click', () => {
      state.rows.splice(state.rows.indexOf(r), 1);
      renderTable();
    });
    actTd.appendChild(del);
  } else {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = r.activo;
    cb.addEventListener('change', () => {
      r.activo = cb.checked;
      renderTable();
    });
    actTd.appendChild(cb);
  }

  // Número de fila: botón que lleva a la vista previa.
  const idxTd = document.createElement('td');
  idxTd.className = 'idx';
  const btn = document.createElement('button');
  btn.className = 'idx-btn';
  btn.textContent = String(i + 1);
  btn.addEventListener('click', () => focusRow(r));
  idxTd.appendChild(btn);
  if (r.manual) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'manual';
    idxTd.appendChild(badge);
  }

  // SKU (editable solo en manuales). Cambiarlo invalida la revisión anterior.
  const skuTd = cell(r.sku);
  if (r.manual) {
    makeEditable(skuTd, v => {
      r.sku = v;
      resetManualCheck(r);
      renderTable();
    });
    if (r === state.pendingEdit) state.pendingCell = skuTd;
  }

  // Título: doble clic para editar, botón de copiar al pasar el mouse.
  const titleTd = cell(r.title, r.titleFound ? '' : 'na');
  makeEditable(titleTd, v => {
    if (v && v !== 'n/a') {
      r.title = v;
      r.titleFound = true;
    } else {
      r.title = 'n/a';
      r.titleFound = false;
    }
    renderTable();
  });
  withCopy(titleTd, () => (r.titleFound ? r.title : ''));

  // Página (editable solo en manuales)
  const pageTd = cell(r.pages.join(', '));
  if (r.manual) {
    makeEditable(pageTd, v => {
      const n = parseInt(v, 10);
      if (Number.isFinite(n) && n >= 1) r.pages = [n];
      renderTable();
    });
  }

  tr.append(
    actTd,
    idxTd,
    skuTd,
    feedCell(r),
    titleTd,
    feedNameCell(r),
    cell(fmt(r.originalPrice), 'num'),
    cell(fmt(r.currentPrice), 'num'),
    urlCell(r),
    pageTd
  );
  return tr;
}

/* ---------------- Anchos de columna ---------------- */

// Calcula el ancho de cada columna visible y lo aplica.
// 1. Las fijas ocupan su ancho (FIXED_COLS).
// 2. Las flexibles reparten el resto según FLEX_COLS, con mínimo FLEX_MIN_PX.
// 3. La suma es igual al ancho del contenedor, así la tabla siempre lo llena.
//    Si los mínimos no caben, la tabla se hace más ancha y aparece scroll horizontal.
// La <colgroup> se reconstruye solo con las columnas visibles, para que cada
// ancho quede en su columna real (las ocultas no ocupan lugar en la tabla).
function layoutColumns() {
  const table = tbody.closest('table');
  const scroll = table.parentElement;
  const group = table.querySelector('colgroup');
  if (!group) return;

  const visible = COLUMNS.filter(c => !state.hiddenCols.has(c.key));
  const avail = Math.floor(scroll.clientWidth);

  const fixedKeys = visible.filter(c => c.key in FIXED_COLS);
  const flexKeys = visible.filter(c => c.key in FLEX_COLS);

  const widths = new Map();
  let fixedPx = 0;
  for (const c of fixedKeys) {
    widths.set(c.key, FIXED_COLS[c.key]);
    fixedPx += FIXED_COLS[c.key];
  }

  const remaining = Math.max(0, avail - fixedPx);
  const totalUnits = flexKeys.reduce((s, c) => s + FLEX_COLS[c.key], 0) || 1;
  for (const c of flexKeys) {
    widths.set(c.key, Math.max(FLEX_MIN_PX, Math.floor(remaining * FLEX_COLS[c.key] / totalUnits)));
  }

  // Ajusta la última flexible para que la suma sea exactamente el ancho disponible.
  let total = [...widths.values()].reduce((s, w) => s + w, 0);
  if (flexKeys.length && total < avail) {
    const last = flexKeys[flexKeys.length - 1].key;
    widths.set(last, widths.get(last) + (avail - total));
    total = avail;
  }

  table.style.width = total > avail ? total + 'px' : '100%';

  group.replaceChildren(...visible.map(c => {
    const col = document.createElement('col');
    col.style.width = widths.get(c.key) + 'px';
    return col;
  }));

  // Encabezados y celdas: las ocultas se quitan del diseño.
  table.querySelectorAll('thead th').forEach((th, i) => {
    th.hidden = state.hiddenCols.has(COLUMNS[i].key);
  });
  tbody.querySelectorAll('tr').forEach(tr => {
    if (tr.classList.contains('gap') || tr.classList.contains('empty-row')) return;
    [...tr.children].forEach((td, i) => {
      td.hidden = state.hiddenCols.has(COLUMNS[i].key);
    });
  });
}

// Recalcula los anchos cuando cambia el tamaño del contenedor (ventana o divisor).
export function initTableLayout() {
  const scroll = tbody.closest('table').parentElement;
  new ResizeObserver(() => layoutColumns()).observe(scroll);
}

/* ---------------- Tabla ---------------- */

// Dibuja la tabla completa según el filtro activo.
export function renderTable() {
  tbody.replaceChildren();
  state.pendingCell = null;

  const keep = FILTERS[state.activeFilter];
  const filtered = state.activeFilter !== 'all';

  // Las bandas se calculan sobre todas las filas, así los colores no cambian al filtrar.
  let currentPage = null;
  let pageIdx = -1;
  let rowInPage = 0;
  let shown = 0;

  state.rows.forEach((r, i) => {
    if (!r.manual) {
      const pg = r.pages[0];
      if (pg !== currentPage) {
        currentPage = pg;
        pageIdx++;
        rowInPage = 0;
      }
      r.band = (pageIdx % 2 === 0 ? 'a' : 'b') + (rowInPage % 2);
      rowInPage++;
    }

    if (!keep(r)) return;
    // Con filtro activo no hay líneas "+", para no insertar filas en una vista incompleta.
    if (!filtered) tbody.appendChild(gapRow(i - 1));
    tbody.appendChild(buildRow(r, i));
    shown++;
  });

  if (!filtered) tbody.appendChild(gapRow(state.rows.length - 1));

  if (!shown) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    const td = document.createElement('td');
    td.colSpan = COLS;
    td.textContent = 'Ninguna fila coincide con este filtro.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  layoutColumns();
  renderSummary(shown);
  syncManualButton();
  openExportBtn.disabled = state.rows.length === 0;

  // Una fila manual recién creada abre su celda SKU para escribir.
  if (state.pendingCell) {
    state.pendingCell.dispatchEvent(new MouseEvent('dblclick'));
    state.pendingCell = null;
    state.pendingEdit = null;
  }
}

/* ---------------- Ir a la fila desde la vista previa ---------------- */

// Si la fila está oculta por un filtro, quita el filtro. Luego desplaza y resalta la fila.
function locateInTable(r) {
  if (!r.rowEl || !r.rowEl.isConnected) {
    state.activeFilter = 'all';
    renderTable();
  }
  const tr = r.rowEl;
  if (!tr) return;

  tr.scrollIntoView({ behavior: 'smooth', block: 'center' });

  tr.classList.remove('row-flash');
  void tr.offsetWidth;
  tr.classList.add('row-flash');
  setTimeout(() => tr.classList.remove('row-flash'), 2500);
}

// Escucha el evento que dispara la vista previa al pulsar un recuadro.
window.addEventListener('briefing:locate', e => locateInTable(e.detail));