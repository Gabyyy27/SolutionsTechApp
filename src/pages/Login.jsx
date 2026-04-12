import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [logo, setLogo] = useState(null)

  // 🔥 Obtener logo desde config
  useEffect(() => {
    const getConfig = async () => {
      try {
        const { data } = await supabase
          .from('config')
          .select('logo_url')
          .limit(1)
          .single()

        if (data?.logo_url) {
          setLogo(data.logo_url)
        }
      } catch (error) {
        console.log('No hay logo configurado')
      }
    }

    getConfig()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Completa correo y contraseña')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        toast.error(error.message || 'No se pudo iniciar sesión')
        return
      }

      toast.success('Bienvenido al panel')
      navigate('/panel')
    } catch (err) {
      toast.error('Ocurrió un error inesperado')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      
      {/* Card */}
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur">

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              className="mb-3 h-14 object-contain"
            />
          ) : (
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">
              ST
            </div>
          )}

          <h1 className="text-xl font-bold text-slate-900">
            Panel Administrativo
          </h1>
          <p className="text-sm text-slate-500">
            Ingresa con tu cuenta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-10 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              autoComplete="current-password"
            />

            {/* Botón ojo */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <button
          type = "button"
          onClick={() => navigate('/')}
          className="mt-4 w-full rounded-xl bg-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
        >
          Volver al sitio web
        </button>
        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Solutions Tech © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default Login