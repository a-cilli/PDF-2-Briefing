import { API } from '../config.js';
import { setFeedImages } from '../ui/images.js';

// Asigna un candidato a la fila: ID, nombre, URL e imágenes.
export function applyCandidate(r, c) {
  r.feedId = c.id;
  r.feedTitle = c.title;
  r.feedVia = c.via || 'g:id';
  r.feedError = null;
  if (c.link) r.url = c.link;
  setFeedImages(r, c.images);
  r.picked = true;
  r.multiOpen = false;
}

// Quita la asignación del feed de la fila.
export function clearFeed(r) {
  r.feedId = null;
  r.feedTitle = null;
  r.feedVia = null;
  r.picked = false;
  setFeedImages(r, []);
}

// Envía los códigos al servidor. Un solo resultado se elige solo; varios quedan pendientes.
export async function enrichFromFeed(list) {
  const skus = list.map(p => p.sku).filter(s => s !== 'XXXXXX');
  try {
    const res = await fetch(`${API}/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al consultar el feed');

    for (const p of list) {
      const matches = data[p.sku]?.matches || [];
      p.candidates = null;
      p.multiOpen = false;
      p.feedError = null;

      if (matches.length === 1) {
        applyCandidate(p, matches[0]);
      } else if (matches.length > 1) {
        p.candidates = matches;
        clearFeed(p);
      } else {
        clearFeed(p);
      }
    }
  } catch (err) {
    for (const p of list) {
      p.candidates = null;
      p.multiOpen = false;
      clearFeed(p);
      p.feedError = err.message;
    }
    throw err;
  }
}