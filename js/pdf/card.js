import {
  CARD_HEIGHT, PRICE_LINE_RE, LABEL_RE, LETTER_RE, NOT_TITLE_RE, SAME_ROW_TOL
} from '../config.js';
import { toNum, mode, codesIn } from '../utils.js';
import { clean, toSegments, findHits, joinParts } from './layout.js';

const LEGEND_HEIGHT = 30;   // puntos por encima del precio donde buscar el nombre en una leyenda

// Título cuando viene en la misma línea que el precio.
function leadingTitle(seg, bodyFont) {
  const words = [];
  for (const p of seg.parts) {
    if (p.font === bodyFont) break;
    if (/\$|\d/.test(p.text) || NOT_TITLE_RE.test(p.text) || !LETTER_RE.test(p.text)) break;
    words.push(p.text);
  }
  return words.length ? words.join(' ') : null;
}

// Título y precios de una tarjeta a partir de sus segmentos (de arriba a abajo).
function analyzeBlock(block) {
  let start = block.findIndex(s => PRICE_LINE_RE.test(s.text));
  if (start === -1) start = block.length;
  const above = block.slice(0, start);
  const body = block.slice(start);

  // Tipografía del cuerpo: la de "De", "quincenas", "Código" y "Contado".
  const labelFonts = block.flatMap(s => s.parts).filter(p => LABEL_RE.test(p.text)).map(p => p.font);
  const bodyFont = labelFonts.length ? mode(labelFonts) : null;

  const isTitleLine = s => LETTER_RE.test(s.text) && !NOT_TITLE_RE.test(s.text);
  const isTitleCandidate = s => isTitleLine(s) && (bodyFont === null || s.font !== bodyFont);

  // Título: la línea más cercana al precio con tipografía distinta al cuerpo, más sus vecinas.
  let title = null;
  let end = above.length - 1;
  while (end >= 0 && !isTitleCandidate(above[end])) end--;

  if (end >= 0) {
    const font = above[end].font;
    let begin = end;
    while (begin > 0 && isTitleLine(above[begin - 1]) && above[begin - 1].font === font) begin--;
    title = above.slice(begin, end + 1).map(s => s.text).join(' ');
  } else if (body.length && bodyFont) {
    title = leadingTitle(body[0], bodyFont);
  }

  const bodyText = body.map(s => s.text).join(' ');
  let originalPrice = null;
  let currentPrice = null;

  const de = bodyText.match(/De\s*\$\s*([\d,]+)\s*a\b/i);
  if (de) {
    originalPrice = toNum(de[1]);
    const after = bodyText.slice(de.index + de[0].length).match(/^\s*\$\s*([\d,]+)/);
    currentPrice = after ? toNum(after[1]) : null;
  }

  const contado = bodyText.match(/Contado:?\s*\$\s*([\d,]+)/i);
  const cashPrice = contado ? toNum(contado[1]) : null;

  const quin = bodyText.match(/(\d+)\s*quincenas:?\s*\$\s*([\d,]+)/i);
  const biweekly = quin ? { quincenas: Number(quin[1]), amount: toNum(quin[2]) } : null;

  return {
    title: title || 'n/a',
    titleFound: Boolean(title),
    originalPrice,
    currentPrice,
    cashPrice,
    biweekly,
    raw: block.map(s => s.text).join(' | ')
  };
}

/* ---------------- Formato leyenda ---------------- */

// Crea un segmento a partir de algunos fragmentos (para separar título y precio de una misma línea).
function mkSeg(parts) {
  if (!parts.length) return null;
  const last = parts[parts.length - 1];
  return {
    y: parts[0].y,
    x0: parts[0].x,
    x1: last.x + last.width,
    parts,
    text: joinParts(parts),
    font: parts[0].font
  };
}

// "Loveseat Naomi de $7,399 a $6,999" → ["Loveseat Naomi", "de $7,399 a $6,999"]
function splitSeg(s) {
  const i = s.parts.findIndex(p => /\$|\d/.test(p.text));
  if (i <= 0) return [s];
  const cut = /^de$/i.test(s.parts[i - 1].text) ? i - 1 : i;
  return [mkSeg(s.parts.slice(0, cut)), mkSeg(s.parts.slice(cut))].filter(Boolean);
}

// Bloque de una leyenda: el código está a la derecha, en la línea de "quincenas".
// El nombre y el precio están en la columna izquierda, justo encima de esa línea.
function legendBlock(hit, segs) {
  const sameRow = segs.filter(s => Math.abs(s.y - hit.y) < 2 && s.x0 < hit.x0 - 2);
  const first = sameRow
    .filter(s => /quincenas|^De\b|Contado/i.test(s.text))
    .sort((a, b) => a.x0 - b.x0)[0];
  if (!first) return null;

  const left = first.x0;
  const priceY = first.y;

  // Líneas de la misma columna, subiendo desde el precio hasta la línea de otra tarjeta.
  const above = segs
    .filter(s =>
      s.y < priceY - 1 && s.y >= priceY - LEGEND_HEIGHT &&
      s.x0 >= left - 6 && s.x0 < hit.x0 - 2)
    .sort((a, b) => b.y - a.y);

  const lines = [];
  for (const s of above) {
    if (/quincenas|Contado/i.test(s.text)) break;   // aquí termina la leyenda anterior
    lines.unshift(s);
  }

  const rowLine = sameRow
    .filter(s => Math.abs(s.y - priceY) < 2 && s.x0 >= left - 6)
    .sort((a, b) => a.x0 - b.x0);

  return [...lines, ...rowLine].flatMap(splitSeg);
}

// Puntaje de un resultado: título vale 2, precio vale 1.
const hasPrice = i =>
  i.originalPrice !== null || i.currentPrice !== null || i.cashPrice !== null || i.biweekly !== null;
const infoScore = i => (i.titleFound ? 2 : 0) + (hasPrice(i) ? 1 : 0);

/* ---------------- Parser por página ---------------- */

// Una fila por cada aparición del código en la página, con título y precio si las coordenadas los encuentran.
function parsePage(page) {
  const segs = toSegments(clean(page.items));
  const hits = findHits(page.items, page.page);
  const overlaps = (a, b) => a.x0 < b.x1 + 2 && b.x0 < a.x1 + 2;

  return hits.map(hit => {
    const above = segs
      .filter(s => s.y < hit.y - 1 && s.y > hit.y - CARD_HEIGHT && overlaps(s, hit))
      .sort((a, b) => b.y - a.y);

    const block = [];
    for (const s of above) {
      if (codesIn(s.text).length) break;
      block.unshift(s);
    }

    if (!hit.isList) {
      const own = segs.filter(s => Math.abs(s.y - hit.y) < 2 && overlaps(s, hit));
      block.push(...own);
    }

    // Primero la tarjeta normal. Si la leyenda encuentra más (título o precio), se usa ella.
    let info = analyzeBlock(block);
    const legend = legendBlock(hit, segs);
    if (legend) {
      const alt = analyzeBlock(legend);
      if (infoScore(alt) > infoScore(info)) info = alt;
    }

    const flags = [];
    if (hit.isList) flags.push('código en lista');
    if (!info.titleFound) flags.push('sin título');
    if (info.originalPrice === null && info.cashPrice === null && info.biweekly === null) flags.push('sin precio');
    if (info.originalPrice !== null && info.currentPrice !== null && info.currentPrice > info.originalPrice) {
      flags.push('precio a revisar');
    }

    const loc = { page: hit.page, x: hit.bx, y: hit.y, w: hit.bw, h: hit.bh };
    return { page: hit.page, sku: hit.sku, ...info, flags, raw: info.raw || hit.raw, loc };
  });
}

/* ---------------- Una fila por producto y página ---------------- */

// Si un código aparece varias veces en la misma página, se queda una sola fila.
// Prefiere la aparición con título y la de tarjeta sobre la de línea "Códigos:".
function scoreHit(h) {
  return (h.titleFound ? 2 : 0) + (h.flags.includes('código en lista') ? 0 : 1);
}

function onePerPage(hits) {
  const best = new Map();
  for (const h of hits) {
    const key = `${h.page}|${h.sku}`;
    const cur = best.get(key);
    if (!cur || scoreHit(h) > scoreHit(cur)) best.set(key, h);
  }
  return [...best.values()];
}

// Orden de lectura dentro de cada página: arriba a abajo, luego izquierda a derecha.
// Los códigos cuya altura está a menos de SAME_ROW_TOL puntos se consideran la misma fila.
function readingOrder(rows) {
  const pages = [...new Set(rows.map(r => r.page))].sort((a, b) => a - b);
  const out = [];

  for (const p of pages) {
    const pageRows = rows
      .filter(r => r.page === p)
      .sort((a, b) => a.loc.y - b.loc.y);   // y crece hacia abajo: menor y = arriba de la página

    const bands = [];
    for (const r of pageRows) {
      const last = bands[bands.length - 1];
      if (last && Math.abs(last.y - r.loc.y) <= SAME_ROW_TOL) {
        last.rows.push(r);
      } else {
        bands.push({ y: r.loc.y, rows: [r] });
      }
    }

    for (const band of bands) {
      band.rows.sort((a, b) => a.loc.x - b.loc.x);
      out.push(...band.rows);
    }
  }
  return out;
}

// Punto de entrada del parser: documento leído → filas en orden de lectura.
export function extract(doc) {
  const hits = doc.pages.flatMap(page => parsePage(page));
  const unique = onePerPage(hits).map(r => ({
    ...r,
    pages: [r.page],
    locs: [r.loc],
    occurrences: 1
  }));
  return { products: readingOrder(unique), hitCount: hits.length };
}