import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  BriefcaseBusiness,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import {
  getTrabajos,
  createTrabajo,
  updateTrabajo,
  deleteTrabajo,
} from '../lib/trabajos'
import { formatCurrency, formatDateTime } from '../utils/format'

const initialForm = {
  tipo_trabajo: 'Diseño e Impresión de Tarjetas de Presentación',
  tipo_trabajo_manual: '',
  cliente_nombre: '',
  descripcion: '',
  costo: '',
  precio_cobrado: '',
  adelanto: '',
  estado_pago: 'Pendiente',
  estado_trabajo: 'Pendiente',
  fecha_entrega_estimada: '',
  notas: '',
}

function Trabajos() {
  const [trabajos, setTrabajos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [pagoFiltro, setPagoFiltro] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTrabajo, setEditingTrabajo] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadTrabajos = async () => {
    try {
      setLoading(true)
      const data = await getTrabajos()
      setTrabajos(data)
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron cargar los trabajos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrabajos()
  }, [])

  const filteredTrabajos = useMemo(() => {
    return trabajos.filter((trabajo) => {
      const term = search.toLowerCase()

      const matchesSearch =
        trabajo.cliente_nombre.toLowerCase().includes(term) ||
        trabajo.tipo_trabajo.toLowerCase().includes(term) ||
        String(trabajo.tipo_trabajo_manual || '').toLowerCase().includes(term)

      const matchesEstado = estadoFiltro
        ? trabajo.estado_trabajo === estadoFiltro
        : true

      const matchesPago = pagoFiltro
        ? trabajo.estado_pago === pagoFiltro
        : true

      return matchesSearch && matchesEstado && matchesPago
    })
  }, [trabajos, search, estadoFiltro, pagoFiltro])

  const summary = useMemo(() => {
    const totalTrabajos = filteredTrabajos.length
    const totalCobrado = filteredTrabajos.reduce(
      (acc, item) => acc + Number(item.precio_cobrado || 0),
      0
    )
    const totalPendiente = filteredTrabajos.reduce(
      (acc, item) => acc + Number(item.pendiente_por_cobrar || 0),
      0
    )
    const ganancia = filteredTrabajos.reduce(
      (acc, item) => acc + Number(item.ganancia || 0),
      0
    )

    return {
      totalTrabajos,
      totalCobrado,
      totalPendiente,
      ganancia,
    }
  }, [filteredTrabajos])

  const openCreateModal = () => {
    setEditingTrabajo(null)
    setForm(initialForm)
    setIsModalOpen(true)
  }

  const openEditModal = (trabajo) => {
    setEditingTrabajo(trabajo)
    setForm({
      tipo_trabajo: trabajo.tipo_trabajo || '',
      tipo_trabajo_manual: trabajo.tipo_trabajo_manual || '',
      cliente_nombre: trabajo.cliente_nombre || '',
      descripcion: trabajo.descripcion || '',
      costo: trabajo.costo ?? '',
      precio_cobrado: trabajo.precio_cobrado ?? '',
      adelanto: trabajo.adelanto ?? '',
      estado_pago: trabajo.estado_pago || 'Pendiente',
      estado_trabajo: trabajo.estado_trabajo || 'Pendiente',
      fecha_entrega_estimada: trabajo.fecha_entrega_estimada
        ? new Date(trabajo.fecha_entrega_estimada).toISOString().split('T')[0]
        : '',
      notas: trabajo.notas || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTrabajo(null)
    setForm(initialForm)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.cliente_nombre.trim()) {
      toast.error('El nombre del cliente es obligatorio')
      return
    }

    if (!form.tipo_trabajo.trim()) {
      toast.error('El tipo de trabajo es obligatorio')
      return
    }

    if (form.tipo_trabajo === 'Otro' && !form.tipo_trabajo_manual.trim()) {
      toast.error('Debes escribir el tipo de trabajo manual')
      return
    }

    try {
      setSaving(true)

      if (editingTrabajo) {
        await updateTrabajo(editingTrabajo.id, form)
        toast.success('Trabajo actualizado')
      } else {
        await createTrabajo(form)
        toast.success('Trabajo creado')
      }

      await loadTrabajos()
      closeModal()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo guardar el trabajo')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este trabajo?')
    if (!confirmed) return

    try {
      await deleteTrabajo(id)
      toast.success('Trabajo eliminado')
      await loadTrabajos()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo eliminar el trabajo')
    }
  }

  const getEstadoClass = (estado) => {
    const map = {
      Pendiente: 'bg-slate-100 text-slate-700',
      'En proceso': 'bg-blue-50 text-blue-700',
      'Listo para entregar': 'bg-yellow-50 text-yellow-700',
      Entregado: 'bg-emerald-50 text-emerald-700',
      Cancelado: 'bg-red-50 text-red-600',
    }

    return map[estado] || 'bg-slate-100 text-slate-700'
  }

  const getPagoClass = (estado) => {
    return estado === 'Pagado'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-red-50 text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trabajos y Servicios</h2>
          <p className="text-sm text-slate-500">
            Administra trabajos personalizados por cliente
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3b5bdb] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Nuevo trabajo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total trabajos</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {summary.totalTrabajos}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total cobrado</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(summary.totalCobrado)}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total pendiente</p>
          <p className="mt-2 text-3xl font-bold text-red-500">
            {formatCurrency(summary.totalPendiente)}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Ganancia</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {formatCurrency(summary.ganancia)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-4">
        <input
          type="text"
          placeholder="Buscar por cliente o trabajo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        />

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Listo para entregar">Listo para entregar</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <select
          value={pagoFiltro}
          onChange={(e) => setPagoFiltro(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        >
          <option value="">Todos los pagos</option>
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
        </select>

        <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Total filtrado: {filteredTrabajos.length}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="p-6 text-slate-500">Cargando trabajos...</div>
        ) : filteredTrabajos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-slate-500">
            <BriefcaseBusiness size={32} />
            <p>No hay trabajos registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 font-semibold">Cliente</th>
                  <th className="px-4 py-4 font-semibold">Trabajo</th>
                  <th className="px-4 py-4 font-semibold">Costo</th>
                  <th className="px-4 py-4 font-semibold">Cobrado</th>
                  <th className="px-4 py-4 font-semibold">Pendiente</th>
                  <th className="px-4 py-4 font-semibold">Ganancia</th>
                  <th className="px-4 py-4 font-semibold">Pago</th>
                  <th className="px-4 py-4 font-semibold">Estado</th>
                  <th className="px-4 py-4 font-semibold">Fecha</th>
                  <th className="px-4 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredTrabajos.map((trabajo) => (
                  <tr key={trabajo.id} className="border-t border-slate-200">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {trabajo.cliente_nombre}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      <div>
                        <p>{trabajo.tipo_trabajo}</p>
                        {trabajo.tipo_trabajo === 'Otro' && trabajo.tipo_trabajo_manual ? (
                          <p className="text-xs text-slate-500">
                            {trabajo.tipo_trabajo_manual}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {formatCurrency(trabajo.costo)}
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {formatCurrency(trabajo.precio_cobrado)}
                    </td>

                    <td className="px-4 py-4 text-red-500">
                      {formatCurrency(trabajo.pendiente_por_cobrar)}
                    </td>

                    <td className="px-4 py-4 text-emerald-600">
                      {formatCurrency(trabajo.ganancia)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getPagoClass(
                          trabajo.estado_pago
                        )}`}
                      >
                        {trabajo.estado_pago}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoClass(
                          trabajo.estado_trabajo
                        )}`}
                      >
                        {trabajo.estado_trabajo}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {formatDateTime(trabajo.fecha_creacion)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(trabajo)}
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(trabajo.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTrabajo ? 'Editar trabajo' : 'Nuevo trabajo'}
              </h3>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tipo de trabajo
                  </label>
                  <select
                    name="tipo_trabajo"
                    value={form.tipo_trabajo}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option>Diseño e Impresión de Tarjetas de Presentación</option>
                    <option>Diseño e Impresión de Banner</option>
                    <option>Diseño e Impresión de Diplomas</option>
                    <option>Diseño e Impresión de Stickers</option>
                    <option>Reparación de Celulares</option>
                    <option>Otro</option>
                  </select>
                </div>

                {form.tipo_trabajo === 'Otro' ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Especifica el trabajo
                    </label>
                    <input
                      type="text"
                      name="tipo_trabajo_manual"
                      value={form.tipo_trabajo_manual}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cliente
                  </label>
                  <input
                    type="text"
                    name="cliente_nombre"
                    value={form.cliente_nombre}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Costo
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="costo"
                    value={form.costo}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Precio cobrado
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="precio_cobrado"
                    value={form.precio_cobrado}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Adelanto
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="adelanto"
                    value={form.adelanto}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Estado de pago
                  </label>
                  <select
                    name="estado_pago"
                    value={form.estado_pago}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option>Pendiente</option>
                    <option>Pagado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Estado del trabajo
                  </label>
                  <select
                    name="estado_trabajo"
                    value={form.estado_trabajo}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option>Pendiente</option>
                    <option>En proceso</option>
                    <option>Listo para entregar</option>
                    <option>Entregado</option>
                    <option>Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fecha estimada de entrega
                  </label>
                  <input
                    type="date"
                    name="fecha_entrega_estimada"
                    value={form.fecha_entrega_estimada}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notas
                </label>
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[#3b5bdb] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Guardando...'
                    : editingTrabajo
                    ? 'Actualizar trabajo'
                    : 'Crear trabajo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Trabajos