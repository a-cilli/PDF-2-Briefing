import { setStatus } from './toast.js';

const COPY_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>`;

const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M20 6L9 17l-5-5"/>
</svg>`;

const LINK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
</svg>`;

// Copia texto al portapapeles. Si la API moderna no está disponible, usa un campo oculto.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) throw new Error('el navegador bloqueó el portapapeles');
  }
}

// Añade un botón de copiar al borde derecho de la celda.
// getText se llama al hacer clic, así siempre copia el valor actual.
// Si no hay texto, no añade el botón.
export function withCopy(td, getText) {
  if (!getText()) return td;

  td.classList.add('copyable');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy-btn';
  btn.title = 'Copiar';
  btn.setAttribute('aria-label', 'Copiar texto');
  btn.innerHTML = COPY_SVG;

  btn.addEventListener('click', async e => {
    e.stopPropagation();
    e.preventDefault();
    const text = getText();
    try {
      await copyText(text);
      btn.innerHTML = CHECK_SVG;
      btn.classList.add('done');
      setTimeout(() => {
        btn.innerHTML = COPY_SVG;
        btn.classList.remove('done');
      }, 1200);
      const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;
      setStatus(`Copiado: ${preview}`);
    } catch (err) {
      setStatus('No se pudo copiar: ' + err.message);
    }
  });

  // Doble clic en el botón no debe abrir la edición de la celda.
  btn.addEventListener('dblclick', e => e.stopPropagation());

  td.appendChild(btn);
  return td;
}

// Añade un botón de enlace al borde derecho de la celda.
// Abre la URL sin querystring (todo lo que va desde "?") en una pestaña nueva.
export function withOpenLink(td, getUrl) {
  if (!getUrl()) return td;

  td.classList.add('copyable');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy-btn';
  btn.title = 'Abrir enlace en una pestaña nueva';
  btn.setAttribute('aria-label', 'Abrir enlace');
  btn.innerHTML = LINK_SVG;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    e.preventDefault();
    const base = getUrl().split('?')[0];
    window.open(base, '_blank', 'noopener');
  });

  // Doble clic en el botón no debe abrir la edición de la celda.
  btn.addEventListener('dblclick', e => e.stopPropagation());

  td.appendChild(btn);
  return td;
}