import {
  NOISE, CODE_RE, LIST_LABEL_RE, FOOTER_Y, HEADLINE_H, COLUMN_GAP
} from '../config.js';
import { round } from '../utils.js';

// Quita fragmentos que no son producto: pies, arte promocional y duplicados.
export function clean(items) {
  const seen = new Set();
  return items.filter(it => {
    if (it.y > FOOTER_Y) return false;
    if (it.height > HEADLINE_H) return false;
    if (NOISE.test(it.text)) return false;
    const key = `${Math.round(it.x)}|${Math.round(it.y)}|${it.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Une fragmentos de una misma línea, metiendo espacio cuando hay hueco.
export function joinParts(parts) {
  let out = '';
  let prevEnd = null;
  for (const p of parts) {
    if (prevEnd !== null && p.x - prevEnd > 1) out += ' ';
    out += p.text;
    prevEnd = p.x + p.width;
  }
  return out.trim();
}

// Agrupa fragmentos por línea y los parte en columnas según el hueco horizontal.
export function toSegments(items) {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);

  const rows = [];
  for (const it of sorted) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(it.y - row.y) < 2) row.items.push(it);
    else rows.push({ y: it.y, items: [it] });
  }

  const segs = [];
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    let cur = null;
    for (const it of row.items) {
      const end = it.x + it.width;
      if (cur && it.x - cur.x1 < COLUMN_GAP) {
        cur.parts.push(it);
        cur.x1 = Math.max(cur.x1, end);
      } else {
        cur = { y: row.y, x0: it.x, x1: end, parts: [it] };
        segs.push(cur);
      }
    }
  }

  for (const s of segs) {
    s.text = joinParts(s.parts);
    s.font = s.parts[0].font;
  }
  return segs;
}

// Todos los códigos de 6 dígitos del texto, con su posición aproximada para el recuadro.
export function findHits(items, pageNo) {
  const hits = [];
  for (const it of items) {
    const matches = [...it.text.matchAll(CODE_RE)];
    if (!matches.length) continue;
    const isList = matches.length > 1 || LIST_LABEL_RE.test(it.text);
    const len = it.text.length || 1;
    for (const m of matches) {
      const sku = m[1];
      hits.push({
        sku, page: pageNo, isList,
        x0: it.x, x1: it.x + it.width, y: it.y,
        bx: round(it.x + it.width * (m.index / len)),
        bw: round(it.width * (sku.length / len)),
        bh: it.height,
        raw: it.text
      });
    }
  }
  return hits;
}