import { API } from '../config.js';
import { state, requestRender } from '../state.js';
import { setStatus } from '../ui/toast.js';

const btn = document.getElementById('checkManual');
const BTN_LABEL = 'Buscar manuales en feed';

// El botón solo se habilita si hay al menos una fila manual.
export function syncManualButton() {
  if (!btn || btn.dataset.busy === '1') return;
  btn.disabled = !state.rows.some(r => r.manual);
}

// Al cambiar el SKU de una fila manual, su verificación anterior deja de valer.
export function resetManualCheck(r) {
  r.feedCheck = undefined;
  r.feedId = null;
  r.feedTitle = null;
  r.feedVia = null;
}

async function queryManual(items) {
  const res = await fetch(`${API}/lookup-manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al consultar el feed');
  return data;
}

// Revisa todas las filas manuales contra el feed y guarda el resultado en cada una.
async function checkManualRows() {
  const manual = state.rows.filter(r => r.manual);
  if (!manual.length) return;

  const items = [...new Set(manual.map(r => (r.sku || '').trim()).filter(Boolean))];
  btn.dataset.busy = '1';
  btn.disabled = true;
  btn.textContent = 'Buscando…';

  try {
    const data = items.length ? await queryManual(items) : {};
    let found = 0;
    let missing = 0;

    for (const r of manual) {
      const hit = data[(r.sku || '').trim()];
      if (hit) {
        r.feedCheck = 'found';
        r.feedId = hit.id;
        r.feedTitle = hit.title;
        r.feedVia = hit.via;
        if (hit.link) r.url = hit.link;
        found++;
      } else {
        r.feedCheck = 'missing';
        r.feedId = null;
        r.feedTitle = null;
        r.feedVia = null;
        missing++;
      }
    }

    requestRender();
    setStatus(`Manuales: ${found} en feed · ${missing} fuera de feed.`);
  } catch (err) {
    setStatus('Error al buscar manuales: ' + err.message);
  } finally {
    btn.dataset.busy = '0';
    btn.textContent = BTN_LABEL;
    syncManualButton();
  }
}

export function initManualCheck() {
  if (!btn) return;
  btn.addEventListener('click', checkManualRows);
  syncManualButton();
}