import { supabase } from './supabase'

export async function createTransaction(cart, paymentMethod) {
  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.precio) * Number(item.cantidad),
    0
  )

  const discount = cart.reduce(
    (acc, item) => acc + Number(item.descuento || 0),
    0
  )

  const costo_total = cart.reduce(
    (acc, item) => acc + Number(item.costo || 0) * Number(item.cantidad),
    0
  )

  const total = subtotal - discount
  const ganancia = total - costo_total

  const items_json = cart.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    precio: Number(item.precio),
    costo: Number(item.costo || 0),
    cantidad: Number(item.cantidad),
    descuento: Number(item.descuento || 0),
  }))

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        items_json,
        subtotal,
        discount,
        total,
        costo_total,
        ganancia,
        payment_method: paymentMethod,
      },
    ])
    .select()
    .single()

  if (error) throw error

  for (const item of cart) {
    const newStock = Number(item.stock) - Number(item.cantidad)

    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: newStock < 0 ? 0 : newStock })
      .eq('id', item.id)

    if (stockError) throw stockError
  }

  return data
}