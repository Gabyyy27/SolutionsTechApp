import { supabase } from './supabase'

export async function getLandingData() {
  const [configRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from('config').select('*').limit(1).maybeSingle(),
    supabase
      .from('products')
      .select(`
        *,
        categories(nombre)
      `)
      .eq('mostrar_en_web', true)
      .eq('activo', true)
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('nombre', { ascending: true }),
  ])

  if (configRes.error) throw configRes.error
  if (productsRes.error) throw productsRes.error
  if (categoriesRes.error) throw categoriesRes.error

  return {
    config: configRes.data,
    products: productsRes.data || [],
    categories: categoriesRes.data || [],
  }
}