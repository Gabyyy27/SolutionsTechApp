import { supabase } from './supabase'

export async function getMyProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, email, rol, activo')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error

  return data
}