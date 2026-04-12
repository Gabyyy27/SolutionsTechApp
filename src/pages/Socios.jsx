import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Wallet,
  Users,
  Landmark,
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getFinancialSources,
  createGasto,
  createPartnerMovement,
  calculateSociosData,
} from '../lib/socios'
import { formatCurrency } from '../utils/format'

const initialPartnerForm = {
  nombre: '',
  rol: 'inversionista',
  aportacion_capital: '',
  notas: '',
  fecha_ingreso: new Date().toISOString().split('T')[0],
}

const initialGastoForm = {
  descripcion: '',
  monto: '',
  categoria: '',
  fondo: 'reinversion',
  socio_id: '',
  fecha: new Date().toISOString().split('T')[0],
}

function Socios() {
  const [partners, setPartners] = useState([])
  const [financialData, setFinancialData] = useState(null)
  const [movements, setMovements] = useState([])
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [partnerModalOpen, setPartnerModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null)
  const [partnerForm, setPartnerForm] = useState(initialPartnerForm)

  const [gastoModalOpen, setGastoModalOpen] = useState(false)
  const [gastoForm, setGastoForm] = useState(initialGastoForm)

  const loadData = async () => {
    try {
      setLoading(true)

      const [partnersData, financialSources] = await Promise.all([
        getPartners(),
        getFinancialSources(),
      ])

      setPartners(partnersData)
      setMovements(financialSources.movements || [])
      setGastos(financialSources.gastos || [])
      setFinancialData(calculateSociosData(financialSources))
    } catch (error) {
      console.error(error)
      toast.error('No se pudo cargar la información de socios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const socios = useMemo(() => {
    return financialData?.sociosCalculados || []
  }, [financialData])

  const openCreatePartner = () => {
    setEditingPartner(null)
    setPartnerForm(initialPartnerForm)
    setPartnerModalOpen(true)
  }

  const openEditPartner = (partner) => {
    setEditingPartner(partner)
    setPartnerForm({
      nombre: partner.nombre || '',
      rol: partner.rol || 'inversionista',
      aportacion_capital: partner.aportacion_capital ?? '',
      notas: partner.notas || '',
      fecha_ingreso: partner.fecha_ingreso
        ? new Date(partner.fecha_ingreso).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    })
    setPartnerModalOpen(true)
  }

  const closePartnerModal = () => {
    setPartnerModalOpen(false)
    setEditingPartner(null)
    setPartnerForm(initialPartnerForm)
  }

  const handlePartnerChange = (e) => {
    const { name, value } = e.target
    setPartnerForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePartnerSubmit = async (e) => {
    e.preventDefault()

    if (!partnerForm.nombre.trim()) {
      toast.error('El nombre del socio es obligatorio')
      return
    }

    try {
      setSaving(true)

      if (editingPartner) {
        await updatePartner(editingPartner.id, partnerForm)
        toast.success('Socio actualizado')
      } else {
        await createPartner(partnerForm)
        toast.success('Socio creado')
      }

      await loadData()
      closePartnerModal()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo guardar el socio')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePartner = async (id) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este socio?')
    if (!confirmed) return

    try {
      await deletePartner(id)
      toast.success('Socio eliminado')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo eliminar el socio')
    }
  }

  const handleGastoChange = (e) => {
    const { name, value } = e.target
    setGastoForm((prev) => ({ ...prev, [name]: value }))
  }

  const closeGastoModal = () => {
    setGastoModalOpen(false)
    setGastoForm(initialGastoForm)
  }

  const getAvailableFund = (fondo, socioId = '') => {
    if (!financialData) return 0

    if (fondo === 'reinversion') return Number(financialData.fondoReinversion || 0)
    if (fondo === 'aportaciones') return Number(financialData.fondoAportaciones || 0)

    if (fondo === 'ganancias' && socioId) {
      const socio = socios.find((item) => item.id === socioId)
      return Number(socio?.saldoPorCobrar || 0)
    }

    if (fondo === 'ganancias') return Number(financialData.fondoGanancias || 0)

    return 0
  }

  const handleGastoSubmit = async (e) => {
    e.preventDefault()

    if (!gastoForm.descripcion.trim()) {
      toast.error('La descripción es obligatoria')
      return
    }

    const monto = Number(gastoForm.monto || 0)

    if (monto <= 0) {
      toast.error('El monto debe ser mayor que 0')
      return
    }

    const available = getAvailableFund(gastoForm.fondo, gastoForm.socio_id)

    if (monto > available) {
      toast.error('No puedes retirar más de lo disponible')
      return
    }

    try {
      setSaving(true)

      await createGasto(gastoForm)

      if (gastoForm.fondo === 'ganancias' && gastoForm.socio_id) {
        await createPartnerMovement({
          socio_id: gastoForm.socio_id,
          tipo: 'retiro',
          descripcion: gastoForm.descripcion,
          monto,
          fondo: gastoForm.fondo,
          fecha: gastoForm.fecha,
        })
      }

      toast.success('Movimiento registrado')
      await loadData()
      closeGastoModal()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo registrar el movimiento')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !financialData) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-500">Cargando socios e inversiones...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Socios e Inversiones</h2>
          <p className="text-sm text-slate-500">
            50% del fondo de ganancias para operativista(s) y 50% para inversionistas por capital
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setGastoModalOpen(true)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Registrar gasto / retiro
          </button>

          <button
            type="button"
            onClick={openCreatePartner}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3b5bdb] px-4 py-3 text-sm font-semibold text-white"
          >
            <Plus size={18} />
            Nuevo socio
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-blue-50 p-4 text-sm text-blue-800 ring-1 ring-blue-100">
        Operativistas: {financialData.totalOperativistas} · Inversionistas: {financialData.totalInversionistas}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Fondo Reinversión',
            value: financialData.fondoReinversion,
            icon: PiggyBank,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            title: 'Fondo Aportaciones',
            value: financialData.fondoAportaciones,
            icon: Landmark,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            title: 'Ganancias Socios',
            value: financialData.fondoGanancias,
            icon: Wallet,
            color: 'text-[#3b5bdb]',
            bg: 'bg-blue-50',
          },
          {
            title: 'Total socios',
            value: socios.length,
            icon: Users,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
            plain: true,
          },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {card.plain ? card.value : formatCurrency(card.value)}
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {socios.map((socio) => (
          <div
            key={socio.id}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{socio.nombre}</h3>
                <p className="mt-1 capitalize text-slate-500">{socio.rol}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditPartner(socio)}
                  className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePartner(socio.id)}
                  className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Capital aportado</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrency(socio.aportacion_capital)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Porcentaje por capital</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {socio.porcentajeCapital.toFixed(2)}%
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Porcentaje final</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {socio.porcentajeFinal.toFixed(2)}%
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Parte de ganancias</p>
                <p className="mt-1 text-lg font-bold text-[#3b5bdb]">
                  {formatCurrency(socio.parteGanancias)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Reinversión asignada</p>
                <p className="mt-1 text-lg font-bold text-emerald-600">
                  {formatCurrency(socio.reinversionAsignada)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Retirado</p>
                <p className="mt-1 text-lg font-bold text-orange-600">
                  {formatCurrency(socio.retiradoTotal)}
                </p>
              </div>

              {socio.rol === 'operativista' ? (
                <div className="rounded-2xl bg-blue-50 p-4 sm:col-span-2">
                  <p className="text-xs text-slate-500">Participación por rol operativista</p>
                  <p className="mt-1 text-lg font-bold text-blue-700">
                    {socio.bonoOperativista.toFixed(2)}% del fondo de socios
                  </p>
                </div>
              ) : null}

              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">Saldo por cobrar</p>
                <p className={`mt-1 text-xl font-bold ${socio.saldoPorCobrar <= 0 ? 'text-slate-500' : 'text-emerald-600'}`}>
                  {formatCurrency(socio.saldoPorCobrar)}
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Fecha de ingreso: {new Date(socio.fecha_ingreso).toLocaleDateString('es-HN')}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Historial de retiros y movimientos</h3>
          <p className="mt-1 text-sm text-slate-500">
            Movimientos registrados por socios
          </p>

          <div className="mt-5 space-y-3">
            {movements.length === 0 ? (
              <p className="text-sm text-slate-500">No hay movimientos registrados.</p>
            ) : (
              movements.map((movement) => {
                const socio = socios.find((item) => item.id === movement.socio_id)

                return (
                  <div
                    key={movement.id}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {movement.descripcion || 'Movimiento'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {socio?.nombre || 'Sin socio'} · {movement.tipo} · {movement.fondo}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-orange-600">
                          {formatCurrency(movement.monto)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(movement.fecha).toLocaleDateString('es-HN')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Historial de gastos por fondo</h3>
          <p className="mt-1 text-sm text-slate-500">
            Salidas registradas en reinversión, aportaciones o ganancias
          </p>

          <div className="mt-5 space-y-3">
            {gastos.length === 0 ? (
              <p className="text-sm text-slate-500">No hay gastos registrados.</p>
            ) : (
              gastos.map((gasto) => {
                const socio = socios.find((item) => item.id === gasto.socio_id)

                return (
                  <div
                    key={gasto.id}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {gasto.descripcion}
                        </p>
                        <p className="text-sm text-slate-500">
                          {gasto.fondo} {gasto.categoria ? `· ${gasto.categoria}` : ''}
                          {socio ? ` · ${socio.nombre}` : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {formatCurrency(gasto.monto)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(gasto.fecha).toLocaleDateString('es-HN')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {partnerModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPartner ? 'Editar socio' : 'Nuevo socio'}
              </h3>
              <button
                type="button"
                onClick={closePartnerModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={partnerForm.nombre}
                    onChange={handlePartnerChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Rol
                  </label>
                  <select
                    name="rol"
                    value={partnerForm.rol}
                    onChange={handlePartnerChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option value="inversionista">Inversionista</option>
                    <option value="operativista">Operativista</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Aportación de capital
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="aportacion_capital"
                    value={partnerForm.aportacion_capital}
                    onChange={handlePartnerChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fecha de ingreso
                  </label>
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={partnerForm.fecha_ingreso}
                    onChange={handlePartnerChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notas
                </label>
                <textarea
                  name="notas"
                  rows="3"
                  value={partnerForm.notas}
                  onChange={handlePartnerChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closePartnerModal}
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
                    : editingPartner
                    ? 'Actualizar socio'
                    : 'Crear socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {gastoModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Registrar gasto / retiro</h3>
              <button
                type="button"
                onClick={closeGastoModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGastoSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={gastoForm.descripcion}
                    onChange={handleGastoChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Monto
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="monto"
                    value={gastoForm.monto}
                    onChange={handleGastoChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Categoría
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    value={gastoForm.categoria}
                    onChange={handleGastoChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fondo
                  </label>
                  <select
                    name="fondo"
                    value={gastoForm.fondo}
                    onChange={handleGastoChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option value="reinversion">Reinversión</option>
                    <option value="aportaciones">Aportaciones</option>
                    <option value="ganancias">Ganancias</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Socio (si aplica)
                  </label>
                  <select
                    name="socio_id"
                    value={gastoForm.socio_id}
                    onChange={handleGastoChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option value="">Sin socio</option>
                    {socios.map((socio) => (
                      <option key={socio.id} value={socio.id}>
                        {socio.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={gastoForm.fecha}
                    onChange={handleGastoChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Disponible en este fondo:{' '}
                <span className="font-bold text-slate-900">
                  {formatCurrency(getAvailableFund(gastoForm.fondo, gastoForm.socio_id))}
                </span>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeGastoModal}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[#3b5bdb] px-5 py-3 text-sm font-semibold text-white"
                >
                  {saving ? 'Guardando...' : 'Registrar movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Socios