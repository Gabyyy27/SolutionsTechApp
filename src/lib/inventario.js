import { supabase } from './supabase'

export async function getInventario() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(nombre)
    `)
    .order('nombre', { ascending: true })

  if (error) throw error
  return data || []
}

export async function updateProductStock(id, newStock) {
  const safeStock = Number(newStock)

  if (Number.isNaN(safeStock) || safeStock < 0) {
    throw new Error('Stock inválido')
  }

  const { data, error } = await supabase
    .from('products')
    .update({ stock: safeStock })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}