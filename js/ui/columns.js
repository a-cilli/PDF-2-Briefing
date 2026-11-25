import { viewChecks, showAllCols } from './dom.js';
import { COLUMNS } from '../config.js';
import { state, requestRender } from '../state.js';

// Chips para mostrar u ocultar columnas en la tabla. Todas empiezan activadas.
// Ocultar una columna solo cambia la vista; el Excel no cambia.
export function initColumns() {
  for (const col of COLUMNS) {
    const label = document.createElement('label');
    label.className = 'col-toggle';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !state.hiddenCols.has(col.key);
    cb.addEventListener('change', () => {
      if (cb.checked) state.hiddenCols.delete(col.key);
      else state.hiddenCols.add(col.key);
      requestRender();
    });

    const span = document.createElement('span');
    span.textContent = col.label;
    label.append(cb, span);
    viewChecks.appendChild(label);
  }

  showAllCols.addEventListener('click', () => {
    state.hiddenCols.clear();
    viewChecks.querySelectorAll('input').forEach(i => (i.checked = true));
    requestRender();
  });
}