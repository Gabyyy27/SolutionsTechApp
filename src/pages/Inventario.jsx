import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Minus, Plus, Printer, Package } from 'lucide-react'
import { getInventario, updateProductStock } from '../lib/inventario'
import { getCategories } from '../lib/products'
import { formatCurrency } from '../utils/format'

function Inventario() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getInventario(),
        getCategories(),
      ])

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error(error)
      toast.error('No se pudo cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.nombre
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesCategory = selectedCategory
        ? product.category_id === selectedCategory
        : true

      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategory])

  const getStockStatus = (stock) => {
    const value = Number(stock || 0)

    if (value === 0) {
      return {
        label: 'Agotado',
        className: 'bg-red-50 text-red-600',
      }
    }

    if (value <= 10) {
      return {
        label: 'Bajo',
        className: 'bg-yellow-50 text-yellow-700',
      }
    }

    return {
      label: 'OK',
      className: 'bg-emerald-50 text-emerald-700',
    }
  }

  const handleStockChange = async (product, delta) => {
    const currentStock = Number(product.stock || 0)
    const nextStock = currentStock + delta

    if (nextStock < 0) {
      toast.error('El stock no puede ser menor que 0')
      return
    }

    try {
      await updateProductStock(product.id, nextStock)
      toast.success('Stock actualizado')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo actualizar el stock')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventario</h2>
          <p className="text-sm text-slate-500">
            Controla stock, costo y precio de tus productos
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Printer size={18} />
          Exportar / Imprimir
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-3">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#3b5bdb] focus:bg-white"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nombre}
            </option>
          ))}
        </select>

        <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Total: {filteredProducts.length} producto(s)
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="p-6 text-slate-500">Cargando inventario...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-slate-500">
            <Package size={32} />
            <p>No hay productos para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 font-semibold">Producto</th>
                  <th className="px-4 py-4 font-semibold">Categoría</th>
                  <th className="px-4 py-4 font-semibold">Costo</th>
                  <th className="px-4 py-4 font-semibold">Precio</th>
                  <th className="px-4 py-4 font-semibold">Stock</th>
                  <th className="px-4 py-4 font-semibold">Estado</th>
                  <th className="px-4 py-4 font-semibold">Ajustar</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock)

                  return (
                    <tr key={product.id} className="border-t border-slate-200">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                            {product.imagen_url ? (
                              <img
                                src={product.imagen_url}
                                alt={product.nombre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Package size={18} />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {product.nombre}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.descripcion || 'Sin descripción'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {product.categories?.nombre || 'Sin categoría'}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatCurrency(product.costo)}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-900">
                        {formatCurrency(product.precio)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {product.stock}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStockChange(product, -1)}
                            className="rounded-xl bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
                          >
                            <Minus size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStockChange(product, 1)}
                            className="rounded-xl bg-[#3b5bdb] p-2 text-white transition hover:opacity-90"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventario