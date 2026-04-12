import { useEffect, useState } from 'react'
import { DollarSign, CalendarDays, AlertTriangle, Receipt } from 'lucide-react'
import { getDashboardMetrics } from '../lib/dashboard'
import { formatCurrency, formatDateTime } from '../utils/format'

function Dashboard() {
  const [data, setData] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    stockBajo: 0,
    totalTransacciones: 0,
    ultimasTransacciones: [],
    topProductos: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')
        const metrics = await getDashboardMetrics()
        setData(metrics)
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar el dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-slate-600">Cargando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 shadow-sm">
        <p className="font-medium text-red-600">{error}</p>
      </div>
    )
  }

  const cards = [
    {
      title: 'Ventas de hoy',
      value: formatCurrency(data.ventasHoy),
      icon: DollarSign,
    },
    {
      title: 'Ventas del mes',
      value: formatCurrency(data.ventasMes),
      icon: CalendarDays,
    },
    {
      title: 'Stock bajo',
      value: data.stockBajo,
      icon: AlertTriangle,
    },
    {
      title: 'Total transacciones',
      value: data.totalTransacciones,
      icon: Receipt,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Resumen general de tu negocio
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {card.title}
                </span>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <Icon size={18} />
                </div>
              </div>

              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Últimas transacciones
          </h3>

          {data.ultimasTransacciones.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay transacciones registradas.
            </p>
          ) : (
            <div className="space-y-3">
              {data.ultimasTransacciones.map((tx) => (
                <div
                  key={tx.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(tx.total)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {tx.payment_method || 'Sin método'}
                      </p>
                    </div>

                    <p className="text-sm text-slate-500">
                      {formatDateTime(tx.transaction_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Top 5 productos más vendidos
          </h3>

          {data.topProductos.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay datos de productos vendidos.
            </p>
          ) : (
            <div className="space-y-3">
              {data.topProductos.map((item, index) => (
                <div
                  key={`${item.nombre}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.nombre}</p>
                    <p className="text-sm text-slate-500">
                      Cantidad vendida
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {item.cantidad}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard