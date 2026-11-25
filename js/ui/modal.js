import { exportModal, openExportBtn, dlExcelBtn } from './dom.js';

export function openModal() {
  exportModal.hidden = false;
  document.body.classList.add('modal-open');
  dlExcelBtn.focus();
}

export function closeModal() {
  exportModal.hidden = true;
  document.body.classList.remove('modal-open');
  openExportBtn.focus();
}

// Abre con el botón, cierra con la X, Cancelar, el fondo o la tecla Escape.
export function initModal() {
  openExportBtn.addEventListener('click', openModal);
  exportModal.querySelectorAll('[data-close]').forEach(el =>
    el.addEventListener('click', closeModal)
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !exportModal.hidden) closeModal();
  });
}