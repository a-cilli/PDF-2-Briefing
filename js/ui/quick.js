import { state, requestRender } from '../state.js';
import { applyCandidate } from '../feed/lookup.js';
import { setStatus } from './toast.js';

const isMulti = r => Boolean(r.candidates);

let els = null;
let list = [];            // filas visibles según los badges
let idx = 0;              // fila actual dentro de list
let selIdx = 0;           // opción resaltada del feed
let showPending = true;   // badge "Multimatch sin elegir"
let showPicked = true;    // badge "Multimatch elegido"

// Filas con varios resultados que pasan el filtro de los badges.
function visibleRows() {
  return state.rows.filter(r => isMulti(r) && (r.picked ? showPicked : showPending));
}

function refreshList() {
  list = visibleRows();
  if (idx > list.length - 1) idx = Math.max(0, list.length - 1);
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

// Resalta cada aparición de sku dentro de text. Todo se escribe como texto, nunca como HTML.
function hl(text, sku) {
  const frag = document.createDocumentFragment();
  const s = String(text ?? '');
  if (!sku) {
    frag.append(s);
    return frag;
  }
  let pos = 0;
  let i;
  while ((i = s.indexOf(sku, pos)) !== -1) {
    if (i > pos) frag.append(s.slice(pos, i));
    frag.append(el('mark', 'qs-hl', sku));
    pos = i + sku.length;
  }
  if (pos < s.length) frag.append(s.slice(pos));
  return frag;
}

// Columna izquierda: las filas visibles con su ID y título elegidos.
function renderSide() {
  els.side.replaceChildren();
  list.forEach((r, pos) => {
    const b = el('button', 'qs-side-item' + (pos === idx ? ' cur' : ''));
    b.type = 'button';
    b.append(
      el('span', 'qs-side-sku', r.sku),
      el('span', 'qs-side-title',
        r.picked ? `${r.feedId} · ${r.feedTitle || '—'}` : (r.titleFound ? r.title : 'sin título en el PDF')),
      el('span', r.picked ? 'qs-tag ok' : 'qs-tag todo', r.picked ? 'Elegido' : 'Sin elegir')
    );
    b.addEventListener('click', () => {
      idx = pos;
      selIdx = 0;
      render();
    });
    els.side.append(b);
  });
}

// Tabla de arriba: el dato del PDF, con el SKU resaltado.
function renderPdf(r) {
  els.pdfBody.replaceChildren();
  const tr = el('tr');
  const skuTd = el('td', 'qs-strong');
  skuTd.append(hl(r.sku, r.sku));
  tr.append(skuTd, el('td', '', r.titleFound ? r.title : 'sin título en el PDF'));
  els.pdfBody.append(tr);
}

// Tabla de abajo: cada opción del feed, con el SKU del PDF resaltado en ID y SKU.
function renderOptions(r) {
  els.optBody.replaceChildren();
  els.optCount.textContent = `${r.candidates.length} opciones`;
  r.candidates.forEach((c, i) => {
    const on = r.picked && r.feedId === c.id;
    const tr = el('tr', (i === selIdx ? 'sel' : '') + (on ? ' picked' : ''));
    tr.addEventListener('click', () => {
      selIdx = i;
      render();
    });

    const btn = el('button', 'btn sm', on ? 'Elegido' : 'Elegir');
    btn.type = 'button';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      choose(c);
    });

    const idTd = el('td', 'qs-strong');
    idTd.append(hl(c.id, r.sku));
    const skuTd = el('td');
    skuTd.append(hl(c.sku || '—', r.sku));
    const actTd = el('td', 'qs-act');
    actTd.append(btn);

    tr.append(el('td', 'qs-num-cell', String(i + 1)), idTd, el('td', '', c.title || '—'), skuTd, actTd);
    els.optBody.append(tr);
  });
}

function emptyMessage() {
  if (!showPending && !showPicked) return 'Activa al menos un badge para ver filas.';
  if (!state.rows.some(isMulti)) return 'No hay filas con varios resultados.';
  return 'No hay filas con este filtro.';
}

function render() {
  if (!els || els.modal.hidden) return;
  const r = list[idx];
  renderSide();
  syncBadges();
  els.prev.disabled = idx <= 0;
  els.next.disabled = !list.length || idx >= list.length - 1;

  if (!r) {
    els.counter.textContent = '0 de 0';
    els.pdfBody.replaceChildren();
    els.optBody.replaceChildren();
    els.optCount.textContent = '';
    els.allBtn.disabled = true;
    els.hint.textContent = '';
    els.empty.hidden = false;
    els.empty.textContent = emptyMessage();
    return;
  }

  els.empty.hidden = true;
  els.counter.textContent = `${idx + 1} de ${list.length}`;
  renderPdf(r);
  renderOptions(r);
  els.allBtn.disabled = false;
  const sel = r.candidates[selIdx];
  els.hint.textContent = sel ? `Opción ${selIdx + 1}: ${sel.id}` : '';
}

function syncBadges() {
  els.badgePending.setAttribute('aria-pressed', String(showPending));
  els.badgePicked.setAttribute('aria-pressed', String(showPicked));
}

// Elige una opción para la fila actual y pasa a la siguiente visible.
function choose(c) {
  const r = list[idx];
  if (!r) return;
  applyCandidate(r, c);
  afterChange(true);
}

// Convierte un ID de feed en patrón reemplazando el código del PDF por {C}.
// Ejemplo: pm-4454333 con código 445433 -> "pm-{C}3".
function patternOf(id, sku) {
  const i = id.indexOf(sku);
  if (i === -1) return null;
  return id.slice(0, i) + '{C}' + id.slice(i + sku.length);
}

// Elige en todas las filas sin elegir la opción que siga el mismo patrón que la resaltada.
function chooseAll() {
  const r = list[idx];
  const c = r && r.candidates[selIdx];
  if (!c) return;

  const tpl = patternOf(c.id, r.sku);
  if (!tpl) {
    setStatus('No se puede generalizar esta opción.');
    return;
  }

  let n = 0;
  for (const row of state.rows) {
    if (!isMulti(row) || row.picked || !row.sku) continue;
    const want = tpl.replace('{C}', row.sku);
    const m = row.candidates.find(x => x.id === want);
    if (m) {
      applyCandidate(row, m);
      n++;
    }
  }

  setStatus(`${n} fila${n === 1 ? '' : 's'} elegida${n === 1 ? '' : 's'} con el patrón ${tpl}`);
  afterChange(false);
}

// Tras elegir: si la fila sigue visible, avanza a la siguiente; si salió de la lista, el índice ya apunta a la siguiente.
function afterChange(advance) {
  const cur = list[idx];
  refreshList();
  if (advance && cur && list.includes(cur)) {
    idx = Math.min(list.indexOf(cur) + 1, Math.max(0, list.length - 1));
  }
  selIdx = 0;
  requestRender();
  render();
  syncQuickButton();
}

function go(delta) {
  const next = Math.min(list.length - 1, Math.max(0, idx + delta));
  if (next === idx) return;
  idx = next;
  selIdx = 0;
  render();
}

function moveOption(delta) {
  const r = list[idx];
  if (!r) return;
  selIdx = Math.min(r.candidates.length - 1, Math.max(0, selIdx + delta));
  render();
}

function openQuick() {
  showPending = true;
  showPicked = true;
  refreshList();
  idx = 0;
  selIdx = 0;
  els.modal.hidden = false;
  document.body.classList.add('modal-open');
  render();
}

function closeQuick() {
  els.modal.hidden = true;
  document.body.classList.remove('modal-open');
}

// Teclado: 1-9 eligen la opción, ← → cambian de fila, ↑ ↓ resaltan opción, Esc cierra.
function onKey(e) {
  if (!els || els.modal.hidden) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeQuick();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    go(1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    go(-1);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    moveOption(1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    moveOption(-1);
  } else if (/^[1-9]$/.test(e.key)) {
    const r = list[idx];
    const c = r && r.candidates[Number(e.key) - 1];
    if (c) {
      e.preventDefault();
      choose(c);
    }
  }
}

// Habilita el botón "Selección de multimatch" solo si hay filas con varios resultados.
export function syncQuickButton() {
  const b = document.getElementById('quickSel');
  if (b) b.disabled = !state.rows.some(isMulti);
}

export function initQuick() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="quickModal" class="modal" hidden>
      <div class="modal-backdrop" data-qs-close></div>
      <div class="modal-card card qs-card" role="dialog" aria-modal="true" aria-labelledby="qsHeading">
        <header class="modal-head">
          <h3 id="qsHeading">Selección de multimatch</h3>
          <div class="help-head-right">
            <span id="qsCounter" class="help-counter"></span>
            <button type="button" class="icon-btn" data-qs-close aria-label="Cerrar">×</button>
          </div>
        </header>
        <div class="qs-bar">
          <button type="button" id="qsAll" class="btn sm primary">Elegir en todas las filas</button>
          <span id="qsHint" class="qs-hint"></span>
        </div>
        <div class="qs-body">
          <aside class="qs-side">
            <div class="qs-side-head qs-badges">
              <button type="button" id="qsBadgePending" class="qs-badge pending" aria-pressed="true">Multimatch sin elegir</button>
              <button type="button" id="qsBadgePicked" class="qs-badge picked" aria-pressed="true">Multimatch elegido</button>
            </div>
            <div id="qsSide" class="qs-side-list"></div>
          </aside>
          <section class="qs-main">
            <p id="qsEmpty" class="qs-empty" hidden></p>
            <h4 class="qs-h">Dato del PDF</h4>
            <div class="qs-tbl-wrap">
              <table class="qs-tbl">
                <thead><tr><th>SKU</th><th>Título en PDF</th></tr></thead>
                <tbody id="qsPdf"></tbody>
              </table>
            </div>
            <h4 class="qs-h">Opciones del feed <span id="qsOptCount" class="qs-count"></span></h4>
            <div class="qs-tbl-wrap">
              <table class="qs-tbl">
                <thead><tr><th>#</th><th>ID en feed</th><th>Título en feed</th><th>SKU</th><th></th></tr></thead>
                <tbody id="qsOpts"></tbody>
              </table>
            </div>
          </section>
        </div>
        <footer class="qs-foot">
          <button type="button" id="qsPrev" class="btn sm">← Anterior</button>
          <span>1-9 elegir · ↑ ↓ opción · ← → fila · Esc cerrar</span>
          <button type="button" id="qsNext" class="btn sm primary">Siguiente →</button>
        </footer>
      </div>
    </div>`;
  document.body.appendChild(wrap.firstElementChild);

  els = {
    modal: document.getElementById('quickModal'),
    counter: document.getElementById('qsCounter'),
    allBtn: document.getElementById('qsAll'),
    hint: document.getElementById('qsHint'),
    side: document.getElementById('qsSide'),
    empty: document.getElementById('qsEmpty'),
    pdfBody: document.getElementById('qsPdf'),
    optBody: document.getElementById('qsOpts'),
    optCount: document.getElementById('qsOptCount'),
    badgePending: document.getElementById('qsBadgePending'),
    badgePicked: document.getElementById('qsBadgePicked'),
    prev: document.getElementById('qsPrev'),
    next: document.getElementById('qsNext')
  };

  document.getElementById('quickSel').addEventListener('click', openQuick);
  els.modal.querySelectorAll('[data-qs-close]').forEach(b => b.addEventListener('click', closeQuick));
  els.allBtn.addEventListener('click', chooseAll);
  els.prev.addEventListener('click', () => go(-1));
  els.next.addEventListener('click', () => go(1));

  els.badgePending.addEventListener('click', () => {
    showPending = !showPending;
    refreshList();
    idx = 0;
    selIdx = 0;
    render();
  });
  els.badgePicked.addEventListener('click', () => {
    showPicked = !showPicked;
    refreshList();
    idx = 0;
    selIdx = 0;
    render();
  });

  document.addEventListener('keydown', onKey);
  syncQuickButton();
}