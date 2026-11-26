// Modal de ayuda en español e inglés. La elección de idioma se guarda en el navegador.
// Las maquetas son solo visuales: no tienen funciones.

const STORAGE_KEY = 'briefing-help-lang';

const UI = {
  en: { title: 'Help', tooltip: 'Help', prev: 'Previous', next: 'Next', of: (n, t) => `${n} of ${t}` },
  es: { title: 'Ayuda', tooltip: 'Ayuda', prev: 'Anterior', next: 'Siguiente', of: (n, t) => `${n} de ${t}` }
};

const ICON_ATTR = 'width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const COPY_ICON = `<svg ${ICON_ATTR}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const LINK_ICON = `<svg ${ICON_ATTR}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const IMG_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>`;
const PICTURE_PH = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>`;

// Textos según el idioma, para las etiquetas de las maquetas.
const T = (lang, en, es) => (lang === 'en' ? en : es);

/* ---------------- Maquetas ---------------- */

const visFeed = () => `
  <div class="mock">
    <div class="mk-bar">
      <span class="feed-pill" data-state="loading"><span class="dot"></span><span class="txt">Cargando feed</span></span>
      <span class="feed-pill" data-state="ready"><span class="dot"></span><span class="txt">Feed listo</span></span>
    </div>
  </div>`;

const visRows = () => `
  <div class="mock">
    <div class="mk-row mk-yellow"><input type="checkbox" checked tabindex="-1" /><span>421804</span><span class="mk-muted">Sin título</span></div>
    <div class="mk-row mk-red"><input type="checkbox" checked tabindex="-1" /><span>409062</span><span class="mk-muted">Solo código</span></div>
    <div class="mk-row mk-lila"><input type="checkbox" checked tabindex="-1" /><span>pm-4218043</span><span>Sofá Naomi</span></div>
    <div class="mk-row mk-gray"><input type="checkbox" tabindex="-1" /><span>389514</span><span>Desactivada</span></div>
  </div>`;

const visManual = lang => `
  <div class="mock">
    <div class="mk-stack">
      <div class="mk-row"><input type="checkbox" checked tabindex="-1" /><span>421804</span><span class="mk-muted">Sofá Naomi</span></div>
      <div class="mk-gap"><span class="mk-plus">+</span></div>
      <div class="mk-row mk-lila"><input type="checkbox" checked tabindex="-1" /><span>pm-4218043</span><span class="mk-muted">${T(lang, 'Manual row', 'Fila manual')}</span></div>
    </div>
  </div>
  <div class="mk-caption">${T(lang, 'Tools → Search manual rows in feed', 'Herramientas → Buscar manuales en feed')}</div>
  <div class="mock mk-action">
    <span class="btn" style="display: inline-block;width: max-content;" tabindex="-1">Buscar manuales en feed</span>
  </div>`;

const visLinks = lang => `
  <div class="mock">
    <div class="mk-grid">
      <div class="mk-gh">Título</div>
      <div class="mk-gh">URL</div>
      <div class="mk-gc">
        <span class="mk-txt">Sofá Naomi</span>
        <button class="copy-btn" tabindex="-1" type="button">${COPY_ICON}</button>
      </div>
      <div class="mk-gc">
        <span class="mk-txt mk-url">https://tienda.ejemplo.com/producto/421804</span><span class="mk-utm">?utm_source=ig</span>
        <button class="copy-btn" tabindex="-1" type="button">${LINK_ICON}</button>
      </div>
    </div>
  </div>
  <div class="mk-caption">${T(lang, 'Editable: double-click Título or URL', 'Editable: doble clic en Título o URL')}</div>`;

const visImages = lang => `
  <div class="mock">
    <div class="mk-grid mk-grid-4">
      <div class="mk-gh"></div>
      <div class="mk-gh">Activo</div>
      <div class="mk-gh">#</div>
      <div class="mk-gh">ID en feed</div>
      <div class="mk-gc mk-center">
        <button class="img-btn" tabindex="-1" type="button">${IMG_ICON}<span class="img-badge">3</span></button>
      </div>
      <div class="mk-gc mk-center"><input type="checkbox" checked tabindex="-1" /></div>
      <div class="mk-gc mk-center">1</div>
      <div class="mk-gc">421804</div>
    </div>
  </div>
  <div class="mk-caption">${T(lang, 'Image states', 'Estados de las imágenes')}</div>
  <div class="mock">
    <div class="mk-tiles">
      <div class="mk-tilecol">
        <div class="img-tile">
          <span class="img-num">1</span><span class="img-check">✓</span>
          <div class="mk-ph">${PICTURE_PH}</div>
        </div>
        <span class="mk-caption">${T(lang, 'Active', 'Activa')}</span>
      </div>
      <div class="mk-tilecol">
        <div class="img-tile off">
          <span class="img-num">2</span>
          <div class="mk-ph">${PICTURE_PH}</div>
        </div>
        <span class="mk-caption">${T(lang, 'Inactive', 'Inactiva')}</span>
      </div>
    </div>
  </div>`;

const visImageTools = lang => `
  <div class="mk-caption">Herramientas → Imágenes</div>
  <div class="mock">
    <div class="mk-tools">
      <span class="btn sm" tabindex="-1">Activar todas</span>
      <span class="btn sm" tabindex="-1">Desactivar todas</span>
      <span class="btn sm" tabindex="-1">Solo la 1ª</span>
      <span class="btn sm" tabindex="-1">Solo la 2ª</span>
      <span class="btn sm primary" tabindex="-1">Capturar y descargar ZIP</span>
      <span class="btn sm" tabindex="-1">Modo selección de fotos</span>
    </div>
  </div>`;

const visPhotoMode = lang => `
  <div class="mock mk-photo">
    <div class="mk-photo-head">
      <strong>421804 · Sofá Naomi</strong>
      <span class="mk-muted">2 ${T(lang, 'of', 'de')} 9</span>
    </div>
    <div class="mk-photo-body">
      <div class="mk-photo-list">
        <div class="mk-pl">409062</div>
        <div class="mk-pl on">421804</div>
        <div class="mk-pl">389514</div>
      </div>
      <div class="mk-photo-grid">
        <div class="img-tile"><span class="img-num">1</span><span class="img-check">✓</span><div class="mk-ph">${PICTURE_PH}</div></div>
        <div class="img-tile off"><span class="img-num">2</span><div class="mk-ph">${PICTURE_PH}</div></div>
        <div class="img-tile"><span class="img-num">3</span><span class="img-check">✓</span><div class="mk-ph">${PICTURE_PH}</div></div>
      </div>
    </div>
    <div class="mk-photo-hint">← → · 1-9 · Esc</div>
  </div>`;

const visFilters = () => `
  <div class="mock">
    <div class="mk-bar">
      <span class="chip">12 filas</span>
      <span class="chip">10 activas</span>
      <span class="chip warn">3 sin título</span>
      <span class="chip muted">2 sin match</span>
    </div>
    <div class="mk-bar">
      <label class="col-toggle"><input type="checkbox" checked tabindex="-1" /><span>Título</span></label>
      <label class="col-toggle"><input type="checkbox" tabindex="-1" /><span>Precio final</span></label>
    </div>
  </div>`;

const visExport = lang => `
  <div class="mock mk-modal">
    <div class="mk-modal-head"><strong>Exportar Excel</strong><span>×</span></div>
    <div class="mk-modal-sec">
      <div class="modal-label">Columnas del Excel</div>
      <div class="check-grid">
        <label class="check"><input type="checkbox" checked disabled /><span>SKU<small>product_id · siempre</small></span></label>
        <label class="check"><input type="checkbox" checked tabindex="-1" /><span>Título<small>header</small></span></label>
        <label class="check"><input type="checkbox" checked tabindex="-1" /><span>Capítulo<small>section</small></span></label>
        <label class="check"><input type="checkbox" checked tabindex="-1" /><span>Link<small>columna link · con UTM</small></span></label>
      </div>
    </div>
    <div class="mk-modal-foot"><span class="btn primary" tabindex="-1">Descargar Excel</span></div>
  </div>
  <div class="mk-caption">${T(lang, 'Click Exportar Excel to open this window', 'Haz clic en Exportar Excel para abrir esta ventana')}</div>`;

/* ---------------- Páginas ---------------- */

const PAGES = [
  {
    // 1: introducción
    title: { en: 'Introduction', es: 'Introducción' },
    body: {
      en: `
        <p><strong>Briefing File</strong></p>
        <p>This tool turns a PDF product catalog into a table you can review, correct, and export to Excel in the briefing format. It also matches each product with the product feed, lets you choose and capture images, and exports the links with your UTM parameters.</p>
        <p>Everything you upload is read on your computer. The PDF is not sent to any server.</p>
        <p><strong>Disclaimer</strong></p>
        <p>This project is <strong>not a product of iPaper</strong>. iPaper is not responsible for its use, maintenance, operation, or the results it produces.</p>
        <ul>
          <li>The code is provided as is.</li>
          <li>Whoever uses it is responsible for <strong>running, modifying, extending, and debugging it</strong>.</li>
          <li>Make sure your use complies with the terms of the websites and data sources it accesses.</li>
        </ul>`,
      es: `
        <p><strong>Briefing File</strong></p>
        <p>Esta herramienta convierte un catálogo de productos en PDF en una tabla que puedes revisar, corregir y exportar a Excel en el formato de briefing. También cruza cada producto con el feed, permite elegir y capturar imágenes, y exporta los enlaces con tus parámetros UTM.</p>
        <p>Todo lo que subes se lee en tu computadora. El PDF no se envía a ningún servidor.</p>
        <p><strong>Aviso importante</strong></p>
        <p>Este proyecto <strong>no es un producto de iPaper</strong>. iPaper no se hace responsable de su uso, mantenimiento, funcionamiento ni de los resultados que produzca.</p>
        <ul>
          <li>El código se entrega tal cual.</li>
          <li>Es responsabilidad de quien lo use <strong>ejecutarlo, modificarlo, agregarle funciones y depurarlo</strong>.</li>
          <li>Revisa que el uso que le des cumpla con los términos de las páginas y fuentes de datos que consulta.</li>
        </ul>`
    },
    visual: () => ''
  },
  {
    // 2: primeros pasos
    title: { en: 'Getting started', es: 'Primeros pasos' },
    body: {
      en: `
        <ol>
          <li>Start the feed server: run <code>py feed_server.py</code> in the terminal and leave it open.</li>
          <li>Open the app with Live Server: right-click <code>index.html</code> and choose "Open with Live Server".</li>
          <li>Drag your PDF onto the start screen, or click to choose it.</li>
        </ol>
        <p>You can upload the PDF while the feed is still loading. The app waits for the feed before showing the table, and the <strong>Feed listo</strong> (Feed ready) pill at the top shows whether the feed is ready.</p>`,
      es: `
        <ol>
          <li>Inicia el servidor del feed: ejecuta <code>py feed_server.py</code> en la terminal y déjala abierta.</li>
          <li>Abre la aplicación con Live Server: haz clic derecho sobre <code>index.html</code> y elige "Open with Live Server".</li>
          <li>Arrastra tu PDF a la pantalla de inicio, o haz clic para elegirlo.</li>
        </ol>
        <p>Puedes subir el PDF mientras el feed todavía carga. La aplicación espera al feed antes de mostrar la tabla, y la pastilla <strong>Feed listo</strong> en la parte superior indica si ya está disponible.</p>`
    },
    visual: visFeed
  },
  {
    // 3: revisar la tabla
    title: { en: 'Reviewing the table', es: 'Revisar la tabla' },
    body: {
      en: `
        <p>Each row is one product. Use the checkbox in <strong>Activo</strong> (Active) to include or exclude a row. Click the row number to jump to that product in the PDF preview.</p>
        <p>Row colors:</p>
        <ul>
          <li><strong>Yellow:</strong> no title found in the PDF. Double-click the title to type it.</li>
          <li><strong>Red on the left:</strong> only the code was found, with no title or price. Check the PDF.</li>
          <li><strong>Lilac:</strong> manual row you added.</li>
          <li><strong>Gray, struck through:</strong> deactivated. It won't be exported.</li>
        </ul>`,
      es: `
        <p>Cada fila es un producto. Usa la casilla de <strong>Activo</strong> para incluir o excluir una fila. Haz clic en el número de fila para ir a ese producto en la vista previa del PDF.</p>
        <p>Colores de las filas:</p>
        <ul>
          <li><strong>Amarillo:</strong> no se encontró el título en el PDF. Haz doble clic en el título para escribirlo.</li>
          <li><strong>Rojo a la izquierda:</strong> solo se encontró el código, sin título ni precio. Revísalo en el PDF.</li>
          <li><strong>Lila:</strong> fila manual que agregaste.</li>
          <li><strong>Gris tachado:</strong> desactivada. No se exporta.</li>
        </ul>`
    },
    visual: visRows
  },
  {
    // 4: agregar y revisar productos manuales
    title: { en: 'Adding and checking products', es: 'Agregar y revisar productos' },
    body: {
      en: `
        <p>To add a product that the PDF didn't capture well, move the mouse between two rows and click the <strong>+</strong> that appears on the line between them. A new manual row is created there. Double-click its SKU to type the code. You can also set or change its <strong>Página</strong> (Page) by double-clicking that column. Delete manual rows with the trash icon.</p>
        <p>To check manual products against the feed, open <strong>Herramientas</strong> (Tools) and click <strong>Buscar manuales en feed</strong> (Search manual rows in feed). Rows turn teal if found and coral if not. You can search by a 6-digit code (<code>421804</code>) or a full feed ID (<code>pm-4218043</code>).</p>`,
      es: `
        <p>Para agregar un producto que el PDF no capturó bien, pasa el mouse entre dos filas y haz clic en el <strong>+</strong> que aparece sobre la línea entre ellas. Se crea una fila manual ahí. Haz doble clic en su SKU para escribir el código. También puedes escribir o cambiar su <strong>Página</strong> con doble clic en esa columna. Elimina filas manuales con el ícono de papelera.</p>
        <p>Para revisar productos manuales contra el feed, abre <strong>Herramientas</strong> y haz clic en <strong>Buscar manuales en feed</strong>. Las filas se pintan de verde azulado si se encuentran y de coral si no. Puedes buscar por código de 6 dígitos (<code>421804</code>) o por ID completo del feed (<code>pm-4218043</code>).</p>`
    },
    visual: visManual
  },
  {
    // 5: enlaces, copiar, columnas editables y UTM
    title: { en: 'Links, copy buttons, and editable columns', es: 'Enlaces, copiar y columnas editables' },
    body: {
      en: `
        <p>Hover over a title or feed name to see the <strong>copy</strong> button. Hover over a URL to see the <strong>link</strong> button, which opens the product page in a new tab without the query string.</p>
        <p><strong>Editable columns:</strong> Title and URL can be edited in every row. Double-click the cell, type, then press Enter to save or Escape to cancel. In manual rows, SKU and Page can be edited as well. ID en feed, Nombre en feed, and the prices are read-only.</p>
        <p>Type a UTM in the <strong>UTM</strong> field at the top, for example <code>utm_source=ig</code>. It is added to every URL in orange, and it is included in the Excel export. The saved URL doesn't change, and the link button never includes the UTM.</p>`,
      es: `
        <p>Pasa el mouse sobre un título o nombre en feed para ver el botón de <strong>copiar</strong>. Pasa el mouse sobre una URL para ver el botón de <strong>enlace</strong>, que abre la página del producto en una pestaña nueva sin el querystring.</p>
        <p><strong>Columnas editables:</strong> Título y URL se pueden editar en todas las filas. Haz doble clic en la celda, escribe y luego presiona Enter para guardar o Escape para cancelar. En las filas manuales también se pueden editar SKU y Página. ID en feed, Nombre en feed y los precios son solo de lectura.</p>
        <p>Escribe un UTM en el campo <strong>UTM</strong> de la parte superior, por ejemplo <code>utm_source=ig</code>. Se agrega a cada URL en naranja y se incluye en la exportación a Excel. La URL guardada no cambia, y el botón de enlace nunca incluye el UTM.</p>`
    },
    visual: visLinks
  },
  {
    // 6: imágenes y estados
    title: { en: 'Images', es: 'Imágenes' },
    body: {
      en: `
        <p>Each product with a feed ID has an image button at the start of its row. Click it to open the product's images below the row, and click it again to close them. Click an image to turn it on or off:</p>
        <ul>
          <li><strong>Active:</strong> shown in color and included in the capture.</li>
          <li><strong>Inactive:</strong> shown in black and white with a red border, and skipped.</li>
        </ul>`,
      es: `
        <p>Cada producto con ID en el feed tiene un botón de imagen al inicio de su fila. Haz clic en él para abrir sus imágenes debajo de la fila, y vuelve a hacer clic para cerrarlas. Haz clic en una imagen para activarla o desactivarla:</p>
        <ul>
          <li><strong>Activa:</strong> se ve a color y se incluye en la captura.</li>
          <li><strong>Inactiva:</strong> se ve en blanco y negro con borde rojo, y no se captura.</li>
        </ul>`
    },
    visual: visImages
  },
  {
    // 7: herramientas de imágenes
    title: { en: 'Image tools and capture', es: 'Herramientas de imágenes y captura' },
    body: {
      en: `
        <p>In <strong>Herramientas → Imágenes</strong> (Tools → Images), these buttons act on all products at once:</p>
        <ul>
          <li><strong>Activar todas</strong> (Activate all): turns on every image.</li>
          <li><strong>Desactivar todas</strong> (Deactivate all): turns off every image.</li>
          <li><strong>Solo la 1ª</strong> (Only the 1st): keeps only the first image of each product.</li>
          <li><strong>Solo la 2ª</strong> (Only the 2nd): keeps only the second image of each product. Products with one image end with none active.</li>
        </ul>
        <p><strong>Capturar y descargar ZIP</strong> (Capture and download ZIP) takes a screenshot of each active image at the largest size that fits your window, and downloads them as a ZIP. Chrome will ask you to share the current tab once. Keep the tab visible during the capture. Images come out at the size they appear on screen, so maximize your window for the best result.</p>`,
      es: `
        <p>En <strong>Herramientas → Imágenes</strong> estos botones actúan sobre todos los productos a la vez:</p>
        <ul>
          <li><strong>Activar todas:</strong> activa todas las imágenes.</li>
          <li><strong>Desactivar todas:</strong> desactiva todas las imágenes.</li>
          <li><strong>Solo la 1ª:</strong> deja activa solo la primera imagen de cada producto.</li>
          <li><strong>Solo la 2ª:</strong> deja activa solo la segunda imagen de cada producto. Los productos con una sola imagen quedan sin ninguna activa.</li>
        </ul>
        <p><strong>Capturar y descargar ZIP</strong> toma una captura de cada imagen activa al tamaño más grande que quepa en tu ventana y descarga todas en un ZIP. Chrome te pedirá compartir la pestaña actual una sola vez. Mantén la pestaña visible durante la captura. Las imágenes salen con el tamaño que se ve en pantalla, así que maximiza la ventana para mejores resultados.</p>`
    },
    visual: visImageTools
  },
  {
    // 8: modo selección de fotos
    title: { en: 'Photo selection mode', es: 'Modo selección de fotos' },
    body: {
      en: `
        <p><strong>Photo selection mode</strong> (Modo selección de fotos) opens a large window for reviewing products one at a time.</p>
        <ul>
          <li>The list on the left shows every product with a feed ID. Click a row to open it.</li>
          <li>The grid on the right shows that product's images. Click an image to turn it on or off.</li>
          <li><strong>Keyboard shortcuts:</strong> <strong>← →</strong> change product, <strong>1 to 9</strong> turn the matching image on or off, and <strong>Esc</strong> closes the window.</li>
          <li><strong>Activar todas</strong>, <strong>Desactivar todas</strong>, <strong>Solo la 1ª</strong>, and <strong>Solo la 2ª</strong> inside this window only affect the product you're viewing.</li>
        </ul>`,
      es: `
        <p>El <strong>Modo selección de fotos</strong> abre una ventana grande para revisar los productos de uno en uno.</p>
        <ul>
          <li>La lista de la izquierda muestra cada producto con ID en el feed. Haz clic en una fila para abrirla.</li>
          <li>La cuadrícula de la derecha muestra las imágenes de ese producto. Haz clic en una imagen para activarla o desactivarla.</li>
          <li><strong>Atajos de teclado:</strong> <strong>← →</strong> cambian de producto, <strong>1 a 9</strong> activan o desactivan la imagen con ese número, y <strong>Esc</strong> cierra la ventana.</li>
          <li><strong>Activar todas</strong>, <strong>Desactivar todas</strong>, <strong>Solo la 1ª</strong> y <strong>Solo la 2ª</strong> dentro de esta ventana solo afectan al producto que estás viendo.</li>
        </ul>`
    },
    visual: visPhotoMode
  },
  {
    // 9: filtros y columnas
    title: { en: 'Filters and columns', es: 'Filtros y columnas' },
    body: {
      en: `
        <p>Under <strong>Herramientas</strong> (Tools), the filter chips show only the rows you pick (active, manual, no title, no match, and so on). Filters only hide rows and never delete anything.</p>
        <p>Under <strong>Columnas en tabla</strong> (Table columns), hiding a column only changes the view, not the Excel file.</p>`,
      es: `
        <p>En <strong>Herramientas</strong>, los filtros muestran solo las filas que elijas (activas, manuales, sin título, sin match, etc.). Los filtros solo ocultan filas y nunca borran nada.</p>
        <p>En <strong>Columnas en tabla</strong>, ocultar una columna solo cambia la vista, no el archivo de Excel.</p>`
    },
    visual: visFilters
  },
  {
    // 10: exportación
    title: { en: 'Exporting to Excel', es: 'Exportar a Excel' },
    body: {
      en: `
        <p>Click <strong>Exportar Excel</strong> (Export Excel). In the window that opens, choose which columns to include: SKU is always included, plus Title, Chapter (page number), and Link. Then click <strong>Descargar Excel</strong> (Download Excel).</p>
        <p>Only active rows are exported.</p>`,
      es: `
        <p>Haz clic en <strong>Exportar Excel</strong>. En la ventana que se abre, elige qué columnas incluir: SKU siempre va incluido, además de Título, Capítulo (número de página) y Link. Luego haz clic en <strong>Descargar Excel</strong>.</p>
        <p>Solo se exportan las filas activas.</p>`
    },
    visual: visExport
  }
];

/* ---------------- Lógica del modal ---------------- */

let lang = 'en';
let idx = 0;
let els = null;

function readSavedLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

function saveLang(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Sin almacenamiento disponible: el idioma solo dura mientras la página esté abierta.
  }
}

function render() {
  const u = UI[lang];
  const p = PAGES[idx];

  els.title.textContent = u.title;
  els.body.innerHTML = `<h4>${p.title[lang]}</h4>${p.body[lang]}${p.visual(lang)}`;
  els.body.scrollTop = 0;
  els.counter.textContent = u.of(idx + 1, PAGES.length);
  els.prev.textContent = u.prev;
  els.next.textContent = u.next;
  els.prev.disabled = idx === 0;
  els.next.disabled = idx === PAGES.length - 1;
  els.langBtns.forEach(b => b.classList.toggle('on', b.dataset.lang === lang));

  document.querySelectorAll('[data-help]').forEach(b => {
    b.title = u.tooltip;
    b.setAttribute('aria-label', u.tooltip);
  });
}

function openHelp() {
  idx = 0;
  els.modal.hidden = false;
  document.body.classList.add('modal-open');
  render();
  els.next.focus();
}

function closeHelp() {
  els.modal.hidden = true;
  document.body.classList.remove('modal-open');
}

function go(delta) {
  const next = Math.min(PAGES.length - 1, Math.max(0, idx + delta));
  if (next === idx) return;
  idx = next;
  render();
}

function setLang(value) {
  lang = value;
  saveLang(value);
  render();
}

export function initHelp() {
  lang = readSavedLang();

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="helpModal" class="modal" hidden>
      <div class="modal-backdrop" data-help-close></div>
      <div class="modal-card card help-card" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
        <header class="modal-head">
          <h3 id="helpTitle"></h3>
          <div class="help-head-right">
            <div class="help-lang">
              <button type="button" class="btn sm" data-lang="en">EN</button>
              <button type="button" class="btn sm" data-lang="es">ES</button>
            </div>
            <button type="button" class="icon-btn" data-help-close aria-label="Cerrar">×</button>
          </div>
        </header>
        <section class="help-body" id="helpBody"></section>
        <footer class="modal-foot help-foot">
          <button type="button" id="helpPrev" class="btn sm">Anterior</button>
          <span id="helpCounter" class="help-counter"></span>
          <button type="button" id="helpNext" class="btn sm primary">Siguiente</button>
        </footer>
      </div>
    </div>`;
  document.body.appendChild(wrap.firstElementChild);

  els = {
    modal: document.getElementById('helpModal'),
    title: document.getElementById('helpTitle'),
    body: document.getElementById('helpBody'),
    counter: document.getElementById('helpCounter'),
    prev: document.getElementById('helpPrev'),
    next: document.getElementById('helpNext'),
    langBtns: [...document.querySelectorAll('#helpModal [data-lang]')]
  };

  document.querySelectorAll('[data-help]').forEach(b => b.addEventListener('click', openHelp));
  els.modal.querySelectorAll('[data-help-close]').forEach(el => el.addEventListener('click', closeHelp));
  els.prev.addEventListener('click', () => go(-1));
  els.next.addEventListener('click', () => go(1));
  els.langBtns.forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  document.addEventListener('keydown', e => {
    if (els.modal.hidden) return;
    if (e.key === 'Escape') closeHelp();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  });

  render();
}