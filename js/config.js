// Parámetros generales. Cambiar algo aquí afecta a todo el proyecto.

export const API = 'http://127.0.0.1:8000';
export const FEED_STATUS_URL = `${API}/status`;

// Texto de pies, insignias y notas legales que nunca es producto.
export const NOISE = /Coppel\.com|RC [Hh]ogar|Abonos calculados|Los precios incluyen|el historial de pago|Ve al punto|Escanea y|pídelo en|estrena|EN PORTADA|^\d{1,2}$|^\u001f/;

// Códigos y etiquetas. Solo se aceptan 6 dígitos.
export const CODE_RE = /\b(\d{6})\b/g;
export const LIST_LABEL_RE = /\bC[oó]digos\b/i;
export const PRICE_LINE_RE = /\$|quincenas|Código|Contado/i;
export const LABEL_RE = /^(De|de|a)$|quincenas|Código|Contado/i;
export const LETTER_RE = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/;
export const NOT_TITLE_RE = /\$|quincenas|Código|Contado|Disponible|Gris|Café|[¡!¿?]|\.\s*$|:\s*\S/i;

// Geometría (puntos del PDF)
export const CARD_HEIGHT = 180;
export const COLUMN_GAP = 12;
export const FOOTER_Y = 735;
export const HEADLINE_H = 20;
export const SAME_ROW_TOL = 8;   // puntos verticales para considerar que dos códigos están en la misma fila

// Vista previa
export const THUMB_WIDTH = 1000;
export const SIDEBAR_MIN = 180;
export const SIDEBAR_MAX = 700;

// Tabla: número de columnas (para las líneas divisorias)
export const COLS = 10;

// Columnas de la tabla, en el orden de la cabecera. Sirven para mostrar u ocultar columnas.
export const COLUMNS = [
  { key: 'activo',      label: 'Activo' },
  { key: 'idx',         label: '#' },
  { key: 'sku',         label: 'SKU' },
  { key: 'feedId',      label: 'ID en feed' },
  { key: 'titulo',      label: 'Título' },
  { key: 'feedName',    label: 'Nombre en feed' },
  { key: 'precioOrig',  label: 'Precio original' },
  { key: 'precioFinal', label: 'Precio final' },
  { key: 'url',         label: 'URL' },
  { key: 'pagina',      label: 'Página' }
];

// Columnas de ancho fijo (px).
export const FIXED_COLS = {
  activo: 56,
  idx: 72,
  sku: 88,
  feedId: 120,
  precioOrig: 96,
  precioFinal: 96,
  pagina: 64
};

// Columnas flexibles: reparten el espacio sobrante según estos pesos.
// URL = 3, Título = 2, Nombre en feed = 2.
export const FLEX_COLS = {
  titulo: 2,
  feedName: 2,
  url: 3
};

// Ancho mínimo de cada columna flexible (px).
export const FLEX_MIN_PX = 175;

// Excel
export const SHEET_NAME = 'Standard Briefing Format';
export const OUTPUT_NAME = 'Briefing File.xlsx';

// Cabecera completa de la plantilla, en el mismo orden.
export const TEMPLATE_COLUMNS = [
  'product_id', 'offer_id', 'priority', 'section', 'header', 'summary', 'splash',
  'image_url', 'sales_price', 'sales_price_aside_1', 'sales_price_aside_2', 'offer_url',
  'energy_label', 'energy_label_image', 'logos'
];

export const EXCEL_WIDTHS = [22.5, 23.125, 8.375, 25.25, 33.75, 46.75, 9, 38.625, 12.875, 22.5, 22.5, 10, 14.5, 22.125, 153.25];
export const HEADER_FILL = 'FF4640B7';
export const STRIPE_FILL = 'FFEFEFEB';
export const WHITE_FILL = 'FFFFFFFF';