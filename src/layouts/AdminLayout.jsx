import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  ShoppingBag,
  BriefcaseBusiness,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = useMemo(
    () => [
      { label: 'Dashboard', path: '/panel', icon: LayoutDashboard },
      { label: 'POS', path: '/panel/pos', icon: ShoppingCart },
      { label: 'Productos', path: '/panel/productos', icon: Package },
      { label: 'Inventario', path: '/panel/inventario', icon: Boxes },
      { label: 'Historial de Ventas', path: '/panel/ventas', icon: Receipt },
      { label: 'Trabajos y Servicios', path: '/panel/trabajos', icon: BriefcaseBusiness },
      { label: 'Socios', path: '/panel/socios', icon: Users },
      { label: 'Configuración', path: '/panel/configuracion', icon: Settings },
      { label: 'Compras Pendientes', path: '/panel/compras-pendientes', icon: ShoppingBag },
    ],
    []
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleNavigate = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const isActive = (path) => {
    if (path === '/panel') return location.pathname === '/panel'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-[#1a2744] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200">
              Panel admin
            </p>
            <h2 className="text-xl font-bold">Solutions Tech</h2>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-[#3b5bdb] text-white shadow-lg'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900 md:text-xl">
                Panel Administrativo
              </h1>
              <p className="text-xs text-slate-500 md:text-sm">
                Gestiona tu negocio desde un solo lugar
              </p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout