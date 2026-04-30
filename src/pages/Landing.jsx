import { useEffect, useMemo, useState } from 'react'
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Search,
  Package,
  Wrench,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { getLandingData } from '../lib/landing'
import { formatCurrency } from '../utils/format'

const defaultConfig = {
  nombre_tienda: 'Solutions Tech',
  descripcion_corta: 'Venta de productos y servicios personalizados',
  logo_url: '',
  whatsapp: '',
  direccion: '',
  email_contacto: '',
  horario: '',
  carousel_images_json: [],
  service_images_json: [],
}

const baseServices = [
  'Reparación de Celulares',
  'Diseño e Impresión de Banners y Stickers',
  'Diseño e Impresión de Tarjetas de Presentación',
  'Diseño e Impresión de Diplomas',
  'Desarrollo de Sitios Web',
  
]

function Landing() {
  const [config, setConfig] = useState(defaultConfig)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await getLandingData()

        setConfig({
          ...defaultConfig,
          ...data.config,
          carousel_images_json: Array.isArray(data.config?.carousel_images_json)
            ? data.config.carousel_images_json
            : [],
          service_images_json: Array.isArray(data.config?.service_images_json)
            ? data.config.service_images_json
            : [],
        })
        setProducts(data.products)
        setCategories(data.categories)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

const filteredProducts = useMemo(() => {
  return products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' ? true : product.category_id === selectedCategory

    const term = searchTerm.toLowerCase().trim()

    const matchesSearch =
      term === ''
        ? true
        : product.nombre?.toLowerCase().includes(term) ||
          product.descripcion?.toLowerCase().includes(term) ||
          product.categories?.nombre?.toLowerCase().includes(term)

    return matchesCategory && matchesSearch
  })
}, [products, selectedCategory, searchTerm])

  const carouselImages = config.carousel_images_json?.filter(Boolean) || []

  const serviceCards = baseServices.map((service, index) => ({
    nombre: service,
    imagen: config.service_images_json?.[index] || '',
  }))

  useEffect(() => {
    if (carouselImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [carouselImages.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    )
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  const whatsappNumber = config.whatsapp?.replace(/\D/g, '') || ''
  const whatsappText = encodeURIComponent(
    `Hola, quiero información sobre ${config.nombre_tienda || 'sus productos'}`
  )
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappText}`
    : '#'

  const productWhatsAppLink = (productName) => {
    const text = encodeURIComponent(`Hola, quiero información sobre: ${productName}`)
    return whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${text}` : '#'
  }

  const serviceWhatsAppLink = (serviceName) => {
    const text = encodeURIComponent(`Hola, quiero cotizar este servicio: ${serviceName}`)
    return whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${text}` : '#'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-slate-700">Cargando sitio...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
  <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={() => scrollToSection('inicio')}
        className="flex min-w-0 items-center gap-3"
      >
        {config.logo_url ? (
          <img
            src={config.logo_url}
            alt={config.nombre_tienda}
            className="h-11 w-11 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a2744] text-white">
            <Package size={20} />
          </div>
        )}

        <div className="min-w-0 text-left">
          <p className="truncate text-lg font-bold text-[#1a2744]">
            {config.nombre_tienda}
          </p>
          <p className="truncate text-xs text-slate-500">
            Soluciones tecnológicas y servicios
          </p>
        </div>
      </button>

      <div className="hidden flex-1 lg:flex lg:max-w-xl">
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (window.location.pathname === '/') {
                scrollToSection('productos')
              }
            }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#3b5bdb] focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <nav className="hidden items-center gap-6 lg:flex">
        <button onClick={() => scrollToSection('inicio')} className="text-sm font-medium text-slate-700 hover:text-[#3b5bdb]">
          Inicio
        </button>
        <button onClick={() => scrollToSection('productos')} className="text-sm font-medium text-slate-700 hover:text-[#3b5bdb]">
          Productos
        </button>
        <button onClick={() => scrollToSection('servicios')} className="text-sm font-medium text-slate-700 hover:text-[#3b5bdb]">
          Servicios
        </button>
        <button onClick={() => scrollToSection('ubicacion')} className="text-sm font-medium text-slate-700 hover:text-[#3b5bdb]">
          Ubicación
        </button>
        <button onClick={() => scrollToSection('contacto')} className="text-sm font-medium text-slate-700 hover:text-[#3b5bdb]">
          Contacto
        </button>
      </nav>

      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="rounded-xl border border-slate-200 p-2 lg:hidden"
      >
        <Menu size={20} />
      </button>
    </div>

    <div className="mt-4 lg:hidden">
      <div className="relative w-full">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            scrollToSection('productos')
          }}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#3b5bdb] focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  </div>

        {mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Menú</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => scrollToSection('inicio')} className="text-left text-sm font-medium text-slate-700">
                Inicio
              </button>
              <button onClick={() => scrollToSection('productos')} className="text-left text-sm font-medium text-slate-700">
                Productos
              </button>
              <button onClick={() => scrollToSection('servicios')} className="text-left text-sm font-medium text-slate-700">
                Servicios
              </button>
              <button onClick={() => scrollToSection('ubicacion')} className="text-left text-sm font-medium text-slate-700">
                Ubicación
              </button>
              <button onClick={() => scrollToSection('contacto')} className="text-left text-sm font-medium text-slate-700">
                Contacto
              </button>
              
            </div>
          </div>
        ) : null}
      </header>

      <main>
<section id="inicio" className="relative bg-[#1a2744] text-white">
  <div className="relative h-[420px] w-full overflow-hidden md:h-[520px]">
    {carouselImages.length > 0 ? (
      <>
        <img
          src={carouselImages[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2744]/15 to-[#3b5bdb]/20" />

        

        {carouselImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/85 p-3 text-slate-900 shadow-md transition hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/85 p-3 text-slate-900 shadow-md transition hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        ) : null}

        {carouselImages.length > 1 ? (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === index ? 'w-7 bg-white' : 'w-2.5 bg-white/45'
                }`}
              />
            ))}
          </div>
        ) : null}
      </>
    ) : (
      <div className="flex h-full items-center justify-center bg-[#1a2744] text-center text-blue-100">
        Agrega imágenes del carrusel en Configuración
      </div>
    )}
  </div>
</section>

        <section id="productos" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#1a2744]">Productos</h2>
            <p className="mt-2 text-slate-500">
              Descubre nuestros productos disponibles.
            </p>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-[#3b5bdb] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-[#3b5bdb] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category.nombre}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-500">
              No se encontraron productos disponibles.
              </p>
          
            </div>
          ) : (
           <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    {product.imagen_url ? (
                      <img
                        src={product.imagen_url}
                        alt={product.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package size={28} />
                      </div>
                    )}
                  </div>

                 <div className="flex flex-col flex-1 p-5">
                    <p className="text-sm text-slate-500">
                      {product.categories?.nombre || 'Sin categoría'}
                    </p>
                   <h3 className="mt-1 text-lg font-bold text-slate-900 line-clamp-2 min-h-[3rem]">
                      {product.nombre}
                    </h3>
                    <p className="mt-2 text-2xl font-extrabold text-[#3b5bdb]">
                      {formatCurrency(product.precio)}
                    </p>

                    <a
                      href={productWhatsAppLink(product.nombre)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a2744] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#24365f]"
                    >
                      <FaWhatsapp size={18} />
                      Pedir por WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="servicios" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1a2744]">Servicios</h2>
              <p className="mt-2 text-slate-500">
                Soluciones personalizadas para ti y tu negocio.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
              {serviceCards.map((service, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl bg-slate-50 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    {service.imagen ? (
                      <img
                        src={service.imagen}
                        alt={service.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Wrench size={28} />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="min-h-[72px] text-base font-bold text-slate-900">
                      {service.nombre}
                    </h3>

                    <a
                      href={serviceWhatsAppLink(service.nombre)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3b5bdb] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      <FaWhatsapp size={18} />
                      Cotizar servicio
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ubicacion" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-3xl font-bold text-[#1a2744]">Ubicación y contacto</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 text-[#3b5bdb]" size={18} />
                  <div>
                    <p className="font-semibold text-slate-900">Dirección</p>
                    <p className="text-slate-600">{config.direccion || 'Sin dirección configurada'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 text-[#3b5bdb]" size={18} />
                  <div>
                    <p className="font-semibold text-slate-900">Horario</p>
                    <p className="text-slate-600">{config.horario || 'Sin horario configurado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 text-[#3b5bdb]" size={18} />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-slate-600">
                      {config.email_contacto || 'Sin email configurado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 text-[#3b5bdb]" size={18} />
                  <div>
                    <p className="font-semibold text-slate-900">WhatsApp</p>
                    <p className="text-slate-600">
                      {config.whatsapp || 'Sin WhatsApp configurado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                <Package className="mt-0.5 text-[#3b5bdb]" size={18} />
                <div>
                <p className="font-semibold text-slate-900">Envíos</p>
                <p className="text-slate-600">
                  Realizamos envíos a nivel nacional
                </p>
               </div>
              </div>
              </div>
            </div>

            <div id="contacto" className="rounded-3xl bg-[#1a2744] p-6 text-white">
              <h3 className="text-2xl font-bold">¿Listo para cotizar?</h3>
              <p className="mt-3 text-blue-100">
               En Solutions Tech ofrecemos servicios de reparación de celulares,
    diseño e impresión de material publicitario y desarrollo de páginas web modernas.
    Trabajamos con clientes en toda Honduras brindando soluciones rápidas,
    accesibles y profesionales.
              </p>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#3b5bdb] px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                <FaWhatsapp size={18} />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1a2744] text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:px-6 lg:grid-cols-3">
          <div>
            <h3 className="text-xl font-bold">{config.nombre_tienda}</h3>
            <p className="mt-3 text-sm text-blue-100">
              {config.descripcion_corta}
            </p>
            
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              Enlaces rápidos
            </h4>
            <div className="mt-4 flex flex-col gap-2 text-sm text-blue-100">
              <button onClick={() => scrollToSection('inicio')} className="text-left hover:text-white">
                Inicio
              </button>
              <button onClick={() => scrollToSection('productos')} className="text-left hover:text-white">
                Productos
              </button>
              <button onClick={() => scrollToSection('servicios')} className="text-left hover:text-white">
                Servicios
              </button>
              <button onClick={() => scrollToSection('contacto')} className="text-left hover:text-white">
                Contacto
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              Contacto
            </h4>
            <div className="mt-4 space-y-2 text-sm text-blue-100">
              <p>{config.direccion || 'Sin dirección configurada'}</p>
              <p>{config.email_contacto || 'Sin email configurado'}</p>
              <p>{config.whatsapp || 'Sin WhatsApp configurado'}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
        <p className="mt-4 text-center text-xs text-blue-200 opacity-80">
  © 2026 Solutions Tech - Todos los derechos reservados
</p>
</div>
      </footer>

    {whatsappNumber ? (
  <a
    href={whatsappLink}
    target="_blank"
    rel="noreferrer"
    aria-label="Contactar por WhatsApp"
    className="fixed bottom-6 right-6 z-[999] flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-green-600"
  >
    <FaWhatsapp size={28} />
  </a>
) : null}
    </div>
  )
}

export default Landing