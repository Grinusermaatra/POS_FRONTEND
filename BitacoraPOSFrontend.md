# Bitácora — prototipo Just2Sale

Experimento visual. No es un punto de venta real y no inicia desarrollo de producto.

## Alcance

Prototipo de pantallas en HTML, CSS y JavaScript. Se abre como archivo local, sin red, servidor, base de datos, API, autenticación ni hardware. Los datos son ficticios. El estado vive solo en la memoria de la pestaña y se pierde al recargar. No usa `localStorage` ni `IndexedDB`.

Las acciones que parecen guardar algo están marcadas como demostración: no envían ni archivan nada.

## Cómo abrirlo

Abrir este archivo en el navegador:

`prototype/index.html`

Ruta de este repositorio: `prototype/index.html` junto a `prototype/css/` y `prototype/js/`. No hace falta un servidor. Hace falta JavaScript. No descarga fuentes, iconos ni librerías.

## Archivos

- `prototype/index.html` — página. Icono en SVG embebido. Sin recursos externos.
- `prototype/css/styles.css` — presentación. Fondo `#F5F1EA`, acento `#BB8744`.
- `prototype/js/data.js` — productos, pedidos, reportes y folios de ejemplo.
- `prototype/js/app.js` — pantallas e interacción en memoria.
- `BitacoraPOSFrontend.md` — esta nota.

## Qué se puede recorrer

1. Inicio, con tarjetas hacia cada módulo. La venta es la entrada principal.
2. Punto de venta: búsqueda, escáner simulado, carrito, cantidades, promociones, subtotal, total, efectivo, tarjeta, transferencia, pago mixto, cambio y vista previa del ticket.
3. Caja: turno abierto de ejemplo, apertura, entradas y salidas, resumen por forma de pago, cierre y conteo por denominación con total y diferencia.
4. Inventario: precios, existencia, stock bajo y movimientos de ejemplo.
5. Pedidos y apartados: estado, anticipo, saldo, fecha límite y acciones según el estado.
6. Devoluciones y cancelaciones: motivo y efecto ilustrado en inventario.
7. Reportes: día, semana y mes, con filtros y vistas previas de CSV y PDF. No se descarga un archivo.
8. Insumos: módulo opcional, apagado al empezar. Solo la vista Superadmin lo enciende.
9. Ajustes y roles: Superadmin, Supervisor y Empleado. El cambio de rol es una vista, no un acceso.
10. Moneda MXN o USD, e indicador de conexión, sincronización y ventas pendientes, sincronizadas o con error.

## Decisiones

- Textos de interfaz en español. Nombres y cifras de ejemplo también.
- Los precios de ejemplo están en centavos de peso. USD solo cambia la vista, con un tipo fijo de demostración: 1 USD = 18.50 MXN. No es un tipo de cambio real.
- El corte de caja usa billetes y monedas de la moneda activa. En pesos incluye, entre otros, el billete de 1000, el de 100 y la moneda de 10. En dólares, el billete de 100 y monedas como la de 0.25.
- El efectivo esperado parte de cifras de ejemplo y suma lo cobrado en esta pestaña. La fórmula queda visible en pesos.
- El rol inicial es Empleado, que es quien cobra. Supervisor y Superadmin muestran más módulos. No hay contraseñas ni permisos reales.
- Insumos empieza apagado para que el interruptor se note. No descuenta consumibles al vender un café.
- El ticket dice que no tiene validez fiscal.
- Iconos en SVG dentro del HTML y del script. Sin CDN.

## Pendiente, a propósito

- No hay backend, Django, base de datos, API, usuarios reales ni persistencia.
- No hay impresora, cajón, lector, terminal bancaria ni timbrado.
- No hay cálculo fiscal ni multi-sucursal.
- Los reportes no cuadran contra un corte contable: mezclan cifras de ejemplo con lo cobrado en la pestaña.
- El tipo de cambio es fijo y la conversión puede diferir en centavos.
- Recargar la página devuelve los datos de ejemplo.

No implementar un punto de venta real a partir de este prototipo sin un alcance nuevo.
