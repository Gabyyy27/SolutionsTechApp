import { supabase } from './supabase'

export async function getConfig() {
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function saveConfig(config) {
  const payload = {
    nombre_tienda: config.nombre_tienda || '',
    descripcion_corta: config.descripcion_corta || '',
    logo_url: config.logo_url || '',
    whatsapp: config.whatsapp || '',
    direccion: config.direccion || '',
    email_contacto: config.email_contacto || '',
    horario: config.horario || '',
    carousel_images_json: config.carousel_images_json || [],
    service_images_json: config.service_images_json || [],
  }

  if (config.id) {
    const { data, error } = await supabase
      .from('config')
      .update(payload)
      .eq('id', config.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('config')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}