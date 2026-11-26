// Punto de entrada: conecta los módulos y arranca la app.
import { hooks } from './state.js';
import { renderTable, initTableLayout } from './ui/table.js';
import { initUpload } from './ui/upload.js';
import { initResizer } from './ui/preview.js';
import { initExport } from './export/excel.js';
import { startFeedStatus } from './feed/status.js';
import { initManualCheck } from './feed/manual.js';
import { initUtm } from './ui/utm.js';
import { initColumns } from './ui/columns.js';
import { initModal } from './ui/modal.js';
import { initToolsToggle } from './ui/toolbar.js';
import { initImages } from './ui/images.js';

// Registra el render de la tabla para que los demás módulos puedan pedirlo.
hooks.render = renderTable;

initUpload();
initResizer();
initExport();
initManualCheck();
initUtm();
initColumns();
initModal();
initToolsToggle();
initTableLayout();
initImages();
startFeedStatus();