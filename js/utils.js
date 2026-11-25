import { CODE_RE } from './config.js';

export const round = n => Math.round(n * 100) / 100;
export const toNum = s => Number(s.replace(/,/g, ''));
export const codesIn = text => [...text.matchAll(CODE_RE)].map(m => m[1]);
export const fmt = n => (n == null ? '' : '$' + n.toLocaleString('es-MX'));

// Valor más frecuente de una lista (se usa para detectar la tipografía del cuerpo).
export function mode(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  let best = null;
  let n = 0;
  for (const [v, c] of counts) if (c > n) { best = v; n = c; }
  return best;
}

// Fila automática sin título ni precio.
export const isSoloSku = r =>
  !r.manual &&
  !r.titleFound &&
  r.originalPrice === null &&
  r.currentPrice === null &&
  r.cashPrice === null &&
  r.biweekly === null;

// Crea una celda <td> con texto y clase opcional.
export function cell(text, cls) {
  const td = document.createElement('td');
  if (cls) td.className = cls;
  td.textContent = text ?? '';
  return td;
}

// Parte que se añade al final de la URL con el valor de UTM (con ? o & según corresponda).
export function utmSuffix(base, utm) {
  const q = (utm || '').trim().replace(/^[?&]+/, '');
  if (!base || !q) return '';
  return (base.includes('?') ? '&' : '?') + q;
}

// URL final: la base más el UTM.
export const finalUrl = (base, utm) => (base ? base + utmSuffix(base, utm) : '');