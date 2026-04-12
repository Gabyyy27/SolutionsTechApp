import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, DollarSign, Wallet, TrendingUp, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { getVentas, getVentasSummary } from '../lib/ventas'
import { formatCurrency, formatDateTime } from '../utils/format'

function Ventas() {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    period: 'mes',
    paymentMethod: 'todos',
    search: '',
    sortBy: 'fecha_desc',
    startDate: '',
    endDate: '',
  })

  const loadVentas = async () => {
    try {
      setLoading(true)
      const data = await getVentas(filters)
      setVentas(data)
    } catch (error) {
      console.error(error)
      toast.error('No se pudo cargar el historial de ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVentas()
  }, [filters.period, filters.paymentMethod, filters.sortBy])

  const summary = useMemo(() => getVentasSummary(ventas), [ventas])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = async () => {
    await loadVentas()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historial de Ventas</h2>
          <p className="text-sm text-slate-500">
            Revisa transacciones, ingresos y rendimiento del período
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Printer size={18} />
          Exportar / Imprimir
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:grid-cols-5">
        <select
          name="period"
          value={filters.period}
          onChange={handleFilterChange}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        >
          <option value="hoy">Hoy</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
          <option value="año">Año</option>
          <option value="todo">Todo</option>
          <option value="personalizado">Personalizado</option>
        </select>

        <select
          name="paymentMethod"
          value={filters.paymentMethod}
          onChange={handleFilterChange}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        >
          <option value="todos">Todos los métodos</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>

        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        >
          <option value="fecha_desc">Fecha más reciente</option>
          <option value="fecha_asc">Fecha más antigua</option>
          <option value="monto_desc">Monto mayor</option>
          <option value="monto_asc">Monto menor</option>
        </select>

        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Buscar por producto..."
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        />

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-2xl bg-[#3b5bdb] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Buscar
        </button>

        {filters.period === 'personalizado' ? (
          <>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Ingresos',
            value: formatCurrency(summary.ingresos),
            icon: DollarSign,
            color: 'text-[#3b5bdb]',
            bg: 'bg-blue-50',
          },
          {
            label: 'Costo invertido',
            value: formatCurrency(summary.costoInvertido),
            icon: Wallet,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            label: 'Ganancia neta',
            value: formatCurrency(summary.gananciaNeta),
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Descuentos',
            value: formatCurrency(summary.descuentos),
            icon: CalendarDays,
            color: 'text-red-500',
            bg: 'bg-red-50',
          },
        ].map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div className={`rounded-2xl p-3 ${card.bg} ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="p-6 text-slate-500">Cargando ventas...</div>
          ) : ventas.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No hay ventas registradas en este período.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Fecha</th>
                    <th className="px-4 py-4 font-semibold">Productos</th>
                    <th className="px-4 py-4 font-semibold">Costo</th>
                    <th className="px-4 py-4 font-semibold">Descuento</th>
                    <th className="px-4 py-4 font-semibold">Total</th>
                    <th className="px-4 py-4 font-semibold">Ganancia</th>
                    <th className="px-4 py-4 font-semibold">Pago</th>
                  </tr>
                </thead>

                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="border-t border-slate-200">
                      <td className="px-4 py-4 text-slate-600">
                        {formatDateTime(venta.transaction_date)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {(Array.isArray(venta.items_json) ? venta.items_json : []).map(
                            (item, index) => (
                              <p key={index} className="text-slate-700">
                                {item.nombre} x{item.cantidad}
                              </p>
                            )
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatCurrency(venta.costo_total)}
                      </td>

                      <td className="px-4 py-4 text-red-500">
                        -{formatCurrency(venta.discount)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {formatCurrency(venta.total)}
                      </td>

                      <td className="px-4 py-4 text-emerald-600">
                        {formatCurrency(venta.ganancia)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {venta.payment_method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Ventas por método
            </h3>

            <div className="space-y-3">
              {Object.keys(summary.ventasPorMetodo).length === 0 ? (
                <p className="text-sm text-slate-500">Sin datos disponibles.</p>
              ) : (
                Object.entries(summary.ventasPorMetodo).map(([method, total]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <span className="font-medium text-slate-700">{method}</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Top productos
            </h3>

            <div className="space-y-3">
              {summary.topProductos.length === 0 ? (
                <p className="text-sm text-slate-500">Sin datos disponibles.</p>
              ) : (
                summary.topProductos.map((item, index) => (
                  <div
                    key={`${item.nombre}-${index}`}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{item.nombre}</p>
                      <p className="text-xs text-slate-500">Cantidad vendida</p>
                    </div>
                    <span className="rounded-full bg-[#3b5bdb] px-3 py-1 text-xs font-semibold text-white">
                      {item.cantidad}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Ventas