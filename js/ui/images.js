import { state, requestRender } from '../state.js';
import { API } from '../config.js';
import { setStatus } from './toast.js';

// Alto de la tira de imágenes (px). Se puede cambiar arrastrando la barra inferior.
const STRIP_DEFAULT = 360;   // alto inicial
const STRIP_MIN = 140;       // alto mínimo al arrastrar
const STRIP_MAX_VH = 80;     // alto máximo al arrastrar, en % de la altura de la ventana

const CHECK_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>`;

const IMG_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>`;

// Elementos del modo selección de fotos (se leen en initImages).
let P = null;
// Función que vuelve a dibujar el modo selección cuando cambia una imagen.
let modalRefresh = null;
// Productos con ID de feed que recorre el modo selección, y la posición actual.
let photoList = [];
let photoIdx = 0;

export const hasImages = r => Boolean(r && r.images && r.images.length);
const feedRows = () => state.rows.filter(r => r.feedId);

// Guarda las URLs del feed como imágenes, todas activadas por defecto.
export function setFeedImages(r, urls) {
  r.images = (urls || []).map(url => ({ url, on: true }));
}

function toggleImage(r, i) {
  const it = r.images && r.images[i];
  if (!it) return;
  it.on = !it.on;
  requestRender();
  if (modalRefresh) modalRefresh();
}

// Una imagen con su número y su casilla. Apagada = blanco y negro con borde rojo.
function makeTile(r, it, i, big) {
  const tile = document.createElement('div');
  tile.className = 'img-tile' + (it.on ? '' : ' off') + (big ? ' big' : '');
  tile.title = `${r.feedId} - ${i + 1} · clic para ${it.on ? 'desactivar' : 'activar'}`;

  const img = document.createElement('img');
  img.src = it.url;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = `${r.feedId} - ${i + 1}`;
  img.onerror = () => tile.classList.add('broken');

  const num = document.createElement('span');
  num.className = 'img-num';
  num.textContent = String(i + 1);

  const chk = document.createElement('span');
  chk.className = 'img-check';
  chk.innerHTML = it.on ? CHECK_SVG : '';

  tile.append(img, num, chk);
  tile.addEventListener('click', () => toggleImage(r, i));
  return tile;
}

// Pestaña pegada a la izquierda de la tabla. Sin ID de feed queda deshabilitada.
export function imgButtonCell(r) {
  const td = document.createElement('td');
  td.className = 'img-cell';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'img-btn' + (r.imgOpen ? ' open' : '');
  btn.disabled = !r.feedId;
  btn.title = r.feedId ? 'Ver imágenes del producto' : 'Sin ID en feed: no hay imágenes';
  btn.setAttribute('aria-expanded', String(Boolean(r.imgOpen)));
  btn.innerHTML = IMG_SVG + `<span class="img-badge">${(r.images || []).length}</span>`;
  btn._row = r;   // para saber a qué producto pertenece el clic
  btn.addEventListener('click', () => {
    r.imgOpen = !r.imgOpen;
    requestRender();
  });

  td.appendChild(btn);
  return td;
}

function stripHeight(r) {
  return r.imgH || STRIP_DEFAULT;
}

// Arrastrar la barra inferior cambia el alto de la tira y lo recuerda para este producto.
function startResize(e, r, strip) {
  e.preventDefault();
  const handle = e.currentTarget;
  handle.setPointerCapture(e.pointerId);

  const startY = e.clientY;
  const startH = strip.getBoundingClientRect().height;
  const maxH = Math.round(window.innerHeight * STRIP_MAX_VH / 100);

  const onMove = ev => {
    const h = Math.round(Math.min(maxH, Math.max(STRIP_MIN, startH + (ev.clientY - startY))));
    strip.style.height = h + 'px';
    r.imgH = h;
  };
  const onUp = () => {
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onUp);
    handle.removeEventListener('pointercancel', onUp);
  };
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);
}

// Fila desplegable con las imágenes. No tiene número de fila.
export function imageSubRow(r, span) {
  const tr = document.createElement('tr');
  tr.className = 'img-row';
  tr._row = r;   // para saber a qué producto pertenece la fila

  const td = document.createElement('td');
  td.colSpan = span;

  if (!hasImages(r)) {
    const p = document.createElement('p');
    p.className = 'img-empty';
    p.textContent = 'Sin imágenes para este producto.';
    td.appendChild(p);
    tr.appendChild(td);
    return tr;
  }

  const strip = document.createElement('div');
  strip.className = 'img-strip';
  strip.style.height = stripHeight(r) + 'px';
  r.images.forEach((it, i) => strip.appendChild(makeTile(r, it, i, false)));

  const handle = document.createElement('div');
  handle.className = 'img-resize';
  handle.title = 'Arrastra para cambiar el alto';
  handle.innerHTML = '<span></span>';
  handle.addEventListener('pointerdown', e => startResize(e, r, strip));

  td.append(strip, handle);
  tr.appendChild(td);
  return tr;
}

/* ---------------- Carrito y acciones masivas ---------------- */

// mode: 'all' | 'none' | índice de la imagen que queda activa (0 = primera, 1 = segunda)
function setOn(it, i, mode) {
  if (mode === 'all') it.on = true;
  else if (mode === 'none') it.on = false;
  else it.on = i === mode;
}

// Aplica a todos los productos del catálogo.
function applyAll(mode) {
  for (const r of state.rows) {
    if (hasImages(r)) r.images.forEach((it, i) => setOn(it, i, mode));
  }
  requestRender();
}

// Aplica solo al producto que se está viendo en el modo selección.
function applyCurrent(mode) {
  const r = photoList[photoIdx];
  if (!hasImages(r)) return;
  r.images.forEach((it, i) => setOn(it, i, mode));
  requestRender();
  renderPhoto();
}

// Actualiza el contador del carrito y habilita o deshabilita sus botones.
export function syncImagesCart() {
  const count = document.getElementById('imgCount');
  if (!count) return;

  let total = 0;
  let sel = 0;
  let prods = 0;
  for (const r of state.rows) {
    if (!hasImages(r)) continue;
    prods++;
    total += r.images.length;
    sel += r.images.filter(it => it.on).length;
  }

  count.textContent = `${sel} de ${total} imágenes · ${prods} productos`;
  document.getElementById('imgAll').disabled = total === 0;
  document.getElementById('imgNone').disabled = total === 0;
  document.getElementById('imgFirst').disabled = total === 0;
  document.getElementById('imgSecond').disabled = total === 0;
  document.getElementById('imgZip').disabled = sel === 0;
  document.getElementById('photoMode').disabled = feedRows().length === 0;
}

/* ---------------- Captura en pantalla → ZIP ---------------- */

let captureStream = null;
let captureVideo = null;
let captureOverlay = null;
let captureImg = null;
let captureLabel = null;

// Overlay a pantalla completa, creado una sola vez.
function ensureOverlay() {
  if (captureOverlay) return;
  captureOverlay = document.createElement('div');
  captureOverlay.style.cssText =
    'position:fixed;inset:0;z-index:100;background:#000;display:none;align-items:center;justify-content:center;';
  captureImg = document.createElement('img');
  captureImg.style.display = 'block';
  captureLabel = document.createElement('div');
  captureLabel.style.cssText =
    'position:fixed;top:12px;left:12px;background:rgba(0,0,0,.75);color:#fff;padding:6px 10px;border-radius:8px;font:600 13px system-ui,sans-serif;';
  captureOverlay.append(captureImg, captureLabel);
  document.body.appendChild(captureOverlay);
}

// Pide permiso para capturar esta pestaña. Debe llamarse desde un clic, antes de cualquier await.
async function startCapture() {
  captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: 'browser' },
    audio: false,
    preferCurrentTab: true
  });
  // Si el usuario detiene el uso compartido desde Chrome, el bucle se entera por aquí.
  captureStream.getVideoTracks()[0].addEventListener('ended', () => { captureStream = null; });

  captureVideo = document.createElement('video');
  captureVideo.muted = true;
  captureVideo.style.display = 'none';
  captureVideo.srcObject = captureStream;
  document.body.appendChild(captureVideo);
  if (captureVideo.readyState < 1) {
    await new Promise(r => captureVideo.addEventListener('loadedmetadata', r, { once: true }));
  }
  await captureVideo.play();
}

function stopCapture() {
  captureStream?.getTracks().forEach(t => t.stop());
  captureStream = null;
  captureVideo?.remove();
  captureVideo = null;
}

// Espera el siguiente frame de vídeo. Si la pestaña está oculta, no llega ninguno: se rechaza tras el tiempo límite.
function nextFrame(ms = 3000) {
  return Promise.race([
    new Promise(r => captureVideo.requestVideoFrameCallback(() => r())),
    new Promise((_, rej) => setTimeout(() => rej(new Error('la pestaña no estaba visible')), ms))
  ]);
}

// Lado más grande posible que quepa en la ventana sin deformar la imagen.
function fitSize(nw, nh) {
  const k = Math.min(window.innerWidth / nw, window.innerHeight / nh);
  return { w: Math.round(nw * k), h: Math.round(nh * k) };
}

// Muestra una imagen a su tamaño máximo, captura solo su rectángulo y devuelve un PNG.
async function captureOne(url, label) {
  captureLabel.textContent = label;
  captureLabel.style.visibility = 'visible';
  captureImg.src = url;
  await captureImg.decode();

  const { w, h } = fitSize(captureImg.naturalWidth, captureImg.naturalHeight);
  captureImg.style.width = w + 'px';
  captureImg.style.height = h + 'px';
  captureOverlay.style.display = 'flex';

  // Dos frames para que el layout esté aplicado; luego un frame de vídeo posterior a eso.
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  captureLabel.style.visibility = 'hidden';
  await nextFrame();

  // El frame capturado es la ventana en píxeles de dispositivo. Se mapea el rectángulo CSS a ese espacio.
  const sx = captureVideo.videoWidth / window.innerWidth;
  const sy = captureVideo.videoHeight / window.innerHeight;
  const rect = captureImg.getBoundingClientRect();

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(rect.width * sx);
  canvas.height = Math.round(rect.height * sy);
  canvas.getContext('2d').drawImage(
    captureVideo,
    rect.left * sx, rect.top * sy, rect.width * sx, rect.height * sy,
    0, 0, canvas.width, canvas.height
  );

  return new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error('no se pudo generar el PNG'))), 'image/png')
  );
}

/* ----- ZIP sin compresión (store), escrito a mano ----- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// entries: [{ name, data: Uint8Array }]. Devuelve un Blob .zip.
function buildZip(entries) {
  const enc = new TextEncoder();
  const body = [];
  const central = [];
  let offset = 0;

  for (const e of entries) {
    const name = enc.encode(e.name);
    const crc = crc32(e.data);
    const size = e.data.length;

    // Cabecera local (30 bytes)
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);        // versión necesaria
    lh.setUint16(6, 0x0800, true);    // nombres en UTF-8
    lh.setUint16(8, 0, true);         // método 0 = sin compresión
    lh.setUint16(12, 0x21, true);     // fecha 1980-01-01
    lh.setUint32(14, crc, true);
    lh.setUint32(18, size, true);
    lh.setUint32(22, size, true);
    lh.setUint16(26, name.length, true);
    body.push(lh.buffer, name, e.data);

    // Entrada del directorio central (46 bytes)
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true);
    ch.setUint16(14, 0x21, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, size, true);
    ch.setUint32(24, size, true);
    ch.setUint16(28, name.length, true);
    ch.setUint32(42, offset, true);
    central.push(ch.buffer, name);

    offset += 30 + name.length + size;
  }

  const cdSize = central.reduce((s, b) => s + b.byteLength, 0);

  // Registro de fin del directorio (22 bytes)
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);

  return new Blob([...body, ...central, end.buffer], { type: 'application/zip' });
}

/* ----- Flujo completo ----- */

async function captureAndZip() {
  const btn = document.getElementById('imgZip');

  // Lista de trabajos: solo imágenes activas de productos con ID. Esto no es asíncrono.
  const jobs = [];
  const seen = new Set();
  for (const r of state.rows) {
    if (!r.feedId || !hasImages(r)) continue;
    r.images.forEach((it, i) => {
      if (!it.on) return;
      const name = `${r.feedId} - ${i + 1}.png`;
      if (seen.has(name)) return;
      seen.add(name);
      jobs.push({ name, url: it.url });
    });
  }
  if (!jobs.length) {
    setStatus('No hay imágenes seleccionadas.');
    return;
  }

  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Capturando…';

  const entries = [];
  const errors = [];

  try {
    // Esta llamada debe ser la primera operación asíncrona, para que Chrome acepte el clic.
    try {
      await startCapture();
    } catch (err) {
      setStatus('Captura no iniciada: ' + err.message);
      return;
    }
    ensureOverlay();

    for (let k = 0; k < jobs.length; k++) {
      if (!captureStream) {
        errors.push('captura detenida por el usuario');
        break;
      }
      const job = jobs[k];
      setStatus(`Capturando ${k + 1} de ${jobs.length} · no cambies de pestaña`);
      try {
        const blob = await captureOne(job.url, `${k + 1} de ${jobs.length} · ${job.name}`);
        entries.push({ name: job.name, data: new Uint8Array(await blob.arrayBuffer()) });
      } catch (err) {
        errors.push(`${job.name}: ${err.message}`);
      }
    }
  } finally {
    stopCapture();
    if (captureOverlay) captureOverlay.style.display = 'none';
    btn.textContent = label;
    syncImagesCart();
  }

  if (errors.length) {
    entries.push({ name: 'errores.txt', data: new TextEncoder().encode(errors.join('\n')) });
  }
  if (!entries.length || entries.length === (errors.length ? 1 : 0)) {
    setStatus('No se capturó ninguna imagen.');
    return;
  }

  const blob = buildZip(entries);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Imagenes Briefing.zip';
  a.click();
  URL.revokeObjectURL(url);

  const ok = entries.length - (errors.length ? 1 : 0);
  setStatus(`ZIP listo: ${ok} imágenes${errors.length ? `, ${errors.length} con error` : ''}.`);
}

/* ---------------- Modo selección de fotos ---------------- */

function cellText(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function renderList() {
  P.tableBox.replaceChildren();

  const table = document.createElement('table');
  table.className = 'photo-table';

  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  ['ID en feed', 'Título · en feed', '#', 'Pág.'].forEach(t => {
    const th = document.createElement('th');
    th.textContent = t;
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  photoList.forEach((r, k) => {
    const tr = document.createElement('tr');
    if (k === photoIdx) tr.className = 'on';
    tr.append(
      cellText(r.feedId),
      cellText(`${r.title} - ${r.feedTitle || ''}`),
      cellText(String(state.rows.indexOf(r) + 1)),
      cellText(r.pages.join(', '))
    );
    tr.addEventListener('click', () => {
      photoIdx = k;
      renderPhoto();
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  P.tableBox.appendChild(table);

  const cur = P.tableBox.querySelector('tr.on');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
}

function renderPhoto() {
  const r = photoList[photoIdx];
  if (!r) return;
  modalRefresh = renderPhoto;

  P.title.textContent = `${r.feedId} · ${r.feedTitle || r.title}`;
  P.counter.textContent = `${photoIdx + 1} de ${photoList.length}`;
  P.prev.disabled = photoIdx === 0;
  P.next.disabled = photoIdx === photoList.length - 1;

  P.grid.replaceChildren();
  if (!hasImages(r)) {
    const p = document.createElement('p');
    p.className = 'img-empty';
    p.textContent = 'Sin imágenes para este producto.';
    P.grid.appendChild(p);
  } else {
    r.images.forEach((it, i) => P.grid.appendChild(makeTile(r, it, i, true)));
  }

  renderList();
}

function openPhotoMode(startRow = null) {
  photoList = feedRows();
  if (!photoList.length) {
    setStatus('No hay productos con ID de feed.');
    return;
  }
  const k = startRow ? photoList.indexOf(startRow) : 0;
  photoIdx = k < 0 ? 0 : k;

  P.modal.hidden = false;
  document.body.classList.add('modal-open');
  renderPhoto();
}

function closePhotoMode() {
  P.modal.hidden = true;
  document.body.classList.remove('modal-open');
  modalRefresh = null;
}

function go(delta) {
  const next = Math.min(photoList.length - 1, Math.max(0, photoIdx + delta));
  if (next === photoIdx) return;
  photoIdx = next;
  renderPhoto();
}

// Teclado del modo selección: flechas cambian de producto, 1-9 activan o desactivan
// la imagen con ese número, Escape cierra.
function onKey(e) {
  if (!P || P.modal.hidden) return;
  if (e.target && e.target.isContentEditable) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closePhotoMode();
    return;
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    go(1);
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    go(-1);
    return;
  }
  if (/^[1-9]$/.test(e.key)) {
    const r = photoList[photoIdx];
    const i = Number(e.key) - 1;
    if (hasImages(r) && r.images[i]) {
      e.preventDefault();
      toggleImage(r, i);
    }
  }
}

// Cualquier clic fuera de la fila de imágenes la cierra. Un clic en la pestaña de otro
// producto cierra la anterior y abre la suya. Se ejecuta antes de que el clic llegue
// al elemento, por eso usa la fase de captura.
function closeImageRowsOnOutsideClick(e) {
  if (P && !P.modal.hidden) return;
  if (!(e.target instanceof Element)) return;

  const sub = e.target.closest('tr.img-row');
  const btn = e.target.closest('.img-btn');
  const keep = sub ? sub._row : btn ? btn._row : null;

  let changed = false;
  for (const r of state.rows) {
    if (r.imgOpen && r !== keep) {
      r.imgOpen = false;
      changed = true;
    }
  }
  if (changed) requestRender();
}

function getPhotoEls() {
  return {
    modal: document.getElementById('photoModal'),
    title: document.getElementById('photoTitle'),
    counter: document.getElementById('photoCounter'),
    prev: document.getElementById('photoPrev'),
    next: document.getElementById('photoNext'),
    close: document.getElementById('photoClose'),
    tableBox: document.getElementById('photoTableBox'),
    grid: document.getElementById('photoGrid'),
    all: document.getElementById('photoAll'),
    none: document.getElementById('photoNone'),
    first: document.getElementById('photoFirst'),
    second: document.getElementById('photoSecond')
  };
}

// Conecta el carrito, el botón de modo selección, el teclado y el cierre por clic fuera.
export function initImages() {
  P = getPhotoEls();

  document.getElementById('imgAll').addEventListener('click', () => applyAll('all'));
  document.getElementById('imgNone').addEventListener('click', () => applyAll('none'));
  document.getElementById('imgFirst').addEventListener('click', () => applyAll(0));
  document.getElementById('imgSecond').addEventListener('click', () => applyAll(1));
  document.getElementById('imgZip').addEventListener('click', captureAndZip);
  document.getElementById('photoMode').addEventListener('click', () => openPhotoMode());

  P.prev.addEventListener('click', () => go(-1));
  P.next.addEventListener('click', () => go(1));
  P.close.addEventListener('click', closePhotoMode);
  P.modal.addEventListener('click', e => {
    if (e.target === P.modal) closePhotoMode();
  });
  P.all.addEventListener('click', () => applyCurrent('all'));
  P.none.addEventListener('click', () => applyCurrent('none'));
  P.first.addEventListener('click', () => applyCurrent(0));
  P.second.addEventListener('click', () => applyCurrent(1));

  document.addEventListener('keydown', onKey);
  document.addEventListener('click', closeImageRowsOnOutsideClick, true);
  syncImagesCart();
}