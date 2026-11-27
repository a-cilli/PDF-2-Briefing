# Briefing File

## English

Tool for converting a PDF catalog into a product table, reviewing it, resolving products with several feed matches, capturing images, and exporting everything in the briefing format.

---

### ⚠️ Important notice

This project is **not a product of iPaper**. iPaper is not responsible for its use, maintenance, operation, or the results it produces.

- The code is provided as is.
- Whoever uses it is responsible for **running, modifying, extending, and debugging it**.
- Make sure your use complies with the terms of the websites and data sources it accesses.

---

### What you need to install

You need these programs before you start. If you already have them, skip this part.

#### 1. Visual Studio Code (VS Code)

The editor where you open and organize the project folder.

1. Go to **code.visualstudio.com**.
2. Download the version for your system and install it with the default options.

#### 2. Python

The program that runs the feed server.

1. Go to **python.org/downloads** and download the latest version.
2. During installation, **check "Add python.exe to PATH"** on the first screen.
3. Finish the installation.

#### 3. Python extension for VS Code

1. Open VS Code, click the **Extensions** icon (or press **Ctrl + Shift + X**).
2. Search for **Python** and install the one published by **Microsoft**.
3. Press **Ctrl + Shift + P**, choose **Python: Select Interpreter**, and select version **3.12** or newer.

#### 4. Live Server (VS Code extension)

Opens the application in the browser with a local address.

1. Search for **Live Server** (by author Ritwick Dey) in the Extensions panel and install it.

#### 5. Compatible browser

The image capture feature only works in **Google Chrome** and **Microsoft Edge**.

#### 6. Git (optional, only to upload the project to GitHub)

1. Go to **git-scm.com/downloads** and install it with the default options.
2. Close and reopen VS Code afterwards so the terminal recognizes it.

---

### Check that Python works

1. Go to **Terminal → New Terminal** in VS Code.
2. Run the command for your system:

**Windows:**
```
py --version
```

**Mac or Linux:**
```
python3 --version
```

You should see something like `Python 3.12.x`.

If you get "is not recognized as a command" or "command not found":

- Close VS Code completely and reopen it.
- On Windows, try `python --version` instead of `py --version`.
- If nothing works, reinstall Python and check **"Add python.exe to PATH"**.

---

### How to open the project

1. Extract the project folder somewhere easy to find, such as the Desktop.
2. In VS Code, go to **File → Open Folder** and select the project folder.

The project looks like this:

```
pdf-crawler/
├── feed_server.py      ← feed server (port 8000): lookup, search, status, feed-check page
├── feed-check.html     ← the "Revisar ID" search page
├── index.html          ← the application
├── styles.css          ← styles
├── README.md           ← this file
└── js/                 ← application logic
    ├── main.js         ← entry point
    ├── state.js        ← shared state
    ├── config.js       ← constants and column widths
    ├── utils.js
    ├── feed/           ← lookup.js, status.js, manual.js
    ├── pdf/            ← reader.js, card.js, layout.js
    ├── export/         ← excel.js
    └── ui/             ← table.js, quick.js, help.js, images.js, ...
```

---

### How to run it

You need **two servers running at the same time**:

- The **feed server** (Python), on port **8000**. It queries the product feed and serves the **Revisar ID** page.
- The **application** (Live Server), usually on port **5500**. It serves `index.html`.

#### Step 1: start the feed server

1. In the VS Code terminal, run:

**Windows:**
```
py feed_server.py
```

**Mac or Linux:**
```
python3 feed_server.py
```

2. You should see `Servidor en http://127.0.0.1:8000`.
3. **Keep this terminal open.** Closing it stops the feed.

The first load takes one or two minutes. You can upload a PDF in the meantime; the app waits for the feed before building the table. To check the status, open **http://127.0.0.1:8000/status**. When you see `"loaded": true`, the feed is ready.

**Restart the server** after any change to `feed_server.py`. The lookup index is built when the server starts.

#### Step 2: open the application

1. In the VS Code left panel, right-click **index.html** and choose **Open with Live Server**.
2. The browser opens the application.

**Important:** do not double-click `index.html`, and do not open files under `js/` directly. Always open the app from the root `index.html` through Live Server.

#### To stop everything

- Press **Ctrl + C** in the feed server terminal.
- To stop Live Server, click **Port: 5500** in the VS Code status bar.

---

### What it can do

#### 1. Upload a PDF

Drag the catalog PDF onto the start screen, or click to choose it. The application reads each page and finds the 6-digit codes.

Once the PDF is read, the screen shows **"PDF listo. Esperando el feed…"** until the feed server has loaded. Then the table opens. If the server is off, the message changes to **"Esperando el servidor del feed…"** and the app keeps checking every second.

The PDF is read on your computer. Nothing is uploaded to a server.

#### 2. Review the table

Each row is a product. The columns are:

| Column | What it shows |
|---|---|
| **Activo** (Active) | Checkbox to include or exclude the row |
| **#** | Row number. Clicking it shows the product in the PDF preview |
| **SKU** | The 6-digit code from the PDF |
| **ID en feed** | The feed ID that was picked for the row |
| **Título** (Title) | Name found in the PDF |
| **Nombre en feed** (Feed name) | Product name from the feed |
| **Precio original / final** | Prices found in the PDF |
| **URL** | Product link from the feed |
| **Página** (Page) | PDF page where the product appears |

Products that appear on several pages have one row per page.

#### 3. Understand the colors

| Row color | Meaning |
|---|---|
| **Yellow** | Title not found in the PDF |
| **Red bar on the left** | Only the code was found, without title or price |
| **Orange** | Multimatch without a choice yet (several feed IDs match) |
| **Light blue** | Multimatch with a choice made |
| **Lilac** | Manual row (added by you) |
| **Teal green** | Manual row found in the feed |
| **Coral** | Manual row not found in the feed |
| **Gray, struck through** | Deactivated row. It won't be exported |

Regular rows alternate between two shades of blue or green per page.

#### 4. PDF preview

The catalog pages appear on the left. Each code found has a yellow box.

- **Click a row number** to scroll the preview to that product.
- **Click a box** to scroll the table to that row.
- **Drag the gray line** between the preview and the table to resize them.

#### 5. Editing and buttons

- **Double-click** the title to change it. Enter saves, Escape cancels.
- **Copy button** appears when you hover over the title or the feed name.
- **Link button** appears when you hover over the URL. It opens the product page in a new tab without the query string. The UTM is never included.
- In manual rows you can also edit the SKU and the page.

#### 6. Add manual products

1. Move the mouse between two rows. A **+** sign appears.
2. Click it. A new lilac row is created below the row above.
3. Double-click the SKU and type the code. Type the title if you know it.

The new row takes the page of the row above. Change it by double-clicking the Página column. To delete a manual row, use the **trash** icon.

#### 7. Check manual products against the feed

Click **Herramientas**, then **Buscar manuales en feed**. Manual rows turn teal if found, or coral if not.

You can enter the SKU in two ways:

- **6-digit code**, for example `421804`.
- **Full ID**, for example `pm-4218043`, exactly as it appears in the feed.

#### 8. Multimatch: resolve products with several feed matches

When the 6-digit code from the PDF appears in more than one feed ID, the row can't pick one automatically. The application matches the code **anywhere inside the feed ID**. For example, `409062` matches `pm-4090623`, `pr-3409062-1`, and `pr-3409062-2`.

- **One match:** the row is filled automatically, as before.
- **Several matches:** the ID column shows **Elegir (N)**, where N is the number of candidates, and the row turns orange.

**Choosing in the row**

1. Click **Elegir (N)**. A mini table opens under the row. Its first line shows the PDF code and title, and each following line is one feed candidate, with its ID, title, number, and page.
2. Click **Elegir** on the candidate you want. The row takes that ID, name, URL, and images, the mini table closes, and the row turns light blue.
3. To change a choice later, hover over the ID or name of the row and click the change icon.

**Choosing in bulk**

Click **Selección de multimatch** in **Herramientas**. See section 9.

#### 9. Selección de multimatch (selection window)

A large window that lists every multimatch row and lets you resolve them quickly.

- **Left column:** every multimatch row, with its PDF SKU, its chosen ID and name (if picked), and a status tag. Click a row to open it.
- **Badges:** **Multimatch sin elegir** and **Multimatch elegido** filter the left column. Both are on by default. Click one to hide or show that group.
- **Top: "Elegir en todas las filas"** applies the highlighted option to every unpicked row that has the same pattern. For example, if the highlighted option is `pm-4454333` for the code `445433`, the pattern is `pm-{C}3`, and every unpicked row where `pm-{code}3` exists receives that option. The status line shows how many rows were filled.
- **Middle, top table:** the PDF data for the current row, with the SKU highlighted.
- **Middle, bottom table:** every feed option, with the PDF SKU highlighted in the ID and SKU columns. Click **Elegir** to choose one for this row. The window moves to the next visible row.

**Keyboard**

| Key | Action |
|---|---|
| **1** to **9** | Choose that option for the current row |
| **↑ ↓** | Highlight another option |
| **← →** | Move to the previous or next row |
| **Esc** | Close the window |

#### 10. Images

Each product with a feed ID has an image button at the start of its row. Click it to open its images below the row. Click an image to turn it on or off.

- **Active:** shown in color and included in the capture.
- **Inactive:** black and white with a red border, and skipped.

Drag the gray bar under the images to change their height.

In **Herramientas → Imágenes** you have these buttons:

| Button | What it does |
|---|---|
| **Activar todas** | Activates all images for all products |
| **Desactivar todas** | Deactivates all images for all products |
| **Solo la 1ª** | Keeps only the first image of each product active |
| **Solo la 2ª** | Keeps only the second image active. Products with one image end with none active |
| **Capturar y descargar ZIP** | Captures the active images and downloads a ZIP |
| **Modo selección de fotos** | Opens a window to review products one at a time |

##### Photo selection mode

- The list on the left shows every product with a feed ID. Click a row to open it.
- Click an image, or press its number, to turn it on or off.
- **← →** change product. **1 to 9** toggle the matching image. **Esc** closes the window.
- **Activar todas**, **Desactivar todas**, **Solo la 1ª**, and **Solo la 2ª** inside this window only affect the current product.

##### Capture and download ZIP

This button does not download the original feed images. It takes a screenshot of each active image as it appears on screen and saves them into a ZIP.

1. Click **Capturar y descargar ZIP**.
2. Chrome shows a screen-sharing prompt. Confirm with **Share**. It is asked once per capture.
3. The screen darkens and each image appears alone, as large as fits the window, with the progress in the top left.
4. The browser downloads **Imagenes Briefing.zip** with files named like `421804 - 1.png`.

Keep in mind:

- **Don't switch tabs or minimize the window** during the capture.
- **Size depends on your window and screen.** Maximize the browser window for the best results.
- **If you stop sharing** from Chrome's bar, the ZIP contains only the images captured so far, and `errores.txt` notes that it stopped.
- Images that can't be captured are listed in `errores.txt`.

#### 11. Links, copy buttons, and UTM

- **Copy button:** hover over a title or feed name.
- **Link button:** hover over a URL. It opens the product page in a new tab without the query string.
- **UTM:** type it in the top field, for example `utm_source=ig`. It is added to every URL in orange and included in the Excel export. The saved URL doesn't change.

If you type `?utm_source=ig`, the application removes the question mark automatically.

#### 12. Filters and columns

In **Herramientas**, the filter chips show only the rows you pick: total, active, manual, no title, no match, in feed or out of feed, and the two multimatch groups. Filters only hide rows; they never delete anything.

In **Columnas en tabla**, hiding a column only changes what you see. The Excel file is not affected.

#### 13. Export to Excel

1. Click **Exportar Excel**.
2. Choose which columns to include: **SKU** (always), **Título**, **Capítulo** (page number), and **Link**.
3. Click **Descargar Excel**.

The file is named **Briefing File.xlsx**. Only active rows are exported. Multimatch rows that were never chosen export with the PDF code as `product_id`, so you can see them and fix them later.

#### 14. Revisar ID (feed check page)

Click **Revisar ID** on the start screen or in the top bar. It opens a search page at **http://127.0.0.1:8000/feed-check**.

- Type any part of an ID, for example `7090212`. Every feed ID that contains it appears, with the matching part highlighted.
- The status pill at the top right shows whether the feed server is ready.
- **← Volver a Briefing File** returns to the application.

#### 15. Help

Click the **?** button to open the help window. It has 13 pages with visual examples of the buttons, rows, and windows.

- The **?** button is on the start screen (top right) and in the top bar.
- **EN** and **ES** at the top change the language. The choice is saved in the browser, and English is the default.
- **Anterior** and **Siguiente** move between pages, or use the arrow keys. **Esc** closes the window.

#### 16. Start with another PDF

Refresh the browser page (F5 or Ctrl + R). Data from the previous PDF is lost if you haven't exported, so export first.

---

### Frequently asked questions

**The screen says "Esperando el feed…" and doesn't move.**
The feed server isn't running or is still loading. Check the terminal and **http://127.0.0.1:8000/status**. If it reported an error, restart `feed_server.py`.

**A row shows "feed no disponible".**
The feed server isn't reachable. Start `feed_server.py` and reload.

**A row shows "Elegir (N)" and I expected one match.**
The code appears inside more than one feed ID. Open the row, compare the candidates, and click **Elegir** on the right one, or use **Selección de multimatch** to resolve several rows at once.

**I changed `feed_server.py` but the results didn't change.**
Restart the feed server. Changes to the server only take effect after a restart.

**The console shows 404 errors for files like `js/ui/ui/table.js` or `js/ui/state.js`.**
A module inside `js/ui/` is importing with the wrong path. Imports of files outside `ui/` (for example `state.js`, `config.js`, `utils.js`, `feed/`, `export/`) must start with `../` when the file is inside `ui/`.

**The console shows "A listener indicated an asynchronous response…".**
This comes from a browser extension, not the application. It can be ignored.

**The `python` command opens the Microsoft Store or says "Python was not found".**
Use `py feed_server.py` on Windows. To remove the placeholder, go to **Settings → Apps → Advanced app settings → App execution aliases** and turn off `python.exe` and `python3.exe`.

**The application looks unstyled or doesn't respond.**
Make sure you opened it with Live Server, not by double-clicking.

**The feed data is outdated.**
The server refreshes the feed every 24 hours. To force an update, restart `feed_server.py`.

**The screen-sharing prompt doesn't appear when capturing.**
Use an up-to-date Chrome or Edge (version 120 or newer).

**The captured images are smaller than the originals.**
The capture uses the size shown on screen. Maximize the window. Screen capture cannot return the feed's original resolution.

**The ? button doesn't open anything.**
Check that `js/main.js` calls `initHelp()`. Press F12, look for red errors in the Console tab, and reload.

---

### Maintenance and changes

This project is provided without official support. If you want to change something:

- **Colors and styles:** `styles.css`
- **Column widths:** `js/config.js` (`FIXED_COLS`, `FLEX_MIN_PX`)
- **Table logic and multimatch rows:** `js/ui/table.js`
- **Selection of multimatch window:** `js/ui/quick.js`
- **Feed matching and candidate lists:** `js/feed/lookup.js` and `feed_server.py`
- **Copy and link buttons:** `js/ui/buttons.js`
- **Images, photo selection mode, and ZIP capture:** `js/ui/images.js`
- **Help window, its pages, and its language:** `js/ui/help.js`
- **Upload flow and waiting for the feed:** `js/ui/upload.js` and `js/feed/status.js`
- **Feed check page:** `feed-check.html`
- **PDF reading:** `js/pdf/`

Save a copy of the folder before making changes.

---

## Español

Herramienta para convertir un catálogo en PDF en una tabla de productos, revisarla, resolver los productos con varias coincidencias en el feed, capturar sus imágenes y exportar todo en el formato de briefing.

---

### ⚠️ Aviso importante

Este proyecto **no es un producto de iPaper**. iPaper no se hace responsable de su uso, mantenimiento, funcionamiento ni de los resultados que produzca.

- El código se entrega tal cual.
- Es responsabilidad de quien lo use **ejecutarlo, modificarlo, agregarle funciones y depurarlo**.
- Revisa que el uso que le des cumpla con los términos de las páginas y fuentes de datos que consulta.

---

### Qué necesitas instalar

Antes de empezar necesitas estos programas. Si ya los tienes, sáltate esta parte.

#### 1. Visual Studio Code (VS Code)

El editor donde abres y organizas la carpeta del proyecto.

1. Entra a **code.visualstudio.com**.
2. Descarga la versión para tu sistema e instálala con las opciones por defecto.

#### 2. Python

El programa que hace funcionar el servidor del feed.

1. Entra a **python.org/downloads** y descarga la última versión.
2. Al instalarlo, **marca la casilla "Add python.exe to PATH"** en la primera pantalla.
3. Termina la instalación.

#### 3. Extensión de Python para VS Code

1. Abre VS Code y haz clic en el ícono de **Extensiones** (o presiona **Ctrl + Shift + X**).
2. Busca **Python** e instala la publicada por **Microsoft**.
3. Presiona **Ctrl + Shift + P**, elige **Python: Select Interpreter** (Python: seleccionar intérprete) y selecciona la versión **3.12** o una más reciente.

#### 4. Live Server (extensión de VS Code)

Abre la aplicación en el navegador con una dirección local.

1. Busca **Live Server** (del autor Ritwick Dey) en el panel de Extensiones e instálala.

#### 5. Navegador compatible

La captura de imágenes solo funciona en **Google Chrome** y **Microsoft Edge**.

#### 6. Git (opcional, solo para subir el proyecto a GitHub)

1. Entra a **git-scm.com/downloads** e instálalo con las opciones por defecto.
2. Cierra y vuelve a abrir VS Code después, para que la terminal lo reconozca.

---

### Comprobar que Python funciona

1. Ve a **Terminal → New Terminal** (Terminal → Nueva terminal) en VS Code.
2. Ejecuta el comando de tu sistema:

**Windows:**
```
py --version
```

**Mac o Linux:**
```
python3 --version
```

Debe aparecer algo como `Python 3.12.x`.

Si aparece "no se reconoce como un comando" o "command not found":

- Cierra VS Code por completo y vuelve a abrirlo.
- En Windows, prueba `python --version` en lugar de `py --version`.
- Si nada funciona, reinstala Python y marca **"Add python.exe to PATH"**.

---

### Cómo abrir el proyecto

1. Descomprime la carpeta del proyecto en un lugar fácil de encontrar, como el Escritorio.
2. En VS Code, ve a **File → Open Folder** (Archivo → Abrir carpeta) y selecciona la carpeta del proyecto.

El proyecto se ve así:

```
pdf-crawler/
├── feed_server.py      ← servidor del feed (puerto 8000): búsqueda, estado y página de revisión
├── feed-check.html     ← página "Revisar ID"
├── index.html          ← la aplicación
├── styles.css          ← estilos
├── README.md           ← este archivo
└── js/                 ← lógica de la aplicación
    ├── main.js         ← punto de entrada
    ├── state.js        ← estado compartido
    ├── config.js       ← constantes y anchos de columna
    ├── utils.js
    ├── feed/           ← lookup.js, status.js, manual.js
    ├── pdf/            ← reader.js, card.js, layout.js
    ├── export/         ← excel.js
    └── ui/             ← table.js, quick.js, help.js, images.js, ...
```

---

### Cómo ejecutarla

Necesitas **dos servidores funcionando al mismo tiempo**:

- El **servidor del feed** (Python), en el puerto **8000**. Consulta el feed y sirve la página **Revisar ID**.
- La **aplicación** (Live Server), normalmente en el puerto **5500**. Sirve `index.html`.

#### Paso 1: iniciar el servidor del feed

1. En la terminal de VS Code, ejecuta:

**Windows:**
```
py feed_server.py
```

**Mac o Linux:**
```
python3 feed_server.py
```

2. Debe aparecer `Servidor en http://127.0.0.1:8000`.
3. **Deja esta terminal abierta.** Si la cierras, la aplicación pierde los datos del feed.

La primera carga tarda uno o dos minutos. Mientras tanto puedes subir un PDF: la aplicación espera al feed antes de armar la tabla. Para ver el estado, abre **http://127.0.0.1:8000/status**. Cuando aparezca `"loaded": true`, el feed está listo.

**Reinicia el servidor** después de cualquier cambio en `feed_server.py`. El índice de búsqueda se construye al arrancar.

#### Paso 2: abrir la aplicación

1. En el panel izquierdo de VS Code, haz clic derecho sobre **index.html** y elige **Open with Live Server** (Abrir con Live Server).
2. Se abrirá el navegador con la aplicación.

**Importante:** no hagas doble clic en `index.html` y no abras archivos dentro de `js/` directamente. Siempre abre la aplicación desde el `index.html` de la raíz con Live Server.

#### Para detener todo

- En la terminal del servidor del feed, presiona **Ctrl + C**.
- Para detener Live Server, haz clic en **Port: 5500** en la barra inferior de VS Code.

---

### Qué puede hacer

#### 1. Subir un PDF

Arrastra el PDF del catálogo a la pantalla de inicio, o haz clic para elegirlo. La aplicación lee cada página y busca los códigos de 6 dígitos.

Cuando termina de leer el PDF, la pantalla muestra **"PDF listo. Esperando el feed…"** hasta que el servidor del feed esté listo. Luego aparece la tabla. Si el servidor está apagado, el mensaje cambia a **"Esperando el servidor del feed…"** y la aplicación sigue revisando cada segundo.

El PDF se lee en tu computadora. No se sube a ningún servidor.

#### 2. Revisar la tabla

Cada fila es un producto. Las columnas son:

| Columna | Qué muestra |
|---|---|
| **Activo** | Casilla para incluir o excluir la fila |
| **#** | Número de fila. Al hacer clic, muestra el producto en la vista previa del PDF |
| **SKU** | Código de 6 dígitos del PDF |
| **ID en feed** | El ID del feed elegido para la fila |
| **Título** | Nombre que se encontró en el PDF |
| **Nombre en feed** | Nombre del producto según el feed |
| **Precio original / final** | Precios encontrados en el PDF |
| **URL** | Enlace del producto en el feed |
| **Página** | Página del PDF donde aparece |

Los productos que aparecen en varias páginas tienen una fila por página.

#### 3. Entender los colores

| Color de la fila | Significado |
|---|---|
| **Amarillo** | No se encontró el título en el PDF |
| **Barra roja a la izquierda** | Solo se encontró el código, sin título ni precio |
| **Naranja** | Multimatch sin elegir (varios IDs del feed coinciden) |
| **Azul claro** | Multimatch con una elección hecha |
| **Lila** | Fila manual (agregada por ti) |
| **Verde azulado** | Fila manual encontrada en el feed |
| **Coral** | Fila manual que no se encontró en el feed |
| **Gris tachado** | Fila desactivada. No se exporta |

Las filas normales alternan dos tonos de azul o verde por página.

#### 4. Vista previa del PDF

A la izquierda aparecen las páginas del catálogo. Cada código encontrado tiene un recuadro amarillo.

- **Haz clic en el número de una fila** para desplazar la vista previa a ese producto.
- **Haz clic en un recuadro** para desplazar la tabla a esa fila.
- **Arrastra la línea gris** entre la vista previa y la tabla para cambiar su tamaño.

#### 5. Editar y botones

- **Doble clic** en el título para cambiarlo. Enter guarda, Escape cancela.
- **Botón de copiar** al pasar el mouse sobre el título o el nombre del feed.
- **Botón de enlace** al pasar el mouse sobre la URL. Abre la página del producto en una pestaña nueva, sin el querystring. El UTM nunca se incluye.
- En las filas manuales también puedes editar el SKU y la página.

#### 6. Agregar productos manuales

1. Pasa el mouse entre dos filas. Aparecerá un **signo +**.
2. Haz clic. Se crea una fila lila debajo de la fila de arriba.
3. Haz doble clic en el SKU y escribe el código. Escribe el título si lo conoces.

La fila nueva toma la página de la fila de arriba. Cámbiala con doble clic en la columna Página. Para eliminar una fila manual, usa el ícono de **papelera**.

#### 7. Revisar productos manuales contra el feed

Haz clic en **Herramientas** y luego en **Buscar manuales en feed**. Las filas manuales se pintan de verde azulado si están en el feed, o de coral si no.

Puedes escribir el SKU de dos formas:

- **Código de 6 dígitos**, por ejemplo `421804`.
- **ID completo**, por ejemplo `pm-4218043`, tal como aparece en el feed.

#### 8. Multimatch: resolver productos con varias coincidencias

Cuando el código de 6 dígitos del PDF aparece en más de un ID del feed, la fila no puede elegir uno sola. La aplicación busca el código **en cualquier parte del ID del feed**. Por ejemplo, `409062` coincide con `pm-4090623`, `pr-3409062-1` y `pr-3409062-2`.

- **Una sola coincidencia:** la fila se llena automáticamente, como antes.
- **Varias coincidencias:** la columna ID muestra **Elegir (N)**, donde N es el número de opciones, y la fila se pinta de naranja.

**Elegir dentro de la fila**

1. Haz clic en **Elegir (N)**. Se abre una mini tabla debajo de la fila. Su primera línea muestra el código y el título del PDF, y cada línea siguiente es una opción del feed, con su ID, título, número y página.
2. Haz clic en **Elegir** en la opción que quieras. La fila toma ese ID, nombre, URL e imágenes, la mini tabla se cierra y la fila se pinta de azul claro.
3. Para cambiar una elección después, pasa el mouse sobre el ID o el nombre de la fila y haz clic en el ícono de cambiar.

**Elegir en lote**

Haz clic en **Selección de multimatch** en **Herramientas**. Ver la sección 9.

#### 9. Selección de multimatch (ventana de selección)

Una ventana grande que lista todas las filas con multimatch y permite resolverlas rápido.

- **Columna izquierda:** cada fila con multimatch, con su SKU del PDF, su ID y nombre elegidos (si ya hay elección) y una etiqueta de estado. Haz clic en una fila para abrirla.
- **Badges:** **Multimatch sin elegir** y **Multimatch elegido** filtran la columna izquierda. Ambos empiezan activos. Haz clic en uno para ocultar o mostrar ese grupo.
- **Arriba: "Elegir en todas las filas"** aplica la opción resaltada a todas las filas sin elegir que tengan el mismo patrón. Por ejemplo, si la opción resaltada es `pm-4454333` para el código `445433`, el patrón es `pm-{C}3`, y cada fila sin elegir donde exista `pm-{código}3` recibe esa opción. La línea de estado indica cuántas filas se llenaron.
- **Centro, tabla de arriba:** el dato del PDF de la fila actual, con el SKU resaltado.
- **Centro, tabla de abajo:** todas las opciones del feed, con el SKU del PDF resaltado en las columnas ID y SKU. Haz clic en **Elegir** para elegir una opción para esta fila. La ventana pasa a la siguiente fila visible.

**Teclado**

| Tecla | Acción |
|---|---|
| **1** a **9** | Elige esa opción para la fila actual |
| **↑ ↓** | Resalta otra opción |
| **← →** | Pasa a la fila anterior o siguiente |
| **Esc** | Cierra la ventana |

#### 10. Imágenes

Cada producto con ID en el feed tiene un botón de imagen al inicio de su fila. Haz clic para abrir sus imágenes debajo de la fila. Haz clic en una imagen para activarla o desactivarla.

- **Activa:** se ve a color y se incluye en la captura.
- **Inactiva:** blanco y negro con borde rojo, y no se captura.

Arrastra la barra gris debajo de las imágenes para cambiar su alto.

En **Herramientas → Imágenes** tienes estos botones:

| Botón | Qué hace |
|---|---|
| **Activar todas** | Activa todas las imágenes de todos los productos |
| **Desactivar todas** | Desactiva todas las imágenes de todos los productos |
| **Solo la 1ª** | Deja activa solo la primera imagen de cada producto |
| **Solo la 2ª** | Deja activa solo la segunda imagen. Los productos con una sola imagen quedan sin ninguna activa |
| **Capturar y descargar ZIP** | Captura las imágenes activas y descarga un ZIP |
| **Modo selección de fotos** | Abre una ventana para revisar producto por producto |

##### Modo selección de fotos

- La lista de la izquierda muestra cada producto con ID en el feed. Haz clic en una fila para abrirla.
- Haz clic en una imagen, o presiona su número, para activarla o desactivarla.
- **← →** cambian de producto. **1 a 9** activan o desactivan la imagen correspondiente. **Esc** cierra la ventana.
- **Activar todas**, **Desactivar todas**, **Solo la 1ª** y **Solo la 2ª** dentro de esta ventana solo afectan al producto actual.

##### Capturar y descargar ZIP

Este botón no descarga las imágenes originales del feed. Toma una captura de cada imagen activa tal como se ve en pantalla y guarda las capturas en un ZIP.

1. Haz clic en **Capturar y descargar ZIP**.
2. Chrome muestra un aviso para compartir pantalla. Confirma con **Compartir**. Solo se pide una vez por captura.
3. La pantalla se oscurece y cada imagen aparece sola, lo más grande que cabe en la ventana, con el progreso arriba a la izquierda.
4. El navegador descarga **Imagenes Briefing.zip** con archivos llamados `421804 - 1.png`.

Ten en cuenta:

- **No cambies de pestaña ni minimices la ventana** durante la captura.
- **El tamaño depende de tu ventana.** Maximiza el navegador para mejores resultados.
- **Si detienes el uso compartido** desde la barra de Chrome, el ZIP incluye solo las imágenes capturadas hasta ese momento y `errores.txt` indica que se detuvo.
- Las imágenes que no se pudieron capturar aparecen en `errores.txt`.

#### 11. Enlaces, botones de copiar y UTM

- **Botón de copiar:** pasa el mouse sobre un título o nombre del feed.
- **Botón de enlace:** pasa el mouse sobre una URL. Abre la página del producto en una pestaña nueva, sin el querystring.
- **UTM:** escríbelo en el campo de arriba, por ejemplo `utm_source=ig`. Se agrega a cada URL en naranja y se incluye en la exportación a Excel. La URL guardada no cambia.

Si escribes `?utm_source=ig`, la aplicación quita el signo de pregunta automáticamente.

#### 12. Filtros y columnas

En **Herramientas**, los filtros muestran solo las filas que elijas: totales, activas, manuales, sin título, sin match, en feed o fuera de feed, y los dos grupos de multimatch. Los filtros solo ocultan filas; nunca borran nada.

En **Columnas en tabla**, ocultar una columna solo cambia la vista. El archivo de Excel no se ve afectado.

#### 13. Exportar a Excel

1. Haz clic en **Exportar Excel**.
2. Elige qué columnas incluir: **SKU** (siempre), **Título**, **Capítulo** (número de página) y **Link**.
3. Haz clic en **Descargar Excel**.

El archivo se llama **Briefing File.xlsx**. Solo se exportan las filas activas. Las filas multimatch que nunca se eligieron se exportan con el código del PDF como `product_id`, para que las veas y corrijas después.

#### 14. Revisar ID (página de revisión)

Haz clic en **Revisar ID** en la pantalla de inicio o en la barra superior. Se abre una página de búsqueda en **http://127.0.0.1:8000/feed-check**.

- Escribe cualquier parte de un ID, por ejemplo `7090212`. Aparecen todos los IDs del feed que lo contienen, con la parte coincidente resaltada.
- La pastilla de estado arriba a la derecha indica si el servidor del feed está listo.
- **← Volver a Briefing File** regresa a la aplicación.

#### 15. Ayuda

Haz clic en el botón **?** para abrir la ventana de ayuda. Tiene 13 páginas con ejemplos visuales de botones, filas y ventanas.

- El botón **?** está en la pantalla de inicio (arriba a la derecha) y en la barra superior.
- **EN** y **ES** en la parte superior cambian el idioma. La elección se guarda en el navegador. El inglés es el idioma por defecto.
- **Anterior** y **Siguiente** cambian de página, o usa las flechas del teclado. **Esc** cierra la ventana.

#### 16. Empezar con otro PDF

Actualiza la página (F5 o Ctrl + R). Los datos del PDF anterior se pierden si no exportaste, así que exporta antes.

---

### Preguntas frecuentes

**La pantalla dice "Esperando el feed…" y no cambia.**
El servidor del feed no está corriendo o todavía carga. Revisa la terminal y **http://127.0.0.1:8000/status**. Si reportó un error, reinicia `feed_server.py`.

**Una fila dice "feed no disponible".**
No se alcanza el servidor del feed. Inicia `feed_server.py` y recarga.

**Una fila dice "Elegir (N)" y esperaba una sola coincidencia.**
El código aparece dentro de más de un ID del feed. Abre la fila, compara las opciones y haz clic en **Elegir** en la correcta, o usa **Selección de multimatch** para resolver varias filas a la vez.

**Cambié `feed_server.py` pero los resultados no cambian.**
Reinicia el servidor del feed. Los cambios en el servidor solo se aplican después de reiniciar.

**La consola muestra errores 404 con rutas como `js/ui/ui/table.js` o `js/ui/state.js`.**
Un módulo dentro de `js/ui/` importa con una ruta incorrecta. Los imports de archivos fuera de `ui/` (por ejemplo `state.js`, `config.js`, `utils.js`, `feed/`, `export/`) deben empezar con `../` cuando el archivo está dentro de `ui/`.

**La consola muestra "A listener indicated an asynchronous response…".**
Viene de una extensión del navegador, no de la aplicación. Se puede ignorar.

**El comando `python` abre la Microsoft Store o dice "Python was not found".**
En Windows usa `py feed_server.py`. Para quitar el atajo, ve a **Configuración → Aplicaciones → Configuración avanzada de aplicaciones → Alias de ejecución de aplicaciones** y desactiva `python.exe` y `python3.exe`.

**La aplicación se ve sin estilos o no responde.**
Asegúrate de abrirla con Live Server, no con doble clic.

**Los datos del feed están viejos.**
El servidor actualiza el feed cada 24 horas. Para forzar la actualización, reinicia `feed_server.py`.

**No aparece el aviso para compartir pantalla al capturar.**
Usa Chrome o Edge actualizados (versión 120 o más reciente).

**Las imágenes capturadas salen más chicas que las originales.**
La captura usa el tamaño que se ve en pantalla. Maximiza la ventana. La captura de pantalla no puede devolver la resolución original del feed.

**El botón ? no abre nada.**
Revisa que `js/main.js` llame a `initHelp()`. Presiona F12, busca errores en rojo en la pestaña Console y recarga.

---

### Mantenimiento y cambios

Este proyecto se entrega sin soporte oficial. Si quieres cambiar algo:

- **Colores y estilos:** `styles.css`
- **Anchos de columna:** `js/config.js` (`FIXED_COLS`, `FLEX_MIN_PX`)
- **Lógica de la tabla y filas multimatch:** `js/ui/table.js`
- **Ventana de selección de multimatch:** `js/ui/quick.js`
- **Coincidencias del feed y listas de opciones:** `js/feed/lookup.js` y `feed_server.py`
- **Botones de copiar y de enlace:** `js/ui/buttons.js`
- **Imágenes, modo selección y captura en ZIP:** `js/ui/images.js`
- **Ventana de ayuda, sus páginas e idioma:** `js/ui/help.js`
- **Flujo de subida y espera del feed:** `js/ui/upload.js` y `js/feed/status.js`
- **Página de revisión de ID:** `feed-check.html`
- **Lectura del PDF:** `js/pdf/`

Guarda una copia de la carpeta antes de hacer cambios.