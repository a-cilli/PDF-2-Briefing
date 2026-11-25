# Briefing File

Herramienta para convertir un catálogo en PDF en una tabla de productos, revisarla y exportarla a Excel en el formato de briefing.

---

## ⚠️ Aviso importante

Este proyecto **no es un producto de iPaper**. iPaper no se hace responsable de su uso, mantenimiento, funcionamiento ni de los resultados que produzca.

- El código se entrega tal cual.
- Es responsabilidad de quien lo use **ejecutarlo, modificarlo, agregarle funciones y depurarlo**.
- Revisa que el uso que le des cumpla con los términos de las páginas y fuentes de datos que consulta.

---

## Qué necesitas instalar

Antes de empezar necesitas tres programas. Si ya los tienes, sáltate esta parte.

### 1. Visual Studio Code (VS Code)

Es el editor donde abres y organizas la carpeta del proyecto.

1. Entra a **code.visualstudio.com**.
2. Descarga la versión para tu sistema (Windows o Mac).
3. Instálalo con las opciones que vienen por defecto.

### 2. Python

Es el programa que hace funcionar el servidor que consulta el feed de productos.

1. Entra a **python.org/downloads** y descarga la última versión.
2. Al instalarlo, **marca la casilla "Add python.exe to PATH"** en la primera pantalla. Si no la marcas, el programa no se reconocerá después.
3. Termina la instalación.

### 3. Extensión de Python para VS Code

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

### 4. Live Server (extensión de VS Code)

Es una extensión que abre la aplicación en el navegador con una dirección local.

1. En VS Code, haz clic en el ícono de **Extensiones**.
2. Busca **Live Server** (del autor Ritwick Dey).
3. Haz clic en **Install**.

---

## Comprobar que Python funciona

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

## Cómo descargar y abrir el proyecto

1. Descarga la carpeta del proyecto y descomprímela en un lugar fácil de encontrar, por ejemplo el Escritorio.
2. Abre VS Code.
3. Ve a **File → Open Folder** (Archivo → Abrir carpeta) y selecciona la carpeta **briefing-file**.

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

## Cómo ejecutarla

Necesitas **dos cosas funcionando al mismo tiempo**: el servidor de Python y la aplicación con Live Server.

### Paso 1: iniciar el servidor de Python

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

La primera vez, el servidor tarda uno o dos minutos en cargar el feed completo. Mientras tanto, la aplicación funciona, pero no puede cruzar productos con el feed.

Para saber si ya está listo, abre en tu navegador: **http://127.0.0.1:8000/status**. Cuando aparezca `"loaded": true`, el feed está cargado.

### Paso 2: abrir la aplicación con Live Server

1. En el panel izquierdo de VS Code, haz clic derecho sobre **index.html**.
2. Elige **Open with Live Server** (Abrir con Live Server).
3. Se abrirá tu navegador con la aplicación.

**Importante:** no hagas doble clic en `index.html`. Debe abrirse con Live Server, o el navegador bloqueará parte de la aplicación.

### Para detener todo

- En la terminal, presiona **Ctrl + C** para detener el servidor de Python.
- Para detener Live Server, haz clic en **Port: 5500** en la barra inferior de VS Code.

---

## Qué puede hacer

### 1. Subir un PDF

Arrastra el PDF del catálogo a la pantalla de inicio, o haz clic para elegirlo. La aplicación lee cada página, busca los códigos de 6 dígitos y arma la tabla con sus títulos y precios.

Lee el PDF completo en tu computadora. No se sube a ningún servidor.

### 2. Revisar la tabla

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

### 3. Entender los colores

| Color de la fila | Significado |
|---|---|
| **Amarillo** | No se encontró el título en el PDF. Haz doble clic en el título para escribirlo |
| **Rojo a la izquierda** | Solo se encontró el código, sin título ni precio. Revísalo en el PDF |
| **Lila** | Fila manual (agregada por ti) |
| **Verde azulado** | Fila manual encontrada en el feed |
| **Coral** | Fila manual que no se encontró en el feed |
| **Gris tachado** | Fila desactivada. No se exporta |

Las filas normales alternan dos tonos de azul o verde por página, para que se vea dónde empieza y termina cada página.

### 4. Vista previa del PDF

A la izquierda aparecen las páginas del catálogo. Cada código encontrado tiene un recuadro amarillo.

- **Haz clic en el número de una fila** y la vista previa se desplaza a ese producto y lo hace parpadear.
- **Haz clic en un recuadro** y la tabla se desplaza a esa fila.
- Puedes **arrastrar la línea gris** entre la vista previa y la tabla para cambiar el tamaño de cada parte.

### 5. Editar

- **Doble clic** en el título para cambiarlo. Enter guarda, Escape cancela.
- **Botón de copiar** que aparece al pasar el mouse sobre el título o el nombre del feed.
- En los productos manuales puedes editar también el SKU y la página.

### 6. Agregar productos manuales

Hay productos que están en el catálogo pero no aparecen bien en el PDF. Puedes agregarlos así:

1. Pasa el mouse entre dos filas. Aparecerá un **signo +**.
2. Haz clic. Se crea una fila nueva, lila, justo debajo de la fila de arriba.
3. Haz doble clic en el SKU y escribe el código del producto.
4. Escribe el título si lo conoces.

La fila nueva toma la página de la fila de arriba. Puedes cambiarla con doble clic en la columna Página.

Para eliminar una fila manual, usa el ícono de **papelera** en su primera columna.

### 7. Revisar si un producto está en el feed

Hay dos formas:

**Automática:** cuando procesas el PDF, la aplicación busca cada código en el feed. Si lo encuentra, llena las columnas **ID en feed** y **Nombre en feed**. Si no, dice "no se encontró en feed".

**Para productos manuales:** haz clic en **Herramientas** (arriba a la derecha) y luego en **Buscar manuales en feed**. La aplicación revisa todas las filas manuales y las pinta de verde azulado si están en el feed o de coral si no.

Puedes escribir el SKU de dos formas:

- **Código de 6 dígitos**, por ejemplo `421804`. La aplicación busca un producto cuyo ID en el feed tenga ese código.
- **ID completo**, por ejemplo `pm-4218043`, tal como aparece en el feed.

La pastilla **Feed listo** en la parte superior indica si el servidor de Python está funcionando y el feed está cargado. Si dice "Sin conexión", revisa que la terminal con `feed_server.py` siga abierta.

### 8. Filtrar la tabla

Abre **Herramientas** para ver los filtros. Haz clic en cualquiera para mostrar solo esas filas:

- Filas totales, activas o manuales
- Sin título
- Sin match (no encontradas en el feed)
- En feed o fuera de feed (solo manuales)

Haz clic de nuevo para quitar el filtro. Los filtros solo ocultan filas; no borran nada.

### 9. Ocultar columnas

En **Herramientas**, en la fila **Columnas en tabla**, haz clic en las columnas que quieras ocultar. Ocultarlas **solo afecta lo que ves**, no el Excel. Usa **Mostrar todas** para volver a verlas.

### 10. Agregar UTM a los enlaces

En la parte superior hay un campo **UTM**. Escribe, por ejemplo, `utm_source=ig` y el texto se agrega al final de cada URL, en color naranja para que puedas revisarlo. Si escribes `?utm_source=ig`, la aplicación quita el signo de pregunta automáticamente.

El UTM no cambia la URL guardada; solo se agrega al exportar.

### 11. Exportar a Excel

1. Haz clic en **Exportar Excel**.
2. Elige qué columnas incluir: **SKU** (siempre), **Título**, **Capítulo** (número de página) y **Link**.
3. Haz clic en **Descargar Excel**.

El archivo se llama **Briefing File.xlsx**. Solo incluye las filas activas. Las filas desactivadas y las ocultas en la tabla no se exportan.

### 12. Empezar con otro PDF

Actualiza la página del navegador (F5 o Ctrl + R). Vuelves a la pantalla de inicio. Los datos del PDF anterior se pierden si no exportaste, así que exporta antes.

---

## Preguntas frecuentes

**La tabla dice "feed no disponible".**
El servidor de Python no está corriendo o todavía está cargando el feed. Revisa la terminal y `http://127.0.0.1:8000/status`.

**El comando `py` o `python3` no funciona.**
Python no se instaló bien o no se marcó la opción PATH. Desinstálalo, vuelve a instalarlo y marca esa casilla.

**La aplicación se ve sin estilos o no responde.**
Revisa que estés abriéndola con Live Server y no con doble clic.

**Los datos del feed están viejos.**
El servidor actualiza el feed cada 24 horas. Para forzar una actualización, detén el servidor con Ctrl + C y vuelve a ejecutar el comando.

**Un producto aparece sin título.**
Es normal en algunos diseños del catálogo. Haz doble clic en el título y escríbelo.

---

## Mantenimiento y cambios

Como se indicó al inicio, este proyecto se entrega sin soporte oficial. Si quieres cambiar algo:

- **Colores y estilos:** `styles.css`
- **Anchos de columna:** `js/config.js`, en `FIXED_COLS` y `FLEX_MIN_PX`
- **Lógica de la tabla:** `js/ui/table.js`
- **Lectura del PDF:** `js/pdf/`
- **Consulta del feed:** `feed_server.py`

Antes de hacer cambios, guarda una copia de la carpeta.
