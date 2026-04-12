import { supabase } from './supabase'

export async function getDashboardMetrics() {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  const [
    transactionsTodayRes,
    transactionsMonthRes,
    allTransactionsRes,
    productsRes,
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', startOfToday)
      .order('transaction_date', { ascending: false }),

    supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', startOfMonth)
      .order('transaction_date', { ascending: false }),

    supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false }),

    supabase
      .from('products')
      .select('*')
      .order('nombre', { ascending: true }),
  ])

  if (transactionsTodayRes.error) throw transactionsTodayRes.error
  if (transactionsMonthRes.error) throw transactionsMonthRes.error
  if (allTransactionsRes.error) throw allTransactionsRes.error
  if (productsRes.error) throw productsRes.error

  const transactionsToday = transactionsTodayRes.data || []
  const transactionsMonth = transactionsMonthRes.data || []
  const allTransactions = allTransactionsRes.data || []
  const products = productsRes.data || []

  const ventasHoy = transactionsToday.reduce((acc, item) => acc + Number(item.total || 0), 0)
  const ventasMes = transactionsMonth.reduce((acc, item) => acc + Number(item.total || 0), 0)
  const totalTransacciones = allTransactions.length
  const stockBajo = products.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 10).length

  const ultimasTransacciones = allTransactions.slice(0, 5)

  const salesMap = {}

  allTransactions.forEach((tx) => {
    let items = tx.items_json

    if (typeof items === 'string') {
      try {
        items = JSON.parse(items)
      } catch {
        items = []
      }
    }

    if (!Array.isArray(items)) return

    items.forEach((item) => {
      const nombre = item.nombre || item.name || 'Producto'
      const cantidad = Number(item.cantidad || item.quantity || 0)

      if (!salesMap[nombre]) {
        salesMap[nombre] = 0
      }

      salesMap[nombre] += cantidad
    })
  })

  const topProductos = Object.entries(salesMap)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  return {
    ventasHoy,
    ventasMes,
    stockBajo,
    totalTransacciones,
    ultimasTransacciones,
    topProductos,
  }
}