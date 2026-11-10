/* Datos ficticios del prototipo Just2Sale. No provienen de un servidor. */
const POS_DATA = {
  rateText: "1 USD = 18.50 MXN",
  products: [
    { id: "americano", name: "Café americano", sku: "750100000001", price: 35, stock: 40, category: "Bebidas", kind: "cafe" },
    { id: "latte", name: "Café latte", sku: "750100000002", price: 48, stock: 36, category: "Bebidas", kind: "cafe" },
    { id: "jugo", name: "Jugo de naranja", sku: "750100000003", price: 32, stock: 18, category: "Bebidas", kind: "bebida" },
    { id: "agua", name: "Agua natural 600 ml", sku: "750100000004", price: 15, stock: 50, category: "Bebidas", kind: "bebida" },
    { id: "pan", name: "Pan dulce", sku: "750100000005", price: 22, stock: 25, category: "Panadería", kind: "pan" },
    { id: "sandwich", name: "Sándwich de jamón", sku: "750100000006", price: 65, stock: 8, category: "Panadería", kind: "pan" },
    { id: "arroz", name: "Arroz 1 kg", sku: "750100000007", price: 28, stock: 20, category: "Abarrotes", kind: "abarrote" },
    { id: "frijol", name: "Frijol 1 kg", sku: "750100000008", price: 34, stock: 16, category: "Abarrotes", kind: "abarrote" },
    { id: "aceite", name: "Aceite 1 L", sku: "750100000009", price: 42, stock: 4, category: "Abarrotes", kind: "abarrote" },
    { id: "leche", name: "Leche 1 L", sku: "750100000010", price: 26, stock: 2, category: "Abarrotes", kind: "abarrote" },
    { id: "huevo", name: "Huevo 12 pzas", sku: "750100000011", price: 48, stock: 3, category: "Abarrotes", kind: "abarrote" },
    { id: "tortillas", name: "Tortillas 1 kg", sku: "750100000012", price: 24, stock: 14, category: "Abarrotes", kind: "abarrote" },
    { id: "jabon", name: "Jabón de barra", sku: "750100000013", price: 18, stock: 22, category: "Limpieza", kind: "limpieza" },
    { id: "papel", name: "Papel higiénico 4 pzas", sku: "750100000014", price: 39, stock: 11, category: "Limpieza", kind: "limpieza" },
    { id: "galletas", name: "Galletas marías", sku: "750100000015", price: 16, stock: 4, category: "Abarrotes", kind: "abarrote" }
  ],
  movements: [
    { time: "08:10", product: "Arroz 1 kg", type: "Entrada", qty: 20, note: "Compra de ejemplo" },
    { time: "08:12", product: "Leche 1 L", type: "Ajuste", qty: -2, note: "Conteo de ejemplo" },
    { time: "Ayer", product: "Jabón de barra", type: "Venta", qty: -3, note: "Venta de ejemplo" },
    { time: "Ayer", product: "Huevo 12 pzas", type: "Venta", qty: -4, note: "Venta de ejemplo" },
    { time: "Ayer", product: "Aceite 1 L", type: "Entrada", qty: 6, note: "Reposición de ejemplo" }
  ],
  orders: [
    { id: "AP-301", type: "Apartado", customer: "Carmen Díaz", item: "Licuadora de muestra", status: "apartado", total: 1000, deposit: 200, due: "2026-11-18" },
    { id: "PD-118", type: "Pedido", customer: "Mostrador", item: "Charola de café y pan (10 personas)", status: "pedido", total: 450, deposit: 0, due: "2026-11-10" },
    { id: "PD-114", type: "Pedido", customer: "Escuela Reforma", item: "Lunch escolar", status: "listo", total: 860, deposit: 860, due: "2026-11-10" },
    { id: "AP-288", type: "Apartado", customer: "Jorge Peña", item: "Canasta de ejemplo", status: "vencido", total: 750, deposit: 150, due: "2026-11-02" },
    { id: "PD-090", type: "Pedido", customer: "Ana López", item: "Pastel de elote", status: "entregado", total: 320, deposit: 320, due: "2026-11-08" },
    { id: "AP-270", type: "Apartado", customer: "Luis Ortega", item: "Cafetera de muestra", status: "cancelado", total: 1800, deposit: 0, due: "2026-11-01" }
  ],
  examples: [
    {
      id: "T-1042",
      kind: "devolucion",
      method: "Efectivo",
      items: [
        { productId: "latte", qty: 1 },
        { productId: "pan", qty: 1 }
      ],
      applied: false
    },
    {
      id: "T-1038",
      kind: "cancelacion",
      method: "Tarjeta",
      items: [
        { productId: "sandwich", qty: 1 },
        { productId: "jugo", qty: 1 }
      ],
      applied: false
    }
  ],
  supplies: [
    { id: "vasos", name: "Vasos 12 oz", stock: 240, unit: "pzas", low: 40, use: 10 },
    { id: "tapas", name: "Tapas para vaso", stock: 180, unit: "pzas", low: 40, use: 10 },
    { id: "servilletas", name: "Servilletas", stock: 60, unit: "pzas", low: 80, use: 20 },
    { id: "leche-insumo", name: "Leche para bebidas", stock: 6, unit: "L", low: 8, use: 1 }
  ],
  offlineSales: [
    { id: "T-1001", label: "Venta de ejemplo", total: 184, status: "synced", time: "09:12", note: "Dato de ejemplo" },
    { id: "T-1002", label: "Venta de ejemplo", total: 96, status: "synced", time: "10:03", note: "Dato de ejemplo" },
    { id: "T-1003", label: "Venta de ejemplo", total: 210, status: "synced", time: "11:41", note: "Dato de ejemplo" },
    { id: "T-1004", label: "Venta de ejemplo", total: 54, status: "synced", time: "12:20", note: "Dato de ejemplo" },
    { id: "T-1005", label: "Venta de ejemplo", total: 132, status: "pending", time: "13:05", note: "Quedó pendiente en la demostración" },
    { id: "T-1006", label: "Venta de ejemplo", total: 78, status: "pending", time: "13:48", note: "Esperando sincronización simulada" },
    { id: "T-1007", label: "Venta de ejemplo", total: 256, status: "error", time: "13:55", note: "Fallo de red simulado" }
  ],
  users: [
    { name: "Mariana Solís", role: "Superadmin", branch: "Centro" },
    { name: "Luis Mendoza", role: "Supervisor", branch: "Centro" },
    { name: "Ana Ruiz", role: "Empleado", branch: "Centro" }
  ],
  reports: {
    dia: {
      hoy: {
        label: "Hoy",
        series: [["8h", 420], ["9h", 680], ["10h", 910], ["11h", 740], ["12h", 1280], ["13h", 990], ["14h", 860]],
        rows: [
          { folio: "T-1008", time: "14:05", method: "Tarjeta", total: 128, status: "Sincronizada" },
          { folio: "T-1007", time: "13:40", method: "Efectivo", total: 86, status: "Sincronizada" },
          { folio: "T-1006", time: "12:15", method: "Transferencia", total: 240, status: "Pendiente" },
          { folio: "T-1005", time: "11:02", method: "Efectivo", total: 64, status: "Sincronizada" }
        ]
      },
      ayer: {
        label: "Ayer",
        series: [["8h", 380], ["9h", 540], ["10h", 770], ["11h", 690], ["12h", 1100], ["13h", 870], ["14h", 640]],
        rows: [
          { folio: "T-0988", time: "18:10", method: "Efectivo", total: 152, status: "Sincronizada" },
          { folio: "T-0981", time: "16:44", method: "Tarjeta", total: 210, status: "Sincronizada" },
          { folio: "T-0974", time: "13:12", method: "Transferencia", total: 96, status: "Sincronizada" }
        ]
      }
    },
    semana: {
      esta: {
        label: "Esta semana",
        series: [["Lun", 4200], ["Mar", 3880], ["Mié", 4510], ["Jue", 4090], ["Vie", 5320], ["Sáb", 6100], ["Dom", 2740]],
        rows: [
          { folio: "Semana", time: "Lun–dom", method: "Mixto", total: 30840, status: "Ejemplo" },
          { folio: "Corte", time: "Vie", method: "Efectivo", total: 5320, status: "Ejemplo" },
          { folio: "Corte", time: "Sáb", method: "Tarjeta", total: 6100, status: "Ejemplo" }
        ]
      },
      pasada: {
        label: "Semana pasada",
        series: [["Lun", 3900], ["Mar", 4100], ["Mié", 3760], ["Jue", 4280], ["Vie", 4900], ["Sáb", 5700], ["Dom", 2500]],
        rows: [
          { folio: "Semana", time: "Lun–dom", method: "Mixto", total: 29140, status: "Ejemplo" },
          { folio: "Corte", time: "Sáb", method: "Tarjeta", total: 5700, status: "Ejemplo" }
        ]
      }
    },
    mes: {
      nov: {
        label: "Noviembre 2026",
        series: [["Sem 1", 28400], ["Sem 2", 19300]],
        rows: [
          { folio: "Mes", time: "1–10 nov", method: "Mixto", total: 47700, status: "Ejemplo" },
          { folio: "Sem 1", time: "1–7 nov", method: "Efectivo", total: 28400, status: "Ejemplo" },
          { folio: "Sem 2", time: "8–10 nov", method: "Tarjeta", total: 19300, status: "Ejemplo" }
        ]
      },
      oct: {
        label: "Octubre 2026",
        series: [["Sem 1", 26200], ["Sem 2", 27100], ["Sem 3", 25800], ["Sem 4", 24900]],
        rows: [
          { folio: "Mes", time: "Octubre", method: "Mixto", total: 104000, status: "Ejemplo" },
          { folio: "Sem 4", time: "22–31 oct", method: "Transferencia", total: 24900, status: "Ejemplo" }
        ]
      }
    }
  }
};
