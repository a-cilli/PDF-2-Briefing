import json
import re
import threading
import time
import traceback
import urllib.request
import xml.etree.ElementTree as ET
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

FEED_URL = "https://kraken.3pmarketing.com.mx/xml/google.xml"
REFRESH_SECONDS = 24 * 3600
PORT = 8000
G = "{http://base.google.com/ns/1.0}"

# Regla del g:id para el lookup por SKU: dos letras, guion, código de 6 dígitos,
# un dígito extra y sufijo opcional. pm-4218043 -> 421804 ; pr-3409062-1 -> 409062
ID_RE = re.compile(r"^[A-Za-z]{2}-(\d{6})\d(?:-\d+)?$")

# Entradas manuales
CODE_ONLY_RE = re.compile(r"^\d{6}$")                       # 421804
FULL_ID_RE = re.compile(r"^[A-Za-z]{2}-\d{7}(?:-\d+)?$")    # pm-4218043

state = {"loaded": False, "entries": 0, "updated": None, "error": None}
tables = {"sku": {}, "id": {}, "full": {}}


class FixHead:
    """El feed puede empezar con '?xml' sin '<'. Lo corrige al leer, sin cargar todo el archivo en memoria."""
    def __init__(self, resp):
        self.resp = resp
        self.first = True

    def read(self, n=65536):
        data = self.resp.read(n)
        if self.first and data:
            self.first = False
            if data.startswith(b"?xml"):
                data = b"<" + data
        return data


def code_from_id(fid):
    # Devuelve el código de 6 dígitos si el g:id cumple la regla, o None si no.
    m = ID_RE.match((fid or "").strip())
    return m.group(1) if m else None


def load_feed():
    with urllib.request.urlopen(urllib.request.Request(
            FEED_URL, headers={"User-Agent": "feed-lookup/1.0"}), timeout=300) as resp:
        by_sku, by_id, by_full, n, root = {}, {}, {}, 0, None
        for ev, elem in ET.iterparse(FixHead(resp), events=("start", "end")):
            if root is None:          # primer evento "start" = <feed>
                root = elem
                continue
            if ev != "end" or elem.tag != "entry":
                continue
            n += 1
            fid = (elem.findtext(G + "id") or "").strip()
            sku = (elem.findtext(G + "sku") or "").strip()

            # Todas las imágenes del producto: la principal y las adicionales, sin repetir.
            images = []
            for tag in (G + "image_link", G + "additional_image_link"):
                for el in elem.findall(tag):
                    u = (el.text or "").strip()
                    if u and u not in images:
                        images.append(u)

            rec = {
                "id": fid,
                "title": (elem.findtext(G + "title") or "").strip(),
                "link": (elem.findtext(G + "link") or "").strip(),
                "images": images,
            }

            # Índice completo: cualquier g:id, para búsquedas de ID exacto.
            if fid:
                by_full.setdefault(fid.upper(), rec)

            # Índice por código: solo IDs que cumplen la regla.
            code = code_from_id(fid)
            if code is not None:
                by_id.setdefault(code, rec)
                if sku and sku == code:
                    by_sku.setdefault(sku, rec)

            elem.clear()
            root.clear()              # libera las entradas ya procesadas

    tables["sku"], tables["id"], tables["full"] = by_sku, by_id, by_full   # reemplazo completo
    state.update(loaded=True, entries=n, updated=time.strftime("%Y-%m-%d %H:%M:%S"), error=None)
    print(f"Feed cargado: {n} entradas, {len(by_full)} IDs completos, {len(by_id)} códigos válidos.")


def match_manual(raw):
    # Búsqueda para filas manuales: 6 dígitos (código) o ID completo tal cual.
    s = (raw or "").strip()
    if CODE_ONLY_RE.match(s):
        rec = tables["id"].get(s)
        return {**rec, "via": "código"} if rec else None
    if FULL_ID_RE.match(s):
        rec = tables["full"].get(s.upper())
        return {**rec, "via": "id completo"} if rec else None
    return None


def refresher():
    while True:
        try:
            load_feed()
        except Exception as e:
            state["error"] = str(e)
            print("Error al cargar el feed:", e)
            traceback.print_exc()
        time.sleep(REFRESH_SECONDS)


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/status"):
            return self._json(200, state)
        self._json(404, {"error": "no encontrado"})

    def do_POST(self):
        path = self.path.split("?")[0]
        if path not in ("/lookup", "/lookup-manual"):
            return self._json(404, {"error": "no encontrado"})
        if not state["loaded"]:
            return self._json(503, {"error": "El feed aún se está cargando"})
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            return self._json(400, {"error": "JSON inválido"})

        if path == "/lookup-manual":
            items = [str(x) for x in body.get("items", [])]
            return self._json(200, {s: match_manual(s) for s in items})

        out = {}
        for s in map(str, body.get("skus", [])):
            if s in tables["sku"]:
                out[s] = {**tables["sku"][s], "via": "g:sku"}
            elif s in tables["id"]:
                out[s] = {**tables["id"][s], "via": "g:id"}
        self._json(200, out)

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    threading.Thread(target=refresher, daemon=True).start()
    print(f"Servidor en http://127.0.0.1:{PORT} (el feed se carga en segundo plano)")
    print(f"Estado del feed: http://127.0.0.1:{PORT}/status")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()