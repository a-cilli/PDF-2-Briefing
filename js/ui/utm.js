import { state, requestRender } from '../state.js';
import { utmInput } from './dom.js';

// Al escribir en UTM, la tabla se redibuja para mostrar el sufijo en todas las URLs.
export function initUtm() {
  if (!utmInput) return;
  utmInput.addEventListener('input', () => {
    state.utm = utmInput.value;
    requestRender();
  });
}