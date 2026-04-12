import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Image as ImageIcon, Store } from 'lucide-react'
import { getConfig, saveConfig } from '../lib/configuracion'

const initialForm = {
  id: '',
  nombre_tienda: '',
  descripcion_corta: '',
  logo_url: '',
  whatsapp: '',
  direccion: '',
  email_contacto: '',
  horario: '',
  carousel_images_json: ['', '', ''],
  service_images_json: ['', '', '', '', ''],
}

function Configuracion() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = async () => {
    try {
      setLoading(true)
      const data = await getConfig()

      if (data) {
        setForm({
          id: data.id || '',
          nombre_tienda: data.nombre_tienda || '',
          descripcion_corta: data.descripcion_corta || '',
          logo_url: data.logo_url || '',
          whatsapp: data.whatsapp || '',
          direccion: data.direccion || '',
          email_contacto: data.email_contacto || '',
          horario: data.horario || '',
          carousel_images_json:
            Array.isArray(data.carousel_images_json) && data.carousel_images_json.length
              ? [...data.carousel_images_json, '', '', ''].slice(0, 3)
              : ['', '', ''],
          service_images_json:
            Array.isArray(data.service_images_json) && data.service_images_json.length
              ? [...data.service_images_json, '', '', '', '', ''].slice(0, 5)
              : ['', '', '', '', ''],
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('No se pudo cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (field, index, value) => {
    setForm((prev) => {
      const copy = [...prev[field]]
      copy[index] = value
      return {
        ...prev,
        [field]: copy,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      const payload = {
        ...form,
        carousel_images_json: form.carousel_images_json.filter((item) => item.trim() !== ''),
        service_images_json: form.service_images_json.filter((item) => item.trim() !== ''),
      }

      const saved = await saveConfig(payload)

      setForm((prev) => ({
        ...prev,
        id: saved.id,
      }))

      toast.success('Configuración guardada correctamente')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-500">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configuración</h2>
        <p className="text-sm text-slate-500">
          Edita la información principal de tu negocio y de la landing page
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-[#3b5bdb]">
              <Store size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Datos del negocio</h3>
              <p className="text-sm text-slate-500">
                Información general visible en la app
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre de tienda
              </label>
              <input
                type="text"
                name="nombre_tienda"
                value={form.nombre_tienda}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Logo URL
              </label>
              <input
                type="text"
                name="logo_url"
                value={form.logo_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Descripción corta
              </label>
              <textarea
                name="descripcion_corta"
                value={form.descripcion_corta}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="504XXXXXXXX"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email de contacto
              </label>
              <input
                type="email"
                name="email_contacto"
                value={form.email_contacto}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Horario
              </label>
              <input
                type="text"
                name="horario"
                value={form.horario}
                onChange={handleChange}
                placeholder="Lunes a sábado de 8:00 a.m. a 6:00 p.m."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-[#3b5bdb]">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Imágenes del carrusel</h3>
              <p className="text-sm text-slate-500">
                Agrega hasta 3 imágenes para la portada principal
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {form.carousel_images_json.map((value, index) => (
              <div key={index}>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Imagen {index + 1}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    handleArrayChange('carousel_images_json', index, e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-[#3b5bdb]">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Imágenes de servicios</h3>
              <p className="text-sm text-slate-500">
                Agrega hasta 5 imágenes para tarjetas de servicios
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {form.service_images_json.map((value, index) => (
              <div key={index}>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Servicio {index + 1}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    handleArrayChange('service_images_json', index, e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3b5bdb] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Configuracion