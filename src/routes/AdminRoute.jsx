import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getMyProfile } from '../lib/auth'

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let active = true

    const checkAccess = async () => {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!active) return

        if (!currentSession) {
          setSession(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setSession(currentSession)

        const myProfile = await getMyProfile()

        if (!active) return

        setProfile(myProfile || null)
      } catch (error) {
        console.error('Error validando acceso admin:', error)
        if (active) {
          setSession(null)
          setProfile(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    checkAccess()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-lg font-semibold text-slate-700">
        Cargando...
      </div>
    )
  }

  const isAdmin =
    !!session &&
    !!profile &&
    profile.rol === 'admin' &&
    profile.activo === true

  if (!isAdmin) {
    return <Navigate to="/panel/login" replace />
  }

  return children
}

export default AdminRoute