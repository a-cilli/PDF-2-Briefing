import { summaryEl } from './dom.js';
import { state, requestRender } from '../state.js';

// Cada filtro solo decide qué filas se muestran. No borra ni modifica nada.
export const FILTERS = {
  all:           () => true,
  active:        r => r.activo,
  manual:        r => r.manual,
  notitle:       r => !r.titleFound,
  nomatch:       r => !r.manual && !r.feedId && !r.candidates && r.sku !== 'XXXXXX',
  manualFound:   r => r.manual && r.feedCheck === 'found',
  manualMissing: r => r.manual && r.feedCheck === 'missing',
  multiPending:  r => Boolean(r.candidates) && !r.picked,
  multiPicked:   r => Boolean(r.candidates) && Boolean(r.picked)
};

// Chip que actúa como botón. Clic = filtrar; clic de nuevo = quitar el filtro.
function filterChip(key, text, cls) {
  const on = state.activeFilter === key;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `chip filterable ${cls}${on ? ' on' : ''}`.trim();
  b.textContent = text;
  b.setAttribute('aria-pressed', String(on));
  b.title = on && key !== 'all' ? 'Quitar filtro' : 'Filtrar por esto';
  b.addEventListener('click', () => {
    state.activeFilter = (on && key !== 'all') ? 'all' : key;
    requestRender();
  });
  return b;
}

// Dibuja los chips de resumen. Los de manuales y multimatch solo aparecen si hay filas de ese tipo.
export function renderSummary(shown) {
  const rows = state.rows;
  const auto = rows.filter(r => !r.manual);
  const counts = {
    all: rows.length,
    active: rows.filter(r => r.activo).length,
    manual: rows.length - auto.length,
    notitle: rows.filter(FILTERS.notitle).length,
    nomatch: auto.filter(FILTERS.nomatch).length,
    manualFound: rows.filter(FILTERS.manualFound).length,
    manualMissing: rows.filter(FILTERS.manualMissing).length,
    multiPending: rows.filter(FILTERS.multiPending).length,
    multiPicked: rows.filter(FILTERS.multiPicked).length
  };

  const defs = [
    ['all',     `${counts.all} filas`,          ''],
    ['active',  `${counts.active} activas`,     ''],
    ['manual',  `${counts.manual} manuales`,    'purple']
  ];
  if (counts.manual) {
    defs.push(['manualFound',   `${counts.manualFound} en feed`,       'teal']);
    defs.push(['manualMissing', `${counts.manualMissing} fuera de feed`, 'coral']);
  }
  if (counts.multiPending || counts.multiPicked) {
    defs.push(['multiPending', `${counts.multiPending} Multimatch sin elegir`, 'multi-pending']);
    defs.push(['multiPicked',  `${counts.multiPicked} Multimatch elegido`,     'multi-picked']);
  }
  defs.push(['notitle', `${counts.notitle} sin título`, counts.notitle ? 'warn' : '']);
  defs.push(['nomatch', `${counts.nomatch} sin match`,  counts.nomatch ? 'muted' : '']);

  const chips = defs.map(([key, text, cls]) => filterChip(key, text, cls));
  if (state.activeFilter !== 'all') {
    const note = document.createElement('span');
    note.className = 'chip-note';
    note.textContent = `Mostrando ${shown} de ${rows.length}`;
    chips.push(note);
  }
  summaryEl.replaceChildren(...chips);
}