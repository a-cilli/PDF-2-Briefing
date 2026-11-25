import { requestRender } from '../state.js';

// Doble clic: la celda pasa a editable y se selecciona todo.
// Enter o pérdida de foco guarda; Escape descarta. Pegado en texto plano.
export function makeEditable(td, onCommit) {
  td.classList.add('editable');
  td.title = 'Doble clic para editar';

  td.addEventListener('paste', e => {
    if (!td.isContentEditable) return;
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
  });

  td.addEventListener('dblclick', () => {
    if (td.isContentEditable) return;
    let done = false;

    const finish = save => {
      if (done) return;
      done = true;
      td.removeEventListener('blur', onBlur);
      td.removeEventListener('keydown', onKey);
      td.contentEditable = 'false';
      td.classList.remove('editing');
      if (save) onCommit(td.textContent.trim());
      else requestRender();
    };
    const onBlur = () => finish(true);
    const onKey = e => {
      if (e.key === 'Enter') { e.preventDefault(); td.blur(); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    };

    td.contentEditable = 'true';
    td.classList.add('editing');
    td.addEventListener('blur', onBlur);
    td.addEventListener('keydown', onKey);
    td.focus();

    const range = document.createRange();
    range.selectNodeContents(td);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });
}