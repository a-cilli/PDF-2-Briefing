# Briefing File

## English

Tool for converting a PDF catalog into a product table, reviewing it, capturing its images, and exporting everything in the briefing format.

---

### ⚠️ Important notice

This project is **not a product of iPaper**. iPaper is not responsible for its use, maintenance, operation, or the results it produces.

- The code is provided as is.
- Whoever uses it is responsible for **running, modifying, extending, and debugging it**.
- Make sure your use complies with the terms of the websites and data sources it accesses.

---

### What you need to install

You need three programs before you start. If you already have them, skip this part.

#### 1. Visual Studio Code (VS Code)

This is the editor where you open and organize the project folder.

1. Go to **code.visualstudio.com**.
2. Download the version for your system (Windows or Mac).
3. Install it with the default options.

#### 2. Python

This is the program that runs the server that queries the product feed.

1. Go to **python.org/downloads** and download the latest version.
2. During installation, **check "Add python.exe to PATH"** on the first screen. If you skip this, the program won't be recognized later.
3. Finish the installation.

#### 3. Python extension for VS Code

VS Code needs the Python extension to recognize the version you installed.

1. Open VS Code.
2. In the left panel, click the **squares** icon (Extensions), or press **Ctrl + Shift + X**.
3. Type **Python** in the search box.
4. Choose the extension named **Python** published by **Microsoft** (the one with the most downloads).
5. Click **Install**.

Then select the Python version VS Code will use:

1. Press **Ctrl + Shift + P** to open the command palette.
2. Type **Python: Select Interpreter** and choose it.
3. Select version **3.12** or a newer one.

If the version you want doesn't appear, close VS Code, reopen it, and try again.

#### 4. Live Server (VS Code extension)

This extension opens the application in the browser using a local address.

1. In VS Code, click the **Extensions** icon.
2. Search for **Live Server** (by author Ritwick Dey).
3. Click **Install**.

#### 5. Compatible browser

The image capture feature only works in **Google Chrome** and **Microsoft Edge**. Use one of those two to open the application.

#### 6. Git (optional, only to upload the project to GitHub)

1. Go to **git-scm.com/downloads** and install the version for your system with the default options.
2. Close and reopen VS Code after installing so the terminal recognizes it.

---

### Check that Python works

After installing Python, make sure VS Code and the terminal recognize it.

1. Go to **Terminal → New Terminal**.
2. Type the command for your system and press Enter:

**Windows:**
```
py --version
```

**Mac or Linux:**
```
python3 --version
```

3. You should see something like `Python 3.12.x`. If you see that number, Python is ready.

If you see an error like **"is not recognized as a command"** or **"command not found"**:

- Close VS Code completely and reopen it. The terminal only recognizes Python if VS Code was opened after installing it.
- On Windows, try `python --version` instead of `py --version`.
- If nothing works, uninstall Python, reinstall it, and check **"Add python.exe to PATH"**.

---

### How to download and open the project

1. Download the project folder and extract it somewhere easy to find, such as the Desktop.
2. Open VS Code.
3. Go to **File → Open Folder** and select the project folder.

You should see these files in the left panel:

```
briefing-file/
├── feed_server.py      ← server that queries the product feed
├── index.html          ← the application
├── styles.css          ← the styles
├── README.md           ← this file
└── js/                 ← application logic (several files)
```

---

### How to run it

You need **two things running at the same time**: the Python server and the application through Live Server.

#### Step 1: start the Python server

1. In the VS Code terminal, type the command for your system and press Enter:

**Windows:**
```
py feed_server.py
```

**Mac or Linux:**
```
python3 feed_server.py
```

2. You should see a message like: `Servidor en http://127.0.0.1:8000`.
3. **Keep this terminal open while you use the application.** If you close it, the application loses its feed data.

The first time, the server takes one or two minutes to load the full feed. You can still upload a PDF during that time. The app reads the PDF and then waits for the feed before showing the table.

To check whether it's ready, open **http://127.0.0.1:8000/status** in your browser. When you see `"loaded": true`, the feed is loaded.

The server only queries the feed. It doesn't download images: images come from what the application already displays.

#### Step 2: open the application with Live Server

1. In the VS Code left panel, right-click **index.html**.
2. Choose **Open with Live Server**.
3. Your browser will open the application.

**Important:** don't double-click `index.html`. It must be opened with Live Server, or the browser will block parts of the application.

#### To stop everything

- In the terminal, press **Ctrl + C** to stop the Python server.
- To stop Live Server, click **Port: 5500** in the VS Code status bar.

---

### What it can do

#### 1. Upload a PDF

Drag the catalog PDF onto the start screen, or click to choose it. The application reads each page and finds the 6-digit codes.

Once the PDF is read, the screen shows **"PDF listo. Esperando el feed…"** (PDF ready, waiting for the feed) until the feed server has loaded. Then the table opens with titles, prices, and feed data. If the server is off, the message changes to **"Esperando el servidor del feed…"** and the app keeps checking every second.

It reads the full PDF on your computer. Nothing is uploaded to a server.

#### 2. Review the table

Each row is a product. The columns are:

| Column | What it shows |
|---|---|
| **Activo** (Active) | Checkbox to include or exclude the row |
| **#** | Row number. Clicking it shows the product in the PDF preview |
| **SKU** | The product's 6-digit code |
| **ID en feed** | ID found in the product feed |
| **Título** (Title) | Name found in the PDF |
| **Nombre en feed** (Feed name) | Product name from the feed |
| **Precio original / final** | Prices found in the PDF |
| **URL** | Product link from the feed |
| **Página** (Page) | PDF page where the product appears |

Products that appear on several pages have one row per page.

#### 3. Understand the colors

| Row color | Meaning |
|---|---|
| **Yellow** | Title not found in the PDF. Double-click the title to type it |
| **Red on the left** | Only the code was found, without title or price. Check it in the PDF |
| **Lilac** | Manual row (added by you) |
| **Teal green** | Manual row found in the feed |
| **Coral** | Manual row not found in the feed |
| **Gray, struck through** | Deactivated row. It won't be exported |

Regular rows alternate between two shades of blue or green per page, so you can see where each page starts and ends.

#### 4. PDF preview

The catalog pages appear on the left. Each code found has a yellow box.

- **Click a row number** and the preview scrolls to that product and makes it blink.
- **Click a box** and the table scrolls to that row.
- You can **drag the gray line** between the preview and the table to resize each one.

#### 5. Editing and buttons

- **Double-click** the title to change it. Enter saves, Escape cancels.
- **Copy button** appears when you hover over the title or the feed name.
- **Link button** appears when you hover over the URL. It opens the product page in a new tab, without the query string (everything from `?` onward). The UTM you type in the top field is never included.
- In manual rows you can also edit the SKU and the page.

#### 6. Add manual products

Some products are in the catalog but don't show up well in the PDF. You can add them like this:

1. Move the mouse between two rows. A **+** sign will appear.
2. Click it. A new lilac row is created directly below the row above.
3. Double-click the SKU and type the product code.
4. Type the title if you know it.

The new row takes the page of the row above. You can change it by double-clicking the Página column.

To delete a manual row, use the **trash** icon in its first column.

#### 7. Check whether a product is in the feed

There are two ways:

**Automatic:** when you process the PDF, the application looks up each code in the feed. If it finds it, it fills in **ID en feed** and **Nombre en feed**. If not, it says "no se encontró en feed" (not found in feed).

**For manual products:** click **Herramientas** (top right), then **Buscar manuales en feed**. The application checks all manual rows and colors them teal green if they're in the feed, or coral if not.

You can enter the SKU in two ways:

- **6-digit code**, for example `421804`. The application looks for a product whose feed ID contains that code.
- **Full ID**, for example `pm-4218043`, exactly as it appears in the feed.

The **Feed listo** (Feed ready) pill at the top shows whether the Python server is running and the feed is loaded. If it says "Sin conexión" (no connection), check that the terminal running `feed_server.py` is still open.

#### 8. Filter the table

Open **Herramientas** to see the filters. Click any of them to show only those rows:

- Total, active, or manual rows
- No title
- No match (not found in the feed)
- In feed or out of feed (manual rows only)

Click again to remove the filter. Filters only hide rows; they don't delete anything.

#### 9. Hide columns

In **Herramientas**, in the **Columnas en tabla** row, click the columns you want to hide. Hiding them **only affects what you see**, not the Excel file. Use **Mostrar todas** (Show all) to show them again.

#### 10. View and choose images

Every product with a feed ID has a tab with an image icon, attached to the left side of the table. Click it to expand its images below the row.

- **Click an image** to turn it on or off. Deactivated images appear in black and white with a red border.
- **Drag the gray bar** below the images to change their height.
- Clicking another tab closes the previous one.

In **Herramientas**, in the **Imágenes** row, you have these buttons:

| Button | What it does |
|---|---|
| **Activar todas** (Activate all) | Activates all images for all products |
| **Desactivar todas** (Deactivate all) | Deactivates all images for all products |
| **Solo la 1ª** (Only the 1st) | In each product, keeps only the first image active |
| **Solo la 2ª** (Only the 2nd) | In each product, keeps only the second image active. If a product has only one image, none stay active |
| **Capturar y descargar ZIP** (Capture and download ZIP) | Captures the active images and downloads a ZIP (see below) |
| **Modo selección de fotos** (Photo selection mode) | Opens a view to review product by product |

Image buttons are enabled once the feed server has loaded and there are products with images. If a button looks disabled, check that the server is running.

##### Photo selection mode

Opens a large window with the product list on the left and the images on the right.

- **Click a row** in the list to open that product.
- **Click an image**, or press its number, to turn it on or off.
- **← →** change product.
- **1 to 9** turn the image with that number on or off.
- **Solo la 1ª** and **Solo la 2ª** apply only to the product you're viewing.
- **Esc** closes the window.

##### Capture and download ZIP

This button does not download the original feed images. Instead, it takes a screenshot of each image as it appears on screen and saves those screenshots into a ZIP.

1. Click **Capturar y descargar ZIP**.
2. Chrome shows a screen-sharing prompt. The Briefing File tab should already be selected. Confirm with **Share**. It is only asked once per capture.
3. The screen darkens and each image appears alone, centered, and as large as fits the window. The progress appears in the top left, for example "3 de 12 · 421804 - 1.png".
4. When it finishes, the browser downloads **Imagenes Briefing.zip** with files named like `421804 - 1.png`.

Keep in mind:

- **Don't switch tabs or minimize the window** during the capture. If you do, the capture stops.
- **Size depends on your window and screen.** Images come out at the size they appear on screen, not necessarily the original feed size. For best results, maximize the browser window.
- **If you stop sharing** from Chrome's bar, the capture ends and the ZIP contains only the images captured so far. The `errores.txt` file inside the ZIP notes that it was stopped.
- If an image can't be captured, it's listed in `errores.txt` and the rest continue normally.
- It takes a few seconds per image. A batch of 100 images can take several minutes.

#### 11. Add UTM to links

At the top there's a **UTM** field. Type, for example, `utm_source=ig` and the text is added to the end of every URL, in orange so you can check it. If you type `?utm_source=ig`, the application removes the question mark automatically.

The UTM doesn't change the saved URL; it's only added when exporting.

#### 12. Export to Excel

1. Click **Exportar Excel**.
2. Choose which columns to include: **SKU** (always), **Título** (Title), **Capítulo** (Chapter, the page number), and **Link**.
3. Click **Descargar Excel** (Download Excel).

The file is named **Briefing File.xlsx**. It only includes active rows. Deactivated rows and rows hidden in the table are not exported.

#### 13. Help

Click the **?** button to open the help window. It has 10 pages that explain the tool, with visual examples of the buttons, rows, and windows.

- The **?** button appears on the start screen (top right) and in the top bar of the workspace.
- Use **EN** or **ES** at the top of the window to change the language. The choice is saved in the browser, so the next time you open the app it stays the same. English is the default.
- Use **Anterior** (Previous) and **Siguiente** (Next) to move between pages, or the arrow keys. **Esc** closes the window.

#### 14. Start with another PDF

Refresh the browser page (F5 or Ctrl + R). You return to the start screen. Data from the previous PDF is lost if you haven't exported, so export first.

---

### Frequently asked questions

**The screen says "Esperando el feed…" (Waiting for the feed) and doesn't move.**
The Python server isn't running or is still loading the feed. Check the terminal and `http://127.0.0.1:8000/status`. If the server reported an error, restart `feed_server.py`.

**The table says "feed no disponible" (feed unavailable).**
The Python server isn't running or is still loading the feed. Check the terminal and `http://127.0.0.1:8000/status`.

**The command `python` opens the Microsoft Store or says "Python was not found".**
Windows is using a placeholder for `python`. Use `py feed_server.py` instead. To remove the placeholder, go to **Settings → Apps → Advanced app settings → App execution aliases** and turn off `python.exe` and `python3.exe`.

**The `py` or `python3` command doesn't work.**
Python wasn't installed correctly or the PATH option wasn't checked. Uninstall it, reinstall it, and check that option.

**The application looks unstyled or doesn't respond.**
Make sure you opened it with Live Server and not by double-clicking.

**The feed data is outdated.**
The server refreshes the feed every 24 hours. To force an update, stop the server with Ctrl + C and run the command again.

**A product appears without a title.**
This is normal for some catalog layouts. Double-click the title and type it.

**The screen-sharing prompt doesn't appear when capturing.**
You're using a browser other than Chrome or Edge, or the version is older than 120. Open the application in an up-to-date Chrome or Edge.

**The captured images are smaller than the originals.**
The capture uses the size shown on screen. Maximize the browser window and try again. If you need the original size, screen capture can't provide it.

**The images are cut off or include background.**
Don't switch tabs or move the window during the capture. If the page moved while capturing, run it again.

**The capture button does nothing or looks disabled.**
It's enabled when at least one image is active. Also check that the feed server is running.

**The ? button doesn't open anything.**
Make sure `js/main.js` calls `initHelp()` and that the app was opened with Live Server. Press F12, check the Console tab for red errors, and reload the page.

---

### Maintenance and changes

As noted at the start, this project is provided without official support. If you want to change something:

- **Colors and styles:** `styles.css`
- **Column widths:** `js/config.js`, in `FIXED_COLS` and `FLEX_MIN_PX`
- **Table logic:** `js/ui/table.js`
- **Copy and link buttons:** `js/ui/buttons.js`
- **Images, photo selection mode, and ZIP capture:** `js/ui/images.js`
- **Help window, its pages, and its language:** `js/ui/help.js`
- **Upload flow and waiting for the feed:** `js/ui/upload.js` and `js/feed/status.js`
- **PDF reading:** `js/pdf/`
- **Feed lookup:** `feed_server.py`

Before making changes, save a copy of the folder.

---

## Español

Herramienta para convertir un catálogo en PDF en una tabla de productos, revisarla, capturar sus imágenes y exportar todo en el formato de briefing.

---

### ⚠️ Aviso importante

Este proyecto **no es un producto de iPaper**. iPaper no se hace responsable de su uso, mantenimiento, funcionamiento ni de los resultados que produzca.

- El código se entrega tal cual.
- Es responsabilidad de quien lo use **ejecutarlo, modificarlo, agregarle funciones y depurarlo**.
- Revisa que el uso que le des cumpla con los términos de las páginas y fuentes de datos que consulta.

---

### Qué necesitas instalar

Antes de empezar necesitas tres programas. Si ya los tienes, sáltate esta parte.

#### 1. Visual Studio Code (VS Code)

Es el editor donde abres y organizas la carpeta del proyecto.

1. Entra a **code.visualstudio.com**.
2. Descarga la versión para tu sistema (Windows o Mac).
3. Instálalo con las opciones que vienen por defecto.

#### 2. Python

Es el programa que hace funcionar el servidor que consulta el feed de productos.

1. Entra a **python.org/downloads** y descarga la última versión.
2. Al instalarlo, **marca la casilla "Add python.exe to PATH"** en la primera pantalla. Si no la marcas, el programa no se reconocerá después.
3. Termina la instalación.

#### 3. Extensión de Python para VS Code

VS Code necesita la extensión de Python para reconocer la versión que instalaste.

1. Abre VS Code.
2. En el panel izquierdo, haz clic en el ícono de **cuadros** (Extensiones), o presiona **Ctrl + Shift + X**.
3. Escribe **Python** en el buscador.
4. Elige la extensión llamada **Python** publicada por **Microsoft** (la que tiene más descargas).
5. Haz clic en **Install** (Instalar).

Luego selecciona la versión de Python que usará VS Code:

1. Presiona **Ctrl + Shift + P** para abrir la paleta de comandos.
2. Escribe **Python: Select Interpreter** (Python: seleccionar intérprete) y elígelo.
3. Selecciona la versión **3.12** o una más reciente.

Si la versión que quieres no aparece, cierra VS Code, vuelve a abrirlo e intenta otra vez.

#### 4. Live Server (extensión de VS Code)

Es una extensión que abre la aplicación en el navegador con una dirección local.

1. En VS Code, haz clic en el ícono de **Extensiones**.
2. Busca **Live Server** (del autor Ritwick Dey).
3. Haz clic en **Install**.

#### 5. Navegador compatible

La captura de imágenes usa una función que solo está disponible en **Google Chrome** y **Microsoft Edge**. Usa uno de esos dos para abrir la aplicación.

#### 6. Git (opcional, solo para subir el proyecto a GitHub)

1. Entra a **git-scm.com/downloads** e instala la versión para tu sistema con las opciones por defecto.
2. Cierra y vuelve a abrir VS Code después de instalarlo, para que la terminal lo reconozca.

---

### Comprobar que Python funciona

Después de instalar Python, revisa que VS Code y la terminal lo reconozcan.

1. Ve a **Terminal → New Terminal** (Terminal → Nueva terminal).
2. Escribe el comando según tu sistema y presiona Enter:

**Windows:**
```
py --version
```

**Mac o Linux:**
```
python3 --version
```

3. Debe aparecer algo como `Python 3.12.x`. Si aparece ese número, Python está listo.

Si aparece un error del tipo **"no se reconoce como un comando"** o **"command not found"**:

- Cierra VS Code por completo y vuelve a abrirlo. La terminal solo reconoce Python si se abrió después de instalarlo.
- En Windows, prueba con `python --version` en lugar de `py --version`.
- Si nada funciona, desinstala Python, vuelve a instalarlo y marca la casilla **"Add python.exe to PATH"**.

---

### Cómo descargar y abrir el proyecto

1. Descarga la carpeta del proyecto y descomprímela en un lugar fácil de encontrar, por ejemplo el Escritorio.
2. Abre VS Code.
3. Ve a **File → Open Folder** (Archivo → Abrir carpeta) y selecciona la carpeta del proyecto.

Deberás ver estos archivos en el panel izquierdo:

```
briefing-file/
├── feed_server.py      ← servidor que consulta el feed de productos
├── index.html          ← la aplicación
├── styles.css          ← los estilos
├── README.md           ← este archivo
└── js/                 ← la lógica de la aplicación (varios archivos)
```

---

### Cómo ejecutarla

Necesitas **dos cosas funcionando al mismo tiempo**: el servidor de Python y la aplicación con Live Server.

#### Paso 1: iniciar el servidor de Python

1. En la terminal de VS Code, escribe el comando según tu sistema y presiona Enter:

**Windows:**
```
py feed_server.py
```

**Mac o Linux:**
```
python3 feed_server.py
```

2. Debe aparecer un mensaje parecido a: `Servidor en http://127.0.0.1:8000`.
3. **Deja esta terminal abierta mientras uses la aplicación.** Si la cierras, la aplicación deja de tener datos del feed.

La primera vez, el servidor tarda uno o dos minutos en cargar el feed completo. Mientras tanto puedes subir un PDF: la aplicación lo lee y luego espera el feed antes de mostrar la tabla.

Para saber si ya está listo, abre en tu navegador: **http://127.0.0.1:8000/status**. Cuando aparezca `"loaded": true`, el feed está cargado.

El servidor solo consulta el feed. No descarga imágenes: las imágenes se toman de lo que ya muestra la aplicación.

#### Paso 2: abrir la aplicación con Live Server

1. En el panel izquierdo de VS Code, haz clic derecho sobre **index.html**.
2. Elige **Open with Live Server** (Abrir con Live Server).
3. Se abrirá tu navegador con la aplicación.

**Importante:** no hagas doble clic en `index.html`. Debe abrirse con Live Server, o el navegador bloqueará parte de la aplicación.

#### Para detener todo

- En la terminal, presiona **Ctrl + C** para detener el servidor de Python.
- Para detener Live Server, haz clic en **Port: 5500** en la barra inferior de VS Code.

---

### Qué puede hacer

#### 1. Subir un PDF

Arrastra el PDF del catálogo a la pantalla de inicio, o haz clic para elegirlo. La aplicación lee cada página y busca los códigos de 6 dígitos.

Cuando termina de leer el PDF, la pantalla muestra **"PDF listo. Esperando el feed…"** hasta que el servidor del feed termine de cargar. Luego aparece la tabla con títulos, precios y datos del feed. Si el servidor está apagado, el mensaje cambia a **"Esperando el servidor del feed…"** y la aplicación sigue revisando cada segundo.

Lee el PDF completo en tu computadora. No se sube a ningún servidor.

#### 2. Revisar la tabla

Cada fila es un producto. Las columnas son:

| Columna | Qué muestra |
|---|---|
| **Activo** | Casilla para incluir o excluir la fila |
| **#** | Número de fila. Al hacer clic, muestra el producto en la vista previa del PDF |
| **SKU** | Código de 6 dígitos del producto |
| **ID en feed** | ID encontrado en el feed de productos |
| **Título** | Nombre que se encontró en el PDF |
| **Nombre en feed** | Nombre del producto según el feed |
| **Precio original / final** | Precios encontrados en el PDF |
| **URL** | Enlace del producto en el feed |
| **Página** | Página del PDF donde aparece |

Los productos que aparecen en varias páginas tienen una fila por página.

#### 3. Entender los colores

| Color de la fila | Significado |
|---|---|
| **Amarillo** | No se encontró el título en el PDF. Haz doble clic en el título para escribirlo |
| **Rojo a la izquierda** | Solo se encontró el código, sin título ni precio. Revísalo en el PDF |
| **Lila** | Fila manual (agregada por ti) |
| **Verde azulado** | Fila manual encontrada en el feed |
| **Coral** | Fila manual que no se encontró en el feed |
| **Gris tachado** | Fila desactivada. No se exporta |

Las filas normales alternan dos tonos de azul o verde por página, para que se vea dónde empieza y termina cada página.

#### 4. Vista previa del PDF

A la izquierda aparecen las páginas del catálogo. Cada código encontrado tiene un recuadro amarillo.

- **Haz clic en el número de una fila** y la vista previa se desplaza a ese producto y lo hace parpadear.
- **Haz clic en un recuadro** y la tabla se desplaza a esa fila.
- Puedes **arrastrar la línea gris** entre la vista previa y la tabla para cambiar el tamaño de cada parte.

#### 5. Editar y botones

- **Doble clic** en el título para cambiarlo. Enter guarda, Escape cancela.
- **Botón de copiar** que aparece al pasar el mouse sobre el título o el nombre del feed.
- **Botón de enlace** que aparece al pasar el mouse sobre la URL. Abre la página del producto en una pestaña nueva, sin el querystring (todo lo que va desde `?`). El UTM que escribas en el campo de arriba nunca se incluye.
- En los productos manuales puedes editar también el SKU y la página.

#### 6. Agregar productos manuales

Hay productos que están en el catálogo pero no aparecen bien en el PDF. Puedes agregarlos así:

1. Pasa el mouse entre dos filas. Aparecerá un **signo +**.
2. Haz clic. Se crea una fila nueva, lila, justo debajo de la fila de arriba.
3. Haz doble clic en el SKU y escribe el código del producto.
4. Escribe el título si lo conoces.

La fila nueva toma la página de la fila de arriba. Puedes cambiarla con doble clic en la columna Página.

Para eliminar una fila manual, usa el ícono de **papelera** en su primera columna.

#### 7. Revisar si un producto está en el feed

Hay dos formas:

**Automática:** cuando procesas el PDF, la aplicación busca cada código en el feed. Si lo encuentra, llena las columnas **ID en feed** y **Nombre en feed**. Si no, dice "no se encontró en feed".

**Para productos manuales:** haz clic en **Herramientas** (arriba a la derecha) y luego en **Buscar manuales en feed**. La aplicación revisa todas las filas manuales y las pinta de verde azulado si están en el feed o de coral si no.

Puedes escribir el SKU de dos formas:

- **Código de 6 dígitos**, por ejemplo `421804`. La aplicación busca un producto cuyo ID en el feed tenga ese código.
- **ID completo**, por ejemplo `pm-4218043`, tal como aparece en el feed.

La pastilla **Feed listo** en la parte superior indica si el servidor de Python está funcionando y el feed está cargado. Si dice "Sin conexión", revisa que la terminal con `feed_server.py` siga abierta.

#### 8. Filtrar la tabla

Abre **Herramientas** para ver los filtros. Haz clic en cualquiera para mostrar solo esas filas:

- Filas totales, activas o manuales
- Sin título
- Sin match (no encontradas en el feed)
- En feed o fuera de feed (solo manuales)

Haz clic de nuevo para quitar el filtro. Los filtros solo ocultan filas; no borran nada.

#### 9. Ocultar columnas

En **Herramientas**, en la fila **Columnas en tabla**, haz clic en las columnas que quieras ocultar. Ocultarlas **solo afecta lo que ves**, no el Excel. Usa **Mostrar todas** para volver a verlas.

#### 10. Ver y elegir imágenes

Cada producto con ID en el feed tiene una pestaña con un ícono de imagen, pegada a la izquierda de la tabla. Haz clic en ella para desplegar sus imágenes debajo de la fila.

- **Clic en una imagen** la activa o la desactiva. Las desactivadas se ven en blanco y negro con borde rojo.
- **Arrastra la barra gris** debajo de las imágenes para cambiar su alto.
- Al hacer clic en otra pestaña, la anterior se cierra.

En **Herramientas**, en la fila **Imágenes**, tienes estos botones:

| Botón | Qué hace |
|---|---|
| **Activar todas** | Activa todas las imágenes de todos los productos |
| **Desactivar todas** | Desactiva todas las imágenes de todos los productos |
| **Solo la 1ª** | En cada producto deja activa solo la primera imagen |
| **Solo la 2ª** | En cada producto deja activa solo la segunda imagen. Si un producto tiene una sola imagen, queda sin ninguna activa |
| **Capturar y descargar ZIP** | Captura las imágenes activas y descarga un ZIP (ver abajo) |
| **Modo selección de fotos** | Abre una vista para revisar producto por producto |

Los botones de imágenes se activan cuando el servidor del feed ya cargó y hay productos con imágenes. Si un botón aparece apagado, revisa que el servidor esté corriendo.

##### Modo selección de fotos

Abre una ventana grande con la lista de productos a la izquierda y las imágenes a la derecha.

- **Haz clic en una fila** de la lista para abrir ese producto.
- **Haz clic en una imagen**, o presiona su número, para activarla o desactivarla.
- **← →** cambian de producto.
- **1 a 9** activan o desactivan la imagen con ese número.
- **Solo la 1ª** y **Solo la 2ª** aplican solo al producto que estás viendo.
- **Esc** cierra la ventana.

##### Capturar y descargar ZIP

Este botón no descarga las imágenes originales del feed. En su lugar, toma una captura de cada imagen tal como se ve en pantalla y guarda esas capturas en un ZIP.

1. Haz clic en **Capturar y descargar ZIP**.
2. Chrome muestra un aviso para compartir pantalla. La pestaña de Briefing File debe aparecer ya seleccionada. Confirma con **Compartir**. Solo se pide una vez por captura.
3. La pantalla se oscurece y cada imagen aparece sola, centrada y lo más grande que cabe en la ventana. Arriba a la izquierda aparece el progreso, por ejemplo "3 de 12 · 421804 - 1.png".
4. Al terminar, el navegador descarga **Imagenes Briefing.zip** con archivos llamados como `421804 - 1.png`.

Ten en cuenta lo siguiente:

- **No cambies de pestaña ni minimices la ventana** durante la captura. Si lo haces, la captura se detiene.
- **El tamaño depende de tu ventana y de tu pantalla.** Las imágenes salen con el tamaño que se ve en pantalla, no necesariamente con el tamaño original del feed. Para mejores resultados, maximiza la ventana del navegador.
- **Si detienes el uso compartido** desde la barra de Chrome, la captura termina y el ZIP incluye solo las imágenes ya capturadas. El archivo `errores.txt` dentro del ZIP indica que se detuvo.
- Si una imagen no se puede capturar, aparece en `errores.txt` y el resto sigue normal.
- Tarda unos segundos por imagen. Un lote de 100 imágenes puede tardar varios minutos.

#### 11. Agregar UTM a los enlaces

En la parte superior hay un campo **UTM**. Escribe, por ejemplo, `utm_source=ig` y el texto se agrega al final de cada URL, en color naranja para que puedas revisarlo. Si escribes `?utm_source=ig`, la aplicación quita el signo de pregunta automáticamente.

El UTM no cambia la URL guardada; solo se agrega al exportar.

#### 12. Exportar a Excel

1. Haz clic en **Exportar Excel**.
2. Elige qué columnas incluir: **SKU** (siempre), **Título**, **Capítulo** (número de página) y **Link**.
3. Haz clic en **Descargar Excel**.

El archivo se llama **Briefing File.xlsx**. Solo incluye las filas activas. Las filas desactivadas y las ocultas en la tabla no se exportan.

#### 13. Ayuda

Haz clic en el botón **?** para abrir la ventana de ayuda. Tiene 10 páginas que explican la herramienta, con ejemplos visuales de los botones, las filas y las ventanas.

- El botón **?** aparece en la pantalla de inicio (esquina superior derecha) y en la barra superior del espacio de trabajo.
- Usa **EN** o **ES** en la parte superior de la ventana para cambiar el idioma. La elección se guarda en el navegador, así que la próxima vez que abras la aplicación seguirá igual. El inglés es el idioma por defecto.
- Usa **Anterior** y **Siguiente** para moverte entre páginas, o las flechas del teclado. **Esc** cierra la ventana.

#### 14. Empezar con otro PDF

Actualiza la página del navegador (F5 o Ctrl + R). Vuelves a la pantalla de inicio. Los datos del PDF anterior se pierden si no exportaste, así que exporta antes.

---

### Preguntas frecuentes

**La pantalla dice "Esperando el feed…" y no cambia.**
El servidor de Python no está corriendo o todavía está cargando el feed. Revisa la terminal y `http://127.0.0.1:8000/status`. Si el servidor reportó un error, reinicia `feed_server.py`.

**La tabla dice "feed no disponible".**
El servidor de Python no está corriendo o todavía está cargando el feed. Revisa la terminal y `http://127.0.0.1:8000/status`.

**El comando `python` abre la Microsoft Store o dice "Python was not found".**
Windows está usando un atajo para `python`. Usa `py feed_server.py` en su lugar. Para quitar el atajo, ve a **Configuración → Aplicaciones → Configuración avanzada de aplicaciones → Alias de ejecución de aplicaciones** y desactiva `python.exe` y `python3.exe`.

**El comando `py` o `python3` no funciona.**
Python no se instaló bien o no se marcó la opción PATH. Desinstálalo, vuelve a instalarlo y marca esa casilla.

**La aplicación se ve sin estilos o no responde.**
Revisa que estés abriéndola con Live Server y no con doble clic.

**Los datos del feed están viejos.**
El servidor actualiza el feed cada 24 horas. Para forzar una actualización, detén el servidor con Ctrl + C y vuelve a ejecutar el comando.

**Un producto aparece sin título.**
Es normal en algunos diseños del catálogo. Haz doble clic en el título y escríbelo.

**No aparece el aviso para compartir pantalla al capturar.**
Estás usando un navegador distinto de Chrome o Edge, o la versión es anterior a la 120. Abre la aplicación en Chrome o Edge actualizado.

**Las imágenes capturadas salen más chicas que las originales.**
La captura toma el tamaño que se ve en pantalla. Maximiza la ventana del navegador y vuelve a intentarlo. Si necesitas el tamaño original, la captura de pantalla no puede dar ese resultado.

**Las imágenes salen cortadas o con parte del fondo.**
No cambies de pestaña ni muevas la ventana durante la captura. Si la página se movió mientras capturaba, vuelve a ejecutarla.

**El botón de captura no hace nada o aparece apagado.**
Se activa cuando hay al menos una imagen activa. Revisa también que el servidor del feed esté funcionando.

**El botón ? no abre nada.**
Revisa que `js/main.js` llame a `initHelp()` y que la aplicación se abra con Live Server. Presiona F12, revisa la pestaña Console por errores en rojo y recarga la página.

---

### Mantenimiento y cambios

Como se indicó al inicio, este proyecto se entrega sin soporte oficial. Si quieres cambiar algo:

- **Colores y estilos:** `styles.css`
- **Anchos de columna:** `js/config.js`, en `FIXED_COLS` y `FLEX_MIN_PX`
- **Lógica de la tabla:** `js/ui/table.js`
- **Botones de copiar y de enlace:** `js/ui/buttons.js`
- **Imágenes, modo selección y captura en ZIP:** `js/ui/images.js`
- **Ventana de ayuda, sus páginas e idioma:** `js/ui/help.js`
- **Flujo de subida y espera del feed:** `js/ui/upload.js` y `js/feed/status.js`
- **Lectura del PDF:** `js/pdf/`
- **Consulta del feed:** `feed_server.py`

Antes de hacer cambios, guarda una copia de la carpeta.