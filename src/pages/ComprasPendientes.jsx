import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, ShoppingBag, CheckCircle2, Clock3 } from 'lucide-react'
import {
  getComprasPendientes,
  createCompra,
  updateCompra,
  updateCompraEstado,
  deleteCompra,
} from '../lib/compras'
import { formatDateTime } from '../utils/format'

const initialForm = {
  producto_nombre: '',
  tienda_nombre: '',
  tipo_compra: '',
  estado: 'Pendiente',
}

function ComprasPendientes() {
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCompra, setEditingCompra] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadCompras = async () => {
    try {
      setLoading(true)
      const data = await getComprasPendientes()
      setCompras(data)
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron cargar las compras pendientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompras()
  }, [])

  const filteredCompras = useMemo(() => {
    return compras.filter((item) => {
      const term = search.toLowerCase()

      const matchesSearch =
        item.producto_nombre.toLowerCase().includes(term) ||
        item.tienda_nombre.toLowerCase().includes(term) ||
        item.tipo_compra.toLowerCase().includes(term)

      const matchesEstado = estadoFiltro ? item.estado === estadoFiltro : true

      return matchesSearch && matchesEstado
    })
  }, [compras, search, estadoFiltro])

  const openCreateModal = () => {
    setEditingCompra(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEditModal = (compra) => {
    setEditingCompra(compra)
    setForm({
      producto_nombre: compra.producto_nombre || '',
      tienda_nombre: compra.tienda_nombre || '',
      tipo_compra: compra.tipo_compra || '',
      estado: compra.estado || 'Pendiente',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setEditingCompra(null)
    setForm(initialForm)
    setModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.producto_nombre.trim()) {
      toast.error('El nombre del producto es obligatorio')
      return
    }

    if (!form.tienda_nombre.trim()) {
      toast.error('La tienda es obligatoria')
      return
    }

    if (!form.tipo_compra.trim()) {
      toast.error('El tipo de compra es obligatorio')
      return
    }

    try {
      setSaving(true)

      if (editingCompra) {
        await updateCompra(editingCompra.id, {
          ...form,
          fecha_compra: editingCompra.fecha_compra,
        })
        toast.success('Compra actualizada')
      } else {
        await createCompra(form)
        toast.success('Compra registrada')
      }

      await loadCompras()
      closeModal()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo guardar la compra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este registro?')
    if (!confirmed) return

    try {
      await deleteCompra(id)
      toast.success('Registro eliminado')
      await loadCompras()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo eliminar')
    }
  }

  const handleEstadoRapido = async (compra) => {
    const nextEstado = compra.estado === 'Pendiente' ? 'Comprado' : 'Pendiente'

    try {
      await updateCompraEstado(compra.id, nextEstado)
      toast.success(`Estado actualizado a ${nextEstado}`)
      await loadCompras()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo actualizar el estado')
    }
  }

  const getEstadoClass = (estado) => {
  switch (estado) {
    case 'Comprado':
      return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
    case 'Pendiente':
      return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Compras Pendientes</h2>
          <p className="text-sm text-slate-500">
            Organiza productos o repuestos pendientes por comprar
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3b5bdb] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Nueva compra
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-3">
        <input
          type="text"
          placeholder="Buscar producto, tienda o tipo..."
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
          <option value="Comprado">Comprado</option>
        </select>

        <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Total: {filteredCompras.length} registro(s)
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="p-6 text-slate-500">Cargando compras...</div>
        ) : filteredCompras.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-slate-500">
            <ShoppingBag size={32} />
            <p>No hay compras pendientes registradas.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Producto</th>
                    <th className="px-4 py-4 font-semibold">Tienda</th>
                    <th className="px-4 py-4 font-semibold">Tipo</th>
                    <th className="px-4 py-4 font-semibold">Estado</th>
                    <th className="px-4 py-4 font-semibold">Creado</th>
                    <th className="px-4 py-4 font-semibold">Comprado</th>
                    <th className="px-4 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCompras.map((compra) => (
                    <tr key={compra.id} className="border-t border-slate-200">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {compra.producto_nombre}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {compra.tienda_nombre}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {compra.tipo_compra}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoClass(compra.estado)}`}>
                          {compra.estado}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDateTime(compra.fecha_creacion)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {compra.fecha_compra ? formatDateTime(compra.fecha_compra) : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
  onClick={() => handleEstadoRapido(compra)}
  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition ${
    compra.estado === 'Pendiente'
      ? 'bg-amber-500 hover:bg-amber-600'
      : 'bg-emerald-500 hover:bg-emerald-600'
  }`}
>
  {compra.estado === 'Pendiente' ? (
    <>
      <Clock3 size={16} />
      
    </>
  ) : (
    <>
      <CheckCircle2 size={16} />
      
    </>
  )}
</button>

                          <button
                            onClick={() => openEditModal(compra)}
                            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(compra.id)}
                            className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
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

            <div className="space-y-4 p-4 md:hidden">
              {filteredCompras.map((compra) => (
                <div
                  key={compra.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{compra.producto_nombre}</h3>
                      <p className="text-sm text-slate-500">{compra.tienda_nombre}</p>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoClass(compra.estado)}`}>
                      {compra.estado}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium">Tipo:</span> {compra.tipo_compra}</p>
                    <p><span className="font-medium">Creado:</span> {formatDateTime(compra.fecha_creacion)}</p>
                    <p>
                      <span className="font-medium">Comprado:</span>{' '}
                      {compra.fecha_compra ? formatDateTime(compra.fecha_compra) : '—'}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                    onClick={() => handleEstadoRapido(compra)}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition ${
                    compra.estado === 'Pendiente'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}>
                    {compra.estado === 'Pendiente' ? 'Marcar comprado' : 'Marcar pendiente'}
                    </button>

                    <button
                      onClick={() => openEditModal(compra)}
                      className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-200"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(compra.id)}
                      className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCompra ? 'Editar compra' : 'Nueva compra pendiente'}
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
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    name="producto_nombre"
                    value={form.producto_nombre}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tienda
                  </label>
                  <input
                    type="text"
                    name="tienda_nombre"
                    value={form.tienda_nombre}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tipo de compra
                  </label>
                  <input
                    type="text"
                    name="tipo_compra"
                    value={form.tipo_compra}
                    onChange={handleChange}
                    placeholder="Repuesto, accesorio, herramienta..."
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Comprado">Comprado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[#3b5bdb] px-5 py-3 text-sm font-semibold text-white"
                >
                  {saving
                    ? 'Guardando...'
                    : editingCompra
                    ? 'Actualizar compra'
                    : 'Crear compra'}
                    
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ComprasPendientes