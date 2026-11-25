import { exTitle, exChapter, exLink, dlExcelBtn } from '../ui/dom.js';
import { state } from '../state.js';
import {
  TEMPLATE_COLUMNS, EXCEL_WIDTHS, SHEET_NAME, OUTPUT_NAME,
  HEADER_FILL, STRIPE_FILL, WHITE_FILL
} from '../config.js';
import { setStatus } from '../ui/toast.js';
import { finalUrl } from '../utils.js';

const LINK_WIDTH = 60;
const BORDER_THIN = { style: 'thin', color: { argb: 'FF000000' } };
const CELL_BORDER = { left: BORDER_THIN, right: BORDER_THIN };

// Las 15 columnas de la plantilla, y "link" al final si su casilla está activa.
function exportColumns() {
  return exLink.checked ? [...TEMPLATE_COLUMNS, 'link'] : [...TEMPLATE_COLUMNS];
}

function columnWidths(columns) {
  return columns.map((_, i) => (i < TEMPLATE_COLUMNS.length ? EXCEL_WIDTHS[i] : LINK_WIDTH));
}

// Solo filas activas. product_id siempre; header y section según sus casillas;
// link (URL del feed más el UTM) si la casilla Link está activa.
function buildExcelRows(columns) {
  const active = state.rows.filter(r => r.activo);
  const missing = [];

  const data = active.map(r => {
    const productId = String(r.feedId || r.sku || '').trim();
    if (!productId) missing.push(state.rows.indexOf(r) + 1);

    const out = {};
    for (const col of columns) out[col] = '';
    out.product_id = productId;
    if (exTitle.checked) out.header = r.titleFound ? r.title : '';
    if (exChapter.checked) out.section = Number(r.pages?.[0]) || 1;
    if (exLink.checked) out.link = finalUrl(r.url, state.utm);
    return out;
  });

  return { data, missing };
}

function solidFill(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

// Genera el .xlsx con el estilo de la plantilla y lo descarga.
async function downloadExcel() {
  const columns = exportColumns();
  const { data, missing } = buildExcelRows(columns);

  if (missing.length) {
    setStatus(`No se exportó: ${missing.length} fila(s) activa(s) sin ID ni SKU (filas ${missing.join(', ')}).`);
    return;
  }
  if (!data.length) {
    setStatus('No hay filas activas para exportar.');
    return;
  }

  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(SHEET_NAME, {
      views: [{ state: 'frozen', xSplit: 2, ySplit: 1, zoomScale: 70 }]
    });

    const widths = columnWidths(columns);
    ws.columns = columns.map((key, i) => ({ header: key, key, width: widths[i] }));

    const header = ws.getRow(1);
    header.height = 18;
    header.eachCell({ includeEmpty: true }, c => {
      c.fill = solidFill(HEADER_FILL);
      c.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      c.alignment = { vertical: 'middle', horizontal: 'left' };
      c.border = CELL_BORDER;
    });

    data.forEach((rowData, i) => {
      const row = ws.addRow(rowData);
      const fill = solidFill(i % 2 === 0 ? STRIPE_FILL : WHITE_FILL);
      row.eachCell({ includeEmpty: true }, c => {
        c.fill = fill;
        c.font = { name: 'Arial', size: 10 };
        c.alignment = { vertical: 'top' };
        c.border = CELL_BORDER;
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = OUTPUT_NAME;
    a.click();
    URL.revokeObjectURL(url);

    setStatus(`Excel exportado: ${data.length} filas${exLink.checked ? ' · con columna link' : ''}.`);
  } catch (err) {
    setStatus('Error al exportar: ' + err.message);
    console.error(err);
  }
}

export function initExport() {
  dlExcelBtn.addEventListener('click', downloadExcel);
}