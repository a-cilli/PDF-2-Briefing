import { FEED_STATUS_URL } from '../config.js';

let feedTimer = null;

// Actualiza todas las pastillas. Texto corto visible; el detalle queda en el tooltip.
function setFeedPill(stateName, label, detail = '') {
  document.querySelectorAll('[data-feed]').forEach(p => {
    p.dataset.state = stateName;
    p.querySelector('.txt').textContent = label;
    p.title = detail || label;
  });
}

// Revisa /status del servidor Python. Cada 15 s con el feed listo, cada 2 s si no lo está.
async function checkFeedServer() {
  let next = 2000;
  try {
    const res = await fetch(FEED_STATUS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const s = await res.json();

    if (s.error) {
      setFeedPill('error', 'Error del feed', s.error);
      next = 5000;
    } else if (!s.loaded) {
      setFeedPill('loading', 'Cargando feed', 'El servidor está cargando el feed');
    } else {
      const entries = Number(s.entries).toLocaleString('es-MX');
      setFeedPill('ready', 'Feed listo', `${entries} entradas · actualizado ${s.updated}`);
      next = 15000;
    }
  } catch {
    setFeedPill('down', 'Sin conexión', 'Servidor apagado: ejecuta feed_server.py');
  }
  clearTimeout(feedTimer);
  feedTimer = setTimeout(checkFeedServer, next);
}

export function startFeedStatus() {
  checkFeedServer();
}

// Espera hasta que el feed esté cargado. Llama onWait con un mensaje mientras espera.
// Rechaza si el servidor reporta un error de carga.
export function waitForFeed(onWait) {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const res = await fetch(FEED_STATUS_URL, { cache: 'no-store' });
        const s = await res.json();
        if (s.loaded) return resolve(s);
        if (s.error) return reject(new Error(s.error));
        onWait('PDF listo. Esperando el feed…');
      } catch {
        onWait('PDF listo. Esperando el servidor del feed…');
      }
      setTimeout(poll, 1000);
    };
    poll();
  });
}