import { sidebar, resizer } from "./dom.js";
import { SIDEBAR_MIN, SIDEBAR_MAX } from "../config.js";
import { setStatus } from "./toast.js";

let flashTimer = null;

// Avisa a la tabla que debe mostrar esta fila. La tabla escucha este evento.
export function locateRow(r) {
  window.dispatchEvent(new CustomEvent("briefing:locate", { detail: r }));
}

// Una div por página (miniatura + recuadros). Los recuadros usan porcentajes, así que siguen alineados.
export function renderSidebar(doc, list) {
  sidebar.replaceChildren();
  const pageEls = {};
  const dims = {};

  for (const pg of doc.pages) {
    dims[pg.page] = { w: pg.width, h: pg.height };

    const box = document.createElement("div");
    box.className = "thumb";

    const pageDiv = document.createElement("div");
    pageDiv.className = "page";
    pageDiv.dataset.page = pg.page;

    const img = document.createElement("img");
    img.src = pg.thumb;
    img.alt = `Página ${pg.page}`;
    pageDiv.appendChild(img);

    const label = document.createElement("span");
    label.textContent = `Página ${pg.page}`;

    box.append(pageDiv, label);
    sidebar.appendChild(box);
    pageEls[pg.page] = pageDiv;
  }

  for (const r of list) {
    r.boxes = [];
    for (const loc of r.locs || []) {
      const pageDiv = pageEls[loc.page];
      const d = dims[loc.page];
      if (!pageDiv || !d) continue;

      const el = document.createElement("div");
      el.className = "hit";
      el.title = `${r.sku} · clic para ver en la tabla`;
      el.style.left = (loc.x / d.w) * 100 + "%";
      el.style.top = (Math.max(0, loc.y - loc.h) / d.h) * 100 + "%";
      el.style.width = (loc.w / d.w) * 100 + "%";
      el.style.height = (loc.h / d.h) * 100 + "%";
      el.addEventListener("click", () => locateRow(r));
      pageDiv.appendChild(el);
      r.boxes.push(el);
    }
  }
}

// Desplaza la vista previa al primer recuadro de la fila y lo hace parpadear 1 s.
export function focusRow(r) {
  const els = r.boxes || [];
  if (!els.length) {
    setStatus("Esta fila no tiene ubicación en la vista previa.");
    return;
  }

  document
    .querySelectorAll(".hit.flash")
    .forEach((el) => el.classList.remove("flash"));
  clearTimeout(flashTimer);

  els[0].scrollIntoView({ behavior: "smooth", block: "center" });

  flashTimer = setTimeout(() => {
    els.forEach((el) => {
      el.classList.remove("flash");
      void el.offsetWidth;
      el.classList.add("flash");
    });
  }, 400);
}

// Divisor arrastrable entre la vista previa y la tabla.
export function initResizer() {
  resizer.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    resizer.setPointerCapture(e.pointerId);
    resizer.classList.add("dragging");
    const startX = e.clientX;
    const startW = sidebar.getBoundingClientRect().width;

    const onMove = (ev) => {
      const maxW = window.innerWidth - 360; // deja al menos 360 px para la tabla
      const w = Math.min(
        maxW,
        Math.max(SIDEBAR_MIN, startW + (ev.clientX - startX)),
      );
      document.documentElement.style.setProperty(
        "--sidebar-w",
        `${Math.round(w)}px`,
      );
    };
    const onUp = () => {
      resizer.classList.remove("dragging");
      resizer.removeEventListener("pointermove", onMove);
      resizer.removeEventListener("pointerup", onUp);
      resizer.removeEventListener("pointercancel", onUp);
    };
    resizer.addEventListener("pointermove", onMove);
    resizer.addEventListener("pointerup", onUp);
    resizer.addEventListener("pointercancel", onUp);
  });
}
