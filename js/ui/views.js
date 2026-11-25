import {
  uploadView, workspaceView, dropZone, dropIdle, dropBusy,
  uploadError, fileInput, wsTitle
} from './dom.js';
import { state } from '../state.js';

export function showUpload() {
  workspaceView.hidden = true;
  uploadView.hidden = false;
  setBusy(false);
  uploadError.hidden = true;
  fileInput.value = '';
}

export function showWorkspace() {
  uploadView.hidden = true;
  workspaceView.hidden = false;
  wsTitle.textContent = `${state.lastName}.pdf`;
}

// Muestra el spinner mientras se procesa el PDF.
export function setBusy(busy) {
  dropZone.classList.toggle('busy', busy);
  dropIdle.hidden = busy;
  dropBusy.hidden = !busy;
}

export function showUploadError(msg) {
  uploadError.textContent = msg;
  uploadError.hidden = false;
}