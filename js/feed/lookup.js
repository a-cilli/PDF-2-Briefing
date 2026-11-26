import { API } from '../config.js';
import { setFeedImages } from '../ui/images.js';

// Envía SKU al servidor local y añade ID, nombre, URL e imágenes a cada fila.
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
      const hit = data[p.sku];
      p.feedId = hit ? hit.id : null;
      p.feedTitle = hit ? hit.title : null;
      p.feedVia = hit ? hit.via : null;
      p.feedError = null;
      if (hit && hit.link) p.url = hit.link;
      setFeedImages(p, hit ? hit.images : []);
    }
  } catch (err) {
    for (const p of list) {
      p.feedId = null;
      p.feedTitle = null;
      p.feedVia = null;
      p.feedError = err.message;
      setFeedImages(p, []);
    }
    throw err;
  }
}