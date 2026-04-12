import { supabase } from './supabase'

export async function getComprasPendientes() {
  const { data, error } = await supabase
    .from('compras_pendientes')
    .select('*')
    .order('fecha_creacion', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createCompra(compra) {
  const payload = {
    producto_nombre: compra.producto_nombre,
    tienda_nombre: compra.tienda_nombre,
    tipo_compra: compra.tipo_compra,
    estado: compra.estado || 'Pendiente',
    fecha_compra: compra.estado === 'Comprado' ? new Date().toISOString() : null,
  }

  const { data, error } = await supabase
    .from('compras_pendientes')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCompra(id, compra) {
  const payload = {
    producto_nombre: compra.producto_nombre,
    tienda_nombre: compra.tienda_nombre,
    tipo_compra: compra.tipo_compra,
    estado: compra.estado,
    fecha_compra: compra.estado === 'Comprado'
      ? compra.fecha_compra || new Date().toISOString()
      : null,
  }

  const { data, error } = await supabase
    .from('compras_pendientes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCompraEstado(id, estado) {
  const payload = {
    estado,
    fecha_compra: estado === 'Comprado' ? new Date().toISOString() : null,
  }

  const { data, error } = await supabase
    .from('compras_pendientes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCompra(id) {
  const { error } = await supabase
    .from('compras_pendientes')
    .delete()
    .eq('id', id)

  if (error) throw error
}