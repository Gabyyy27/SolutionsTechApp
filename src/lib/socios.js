import { supabase } from './supabase'

export async function getPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('fecha_ingreso', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createPartner(partner) {
  const payload = {
    nombre: partner.nombre,
    rol: partner.rol,
    aportacion_capital: Number(partner.aportacion_capital || 0),
    notas: partner.notas || '',
    fecha_ingreso: partner.fecha_ingreso || new Date().toISOString(),
    retirado_ganancias: Number(partner.retirado_ganancias || 0),
  }

  const { data, error } = await supabase
    .from('partners')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePartner(id, partner) {
  const payload = {
    nombre: partner.nombre,
    rol: partner.rol,
    aportacion_capital: Number(partner.aportacion_capital || 0),
    notas: partner.notas || '',
    fecha_ingreso: partner.fecha_ingreso,
    retirado_ganancias: Number(partner.retirado_ganancias || 0),
  }

  const { data, error } = await supabase
    .from('partners')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePartner(id) {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getGastos() {
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .order('fecha', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createGasto(gasto) {
  const payload = {
    descripcion: gasto.descripcion,
    monto: Number(gasto.monto || 0),
    categoria: gasto.categoria || '',
    fondo: gasto.fondo,
    socio_id: gasto.socio_id || null,
    fecha: gasto.fecha || new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('gastos')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPartnerMovements() {
  const { data, error } = await supabase
    .from('partner_movements')
    .select('*')
    .order('fecha', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createPartnerMovement(movement) {
  const payload = {
    socio_id: movement.socio_id || null,
    tipo: movement.tipo,
    descripcion: movement.descripcion || '',
    monto: Number(movement.monto || 0),
    fondo: movement.fondo,
    fecha: movement.fecha || new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('partner_movements')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getFinancialSources() {
  const [transactionsRes, trabajosRes, partnersRes, gastosRes, movementsRes] =
    await Promise.all([
      supabase.from('transactions').select('*'),
      supabase.from('trabajos').select('*'),
      supabase.from('partners').select('*'),
      supabase.from('gastos').select('*'),
      supabase.from('partner_movements').select('*'),
    ])

  if (transactionsRes.error) throw transactionsRes.error
  if (trabajosRes.error) throw trabajosRes.error
  if (partnersRes.error) throw partnersRes.error
  if (gastosRes.error) throw gastosRes.error
  if (movementsRes.error) throw movementsRes.error

  return {
    transactions: transactionsRes.data || [],
    trabajos: trabajosRes.data || [],
    partners: partnersRes.data || [],
    gastos: gastosRes.data || [],
    movements: movementsRes.data || [],
  }
}

export function calculateSociosData({
  transactions,
  trabajos,
  partners,
  gastos,
  movements,
}) {
  const gananciasVentas = transactions.reduce(
    (acc, item) => acc + Number(item.ganancia || 0),
    0
  )

  const gananciasTrabajos = trabajos.reduce(
    (acc, item) => acc + Number(item.ganancia || 0),
    0
  )

  const gananciaNetaTotal = gananciasVentas + gananciasTrabajos

  const fondoReinversionBruto = gananciaNetaTotal * 0.6
  const fondoGananciasBruto = gananciaNetaTotal * 0.4
  const fondoAportacionesBruto = partners.reduce(
    (acc, item) => acc + Number(item.aportacion_capital || 0),
    0
  )

  const gastosReinversion = gastos
    .filter((g) => g.fondo === 'reinversion')
    .reduce((acc, g) => acc + Number(g.monto || 0), 0)

  const gastosAportaciones = gastos
    .filter((g) => g.fondo === 'aportaciones')
    .reduce((acc, g) => acc + Number(g.monto || 0), 0)

  const gastosGanancias = gastos
    .filter((g) => g.fondo === 'ganancias')
    .reduce((acc, g) => acc + Number(g.monto || 0), 0)

  const fondoReinversion = fondoReinversionBruto - gastosReinversion
  const fondoAportaciones = fondoAportacionesBruto - gastosAportaciones
  const fondoGanancias = fondoGananciasBruto - gastosGanancias

  const partnerRows = partners.map((partner) => {
    const fechaIngreso = new Date(partner.fecha_ingreso)

    const gananciasDesdeIngresoVentas = transactions
      .filter((tx) => new Date(tx.transaction_date) >= fechaIngreso)
      .reduce((acc, tx) => acc + Number(tx.ganancia || 0), 0)

    const gananciasDesdeIngresoTrabajos = trabajos
      .filter((tr) => new Date(tr.fecha_creacion) >= fechaIngreso)
      .reduce((acc, tr) => acc + Number(tr.ganancia || 0), 0)

    const gananciasDesdeIngreso =
      gananciasDesdeIngresoVentas + gananciasDesdeIngresoTrabajos

    const fondoGananciasDesdeIngreso = gananciasDesdeIngreso * 0.4
    const reinversionDesdeIngreso = gananciasDesdeIngreso * 0.6

    return {
      ...partner,
      gananciasDesdeIngreso,
      fondoGananciasDesdeIngreso,
      reinversionDesdeIngreso,
    }
  })

  const operativistas = partnerRows.filter((p) => p.rol === 'operativista')
  const inversionistas = partnerRows.filter((p) => p.rol === 'inversionista')

  const mitadOperativistas = 0.5
  const mitadInversionistas = 0.5

  const totalCapitalInversionistas = inversionistas.reduce(
    (acc, item) => acc + Number(item.aportacion_capital || 0),
    0
  )

  const sociosCalculados = partnerRows.map((partner) => {
    let porcentajeFinal = 0

    if (partner.rol === 'operativista') {
      porcentajeFinal =
        operativistas.length > 0 ? mitadOperativistas / operativistas.length : 0
    } else {
      const porcentajeCapitalInv =
        totalCapitalInversionistas > 0
          ? Number(partner.aportacion_capital || 0) / totalCapitalInversionistas
          : 0

      porcentajeFinal = porcentajeCapitalInv * mitadInversionistas
    }

    const porcentajeCapitalGlobal =
      fondoAportacionesBruto > 0
        ? (Number(partner.aportacion_capital || 0) / fondoAportacionesBruto) * 100
        : 0

    const parteGanancias = partner.fondoGananciasDesdeIngreso * porcentajeFinal

    const retirosRegistrados = movements
      .filter((m) => m.socio_id === partner.id && m.fondo === 'ganancias')
      .reduce((acc, m) => acc + Number(m.monto || 0), 0)

    const retiradoBase = Number(partner.retirado_ganancias || 0)
    const retiradoTotal = retiradoBase + retirosRegistrados
    const saldoPorCobrar = parteGanancias - retiradoTotal

    return {
      ...partner,
      porcentajeCapital: porcentajeCapitalGlobal,
      porcentajeFinal: porcentajeFinal * 100,
      bonoOperativista:
        partner.rol === 'operativista' ? mitadOperativistas * 100 : 0,
      parteGanancias,
      reinversionAsignada: partner.reinversionDesdeIngreso * porcentajeFinal,
      retiradoTotal,
      saldoPorCobrar,
    }
  })

  return {
    gananciaNetaTotal,
    fondoReinversion,
    fondoAportaciones,
    fondoGanancias,
    sociosCalculados,
    totalOperativistas: operativistas.length,
    totalInversionistas: inversionistas.length,
  }
}