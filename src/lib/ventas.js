import { supabase } from './supabase'

function getDateRange(period, customDates = {}) {
  const now = new Date()
  const start = new Date(now)
  let end = new Date(now)

  if (period === 'hoy') {
    start.setHours(0, 0, 0, 0)
  } else if (period === 'semana') {
    const day = start.getDay()
    const diff = day === 0 ? 6 : day - 1
    start.setDate(start.getDate() - diff)
    start.setHours(0, 0, 0, 0)
  } else if (period === 'mes') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  } else if (period === 'año') {
    start.setMonth(0, 1)
    start.setHours(0, 0, 0, 0)
  } else if (period === 'personalizado') {
    return {
      start: customDates.startDate ? new Date(customDates.startDate) : null,
      end: customDates.endDate ? new Date(customDates.endDate + 'T23:59:59') : null,
    }
  } else {
    return { start: null, end: null }
  }

  return { start, end }
}

export async function getVentas(filters = {}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })

  const { start, end } = getDateRange(filters.period, filters)

  if (start) {
    query = query.gte('transaction_date', start.toISOString())
  }

  if (end) {
    query = query.lte('transaction_date', end.toISOString())
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'todos') {
    query = query.eq('payment_method', filters.paymentMethod)
  }

  const { data, error } = await query

  if (error) throw error

  let ventas = data || []

  if (filters.search?.trim()) {
    const term = filters.search.toLowerCase()

    ventas = ventas.filter((venta) => {
      const items = Array.isArray(venta.items_json) ? venta.items_json : []
      return items.some((item) =>
        String(item.nombre || '').toLowerCase().includes(term)
      )
    })
  }

  if (filters.sortBy === 'monto_desc') {
    ventas.sort((a, b) => Number(b.total) - Number(a.total))
  } else if (filters.sortBy === 'monto_asc') {
    ventas.sort((a, b) => Number(a.total) - Number(b.total))
  } else if (filters.sortBy === 'fecha_asc') {
    ventas.sort(
      (a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)
    )
  } else {
    ventas.sort(
      (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
    )
  }

  return ventas
}

export function getVentasSummary(ventas) {
  const ingresos = ventas.reduce((acc, item) => acc + Number(item.total || 0), 0)
  const costoInvertido = ventas.reduce(
    (acc, item) => acc + Number(item.costo_total || 0),
    0
  )
  const gananciaNeta = ventas.reduce(
    (acc, item) => acc + Number(item.ganancia || 0),
    0
  )
  const descuentos = ventas.reduce(
    (acc, item) => acc + Number(item.discount || 0),
    0
  )

  const ventasPorMetodo = ventas.reduce((acc, item) => {
    const key = item.payment_method || 'Sin método'
    acc[key] = (acc[key] || 0) + Number(item.total || 0)
    return acc
  }, {})

  const topMap = {}

  ventas.forEach((venta) => {
    const items = Array.isArray(venta.items_json) ? venta.items_json : []

    items.forEach((item) => {
      const nombre = item.nombre || 'Producto'
      const cantidad = Number(item.cantidad || 0)
      topMap[nombre] = (topMap[nombre] || 0) + cantidad
    })
  })

  const topProductos = Object.entries(topMap)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  return {
    ingresos,
    costoInvertido,
    gananciaNeta,
    descuentos,
    ventasPorMetodo,
    topProductos,
  }
}