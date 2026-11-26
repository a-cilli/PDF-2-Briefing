import { dropZone, progressText, uploadError, fileInput } from './dom.js';
import { state } from '../state.js';
import { readPdf } from '../pdf/reader.js';
import { extract } from '../pdf/card.js';
import { enrichFromFeed } from '../feed/lookup.js';
import { waitForFeed } from '../feed/status.js';
import { setStatus } from './toast.js';
import { showWorkspace, setBusy, showUploadError } from './views.js';
import { renderSidebar } from './preview.js';
import { renderTable } from './table.js';

// Lee el PDF, busca códigos y títulos, espera el feed y muestra el espacio de trabajo.
export async function handleFile(file) {
  if (!file) return;
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    showUploadError('Ese archivo no es un PDF.');
    return;
  }

  uploadError.hidden = true;
  setBusy(true);
  state.activeFilter = 'all';

  try {
    state.lastName = file.name.replace(/\.pdf$/i, '');
    const doc = await readPdf(file, msg => (progressText.textContent = msg));

    progressText.textContent = 'Buscando códigos y títulos…';
    const result = extract(doc);
    state.rows = result.products;
    state.rows.forEach(r => {
      r.activo = true;
      r.manual = false;
      r.boxes = [];
    });
    renderSidebar(doc, state.rows);

    // La tabla no se muestra hasta que el feed esté listo.
    progressText.textContent = 'PDF listo. Esperando el feed…';
    try {
      await waitForFeed(msg => (progressText.textContent = msg));

      progressText.textContent = 'Consultando feed local…';
      await enrichFromFeed(state.rows);
      setStatus(`${doc.numPages} páginas · ${result.hitCount} códigos encontrados.`);
    } catch (feedErr) {
      // Sin feed utilizable: las filas se muestran marcadas con el error.
      state.rows.forEach(r => (r.feedError = feedErr.message));
      setStatus(`Sin feed: ${feedErr.message}. Revisa que feed_server.py esté corriendo.`);
      console.error(feedErr);
    }

    showWorkspace();
    renderTable();
  } catch (err) {
    showUploadError('Error al procesar el PDF: ' + err.message);
    console.error(err);
  } finally {
    setBusy(false);
  }
}

// Clic, teclado, arrastrar y soltar en la zona de subida.
export function initUpload() {
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

  ['dragenter', 'dragover'].forEach(ev =>
    dropZone.addEventListener(ev, e => {
      e.preventDefault();
      dropZone.classList.add('over');
    })
  );
  ['dragleave', 'drop'].forEach(ev =>
    dropZone.addEventListener(ev, e => {
      e.preventDefault();
      dropZone.classList.remove('over');
    })
  );
  dropZone.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));

  // Evita que el navegador abra el PDF si se suelta fuera de la zona.
  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('drop', e => e.preventDefault());
}