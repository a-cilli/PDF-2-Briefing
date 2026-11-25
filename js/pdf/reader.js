import { THUMB_WIDTH } from '../config.js';
import { round } from '../utils.js';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Dibuja la página en un canvas de THUMB_WIDTH px y la devuelve como PNG (data URL).
export async function renderThumb(page) {
  const base = page.getViewport({ scale: 1 });
  const vp = page.getViewport({ scale: THUMB_WIDTH / base.width });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(vp.width);
  canvas.height = Math.ceil(vp.height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const url = canvas.toDataURL('image/jpeg', 0.9);
  canvas.width = 0;
  canvas.height = 0;
  return url;
}

// Lee todas las páginas: texto con coordenadas y miniatura.
export async function readPdf(file, onProgress) {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const doc = { numPages: pdf.numPages, pages: [] };

  for (let p = 1; p <= pdf.numPages; p++) {
    onProgress(`Leyendo página ${p} de ${pdf.numPages}…`);
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    const items = content.items
      .filter(it => it.str.trim() !== '')
      .map(it => {
        const m = pdfjsLib.Util.transform(viewport.transform, it.transform);
        return {
          text: it.str,
          x: round(m[4]),
          y: round(m[5]),
          width: round(it.width),
          height: round(it.height),
          font: it.fontName
        };
      });

    const thumb = await renderThumb(page);
    doc.pages.push({
      page: p,
      width: round(viewport.width),
      height: round(viewport.height),
      items,
      thumb
    });
  }
  return doc;
}