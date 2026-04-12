import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Productos from './pages/Productos'
import Inventario from './pages/Inventario'
import Ventas from './pages/Ventas'
import Trabajos from './pages/Trabajos'
import Socios from './pages/Socios'
import Configuracion from './pages/Configuracion'
import AdminLayout from './layouts/AdminLayout'
import AdminRoute from './routes/AdminRoute'
import ComprasPendientes from './pages/ComprasPendientes'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/panel-login-admin-privado-2026" element={<Login />} />

      <Route
        path="/panel"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="productos" element={<Productos />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="trabajos" element={<Trabajos />} />
        <Route path="compras-pendientes" element={<ComprasPendientes />} />
        <Route path="socios" element={<Socios />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App