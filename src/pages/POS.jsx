import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Minus, Plus, ShoppingCart, Trash2, Package } from 'lucide-react'
import { getProducts, getCategories } from '../lib/products'
import { createTransaction } from '../lib/pos'
import { formatCurrency } from '../utils/format'

function POS() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ])

      const onlyPosProducts = (productsData || []).filter(
        (item) => item.activo && item.mostrar_en_pos
      )

      setProducts(onlyPosProducts)
      setCategories(categoriesData || [])
    } catch (error) {
      console.error(error)
      toast.error('Error cargando productos del POS')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.nombre
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchCategory =
        selectedCategory === 'all'
          ? true
          : product.category_id === selectedCategory

      return matchSearch && matchCategory
    })
  }, [products, search, selectedCategory])

  const addToCart = (product) => {
    if (Number(product.stock || 0) <= 0) {
      toast.error('Producto sin stock disponible')
      return
    }

    const existing = cart.find((item) => item.id === product.id)

    if (existing) {
      if (existing.cantidad >= product.stock) {
        toast.error('No puedes agregar más del stock disponible')
        return
      }

      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      )
      return
    }

    setCart((prev) => [
      ...prev,
      {
        ...product,
        cantidad: 1,
        descuento: 0,
      },
    ])
  }

  const changeQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item

          const nextQty = item.cantidad + delta

          if (nextQty <= 0) return null
          if (nextQty > item.stock) {
            toast.error('No puedes superar el stock disponible')
            return item
          }

          return { ...item, cantidad: nextQty }
        })
        .filter(Boolean)
    )
  }

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateDiscount = (id, value) => {
    const discount = Number(value || 0)

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        const maxDiscount = item.precio * item.cantidad
        return {
          ...item,
          descuento: discount < 0 ? 0 : discount > maxDiscount ? maxDiscount : discount,
        }
      })
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.precio) * Number(item.cantidad),
    0
  )

  const totalDiscount = cart.reduce(
    (acc, item) => acc + Number(item.descuento || 0),
    0
  )

  const total = subtotal - totalDiscount

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    try {
      setCheckoutLoading(true)

      const normalizedCart = cart.map((item) => ({
        ...item,
        descuento: Number(item.descuento || 0),
      }))

      await createTransaction(normalizedCart, paymentMethod)

      toast.success('Venta realizada correctamente')
      setCart([])
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo procesar la venta')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">POS</h2>
        <p className="text-sm text-slate-500">Punto de venta de productos físicos</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="space-y-5">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#3b5bdb] focus:bg-white"
            />

            <div className="mt-4 flex flex-wrap gap-3">
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
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-500">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <Package size={36} className="text-slate-400" />
              <p className="font-medium text-slate-700">No hay productos para mostrar</p>
              <p className="text-sm text-slate-500">
                Ajusta la búsqueda o agrega productos al catálogo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  className="overflow-hidden rounded-3xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
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

                  <div className="pt-4">
                    <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold text-slate-900">
                      {product.nombre}
                    </h3>

                    <p className="mt-1 text-3xl font-bold tracking-tight text-[#3b5bdb]">
                      {formatCurrency(product.precio)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Stock: {product.stock}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)]">
          <div className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-2 text-[#3b5bdb]">
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Venta Actual</h3>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                  <ShoppingCart size={30} className="mb-3 text-slate-400" />
                  <p className="font-medium text-slate-700">Aún no has agregado productos</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Toca una tarjeta de producto para agregarlo a la venta.
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const itemTotal =
                    Number(item.precio) * Number(item.cantidad) - Number(item.descuento || 0)

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h4 className="text-base font-semibold text-slate-900">
                          {item.nombre}
                        </h4>

                        <div className="text-right font-bold text-slate-900">
                          {formatCurrency(itemTotal)}
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, -1)}
                            className="rounded-xl bg-slate-200 p-2 text-slate-700 transition hover:bg-slate-300"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-[28px] text-center text-sm font-semibold text-slate-900">
                            {item.cantidad}
                          </span>

                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, 1)}
                            className="rounded-xl bg-slate-200 p-2 text-slate-700 transition hover:bg-slate-300"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <span className="text-sm text-slate-500">
                          @ {formatCurrency(item.precio)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="ml-auto rounded-xl p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Descuento L"
                        value={item.descuento || ''}
                        onChange={(e) => updateDiscount(item.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#3b5bdb]"
                      />
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-red-500">
                  <span>Descuentos:</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">TOTAL:</span>
                <span className="text-4xl font-extrabold tracking-tight text-[#3b5bdb]">
                  {formatCurrency(total)}
                </span>
              </div>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-[#3b5bdb]"
              >
                <option>Efectivo</option>
                <option>Transferencia</option>
              </select>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Limpiar
                </button>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cart.length === 0}
                  className="rounded-2xl bg-[#3b5bdb] px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutLoading ? 'Cobrando...' : 'Cobrar'}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default POS