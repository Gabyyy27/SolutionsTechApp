import { supabase } from './supabase'

export async function getTrabajos() {
  const { data, error } = await supabase
    .from('trabajos')
    .select('*')
    .order('fecha_creacion', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTrabajo(trabajo) {
  const costo = Number(trabajo.costo || 0)
  const precioCobrado = Number(trabajo.precio_cobrado || 0)
  const adelanto = Number(trabajo.adelanto || 0)

  const pendiente =
    trabajo.estado_pago === 'Pagado'
      ? 0
      : Math.max(precioCobrado - adelanto, 0)

  const payload = {
    tipo_trabajo: trabajo.tipo_trabajo,
    tipo_trabajo_manual: trabajo.tipo_trabajo_manual || '',
    cliente_nombre: trabajo.cliente_nombre,
    descripcion: trabajo.descripcion || '',
    costo,
    precio_cobrado: precioCobrado,
    adelanto,
    pendiente_por_cobrar: pendiente,
    estado_pago: trabajo.estado_pago,
    estado_trabajo: trabajo.estado_trabajo,
    fecha_entrega_estimada: trabajo.fecha_entrega_estimada || null,
    notas: trabajo.notas || '',
    ganancia: precioCobrado - costo,
  }

  const { data, error } = await supabase
    .from('trabajos')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTrabajo(id, trabajo) {
  const costo = Number(trabajo.costo || 0)
  const precioCobrado = Number(trabajo.precio_cobrado || 0)
  const adelanto = Number(trabajo.adelanto || 0)

  const pendiente =
    trabajo.estado_pago === 'Pagado'
      ? 0
      : Math.max(precioCobrado - adelanto, 0)

  const payload = {
    tipo_trabajo: trabajo.tipo_trabajo,
    tipo_trabajo_manual: trabajo.tipo_trabajo_manual || '',
    cliente_nombre: trabajo.cliente_nombre,
    descripcion: trabajo.descripcion || '',
    costo,
    precio_cobrado: precioCobrado,
    adelanto,
    pendiente_por_cobrar: pendiente,
    estado_pago: trabajo.estado_pago,
    estado_trabajo: trabajo.estado_trabajo,
    fecha_entrega_estimada: trabajo.fecha_entrega_estimada || null,
    notas: trabajo.notas || '',
    ganancia: precioCobrado - costo,
  }

  const { data, error } = await supabase
    .from('trabajos')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTrabajo(id) {
  const { error } = await supabase
    .from('trabajos')
    .delete()
    .eq('id', id)

  if (error) throw error
}