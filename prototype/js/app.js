/* Just2Sale — prototipo visual. El estado vive solo en memoria y se pierde al recargar.
   No usa localStorage, IndexedDB, red, servidor ni persistencia. */
(function () {
  "use strict";

  const RATE_NUM = 1850;
  const LOW_STOCK = 5;
  const ROLES = {
    superadmin: { label: "Superadmin", person: "Mariana Solís" },
    supervisor: { label: "Supervisor", person: "Luis Mendoza" },
    empleado: { label: "Empleado", person: "Ana Ruiz" }
  };
  const ACCESS = {
    superadmin: { returns: true, reports: true, supplies: true, suppliesToggle: true, closeShift: true, inventoryIn: true },
    supervisor: { returns: true, reports: true, supplies: true, suppliesToggle: false, closeShift: true, inventoryIn: true },
    empleado: { returns: false, reports: false, supplies: false, suppliesToggle: false, closeShift: false, inventoryIn: false }
  };
  const ROLE_COPY = {
    empleado: {
      can: ["Cobrar en el punto de venta", "Consultar inventario y pedir reposición", "Registrar entradas y salidas de caja", "Ver pedidos y apartados", "Contar denominaciones"],
      cannot: ["Cerrar el turno", "Registrar devoluciones o cancelaciones", "Ver reportes", "Activar insumos", "Editar la lista de personal"]
    },
    supervisor: {
      can: ["Operar la venta y la caja", "Cerrar el turno", "Ver devoluciones, reportes e inventario", "Usar insumos si el módulo está activo"],
      cannot: ["Activar o apagar módulos", "Editar la lista de personal de ejemplo"]
    },
    superadmin: {
      can: ["Ver todas las pantallas", "Activar o apagar insumos", "Ver la lista de personal de ejemplo"],
      cannot: ["Ninguna pantalla está bloqueada en esta vista. Aun así no hay acceso real."]
    }
  };
  const MODULES = [
    { id: "dashboard", label: "Inicio", icon: "home", desc: "Mapa de módulos de la demostración." },
    { id: "pos", label: "Punto de venta", short: "Venta", icon: "pos", desc: "Buscar, cobrar y ver el ticket." },
    { id: "caja", label: "Caja", icon: "caja", desc: "Turno, efectivo y corte por denominación." },
    { id: "inventario", label: "Inventario", icon: "box", desc: "Precios, existencias y movimientos de ejemplo." },
    { id: "pedidos", label: "Pedidos y apartados", short: "Pedidos", icon: "bag", desc: "Anticipo, saldo, fecha y acciones." },
    { id: "devoluciones", label: "Devoluciones y cancelaciones", short: "Devoluciones", icon: "return", desc: "Motivo y efecto en el inventario.", perm: "returns" },
    { id: "reportes", label: "Reportes", icon: "chart", desc: "Ventas de ejemplo por día, semana y mes.", perm: "reports" },
    { id: "insumos", label: "Insumos", icon: "supplies", desc: "Módulo opcional de consumibles.", perm: "supplies" },
    { id: "ajustes", label: "Ajustes y roles", short: "Ajustes", icon: "settings", desc: "Vistas de Superadmin, Supervisor y Empleado." }
  ];
  const TITLES = {
    dashboard: "Inicio",
    pos: "Punto de venta",
    caja: "Caja",
    inventario: "Inventario",
    pedidos: "Pedidos y apartados",
    devoluciones: "Devoluciones y cancelaciones",
    reportes: "Reportes",
    insumos: "Insumos",
    ajustes: "Ajustes y roles"
  };
  const PROMO_LABEL = {
    none: "Sin promoción",
    percent10: "10% en la venta",
    bogo: "2x1 en cafés",
    fixed20: "Descuento de $20 MXN"
  };
  const STATUS_LABEL = {
    apartado: "Apartado",
    pedido: "Pedido",
    listo: "Listo para entregar",
    entregado: "Entregado",
    vencido: "Vencido",
    cancelado: "Cancelado"
  };
  const STATUS_TONE = {
    apartado: "info",
    pedido: "info",
    listo: "warn",
    entregado: "ok",
    vencido: "bad",
    cancelado: "bad"
  };
  const OFFLINE_LABEL = { pending: "Pendiente", synced: "Sincronizada", error: "Con error" };
  const OFFLINE_TONE = { pending: "warn", synced: "ok", error: "bad" };
  const DENOMS = {
    MXN: [
      { id: "mxn-bill-1000", cents: 100000, group: "Billetes", label: "Billete de 1000" },
      { id: "mxn-bill-500", cents: 50000, group: "Billetes", label: "Billete de 500" },
      { id: "mxn-bill-200", cents: 20000, group: "Billetes", label: "Billete de 200" },
      { id: "mxn-bill-100", cents: 10000, group: "Billetes", label: "Billete de 100" },
      { id: "mxn-bill-50", cents: 5000, group: "Billetes", label: "Billete de 50" },
      { id: "mxn-bill-20", cents: 2000, group: "Billetes", label: "Billete de 20" },
      { id: "mxn-coin-20", cents: 2000, group: "Monedas", label: "Moneda de 20" },
      { id: "mxn-coin-10", cents: 1000, group: "Monedas", label: "Moneda de 10" },
      { id: "mxn-coin-5", cents: 500, group: "Monedas", label: "Moneda de 5" },
      { id: "mxn-coin-2", cents: 200, group: "Monedas", label: "Moneda de 2" },
      { id: "mxn-coin-1", cents: 100, group: "Monedas", label: "Moneda de 1" },
      { id: "mxn-coin-050", cents: 50, group: "Monedas", label: "Moneda de 0.50" }
    ],
    USD: [
      { id: "usd-bill-100", cents: 10000, group: "Billetes", label: "Billete de 100" },
      { id: "usd-bill-50", cents: 5000, group: "Billetes", label: "Billete de 50" },
      { id: "usd-bill-20", cents: 2000, group: "Billetes", label: "Billete de 20" },
      { id: "usd-bill-10", cents: 1000, group: "Billetes", label: "Billete de 10" },
      { id: "usd-bill-5", cents: 500, group: "Billetes", label: "Billete de 5" },
      { id: "usd-bill-1", cents: 100, group: "Billetes", label: "Billete de 1" },
      { id: "usd-coin-50", cents: 50, group: "Monedas", label: "Moneda de 0.50" },
      { id: "usd-coin-25", cents: 25, group: "Monedas", label: "Moneda de 0.25" },
      { id: "usd-coin-10", cents: 10, group: "Monedas", label: "Moneda de 0.10" },
      { id: "usd-coin-5", cents: 5, group: "Monedas", label: "Moneda de 0.05" },
      { id: "usd-coin-1", cents: 1, group: "Monedas", label: "Moneda de 0.01" }
    ]
  };
  const RETURN_REASONS = ["Producto en mal estado", "Equivocación del cliente", "Error de captura", "Otro (demostración)"];
  const VOID_REASONS = ["Error de captura", "Pago no confirmado", "Ticket duplicado", "Otro (demostración)"];
  const CASH_REASONS = ["Fondo adicional", "Pago a proveedor", "Retiro del encargado", "Cambio de denominaciones", "Otro ejemplo"];
  const ICONS = {
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>',
    pos: '<circle cx="8" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/><path d="M3 5h2l2.2 10.5h10.6l1.8-7H7"/>',
    caja: '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M3 12h18M10 12v3h4v-3"/>',
    box: '<path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>',
    bag: '<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
    return: '<path d="M4 12h12a4 4 0 0 1 0 8H9"/><path d="M7 9 4 12l3 3"/>',
    chart: '<path d="M4 19h16"/><path d="M7 16v-4M12 16V7M17 16v-6"/>',
    supplies: '<path d="M12 3 4 7l8 4 8-4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/>',
    settings: '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="2" fill="#F5F1EA"/><circle cx="15" cy="12" r="2" fill="#F5F1EA"/><circle cx="10" cy="17" r="2" fill="#F5F1EA"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
    scan: '<path d="M4 8V5h3M16 5h3v3M20 16v3h-3M8 19H5v-3"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    alert: '<path d="M12 4 3 19h18L12 4z"/><path d="M12 10v4M12 16h.01"/>',
    more: '<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>'
  };

  let state;
  let toastTimer = 0;
  let bound = false;

  function emptyCounts() {
    const counts = { MXN: {}, USD: {} };
    Object.keys(DENOMS).forEach((currency) => {
      DENOMS[currency].forEach((denom) => {
        counts[currency][denom.id] = 0;
      });
    });
    return counts;
  }

  function buildState() {
    return {
      screen: "dashboard",
      role: "empleado",
      currency: "MXN",
      suppliesEnabled: false,
      nextFolio: 2100,
      ticketFooter: "Gracias por su visita. Este papel es una demostración.",
      products: POS_DATA.products.map((item) => ({ ...item, priceCents: Math.round(item.price * 100) })),
      movements: POS_DATA.movements.map((item) => ({ ...item })),
      orders: POS_DATA.orders.map((item) => ({
        ...item,
        totalCents: Math.round(item.total * 100),
        depositCents: Math.round(item.deposit * 100)
      })),
      examples: POS_DATA.examples.map((item) => ({
        ...item,
        items: item.items.map((line) => ({ ...line })),
        applied: false,
        result: ""
      })),
      supplies: POS_DATA.supplies.map((item) => ({ ...item })),
      supplyLog: [],
      restockRequests: [],
      sessionSales: [],
      lastClose: null,
      offline: {
        connection: "online",
        sales: POS_DATA.offlineSales.map((item) => ({ ...item, totalCents: Math.round(item.total * 100) }))
      },
      shift: freshShift(150000, true),
      cart: emptyCart(),
      ui: {
        search: "",
        invSearch: "",
        invFilter: "all",
        orderFilter: "todos",
        reportRange: "dia",
        reportPeriod: "hoy",
        returnReason: RETURN_REASONS[0],
        voidReason: VOID_REASONS[0],
        cashReason: CASH_REASONS[0],
        cashRaw: "",
        cashNote: "",
        openingRaw: "",
        depositRaw: {},
        offlineOpen: false,
        cartOpen: false,
        moreOpen: false,
        scannerOpen: false,
        scanRaw: "750100000001",
        ticket: null,
        exportView: null,
        toast: "",
        focusSearch: false,
        scrollTop: false
      }
    };
  }

  function freshShift(openingCents, seeded) {
    return {
      open: true,
      openedAt: seeded ? "10 nov 2026, 08:00 · ejemplo" : nowLabel(),
      openingCents: openingCents,
      cashIn: seeded ? [{ cents: 20000, reason: "Fondo adicional de demostración", time: "08:02", note: "" }] : [],
      cashOut: seeded ? [{ cents: 15000, reason: "Pago a proveedor (ejemplo)", time: "09:30", note: "" }] : [],
      byMethod: seeded
        ? { efectivo: 86000, tarjeta: 124000, transferencia: 30000 }
        : { efectivo: 0, tarjeta: 0, transferencia: 0 },
      counts: emptyCounts()
    };
  }

  function emptyCart() {
    return {
      lines: [],
      promo: "none",
      payMode: "efectivo",
      tenderRaw: "",
      mixRaw: { efectivo: "", tarjeta: "", transferencia: "" }
    };
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
  }

  function chip(text, tone) {
    return `<span class="chip" data-tone="${tone || "info"}">${esc(text)}</span>`;
  }

  function product(id) {
    return state.products.find((item) => item.id === id);
  }

  function parseMoneyInput(raw) {
    if (raw == null) return 0;
    let text = String(raw).trim().replace(/\s/g, "").replace(/[$]/g, "");
    text = text.replace(/MXN|USD|mxn|usd/g, "");
    if (!text) return 0;
    if (text.includes(",") && text.includes(".")) {
      if (text.lastIndexOf(",") > text.lastIndexOf(".")) text = text.replace(/\./g, "").replace(",", ".");
      else text = text.replace(/,/g, "");
    } else if (text.includes(",")) {
      text = text.replace(",", ".");
    }
    const number = Number(text);
    return Number.isFinite(number) ? number : 0;
  }

  function activeInputToMxnCents(raw) {
    const activeCents = Math.round(parseMoneyInput(raw) * 100);
    if (state.currency === "MXN") return activeCents;
    return Math.round(activeCents * RATE_NUM / 100);
  }

  function mxnToActiveCents(mxnCents) {
    if (state.currency === "MXN") return mxnCents;
    return Math.round(mxnCents * 100 / RATE_NUM);
  }

  function formatCents(cents, currency) {
    const formatted = new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cents / 100);
    return formatted + " " + currency;
  }

  function money(mxnCents) {
    return formatCents(mxnToActiveCents(mxnCents), state.currency);
  }

  function moneyActive(cents) {
    return formatCents(cents, state.currency);
  }

  function formatMxn(cents) {
    return formatCents(cents, "MXN");
  }

  function shortNumber(mxnCents) {
    const amount = state.currency === "MXN" ? mxnCents / 100 : Math.round(mxnCents * 100 / RATE_NUM) / 100;
    return new Intl.NumberFormat(state.currency === "USD" ? "en-US" : "es-MX", { maximumFractionDigits: 0 }).format(amount);
  }

  function nowLabel(date) {
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date || new Date());
  }

  function timeShort(date) {
    return new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(date || new Date());
  }

  function formatDate(iso) {
    const parts = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function addDays(iso, days) {
    const parts = iso.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    date.setDate(date.getDate() + days);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function setToast(message) {
    state.ui.toast = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      state.ui.toast = "";
      render();
    }, 4600);
  }

  function can(flag) {
    return !!ACCESS[state.role][flag];
  }

  function canOpen(screen) {
    if (screen === "devoluciones") return can("returns");
    if (screen === "reportes") return can("reports");
    if (screen === "insumos") return can("suppliesToggle") || (can("supplies") && state.suppliesEnabled);
    return true;
  }

  function cartQty(id) {
    const line = state.cart.lines.find((item) => item.productId === id);
    return line ? line.qty : 0;
  }

  function cartSubtotal() {
    return state.cart.lines.reduce((sum, line) => sum + product(line.productId).priceCents * line.qty, 0);
  }

  function cartDiscount(subtotal) {
    if (state.cart.promo === "percent10") return Math.round(subtotal * 0.1);
    if (state.cart.promo === "fixed20") return Math.min(2000, subtotal);
    if (state.cart.promo === "bogo") {
      const units = [];
      state.cart.lines.forEach((line) => {
        const item = product(line.productId);
        if (item.kind !== "cafe") return;
        for (let index = 0; index < line.qty; index += 1) units.push(item.priceCents);
      });
      units.sort((a, b) => a - b);
      const free = Math.floor(units.length / 2);
      let discount = 0;
      for (let index = 0; index < free; index += 1) discount += units[index];
      return discount;
    }
    return 0;
  }

  function totalMxnCents() {
    const subtotal = cartSubtotal();
    return subtotal - cartDiscount(subtotal);
  }

  function settlement() {
    const total = totalMxnCents();
    const hasLines = state.cart.lines.length > 0;
    const mode = state.cart.payMode;
    let received = 0;
    let card = 0;
    let transfer = 0;
    let error = "";
    if (mode === "efectivo") received = activeInputToMxnCents(state.cart.tenderRaw);
    if (mode === "tarjeta") card = total;
    if (mode === "transferencia") transfer = total;
    if (mode === "mixto") {
      received = activeInputToMxnCents(state.cart.mixRaw.efectivo);
      card = activeInputToMxnCents(state.cart.mixRaw.tarjeta);
      transfer = activeInputToMxnCents(state.cart.mixRaw.transferencia);
    }
    const electronic = card + transfer;
    if (mode === "mixto" && electronic > total) error = "Tarjeta y transferencia superan el total.";
    const due = Math.max(0, total - electronic);
    const cashApplied = mode === "tarjeta" || mode === "transferencia" ? 0 : Math.min(Math.max(received, 0), due);
    const change = mode === "efectivo" || mode === "mixto" ? Math.max(0, received - cashApplied) : 0;
    const falta = error ? 0 : Math.max(0, due - Math.max(received, 0));
    const covered = hasLines && !error && falta === 0 && received >= 0 && card >= 0 && transfer >= 0;
    let message = "Agrega productos para armar la venta.";
    if (hasLines && error) message = error;
    else if (hasLines && falta > 0) message = "Falta " + money(falta);
    else if (hasLines && change > 0) message = "Cambio " + money(change);
    else if (hasLines) message = "Cambio " + money(0) + " · pago exacto";
    return {
      total: total,
      subtotal: cartSubtotal(),
      discount: cartDiscount(cartSubtotal()),
      received: received,
      change: change,
      falta: falta,
      covered: covered,
      error: error,
      message: message,
      parts: {
        efectivo: mode === "efectivo" ? total : cashApplied,
        tarjeta: card,
        transferencia: transfer
      },
      tendered: mode === "efectivo" || mode === "mixto" ? received : 0
    };
  }

  function canCharge() {
    const pay = settlement();
    return state.shift.open && pay.covered && !pay.error;
  }

  function sumCash(list) {
    return list.reduce((sum, row) => sum + row.cents, 0);
  }

  function expectedMxnCents() {
    return state.shift.openingCents + sumCash(state.shift.cashIn) - sumCash(state.shift.cashOut) + state.shift.byMethod.efectivo;
  }

  function countedActiveCents() {
    return DENOMS[state.currency].reduce((sum, denom) => sum + denom.cents * (state.shift.counts[state.currency][denom.id] || 0), 0);
  }

  function offlineCounts() {
    const sales = state.offline.sales;
    return {
      pending: sales.filter((sale) => sale.status === "pending").length,
      synced: sales.filter((sale) => sale.status === "synced").length,
      error: sales.filter((sale) => sale.status === "error").length
    };
  }

  function connectionLabel() {
    return state.offline.connection === "online" ? "En línea" : "Sin conexión";
  }

  function syncLabel() {
    const counts = offlineCounts();
    if (state.offline.connection === "offline") return "Sin sincronizar";
    if (counts.pending > 0) return "Pendiente de sincronizar";
    if (counts.error > 0) return "Con errores";
    return "Sincronizado";
  }

  function lowProducts() {
    return state.products.filter((item) => item.stock <= LOW_STOCK);
  }

  function convertRaw(raw, from, to) {
    if (!String(raw || "").trim()) return raw || "";
    const cents = Math.round(parseMoneyInput(raw) * 100);
    const mxn = from === "MXN" ? cents : Math.round(cents * RATE_NUM / 100);
    const active = to === "MXN" ? mxn / 100 : Math.round(mxn * 100 / RATE_NUM) / 100;
    return active.toFixed(2);
  }

  function go(screen) {
    if (!canOpen(screen)) {
      setToast("La vista " + ROLES[state.role].label + " no abre este módulo. Cambiar de rol es solo una demostración.");
      state.ui.moreOpen = false;
      return;
    }
    state.screen = screen;
    state.ui.moreOpen = false;
    state.ui.cartOpen = false;
    state.ui.offlineOpen = false;
    state.ui.focusSearch = screen === "pos";
    state.ui.scrollTop = true;
  }

  function addProduct(id) {
    const item = product(id);
    if (!item) {
      setToast("Código de demostración no encontrado.");
      return;
    }
    const line = state.cart.lines.find((entry) => entry.productId === id);
    const qty = line ? line.qty : 0;
    if (item.stock - qty < 1) {
      setToast("Demostración: no hay más existencia de " + item.name + ".");
      return;
    }
    if (line) line.qty += 1;
    else state.cart.lines.push({ productId: id, qty: 1 });
  }

  function buildTicket(folio, pay, preview) {
    return {
      folio: folio,
      when: nowLabel(),
      preview: !!preview,
      lines: state.cart.lines.map((line) => {
        const item = product(line.productId);
        return { name: item.name, qty: line.qty, unit: item.priceCents, total: item.priceCents * line.qty };
      }),
      promo: PROMO_LABEL[state.cart.promo],
      subtotal: pay.subtotal,
      discount: pay.discount,
      total: pay.total,
      payments: paymentLines(pay),
      change: pay.change,
      message: pay.message,
      footer: state.ticketFooter
    };
  }

  function paymentLines(pay) {
    const rows = [];
    if (state.cart.payMode === "efectivo") rows.push({ method: "Efectivo recibido", amount: pay.tendered });
    if (state.cart.payMode === "tarjeta") rows.push({ method: "Tarjeta", amount: pay.total });
    if (state.cart.payMode === "transferencia") rows.push({ method: "Transferencia", amount: pay.total });
    if (state.cart.payMode === "mixto") {
      const card = activeInputToMxnCents(state.cart.mixRaw.tarjeta);
      const transfer = activeInputToMxnCents(state.cart.mixRaw.transferencia);
      if (pay.tendered > 0) rows.push({ method: "Efectivo recibido", amount: pay.tendered });
      if (card > 0) rows.push({ method: "Tarjeta", amount: card });
      if (transfer > 0) rows.push({ method: "Transferencia", amount: transfer });
    }
    return rows;
  }

  function charge() {
    const pay = settlement();
    if (!state.shift.open) {
      setToast("El turno está cerrado. Ábrelo en Caja. Sigue siendo una demostración.");
      return;
    }
    if (!state.cart.lines.length) {
      setToast("Agrega productos antes de cobrar.");
      return;
    }
    if (!pay.covered || pay.error) {
      setToast(pay.error || pay.message);
      return;
    }
    for (let index = 0; index < state.cart.lines.length; index += 1) {
      const line = state.cart.lines[index];
      if (product(line.productId).stock < line.qty) {
        setToast("Sin existencia suficiente de " + product(line.productId).name + ".");
        return;
      }
    }
    const folio = "T-" + state.nextFolio;
    state.nextFolio += 1;
    const ticket = buildTicket(folio, pay, false);
    state.cart.lines.forEach((line) => {
      const item = product(line.productId);
      item.stock -= line.qty;
      state.movements.unshift({
        time: timeShort(),
        product: item.name,
        type: "Venta",
        qty: -line.qty,
        note: "Ticket " + folio + " · demostración"
      });
    });
    state.movements = state.movements.slice(0, 30);
    state.shift.byMethod.efectivo += pay.parts.efectivo;
    state.shift.byMethod.tarjeta += pay.parts.tarjeta;
    state.shift.byMethod.transferencia += pay.parts.transferencia;
    const offlineStatus = state.offline.connection === "online" ? "synced" : "pending";
    state.offline.sales.unshift({
      id: folio,
      label: "Venta de esta sesión",
      totalCents: pay.total,
      status: offlineStatus,
      time: timeShort(),
      note: offlineStatus === "synced" ? "Marcada como sincronizada en la pantalla" : "Pendiente porque la conexión simulada está apagada"
    });
    const method = state.cart.payMode === "mixto" ? "Mixto" : state.cart.payMode[0].toUpperCase() + state.cart.payMode.slice(1);
    state.sessionSales.unshift({
      folio: folio,
      time: timeShort(),
      method: method,
      totalCents: pay.total,
      status: OFFLINE_LABEL[offlineStatus],
      session: true
    });
    state.cart = emptyCart();
    state.ui.ticket = ticket;
    state.ui.cartOpen = false;
    setToast(offlineStatus === "synced"
      ? "Demostración: venta marcada como sincronizada. No se envió a ningún servidor."
      : "Demostración: sin conexión simulada. La venta quedó pendiente en esta pantalla.");
  }

  function exampleEffect(example, reason, projected) {
    const pieces = example.items.map((line) => {
      const item = product(line.productId);
      const next = projected ? item.stock + line.qty : item.stock;
      const verb = projected ? "quedaría" : "quedó";
      return item.name + " +" + line.qty + " (" + verb + " en " + next + ")";
    });
    const moneyNote = example.kind === "cancelacion"
      ? " El pago en " + example.method.toLowerCase() + " se etiqueta como reversado solo en este texto."
      : " No sale dinero de una caja real.";
    return "Motivo: " + reason + ". Efecto ilustrado en inventario: " + pieces.join("; ") + "." + moneyNote + " El turno abierto no cambia, porque el ticket es un ejemplo anterior.";
  }

  function applyExample(kind) {
    const example = state.examples.find((item) => item.kind === kind);
    if (!example || example.applied) return;
    const reason = kind === "devolucion" ? state.ui.returnReason : state.ui.voidReason;
    example.items.forEach((line) => {
      const item = product(line.productId);
      item.stock += line.qty;
      state.movements.unshift({
        time: timeShort(),
        product: item.name,
        type: kind === "devolucion" ? "Devolución" : "Cancelación",
        qty: line.qty,
        note: example.id + " · " + reason + " · demostración"
      });
    });
    example.applied = true;
    example.result = exampleEffect(example, reason, false);
    setToast(kind === "devolucion"
      ? "Demostración: devolución aplicada solo en esta pantalla."
      : "Demostración: cancelación aplicada solo en esta pantalla.");
  }

  function currentReport() {
    const range = state.ui.reportRange;
    const period = POS_DATA.reports[range][state.ui.reportPeriod] ? state.ui.reportPeriod : Object.keys(POS_DATA.reports[range])[0];
    state.ui.reportPeriod = period;
    const sample = POS_DATA.reports[range][period];
    const series = sample.series.map((entry) => ({ label: entry[0], cents: entry[1] * 100 }));
    const rows = sample.rows.map((row) => ({
      folio: row.folio,
      time: row.time,
      method: row.method,
      totalCents: row.total * 100,
      status: row.status,
      session: false
    }));
    if (range === "dia" && period === "hoy") {
      const sessionTotal = state.sessionSales.reduce((sum, row) => sum + row.totalCents, 0);
      if (sessionTotal > 0) series.push({ label: "Demo", cents: sessionTotal });
      return { title: sample.label, series: series, rows: state.sessionSales.concat(rows) };
    }
    return { title: sample.label, series: series, rows: rows };
  }

  function quickAmounts() {
    return state.currency === "USD" ? [5, 10, 20, 50] : [50, 100, 200, 500];
  }

  function runAction(el) {
    const action = el.dataset.action;
    if (action === "go") go(el.dataset.screen);
    else if (action === "toggle-offline") state.ui.offlineOpen = !state.ui.offlineOpen;
    else if (action === "connection") {
      state.offline.connection = state.offline.connection === "online" ? "offline" : "online";
      setToast(state.offline.connection === "offline"
        ? "Conexión simulada apagada. No hay una red real que cortar."
        : "Conexión simulada encendida. Sigue sin haber un servidor.");
    } else if (action === "sync") {
      if (state.offline.connection === "offline") {
        setToast("Sin conexión simulada. Las ventas pendientes siguen en esta pantalla.");
      } else {
        let count = 0;
        state.offline.sales.forEach((sale) => {
          if (sale.status === "pending") {
            sale.status = "synced";
            sale.note = "Sincronización simulada";
            count += 1;
          }
        });
        setToast(count === 0
          ? "No hay ventas pendientes en la demostración."
          : count === 1
            ? "Demostración: 1 venta pasó a sincronizada. No salió de esta pantalla."
            : "Demostración: " + count + " ventas pasaron a sincronizadas. No salieron de esta pantalla.");
      }
    } else if (action === "fail-sync") {
      const pending = state.offline.sales.find((sale) => sale.status === "pending");
      if (!pending) setToast("No hay una venta pendiente para marcar con error.");
      else {
        pending.status = "error";
        pending.note = "Fallo de red simulado";
        setToast("Demostración: una venta pendiente quedó con error. No es una falla real.");
      }
    } else if (action === "retry") {
      const sale = state.offline.sales.find((item) => item.id === el.dataset.id);
      if (!sale) return;
      if (state.offline.connection === "offline") setToast("Sin conexión simulada. El reintento se queda en esta pantalla.");
      else {
        sale.status = "synced";
        sale.note = "Reintento simulado";
        setToast("Demostración: el reintento marcó la venta como sincronizada.");
      }
    } else if (action === "currency") setCurrency(el.dataset.currency);
    else if (action === "role") setRole(el.dataset.role);
    else if (action === "toggle-cart") state.ui.cartOpen = !state.ui.cartOpen;
    else if (action === "toggle-more") state.ui.moreOpen = !state.ui.moreOpen;
    else if (action === "close-more") state.ui.moreOpen = false;
    else if (action === "add-product") addProduct(el.dataset.id);
    else if (action === "qty") changeQty(el.dataset.id, Number(el.dataset.delta));
    else if (action === "remove-line") state.cart.lines = state.cart.lines.filter((line) => line.productId !== el.dataset.id);
    else if (action === "clear-cart") state.cart.lines = [];
    else if (action === "pay-mode") state.cart.payMode = el.dataset.mode;
    else if (action === "quick-cash") applyQuickCash(el.dataset.amount);
    else if (action === "fill-mix") fillMixCash();
    else if (action === "charge") charge();
    else if (action === "preview") openPreview();
    else if (action === "close-ticket") state.ui.ticket = null;
    else if (action === "open-scanner") state.ui.scannerOpen = true;
    else if (action === "close-scanner") state.ui.scannerOpen = false;
    else if (action === "read-scanner") readCode(el.dataset.code || state.ui.scanRaw);
    else if (action === "shift-open") openShift();
    else if (action === "shift-close") closeShift();
    else if (action === "use-zero") state.ui.openingRaw = "0.00";
    else if (action === "cash-in") cashMove("in");
    else if (action === "cash-out") cashMove("out");
    else if (action === "denom-step") stepDenom(el.dataset.id, Number(el.dataset.delta));
    else if (action === "suggest-count") suggestCount();
    else if (action === "clear-counts") {
      DENOMS[state.currency].forEach((denom) => { state.shift.counts[state.currency][denom.id] = 0; });
    } else if (action === "order-status") orderStatus(el.dataset.id, el.dataset.status);
    else if (action === "order-deposit") deposit(el.dataset.id);
    else if (action === "apply-return") applyExample("devolucion");
    else if (action === "apply-void") applyExample("cancelacion");
    else if (action === "report-range") {
      state.ui.reportRange = el.dataset.range;
      state.ui.reportPeriod = Object.keys(POS_DATA.reports[el.dataset.range])[0];
    } else if (action === "export") state.ui.exportView = el.dataset.kind;
    else if (action === "close-export") state.ui.exportView = null;
    else if (action === "inv-filter") state.ui.invFilter = el.dataset.filter;
    else if (action === "order-filter") state.ui.orderFilter = el.dataset.filter;
    else if (action === "inventory-in") inventoryIn(el.dataset.id);
    else if (action === "restock") {
      const item = product(el.dataset.id);
      state.restockRequests.unshift({ product: item.name, time: timeShort(), by: ROLES[state.role].person });
      setToast("Demostración: la petición quedó en esta pantalla. No se envió a nadie.");
    } else if (action === "supply-use") useSupply(el.dataset.id);
    else if (action === "dismiss-toast") state.ui.toast = "";
  }

  function setCurrency(currency) {
    if (currency !== "MXN" && currency !== "USD") return;
    if (currency === state.currency) return;
    const previous = state.currency;
    state.cart.tenderRaw = convertRaw(state.cart.tenderRaw, previous, currency);
    state.cart.mixRaw.efectivo = convertRaw(state.cart.mixRaw.efectivo, previous, currency);
    state.cart.mixRaw.tarjeta = convertRaw(state.cart.mixRaw.tarjeta, previous, currency);
    state.cart.mixRaw.transferencia = convertRaw(state.cart.mixRaw.transferencia, previous, currency);
    state.ui.cashRaw = convertRaw(state.ui.cashRaw, previous, currency);
    state.ui.openingRaw = convertRaw(state.ui.openingRaw, previous, currency);
    Object.keys(state.ui.depositRaw).forEach((id) => {
      state.ui.depositRaw[id] = convertRaw(state.ui.depositRaw[id], previous, currency);
    });
    state.currency = currency;
    setToast(currency === "USD"
      ? "Vista en dólares. Tipo de cambio de demostración: 1 USD = 18.50 MXN."
      : "Vista en pesos mexicanos.");
  }

  function setRole(role) {
    if (!ROLES[role]) return;
    state.role = role;
    if (!canOpen(state.screen)) state.screen = "dashboard";
    setToast("Vista de " + ROLES[role].label + ": " + ROLES[role].person + ". No es un inicio de sesión.");
  }

  function changeQty(id, delta) {
    const line = state.cart.lines.find((entry) => entry.productId === id);
    if (!line) return;
    const next = line.qty + delta;
    if (next <= 0) state.cart.lines = state.cart.lines.filter((entry) => entry.productId !== id);
    else if (next > product(id).stock) setToast("No hay más existencia de ejemplo.");
    else line.qty = next;
  }

  function applyQuickCash(amount) {
    if (amount === "exact") {
      const active = state.currency === "MXN" ? totalMxnCents() / 100 : mxnToActiveCents(totalMxnCents()) / 100;
      state.cart.tenderRaw = active.toFixed(2);
      return;
    }
    state.cart.tenderRaw = Number(amount).toFixed(2);
  }

  function fillMixCash() {
    const card = activeInputToMxnCents(state.cart.mixRaw.tarjeta);
    const transfer = activeInputToMxnCents(state.cart.mixRaw.transferencia);
    const due = Math.max(0, totalMxnCents() - card - transfer);
    const active = state.currency === "MXN" ? due / 100 : mxnToActiveCents(due) / 100;
    state.cart.mixRaw.efectivo = active.toFixed(2);
  }

  function openPreview() {
    if (!state.cart.lines.length) {
      setToast("Agrega productos para ver el ticket.");
      return;
    }
    state.ui.ticket = buildTicket("VISTA PREVIA", settlement(), true);
  }

  function readCode(code) {
    const clean = String(code || "").trim();
    const item = state.products.find((productItem) => productItem.sku === clean);
    state.ui.scannerOpen = false;
    if (!item) {
      setToast("Escáner simulado: el código no está en los productos de ejemplo.");
      return;
    }
    addProduct(item.id);
    setToast("Escáner simulado: se agregó " + item.name + ". No hay lector ni cámara.");
  }

  function openShift() {
    if (String(state.ui.openingRaw).trim() === "") {
      setToast("Escribe el efectivo inicial. Puede ser 0.");
      return;
    }
    const cents = activeInputToMxnCents(state.ui.openingRaw);
    if (cents < 0) {
      setToast("El efectivo inicial no puede ser negativo.");
      return;
    }
    state.shift = freshShift(cents, false);
    state.ui.openingRaw = "";
    setToast("Demostración: turno abierto solo en esta pantalla. Los totales de caja empiezan de nuevo. El inventario no se reinicia.");
  }

  function closeShift() {
    if (!can("closeShift")) {
      setToast("La vista Empleado no cierra el turno. Es una demostración de roles, no seguridad.");
      return;
    }
    const expected = expectedMxnCents();
    const counted = countedActiveCents();
    const expectedActive = mxnToActiveCents(expected);
    state.lastClose = {
      at: nowLabel(),
      expectedCents: expected,
      countedCents: counted,
      currency: state.currency,
      diffCents: counted - expectedActive,
      byMethod: { ...state.shift.byMethod }
    };
    state.shift.open = false;
    setToast("Demostración: turno cerrado en esta pantalla. No se generó un corte real.");
  }

  function cashMove(direction) {
    if (!state.shift.open) return;
    const cents = activeInputToMxnCents(state.ui.cashRaw);
    if (cents <= 0) {
      setToast("Escribe un monto mayor a cero.");
      return;
    }
    if (direction === "out" && cents > expectedMxnCents()) {
      setToast("La salida supera el efectivo esperado de la demostración.");
      return;
    }
    const row = { cents: cents, reason: state.ui.cashReason, time: timeShort(), note: state.ui.cashNote };
    if (direction === "in") state.shift.cashIn.unshift(row);
    else state.shift.cashOut.unshift(row);
    state.ui.cashRaw = "";
    state.ui.cashNote = "";
    setToast(direction === "in"
      ? "Demostración: entrada de efectivo registrada en pantalla."
      : "Demostración: salida de efectivo registrada en pantalla.");
  }

  function stepDenom(id, delta) {
    const next = (state.shift.counts[state.currency][id] || 0) + delta;
    state.shift.counts[state.currency][id] = Math.max(0, Math.min(999, next));
  }

  function suggestCount() {
    let left = mxnToActiveCents(expectedMxnCents());
    DENOMS[state.currency].forEach((denom) => {
      const count = Math.floor(left / denom.cents);
      state.shift.counts[state.currency][denom.id] = Math.min(999, count);
      left -= state.shift.counts[state.currency][denom.id] * denom.cents;
    });
    setToast("Demostración: se sugirió un conteo. Puedes corregir cada denominación.");
  }

  function orderStatus(id, status) {
    const order = state.orders.find((item) => item.id === id);
    if (!order) return;
    if (status === "extender") {
      order.due = addDays(order.due, 7);
      order.status = "apartado";
      setToast("Demostración: la fecha se extendió 7 días en esta pantalla.");
      return;
    }
    if (status === "entregado") order.depositCents = order.totalCents;
    order.status = status;
    setToast("Demostración: el estado pasó a " + STATUS_LABEL[status] + ". No se notificó a nadie.");
  }

  function deposit(id) {
    const order = state.orders.find((item) => item.id === id);
    const cents = activeInputToMxnCents(state.ui.depositRaw[id] || "");
    const balance = order.totalCents - order.depositCents;
    if (cents <= 0) {
      setToast("Escribe un abono mayor a cero.");
      return;
    }
    if (cents > balance) {
      setToast("El abono supera el saldo de este apartado de ejemplo.");
      return;
    }
    order.depositCents += cents;
    state.ui.depositRaw[id] = "";
    setToast("Demostración: abono registrado solo en esta pantalla.");
  }

  function inventoryIn(id) {
    if (!can("inventoryIn")) {
      setToast("La vista Empleado solo consulta el inventario.");
      return;
    }
    const item = product(id);
    item.stock += 10;
    state.movements.unshift({ time: timeShort(), product: item.name, type: "Entrada", qty: 10, note: "Entrada de demostración" });
    setToast("Demostración: entrada de 10 piezas registrada en pantalla.");
  }

  function useSupply(id) {
    const item = state.supplies.find((supply) => supply.id === id);
    if (item.stock < item.use) {
      setToast("No hay suficiente existencia de ejemplo.");
      return;
    }
    item.stock -= item.use;
    state.supplyLog.unshift({ name: item.name, qty: item.use, unit: item.unit, time: timeShort() });
    setToast("Demostración: se descontaron " + item.use + " " + item.unit + " de " + item.name + ".");
  }

  function applyInput(el) {
    const key = el.dataset.input;
    if (key === "search") state.ui.search = el.value;
    else if (key === "tender") state.cart.tenderRaw = el.value;
    else if (key === "mix-efectivo") state.cart.mixRaw.efectivo = el.value;
    else if (key === "mix-tarjeta") state.cart.mixRaw.tarjeta = el.value;
    else if (key === "mix-transferencia") state.cart.mixRaw.transferencia = el.value;
    else if (key === "opening") state.ui.openingRaw = el.value;
    else if (key === "cash-amount") state.ui.cashRaw = el.value;
    else if (key === "cash-note") state.ui.cashNote = el.value;
    else if (key === "scan") state.ui.scanRaw = el.value;
    else if (key === "inv-search") state.ui.invSearch = el.value;
    else if (key === "ticket-footer") {
      if (state.role === "empleado") return;
      state.ticketFooter = el.value;
    } else if (key === "deposit") state.ui.depositRaw[el.dataset.id] = el.value;
    else if (key === "denom") {
      const count = Math.max(0, Math.min(999, parseInt(el.value, 10) || 0));
      state.shift.counts[state.currency][el.dataset.id] = count;
    }
  }

  function applyChange(el) {
    const key = el.dataset.change;
    if (key === "promo") state.cart.promo = el.value;
    else if (key === "report-period") state.ui.reportPeriod = el.value;
    else if (key === "return-reason") state.ui.returnReason = el.value;
    else if (key === "void-reason") state.ui.voidReason = el.value;
    else if (key === "cash-reason") state.ui.cashReason = el.value;
    else if (key === "supplies-toggle") {
      if (!can("suppliesToggle")) {
        setToast("Solo la vista Superadmin enciende o apaga insumos. No es un permiso real.");
        return;
      }
      state.suppliesEnabled = el.checked;
      setToast(state.suppliesEnabled
        ? "Demostración: el módulo de insumos quedó visible."
        : "Demostración: el módulo de insumos quedó oculto para las otras vistas.");
    }
  }

  function renderRoleSwitch(withIds) {
    return `<div class="seg" role="group" aria-label="Rol de demostración">${["superadmin", "supervisor", "empleado"].map((role) => {
      const id = withIds ? ` id="role-${role}"` : "";
      return `<button type="button"${id} class="${state.role === role ? "active" : ""}" data-action="role" data-role="${role}" aria-pressed="${state.role === role}">${ROLES[role].label}</button>`;
    }).join("")}</div>`;
  }

  function renderCurrencySwitch(withIds) {
    return `<div class="seg" role="group" aria-label="Moneda de la vista">${["MXN", "USD"].map((currency) => {
      const id = withIds ? ` id="currency-${currency.toLowerCase()}"` : "";
      return `<button type="button"${id} class="${state.currency === currency ? "active" : ""}" data-action="currency" data-currency="${currency}" aria-pressed="${state.currency === currency}">${currency}</button>`;
    }).join("")}</div>`;
  }

  function renderChrome() {
    const counts = offlineCounts();
    const online = state.offline.connection === "online";
    const role = ROLES[state.role];
    return `
      <button type="button" class="brand" data-action="go" data-screen="dashboard">
        <span class="brand-mark" aria-hidden="true">J2</span>
        <span class="brand-text"><strong>Just2Sale</strong><small>Prototipo</small></span>
      </button>
      <span class="demo-chip">Demostración · no se guarda</span>
      <div class="offline-wrap">
        <button type="button" id="offline-indicator" class="offline-pill" data-action="toggle-offline" aria-expanded="${state.ui.offlineOpen}">
          <span class="offline-dot ${online ? "" : "off"}" aria-hidden="true"></span>
          <span>
            <strong>${connectionLabel()}</strong>
            <small>${esc(syncLabel())}</small>
            <small>Pendientes ${counts.pending} · Sincronizadas ${counts.synced} · Con error ${counts.error}</small>
          </span>
        </button>
      </div>
      <div class="currency-switch">
        ${renderCurrencySwitch(true)}
        <div class="fx-caption" id="currency-caption">${state.currency === "MXN" ? "Pesos mexicanos" : "1 USD = 18.50 MXN · solo vista"}</div>
      </div>
      <div class="role-switch">${renderRoleSwitch(true)}</div>
      <div class="person"><strong>${esc(role.person)}</strong><small>${esc(role.label)}</small></div>`;
  }

  function renderOfflineDialog() {
    if (!state.ui.offlineOpen) return "";
    const sales = state.offline.sales.slice().sort((a, b) => {
      const order = { error: 0, pending: 1, synced: 2 };
      return order[a.status] - order[b.status];
    });
    return `
      <div class="backdrop" data-action="toggle-offline">
        <div class="modal" id="offline-popover" data-action="noop" role="dialog" aria-modal="true" aria-labelledby="offline-title">
          <div class="toolbar">
            <h2 id="offline-title">Operación sin conexión</h2>
            <button type="button" class="btn small ghost" data-action="toggle-offline">Cerrar</button>
          </div>
          <p class="micro">La conexión, la sincronización y estos folios son de demostración. Nada sale de esta pantalla.</p>
          <div class="row-actions">
            <button type="button" id="btn-connection" class="btn small ghost" data-action="connection">${state.offline.connection === "online" ? "Simular sin conexión" : "Simular conexión"}</button>
            <button type="button" id="btn-sync" class="btn small primary" data-action="sync">Simular sincronización</button>
            <button type="button" id="btn-fail" class="btn small ghost" data-action="fail-sync">Simular fallo</button>
          </div>
          <div class="sale-list">
            ${sales.map((sale) => `
              <article class="sale-row">
                <div><strong>${esc(sale.id)}</strong> · ${esc(sale.time)}<div class="micro">${esc(sale.label)}. ${esc(sale.note || "")}</div></div>
                <div>${chip(OFFLINE_LABEL[sale.status], OFFLINE_TONE[sale.status])}<div class="num">${money(sale.totalCents)}</div>
                  ${sale.status === "error" ? `<button type="button" class="btn small ghost" data-action="retry" data-id="${esc(sale.id)}">Reintentar (demo)</button>` : ""}
                </div>
              </article>`).join("")}
          </div>
        </div>
      </div>`;
  }

  function renderNav() {
    const count = state.cart.lines.reduce((sum, line) => sum + line.qty, 0);
    const items = MODULES.filter((item) => canOpen(item.id) && (item.id !== "insumos" || state.suppliesEnabled || can("suppliesToggle")));
    return items.map((item) => `
      <button type="button" id="nav-${item.id}" class="nav-btn ${state.screen === item.id ? "active" : ""}" data-action="go" data-screen="${item.id}" ${state.screen === item.id ? 'aria-current="page"' : ""}>
        ${icon(item.icon)}
        <span>${esc(item.short || item.label)}</span>
        ${item.id === "pos" && count ? `<span class="nav-badge">${count}</span>` : ""}
      </button>`).join("") + `<p class="side-note">Sin servidor. Al recargar vuelven los datos de ejemplo.</p>`;
  }

  function renderBottom() {
    const count = state.cart.lines.reduce((sum, line) => sum + line.qty, 0);
    const primary = [
      { id: "dashboard", label: "Inicio", icon: "home" },
      { id: "pos", label: "Venta", icon: "pos" },
      { id: "caja", label: "Caja", icon: "caja" }
    ];
    const moreActive = !primary.some((item) => item.id === state.screen);
    return primary.map((item) => `
      <button type="button" data-action="go" data-screen="${item.id}" class="${state.screen === item.id ? "active" : ""}" ${state.screen === item.id ? 'aria-current="page"' : ""}>
        ${icon(item.icon)}
        <span>${item.label}</span>
        ${item.id === "pos" && count ? `<span class="nav-badge">${count}</span>` : ""}
      </button>`).join("") + `
      <button type="button" data-action="toggle-more" class="${moreActive ? "active" : ""}" aria-expanded="${state.ui.moreOpen}">
        ${icon("more")}
        <span>Más</span>
      </button>`;
  }

  function renderScreen() {
    const title = TITLES[state.screen] || "Just2Sale";
    document.title = "Just2Sale — " + title;
    if (state.screen === "dashboard") return renderDashboard();
    if (state.screen === "pos") return renderPos();
    if (state.screen === "caja") return renderCaja();
    if (state.screen === "inventario") return renderInventario();
    if (state.screen === "pedidos") return renderPedidos();
    if (state.screen === "devoluciones") return renderDevoluciones();
    if (state.screen === "reportes") return renderReportes();
    if (state.screen === "insumos") return renderInsumos();
    if (state.screen === "ajustes") return renderAjustes();
    return renderDashboard();
  }

  function screenHead(kicker, title, text) {
    return `<header class="screen-head"><p class="kicker">${esc(kicker)}</p><h1 id="screen-title">${esc(title)}</h1>${text ? `<p class="muted">${esc(text)}</p>` : ""}</header>`;
  }

  function renderDashboard() {
    const lows = lowProducts();
    const counts = offlineCounts();
    const cards = MODULES.filter((item) => item.id !== "dashboard" && item.id !== "pos");
    return `
      ${screenHead("Just2Sale", "Inicio", "Elige un módulo. La venta es la pantalla principal.")}
      <section class="hero">
        <div class="icon-wrap">${icon("pos")}</div>
        <div class="copy">
          <h2>Punto de venta</h2>
          <p>Busca el producto, arma la venta y revisa el cambio antes de terminar. Todo ocurre en esta pantalla.</p>
          <p class="micro">${state.shift.open ? "Turno abierto · efectivo esperado " + money(expectedMxnCents()) : "Turno cerrado"}</p>
        </div>
        <div class="actions"><button type="button" class="btn primary" data-action="go" data-screen="pos">Abrir venta</button></div>
      </section>
      <div class="status-row">
        <button type="button" data-action="go" data-screen="caja"><span>Caja</span><strong>${state.shift.open ? "Turno abierto" : "Turno cerrado"}</strong></button>
        <button type="button" data-action="toggle-offline"><span>Sincronización de ejemplo</span><strong>${counts.pending} pendientes · ${counts.error} con error</strong></button>
        <button type="button" data-action="go" data-screen="inventario"><span>Inventario</span><strong>${lows.length} con stock bajo</strong></button>
      </div>
      <div class="card-grid">
        ${cards.map((item) => {
          if (item.id === "insumos" && !canOpen(item.id)) return "";
          const allowed = canOpen(item.id);
          const suppliesOff = item.id === "insumos" && !state.suppliesEnabled;
          if (!allowed) {
            return `<button type="button" class="module-card locked" data-action="go" data-screen="${item.id}">${iconWrap(item.icon)}${chip("Vista bloqueada", "warn")}<strong>${esc(item.label)}</strong><span>${esc(item.desc)} No está en la vista ${esc(ROLES[state.role].label)}.</span></button>`;
          }
          return `<button type="button" class="module-card" data-action="go" data-screen="${item.id}">${iconWrap(item.icon)}${suppliesOff ? chip("Apagado", "warn") : ""}<strong>${esc(item.label)}</strong><span>${esc(item.desc)}</span></button>`;
        }).join("")}
      </div>`;
  }

  function iconWrap(name) {
    return `<span class="icon-wrap">${icon(name)}</span>`;
  }

  function renderPos() {
    const query = state.ui.search.trim().toLowerCase();
    const products = state.products.filter((item) => {
      if (!query) return true;
      return item.name.toLowerCase().includes(query) || item.sku.includes(query) || item.category.toLowerCase().includes(query);
    });
    const offline = state.offline.connection === "offline"
      ? `<p class="inline-alert">Sin conexión simulada. Si cobras, la venta quedará pendiente en esta pantalla.</p>`
      : "";
    const shift = state.shift.open ? "" : `<p class="inline-alert">El turno está cerrado. <button type="button" class="btn small ghost" data-action="go" data-screen="caja">Abrir turno en Caja</button></p>`;
    return `
      ${screenHead("Cobro", "Punto de venta", "")}
      ${shift}
      ${offline}
      <div class="pos">
        <section class="pos-main">
          <div class="search-row">
            <label class="field grow has-icon"><span class="sr-only">Buscar producto o código</span>${icon("search")}
              <input id="search" data-input="search" type="search" placeholder="Buscar por nombre o código" value="${esc(state.ui.search)}" autocomplete="off">
            </label>
            <button type="button" id="btn-scan" class="btn ghost" data-action="open-scanner">${icon("scan")} Simular escáner</button>
          </div>
          <div class="product-grid">
            ${products.length ? products.map(renderProduct).join("") : `<p class="empty">Ningún producto de ejemplo coincide.</p>`}
          </div>
        </section>
        ${renderCart()}
      </div>`;
  }

  function renderProduct(item) {
    const low = item.stock <= LOW_STOCK && item.stock > 0;
    const out = item.stock < 1;
    const reserved = cartQty(item.id);
    return `
      <button type="button" id="product-${item.id}" class="product-card ${low ? "low" : ""} ${out ? "out" : ""}" data-action="add-product" data-id="${item.id}">
        <span class="muted">${esc(item.category)}</span>
        <strong>${esc(item.name)}</strong>
        <span class="micro">${esc(item.sku)}</span>
        ${out ? chip("Sin existencia", "bad") : low ? chip("Stock bajo", "warn") : ""}
        <span class="price num">${money(item.priceCents)}</span>
        <span class="micro">Quedan ${item.stock}${reserved ? " · " + reserved + " en la venta" : ""}</span>
      </button>`;
  }

  function renderCart() {
    const pay = settlement();
    const count = state.cart.lines.reduce((sum, line) => sum + line.qty, 0);
    const hint = {
      efectivo: "El cambio se calcula con el efectivo recibido.",
      tarjeta: "No hay terminal. El cobro con tarjeta es simulado.",
      transferencia: "No hay banco. La transferencia es simulada.",
      mixto: "Puedes combinar efectivo, tarjeta y transferencia. El cambio sale del efectivo."
    }[state.cart.payMode];
    return `
      ${state.ui.cartOpen ? `<button type="button" class="cart-backdrop" data-action="toggle-cart" aria-label="Cerrar cobro"></button>` : ""}
      <aside class="cart-dock ${state.ui.cartOpen ? "open" : ""}" id="cart">
        <button type="button" class="cart-peek" data-action="toggle-cart">
          <span>${count} ${count === 1 ? "artículo" : "artículos"}</span>
          <strong id="cart-total-peek" class="num">${money(pay.total)}</strong>
          <span class="peek-cta">${state.ui.cartOpen ? "Cerrar" : "Ver cobro"}</span>
        </button>
        <div class="cart-body">
          <div class="cart-lines">
            <div class="toolbar"><strong>Venta actual</strong>${state.cart.lines.length ? `<button type="button" class="text-btn" data-action="clear-cart">Vaciar (demo)</button>` : ""}</div>
            ${state.cart.lines.length ? state.cart.lines.map(renderLine).join("") : `<p class="empty">Agrega productos para armar la venta.</p>`}
          </div>
          <div class="cart-pay">
          <label class="field">Promoción
            <select id="promo" data-change="promo">
              ${Object.keys(PROMO_LABEL).map((key) => `<option value="${key}" ${state.cart.promo === key ? "selected" : ""}>${esc(PROMO_LABEL[key])}</option>`).join("")}
            </select>
          </label>
          ${state.cart.promo === "bogo" ? `<p class="micro">Cada segundo café, empezando por el más barato, queda sin cargo.</p>` : ""}
          <div class="pay-grid" role="group" aria-label="Forma de pago">
            ${["efectivo", "tarjeta", "transferencia", "mixto"].map((mode) => {
              const labels = { efectivo: "Efectivo", tarjeta: "Tarjeta", transferencia: "Transferencia", mixto: "Mixto" };
              return `<button type="button" id="pay-${mode}" class="pay-btn ${state.cart.payMode === mode ? "active" : ""}" data-action="pay-mode" data-mode="${mode}" aria-pressed="${state.cart.payMode === mode}">${labels[mode]}</button>`;
            }).join("")}
          </div>
          <p class="micro">${hint}</p>
          ${renderPayFields(pay)}
          </div>
          <div class="cart-foot">
          <div class="totals">
            <div><span>Subtotal</span><span class="num">${money(pay.subtotal)}</span></div>
            ${pay.discount ? `<div><span>Descuento</span><span class="num">${money(pay.discount)}</span></div>` : ""}
            <div class="grand"><span>Total</span><span id="cart-total" class="num">${money(pay.total)}</span></div>
            ${state.currency === "USD" ? `<p class="micro">Base de ejemplo: ${formatMxn(pay.total)}. Conversión de vista, no es un tipo de cambio real.</p>` : ""}
          </div>
          <p id="settlement" class="diff ${!state.cart.lines.length ? "" : pay.error || pay.falta > 0 ? "bad" : "ok"}">${esc(pay.message)}</p>
          ${state.shift.open ? "" : `<p id="charge-note" class="micro">Abre el turno en Caja para registrar la demostración.</p>`}
          <div class="row-actions">
            <button type="button" id="btn-ticket" class="btn ghost" data-action="preview" ${state.cart.lines.length ? "" : "disabled"}>Vista previa del ticket</button>
            <button type="button" id="btn-charge" class="btn primary" data-action="charge" ${canCharge() ? "" : "disabled"}>Cobrar (demo)</button>
          </div>
          <p class="micro">No se guarda ni se envía.</p>
          </div>
        </div>
      </aside>`;
  }

  function renderLine(line) {
    const item = product(line.productId);
    return `
      <div class="line">
        <div><strong>${esc(item.name)}</strong><div class="micro num">${money(item.priceCents)} c/u</div></div>
        <div class="num">${money(item.priceCents * line.qty)}</div>
        <div class="stepper">
          <button type="button" id="qty-minus-${item.id}" data-action="qty" data-id="${item.id}" data-delta="-1" aria-label="Disminuir ${esc(item.name)}">−</button>
          <span id="qty-${item.id}">${line.qty}</span>
          <button type="button" id="qty-plus-${item.id}" data-action="qty" data-id="${item.id}" data-delta="1" aria-label="Aumentar ${esc(item.name)}">+</button>
        </div>
        <button type="button" class="text-btn" data-action="remove-line" data-id="${item.id}">Quitar</button>
      </div>`;
  }

  function renderPayFields(pay) {
    if (state.cart.payMode === "efectivo") {
      return `
        <label class="field">Efectivo recibido
          <input id="tender" data-input="tender" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${esc(state.cart.tenderRaw)}">
        </label>
        <div class="quick-row">
          <button type="button" id="quick-exact" class="btn small ghost" data-action="quick-cash" data-amount="exact">Exacto</button>
          ${quickAmounts().map((amount) => `<button type="button" id="quick-${amount}" class="btn small ghost" data-action="quick-cash" data-amount="${amount}">${state.currency === "USD" ? "US$" : "$"}${amount}</button>`).join("")}
        </div>`;
    }
    if (state.cart.payMode === "mixto") {
      return `
        <div class="mix-grid">
          <label class="field">Efectivo recibido<input id="mix-efectivo" data-input="mix-efectivo" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${esc(state.cart.mixRaw.efectivo)}"></label>
          <label class="field">Tarjeta<input id="mix-tarjeta" data-input="mix-tarjeta" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${esc(state.cart.mixRaw.tarjeta)}"></label>
          <label class="field">Transferencia<input id="mix-transferencia" data-input="mix-transferencia" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${esc(state.cart.mixRaw.transferencia)}"></label>
          <button type="button" id="fill-mix" class="btn ghost" data-action="fill-mix">Poner el resto en efectivo</button>
        </div>
        <p class="micro">Aplicado a la venta: efectivo ${money(pay.parts.efectivo)}, tarjeta ${money(pay.parts.tarjeta)}, transferencia ${money(pay.parts.transferencia)}.</p>`;
    }
    return "";
  }

  function renderCaja() {
    if (!state.shift.open) return renderCajaClosed();
    const expected = expectedMxnCents();
    const expectedActive = mxnToActiveCents(expected);
    const counted = countedActiveCents();
    const diff = counted - expectedActive;
    const tone = diff === 0 ? "ok" : diff < 0 ? "bad" : "warn";
    const diffWord = diff === 0 ? "Cuadra" : diff < 0 ? "Falta" : "Sobra";
    return `
      ${screenHead("Turno", "Caja", "Cifras de ejemplo más lo que cobres en esta pantalla.")}
      <p class="note">Turno abierto desde ${esc(state.shift.openedAt)}. ${can("closeShift") ? "Puedes cerrarlo al terminar el conteo." : "En la vista Empleado el cierre está desactivado."}</p>
      <div class="summary-grid">
        ${stat("Ventas en efectivo", money(state.shift.byMethod.efectivo))}
        ${stat("Ventas con tarjeta", money(state.shift.byMethod.tarjeta))}
        ${stat("Ventas por transferencia", money(state.shift.byMethod.transferencia))}
        ${stat("Fondo inicial", money(state.shift.openingCents))}
        ${stat("Entradas", money(sumCash(state.shift.cashIn)))}
        ${stat("Salidas", money(sumCash(state.shift.cashOut)))}
      </div>
      <p class="formula"><span>Esperado = fondo + entradas − salidas + ventas en efectivo</span></p>
      <p class="formula num"><span>${formatMxn(state.shift.openingCents)} + ${formatMxn(sumCash(state.shift.cashIn))} − ${formatMxn(sumCash(state.shift.cashOut))} + ${formatMxn(state.shift.byMethod.efectivo)}</span><strong>${formatMxn(expected)}</strong></p>
      ${state.currency === "USD" ? `<p class="micro">Esa suma es la base en pesos. El corte usa el total convertido a dólares.</p>` : ""}
      <div class="two-col">
        <section class="panel">
          <h2>Entradas y salidas</h2>
          <p class="micro">Movimientos de demostración. No hay un cajón físico.</p>
          <label class="field">Monto<input id="cash-amount" data-input="cash-amount" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${esc(state.ui.cashRaw)}"></label>
          <label class="field">Motivo<select id="cash-reason" data-change="cash-reason">${CASH_REASONS.map((reason) => `<option ${state.ui.cashReason === reason ? "selected" : ""}>${esc(reason)}</option>`).join("")}</select></label>
          <label class="field">Nota<input id="cash-note" data-input="cash-note" autocomplete="off" value="${esc(state.ui.cashNote)}" placeholder="Opcional"></label>
          <div class="row-actions">
            <button type="button" class="btn primary" data-action="cash-in">Entrada (demo)</button>
            <button type="button" class="btn ghost" data-action="cash-out">Salida (demo)</button>
          </div>
          <ul class="log">
            ${state.shift.cashIn.slice(0, 4).map((row) => `<li><strong class="qty-plus">Entrada</strong> ${money(row.cents)} · ${esc(row.reason)} <span class="micro">${esc(row.time)} ${esc(row.note || "")}</span></li>`).join("")}
            ${state.shift.cashOut.slice(0, 4).map((row) => `<li><strong class="qty-minus">Salida</strong> ${money(row.cents)} · ${esc(row.reason)} <span class="micro">${esc(row.time)} ${esc(row.note || "")}</span></li>`).join("")}
          </ul>
        </section>
        <section class="panel" id="denom-panel">
          <h2 id="denom-heading">Corte en ${state.currency}</h2>
          <p id="denom-counted" class="num">Contado ${moneyActive(counted)}</p>
          <p id="denom-expected" class="num">Esperado ${moneyActive(expectedActive)}</p>
          <p id="denom-diff" class="diff ${tone}">${diffWord} ${moneyActive(Math.abs(diff))}</p>
          <p class="micro">Cuenta billetes y monedas de la moneda activa. El total y la diferencia se calculan solos.</p>
          ${state.currency === "USD" ? `<p class="micro">El esperado en dólares convierte el total en pesos con 1 USD = 18.50 MXN. No se convierten los billetes uno a uno.</p>` : ""}
          ${renderDenoms()}
          <div class="row-actions">
            <button type="button" id="suggest-count" class="btn small ghost" data-action="suggest-count">Sugerir conteo (demo)</button>
            <button type="button" class="btn small ghost" data-action="clear-counts">Poner en ceros</button>
          </div>
          <button type="button" id="btn-close-shift" class="btn danger block" data-action="shift-close">Cerrar turno (demo)</button>
          ${can("closeShift") ? "" : `<p class="micro">El botón responde con un aviso: esta vista no cierra el turno.</p>`}
        </section>
      </div>`;
  }

  function stat(label, value) {
    return `<article class="stat"><span>${esc(label)}</span><strong class="num">${value}</strong></article>`;
  }

  function renderDenoms() {
    const groups = ["Billetes", "Monedas"];
    return groups.map((group) => {
      const rows = DENOMS[state.currency].filter((denom) => denom.group === group);
      return `<h3 class="group-label">${group}</h3>` + rows.map((denom) => {
        const count = state.shift.counts[state.currency][denom.id] || 0;
        return `
          <div class="denom-row">
            <span>${esc(denom.label)}</span>
            <div class="stepper">
              <button type="button" id="denom-minus-${denom.id}" data-action="denom-step" data-id="${denom.id}" data-delta="-1" aria-label="Quitar uno a ${esc(denom.label)}">−</button>
              <input id="denom-count-${denom.id}" data-input="denom" data-id="${denom.id}" inputmode="numeric" value="${count}" aria-label="Cantidad de ${esc(denom.label)}">
              <button type="button" id="denom-plus-${denom.id}" data-action="denom-step" data-id="${denom.id}" data-delta="1" aria-label="Sumar uno a ${esc(denom.label)}">+</button>
            </div>
            <strong id="denom-line-${denom.id}" class="num">${moneyActive(denom.cents * count)}</strong>
          </div>`;
      }).join("");
    }).join("");
  }

  function renderCajaClosed() {
    const closed = state.lastClose;
    return `
      ${screenHead("Turno", "Caja", "El turno está cerrado en esta demostración.")}
      ${closed ? `<section class="panel"><h2>Último cierre de demostración</h2><p>${esc(closed.at)}</p><p class="num">Esperado ${formatMxn(closed.expectedCents)}</p><p class="num">Contado en ${esc(closed.currency)}: ${formatCents(closed.countedCents, closed.currency)}</p><p class="num">Diferencia ${formatCents(closed.diffCents, closed.currency)}</p><p class="micro">Ese corte no se archivó fuera de esta pantalla.</p></section>` : ""}
      <section class="panel">
        <h2>Abrir turno</h2>
        <p class="micro">Escribe el efectivo inicial en la moneda de la vista. Usa 0 si la caja empieza vacía.</p>
        <label class="field">Efectivo inicial<input id="opening-cash" data-input="opening" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${esc(state.ui.openingRaw)}"></label>
        <div class="row-actions">
          <button type="button" class="btn ghost" data-action="use-zero">Usar 0</button>
          <button type="button" id="btn-open-shift" class="btn primary" data-action="shift-open">Abrir turno (demo)</button>
        </div>
      </section>`;
  }

  function renderInventario() {
    const query = state.ui.invSearch.trim().toLowerCase();
    const items = state.products.filter((item) => {
      const matches = !query || item.name.toLowerCase().includes(query) || item.sku.includes(query);
      if (!matches) return false;
      if (state.ui.invFilter === "low") return item.stock <= LOW_STOCK;
      return true;
    });
    return `
      ${screenHead("Existencias", "Inventario", "Precios de ejemplo. El stock bajo es de 5 piezas o menos.")}
      <div class="toolbar">
        <label class="field grow"><span class="sr-only">Buscar en inventario</span>
          <input id="inv-search" data-input="inv-search" type="search" placeholder="Buscar producto" value="${esc(state.ui.invSearch)}" autocomplete="off">
        </label>
        <button type="button" class="btn small ${state.ui.invFilter === "all" ? "primary" : "ghost"}" data-action="inv-filter" data-filter="all">Todos</button>
        <button type="button" class="btn small ${state.ui.invFilter === "low" ? "primary" : "ghost"}" data-action="inv-filter" data-filter="low">Stock bajo (${lowProducts().length})</button>
      </div>
      <div class="inv-grid">
        ${items.map((item) => `
          <article class="inv-card">
            <h2>${esc(item.name)}</h2>
            <p class="micro">${esc(item.sku)} · ${esc(item.category)}</p>
            <p class="price num">${money(item.priceCents)}</p>
            <p>Existencia <strong>${item.stock}</strong> ${item.stock <= LOW_STOCK ? chip(item.stock === 0 ? "Sin existencia" : "Stock bajo", item.stock === 0 ? "bad" : "warn") : chip("OK", "ok")}</p>
            ${can("inventoryIn")
              ? `<button type="button" class="btn small ghost" data-action="inventory-in" data-id="${item.id}">Entrada de 10 (demo)</button>`
              : `<button type="button" class="btn small ghost" data-action="restock" data-id="${item.id}">Pedir reposición (demo)</button>`}
          </article>`).join("") || `<p class="empty">Nada coincide con el filtro.</p>`}
      </div>
      ${state.restockRequests.length ? `<section class="panel"><h2>Peticiones de esta pantalla</h2><ul class="log">${state.restockRequests.map((row) => `<li>${esc(row.time)} · ${esc(row.product)} · ${esc(row.by)}</li>`).join("")}</ul></section>` : ""}
      <section class="panel">
        <h2>Movimientos de ejemplo</h2>
        <ul class="log">
          ${state.movements.slice(0, 12).map((row) => `<li><span>${esc(row.time)}</span> <strong>${esc(row.type)}</strong> ${esc(row.product)} <span class="${row.qty > 0 ? "qty-plus" : "qty-minus"}">${row.qty > 0 ? "+" : ""}${row.qty}</span><div class="micro">${esc(row.note)}</div></li>`).join("")}
        </ul>
      </section>`;
  }

  function renderPedidos() {
    const filters = [
      ["todos", "Todos"],
      ["apartado", "Apartados"],
      ["pedido", "Pedidos"],
      ["listo", "Listos"],
      ["vencido", "Vencidos"]
    ];
    const orders = state.orders.filter((order) => state.ui.orderFilter === "todos" || order.status === state.ui.orderFilter);
    return `
      ${screenHead("Encargos", "Pedidos y apartados", "Estados, anticipo, saldo y fecha. Las acciones solo cambian esta pantalla.")}
      <div class="toolbar">
        ${filters.map((filter) => `<button type="button" class="btn small ${state.ui.orderFilter === filter[0] ? "primary" : "ghost"}" data-action="order-filter" data-filter="${filter[0]}">${filter[1]}</button>`).join("")}
      </div>
      <div class="order-list two-col">
        ${orders.map(renderOrder).join("") || `<p class="empty">No hay encargos con ese estado.</p>`}
      </div>`;
  }

  function renderOrder(order) {
    const balance = order.totalCents - order.depositCents;
    let actions = `<p class="micro">Sin acciones: ${esc(STATUS_LABEL[order.status].toLowerCase())}.</p>`;
    if (order.status === "apartado") {
      actions = `
        <label class="field">Abono<input id="deposit-${order.id}" data-input="deposit" data-id="${order.id}" inputmode="decimal" placeholder="0.00" value="${esc(state.ui.depositRaw[order.id] || "")}"></label>
        <div class="order-actions">
          <button type="button" class="btn small primary" data-action="order-deposit" data-id="${order.id}">Abonar (demo)</button>
          <button type="button" class="btn small ghost" data-action="order-status" data-id="${order.id}" data-status="entregado">Entregar y liquidar (demo)</button>
          <button type="button" class="btn small danger" data-action="order-status" data-id="${order.id}" data-status="cancelado">Cancelar (demo)</button>
        </div>`;
    } else if (order.status === "pedido") {
      actions = `<div class="order-actions"><button type="button" class="btn small primary" data-action="order-status" data-id="${order.id}" data-status="listo">Marcar listo (demo)</button><button type="button" class="btn small danger" data-action="order-status" data-id="${order.id}" data-status="cancelado">Cancelar (demo)</button></div>`;
    } else if (order.status === "listo") {
      actions = `<div class="order-actions"><button type="button" class="btn small primary" data-action="order-status" data-id="${order.id}" data-status="entregado">Entregar (demo)</button></div>`;
    } else if (order.status === "vencido") {
      actions = `<div class="order-actions"><button type="button" class="btn small primary" data-action="order-status" data-id="${order.id}" data-status="extender">Extender 7 días (demo)</button><button type="button" class="btn small danger" data-action="order-status" data-id="${order.id}" data-status="cancelado">Cancelar (demo)</button></div>`;
    }
    return `
      <article class="order-card">
        <div class="toolbar">${chip(order.type, "info")}${chip(STATUS_LABEL[order.status], STATUS_TONE[order.status])}</div>
        <h2>${esc(order.id)} · ${esc(order.customer)}</h2>
        <p>${esc(order.item)}</p>
        <p class="num">Total ${money(order.totalCents)}</p>
        <p class="num">Anticipo ${money(order.depositCents)}</p>
        <p class="num"><strong>Saldo ${money(balance)}</strong></p>
        <p class="micro">Fecha límite ${esc(formatDate(order.due))}</p>
        ${actions}
      </article>`;
  }

  function renderDevoluciones() {
    return `
      ${screenHead("Ejemplos", "Devoluciones y cancelaciones", "Elige un motivo y revisa el efecto en el inventario antes de confirmar.")}
      <div class="two-col">
        ${renderExample(state.examples[0], "Devolución de ejemplo", "return-reason", RETURN_REASONS, state.ui.returnReason, "apply-return")}
        ${renderExample(state.examples[1], "Cancelación de ejemplo", "void-reason", VOID_REASONS, state.ui.voidReason, "apply-void")}
      </div>`;
  }

  function renderExample(example, title, changeKey, reasons, selected, action) {
    const total = example.items.reduce((sum, line) => sum + product(line.productId).priceCents * line.qty, 0);
    const reason = example.applied ? (example.result.match(/^Motivo: ([^.]+)/) || [, selected])[1] : selected;
    const effect = example.applied ? example.result : exampleEffect(example, selected, true);
    return `
      <section class="panel">
        <h2>${esc(title)}</h2>
        <p><strong>${esc(example.id)}</strong> · ${esc(example.method)} · <span class="num">${money(total)}</span></p>
        <ul class="log">
          ${example.items.map((line) => `<li>${esc(product(line.productId).name)} × ${line.qty}</li>`).join("")}
        </ul>
        <label class="field">Motivo
          <select id="${changeKey}" data-change="${changeKey}" ${example.applied ? "disabled" : ""}>
            ${reasons.map((item) => `<option ${item === selected ? "selected" : ""}>${esc(item)}</option>`).join("")}
          </select>
        </label>
        <div class="effect" id="${example.kind}-effect"><strong>${example.applied ? "Aplicado en esta pantalla" : "Si confirmas esta demostración"}</strong><p>${esc(effect)}</p></div>
        <button type="button" class="btn primary" data-action="${action}" ${example.applied ? "disabled" : ""}>${example.applied ? "Ya aplicada en esta demostración" : "Confirmar (demo)"}</button>
      </section>`;
  }

  function renderReportes() {
    const report = currentReport();
    const max = Math.max.apply(null, report.series.map((item) => item.cents).concat([1]));
    const ranges = [["dia", "Día"], ["semana", "Semana"], ["mes", "Mes"]];
    const periods = Object.keys(POS_DATA.reports[state.ui.reportRange]).map((key) => [key, POS_DATA.reports[state.ui.reportRange][key].label]);
    return `
      ${screenHead("Cifras de ejemplo", "Reportes", "No salen de una base de datos. Las filas Sesión son ventas de esta pantalla.")}
      <div class="toolbar">
        ${ranges.map((range) => `<button type="button" id="range-${range[0]}" class="btn small ${state.ui.reportRange === range[0] ? "primary" : "ghost"}" data-action="report-range" data-range="${range[0]}">${range[1]}</button>`).join("")}
        <label class="field"><span class="sr-only">Periodo</span>
          <select id="report-period" data-change="report-period">
            ${periods.map((period) => `<option value="${period[0]}" ${state.ui.reportPeriod === period[0] ? "selected" : ""}>${esc(period[1])}</option>`).join("")}
          </select>
        </label>
      </div>
      <h2>${esc(report.title)}</h2>
      <div class="bars" aria-hidden="true">
        ${report.series.map((item) => `
          <div class="bar">
            <small class="num">${shortNumber(item.cents)}</small>
            <div class="bar-track"><div class="bar-fill" style="height:${Math.max(4, Math.round(item.cents / max * 100))}%"></div></div>
            <span>${esc(item.label)}</span>
          </div>`).join("")}
      </div>
      <p class="micro">Montos en la moneda de la vista${state.currency === "USD" ? " (1 USD = 18.50 MXN)" : ""}.</p>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Folio</th><th>Hora</th><th>Forma de pago</th><th>Total</th><th>Estado</th></tr></thead>
          <tbody>
            ${report.rows.map((row) => `<tr>
              <td data-label="Folio">${esc(row.folio)} ${row.session ? chip("Sesión", "warn") : ""}</td>
              <td data-label="Hora">${esc(row.time)}</td>
              <td data-label="Forma de pago">${esc(row.method)}</td>
              <td data-label="Total" class="num">${money(row.totalCents)}</td>
              <td data-label="Estado">${esc(row.status)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="row-actions">
        <button type="button" id="export-csv" class="btn ghost" data-action="export" data-kind="csv">Vista previa CSV (demo)</button>
        <button type="button" id="export-pdf" class="btn ghost" data-action="export" data-kind="pdf">Vista previa PDF (demo)</button>
      </div>`;
  }

  function renderInsumos() {
    if (!state.suppliesEnabled && can("suppliesToggle")) {
      return `
        ${screenHead("Opcional", "Insumos", "Este módulo está apagado.")}
        <section class="panel">
          <h2>Insumos está apagado</h2>
          <p>El interruptor solo muestra u oculta el módulo en esta demostración.</p>
          ${renderSupplySwitch()}
        </section>`;
    }
    return `
      ${screenHead("Opcional", "Insumos", "Consumibles de ejemplo. No se descuentan solos al vender un café.")}
      ${can("suppliesToggle") ? renderSupplySwitch() : `<p class="note">El módulo está activo. Solo la vista Superadmin puede apagarlo.</p>`}
      <div class="inv-grid">
        ${state.supplies.map((item) => `
          <article class="inv-card">
            <h2>${esc(item.name)}</h2>
            <p>Existencia <strong>${item.stock} ${esc(item.unit)}</strong> ${item.stock <= item.low ? chip("Bajo", "warn") : chip("OK", "ok")}</p>
            <button type="button" class="btn small primary" data-action="supply-use" data-id="${item.id}">Registrar uso de ${item.use} ${esc(item.unit)} (demo)</button>
          </article>`).join("")}
      </div>
      ${state.supplyLog.length ? `<ul class="log">${state.supplyLog.map((row) => `<li>${esc(row.time)} · ${esc(row.name)} −${row.qty} ${esc(row.unit)}</li>`).join("")}</ul>` : ""}`;
  }

  function renderSupplySwitch() {
    return `<label class="switch"><input id="supplies-toggle" type="checkbox" data-change="supplies-toggle" ${state.suppliesEnabled ? "checked" : ""}> Módulo de insumos ${state.suppliesEnabled ? "activo" : "apagado"}</label>`;
  }

  function renderAjustes() {
    const copy = ROLE_COPY[state.role];
    const role = ROLES[state.role];
    return `
      ${screenHead("Vista", "Ajustes y roles", "El cambio de rol no identifica personas ni protege datos.")}
      <section class="panel">
        <h2>${esc(role.person)} · ${esc(role.label)}</h2>
        <p>Rol de demostración</p>
        ${renderRoleSwitch(false)}
        <h3>En esta vista se puede</h3>
        <ul>${copy.can.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
        <h3>En esta vista no aparece como acción real</h3>
        <ul>${copy.cannot.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        <h2>Moneda de la vista</h2>
        ${renderCurrencySwitch(false)}
        <p class="micro">Los precios de ejemplo están en pesos. Dólares es una conversión fija: ${esc(POS_DATA.rateText)}. El corte de caja cambia de denominaciones con la moneda activa.</p>
      </section>
      <section class="panel">
        <h2>Texto del ticket</h2>
        <label class="field">Pie del comprobante
          <textarea id="ticket-footer" data-input="ticket-footer" ${state.role === "empleado" ? "readonly" : ""}>${esc(state.ticketFooter)}</textarea>
        </label>
        ${state.role === "empleado" ? `<p class="micro">La vista Empleado lo ve, no lo edita.</p>` : `<p class="micro">El cambio se ve en la próxima vista previa. No se imprime.</p>`}
      </section>
      ${can("suppliesToggle") ? `<section class="panel"><h2>Módulos</h2><p class="micro">Insumos es opcional.</p>${renderSupplySwitch()}</section>` : ""}
      ${state.role === "superadmin" ? `<section class="panel"><h2>Personal de ejemplo</h2><p class="micro">No hay cuentas ni contraseñas.</p><div class="people">${POS_DATA.users.map((user) => `<article><strong>${esc(user.name)}</strong><div>${esc(user.role)} · Sucursal ${esc(user.branch)}</div></article>`).join("")}</div></section>` : ""}
      <p class="note">Nada de esta sesión se guarda en el navegador. Al recargar, los datos de ejemplo vuelven a empezar.</p>`;
  }

  function renderOverlays() {
    return [renderOfflineDialog(), renderTicketModal(), renderScanner(), renderExport(), renderMore()].join("");
  }

  function renderTicketModal() {
    const ticket = state.ui.ticket;
    if (!ticket) return "";
    return `
      <div class="backdrop" data-action="close-ticket">
        <div class="modal" data-action="noop" role="dialog" aria-modal="true" aria-labelledby="ticket-title">
          <div class="ticket" id="ticket-body">
            <h2 id="ticket-title">JUST2SALE</h2>
            <div>Sucursal Centro</div>
            <div>${ticket.preview ? "Vista previa" : "Venta de demostración"} · ${esc(ticket.when)}</div>
            <div class="sep"></div>
            <div>Folio ${esc(ticket.folio)}</div>
            ${ticket.lines.map((line) => `<div class="t-row"><span>${esc(line.name)} × ${line.qty}</span><span>${money(line.total)}</span></div>`).join("")}
            <div class="sep"></div>
            <div class="t-row"><span>Subtotal</span><span>${money(ticket.subtotal)}</span></div>
            ${ticket.discount ? `<div class="t-row"><span>${esc(ticket.promo)}</span><span>−${money(ticket.discount)}</span></div>` : ""}
            <div class="t-row"><strong>TOTAL</strong><strong>${money(ticket.total)}</strong></div>
            ${ticket.payments.map((row) => `<div class="t-row"><span>${esc(row.method)}</span><span>${money(row.amount)}</span></div>`).join("")}
            <div class="t-row"><span>Cambio</span><span>${money(ticket.change)}</span></div>
            <div class="sep"></div>
            <div>${esc(ticket.footer)}</div>
            <strong>COMPROBANTE DE DEMOSTRACIÓN</strong>
            <div>Sin validez fiscal. No se envió a ningún servidor.</div>
            ${ticket.preview ? `<div>${esc(ticket.message)}</div>` : ""}
          </div>
          <div class="row-actions"><button type="button" class="btn primary" data-action="close-ticket">Cerrar</button></div>
        </div>
      </div>`;
  }

  function renderScanner() {
    if (!state.ui.scannerOpen) return "";
    return `
      <div class="backdrop" data-action="close-scanner">
        <div class="modal" data-action="noop" role="dialog" aria-modal="true" aria-labelledby="scan-title">
          <h2 id="scan-title">Simular escáner</h2>
          <p>No hay cámara ni lector. Escribe un código de ejemplo o usa uno de la lista.</p>
          <label class="field">Código<input id="scan-code" data-input="scan" value="${esc(state.ui.scanRaw)}" autocomplete="off"></label>
          <div class="quick-row">
            ${state.products.slice(0, 4).map((item) => `<button type="button" class="btn small ghost" data-action="read-scanner" data-code="${item.sku}">${esc(item.sku)}</button>`).join("")}
          </div>
          <div class="row-actions">
            <button type="button" class="btn ghost" data-action="close-scanner">Cancelar</button>
            <button type="button" id="btn-read-scan" class="btn primary" data-action="read-scanner">Leer código (demo)</button>
          </div>
        </div>
      </div>`;
  }

  function renderExport() {
    if (!state.ui.exportView) return "";
    const report = currentReport();
    if (state.ui.exportView === "csv") {
      const lines = ["folio,hora,metodo,total,estado"].concat(report.rows.map((row) => [row.folio, row.time, row.method, (row.totalCents / 100).toFixed(2), row.status].join(",")));
      return modalExport("Vista previa CSV", `<p>Esto no es un archivo y no se descargó.</p><pre class="ticket">${esc(lines.join("\n"))}</pre>`);
    }
    return modalExport("Vista previa de un PDF", `
      <div class="ticket">
        <h2>JUST2SALE</h2>
        <div>Reporte de ejemplo · ${esc(report.title)}</div>
        <div class="sep"></div>
        ${report.rows.map((row) => `<div class="t-row"><span>${esc(row.folio)} ${esc(row.time)}</span><span>${money(row.totalCents)}</span></div>`).join("")}
        <div class="sep"></div>
        <div>Así se vería una hoja. No se generó un PDF.</div>
      </div>`);
  }

  function modalExport(title, body) {
    return `
      <div class="backdrop" data-action="close-export">
        <div class="modal" data-action="noop" role="dialog" aria-modal="true" aria-labelledby="export-title">
          <h2 id="export-title">${esc(title)}</h2>
          ${body}
          <div class="row-actions"><button type="button" class="btn primary" data-action="close-export">Cerrar</button></div>
        </div>
      </div>`;
  }

  function renderMore() {
    if (!state.ui.moreOpen) return "";
    const items = MODULES.filter((item) => !["dashboard", "pos", "caja"].includes(item.id));
    return `
      <div class="backdrop" data-action="close-more">
        <div class="modal" data-action="noop" role="dialog" aria-modal="true" aria-labelledby="more-title">
          <h2 id="more-title">Más módulos</h2>
          <div class="card-grid">
            ${items.map((item) => {
              const allowed = canOpen(item.id);
              if (item.id === "insumos" && !allowed && !can("suppliesToggle")) return "";
              return `<button type="button" class="module-card ${allowed ? "" : "locked"}" data-action="go" data-screen="${item.id}">${iconWrap(item.icon)}<strong>${esc(item.label)}</strong><span>${allowed ? esc(item.desc) : "No está en esta vista."}</span></button>`;
            }).join("")}
          </div>
        </div>
      </div>`;
  }

  function captureFocus() {
    const el = document.activeElement;
    if (!el || !el.id) return null;
    if (!/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return null;
    return { id: el.id, start: el.selectionStart, end: el.selectionEnd };
  }

  function restoreFocus(snapshot) {
    if (!snapshot) return;
    const el = document.getElementById(snapshot.id);
    if (!el) return;
    el.focus();
    if (typeof snapshot.start === "number" && el.setSelectionRange && el.type !== "checkbox") {
      try {
        const end = Math.min(snapshot.end, el.value.length);
        el.setSelectionRange(Math.min(snapshot.start, el.value.length), end);
      } catch (error) {
        /* select no admite setSelectionRange */
      }
    }
  }

  function syncHeaderHeight() {
    const header = document.getElementById("chrome");
    if (header) document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }

  function render() {
    const focus = captureFocus();
    document.getElementById("chrome").innerHTML = renderChrome();
    document.getElementById("sidenav").innerHTML = renderNav();
    document.getElementById("main").innerHTML = renderScreen();
    document.getElementById("bottomnav").innerHTML = renderBottom();
    document.getElementById("overlays").innerHTML = renderOverlays();
    document.getElementById("toasts").innerHTML = state.ui.toast
      ? `<button type="button" class="toast" data-action="dismiss-toast">${esc(state.ui.toast)}</button>`
      : "";
    const live = document.getElementById("live");
    if (live) live.textContent = state.ui.toast || "";
    const modalOpen = !!(state.ui.ticket || state.ui.scannerOpen || state.ui.exportView || state.ui.moreOpen || state.ui.offlineOpen);
    document.body.classList.toggle("modal-open", modalOpen);
    restoreFocus(focus);
    if (state.ui.focusSearch && window.matchMedia("(min-width: 960px)").matches) {
      const search = document.getElementById("search");
      if (search) search.focus();
    }
    state.ui.focusSearch = false;
    if (state.ui.scrollTop) {
      window.scrollTo(0, 0);
      state.ui.scrollTop = false;
    }
    syncHeaderHeight();
  }

  function onClick(event) {
    const el = event.target.closest("[data-action]");
    if (el) {
      if (el.dataset.action === "noop") return;
      runAction(el);
      render();
      return;
    }
    if (state.ui.offlineOpen && !event.target.closest("#offline-popover") && !event.target.closest("#offline-indicator") && !event.target.closest(".backdrop")) {
      state.ui.offlineOpen = false;
      render();
    }
  }

  function onInput(event) {
    const el = event.target;
    if (!el.dataset || !el.dataset.input) return;
    applyInput(el);
    render();
  }

  function onChange(event) {
    const el = event.target;
    if (!el.dataset || !el.dataset.change) return;
    applyChange(el);
    render();
  }

  function onKey(event) {
    if (event.key === "Escape") {
      state.ui.ticket = null;
      state.ui.scannerOpen = false;
      state.ui.exportView = null;
      state.ui.moreOpen = false;
      state.ui.offlineOpen = false;
      state.ui.cartOpen = false;
      render();
      return;
    }
    if (event.key === "Enter" && event.target.id === "search") {
      event.preventDefault();
      const query = state.ui.search.trim().toLowerCase();
      const exact = state.products.find((item) => item.sku === state.ui.search.trim() || item.name.toLowerCase() === query);
      const visible = state.products.filter((item) => item.name.toLowerCase().includes(query) || item.sku.includes(state.ui.search.trim()));
      if (exact) addProduct(exact.id);
      else if (visible.length === 1) addProduct(visible[0].id);
      render();
    }
    if (event.key === "Enter" && event.target.id === "scan-code") {
      event.preventDefault();
      readCode(state.ui.scanRaw);
      render();
    }
  }

  function init() {
    if (typeof POS_DATA === "undefined") {
      document.getElementById("main").textContent = "No se cargaron los datos de ejemplo. Abre prototype/index.html junto con su carpeta js.";
      return;
    }
    state = buildState();
    if (!bound) {
      document.addEventListener("click", onClick);
      document.addEventListener("input", onInput);
      document.addEventListener("change", onChange);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", syncHeaderHeight);
      bound = true;
    }
    render();
  }

  init();
})();
