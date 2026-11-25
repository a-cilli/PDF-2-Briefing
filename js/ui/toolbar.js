import { toggleTools, toolsRow } from './dom.js';

// Muestra u oculta la segunda fila de herramientas. Empieza plegada en cada carga.
export function initToolsToggle() {
  toggleTools.addEventListener('click', () => {
    const willOpen = toolsRow.hidden;
    toolsRow.hidden = !willOpen;
    toggleTools.setAttribute('aria-expanded', String(willOpen));
  });
}