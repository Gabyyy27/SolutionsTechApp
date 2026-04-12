import { supabase } from './supabase'

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(nombre),
      subcategories(nombre)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createProduct(product) {
  const payload = {
    nombre: product.nombre,
    imagen_url: product.imagen_url || '',
    category_id: product.category_id || null,
    subcategory_id: product.subcategory_id || null,
    costo: Number(product.costo || 0),
    precio: Number(product.precio || 0),
    stock: Number(product.stock || 0),
    descripcion: product.descripcion || '',
    mostrar_en_web: Boolean(product.mostrar_en_web),
    mostrar_en_pos: Boolean(product.mostrar_en_pos),
    activo: true,
  }

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id, product) {
  const payload = {
    nombre: product.nombre,
    imagen_url: product.imagen_url || '',
    category_id: product.category_id || null,
    subcategory_id: product.subcategory_id || null,
    costo: Number(product.costo || 0),
    precio: Number(product.precio || 0),
    stock: Number(product.stock || 0),
    descripcion: product.descripcion || '',
    mostrar_en_web: Boolean(product.mostrar_en_web),
    mostrar_en_pos: Boolean(product.mostrar_en_pos),
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createCategory(nombre) {
  const slug = nombre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')

  const { data, error } = await supabase
    .from('categories')
    .insert([{ nombre, slug }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getSubcategories() {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createSubcategory({ nombre, category_id }) {
  const slug = nombre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')

  const { data, error } = await supabase
    .from('subcategories')
    .insert([{ nombre, slug, category_id }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSubcategory(id) {
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id)

  if (error) throw error
}