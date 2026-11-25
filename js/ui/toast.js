import { toast } from './dom.js';

let toastTimer = null;

// Muestra un mensaje breve abajo de la pantalla.
export function setStatus(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
}