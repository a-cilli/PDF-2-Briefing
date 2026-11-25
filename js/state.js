// Estado compartido por toda la app. Se modifica desde los módulos y se lee desde ellos.
export const state = {
  rows: [],                 // filas de la tabla: automáticas (del PDF) y manuales
  lastName: 'catalogo',     // nombre del PDF sin extensión
  activeFilter: 'all',      // filtro activo de la tabla
  hiddenCols: new Set(),    // columnas ocultas en la tabla (solo vista; no afecta al Excel)
  utm: '',                  // parámetros UTM que se añaden a las URLs
  pendingEdit: null,        // fila manual recién creada: se abre su celda SKU
  pendingCell: null         // celda que debe abrirse en modo edición tras renderizar
};

// La función de render de la tabla se registra desde main.js.
// Así los módulos pueden pedir un render sin importar table.js (evita dependencias circulares).
export const hooks = { render: () => {} };

export function requestRender() {
  hooks.render();
}