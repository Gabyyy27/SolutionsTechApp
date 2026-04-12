import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Pencil,
  Trash2,
  Plus,
  Package,
  X,
} from 'lucide-react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSubcategories,
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
} from '../lib/products'
import { formatCurrency } from '../utils/format'

const initialForm = {
  nombre: '',
  imagen_url: '',
  category_id: '',
  subcategory_id: '',
  costo: '',
  precio: '',
  stock: '',
  descripcion: '',
  mostrar_en_web: false,
  mostrar_en_pos: true,
}

function Productos() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [newCategory, setNewCategory] = useState('')
  const [newSubcategory, setNewSubcategory] = useState('')
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState('')
  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData, subcategoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
        getSubcategories(),
      ])

      setProducts(productsData)
      setCategories(categoriesData)
      setSubcategories(subcategoriesData)
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron cargar los productos')
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

  const filteredSubcategories = useMemo(() => {
    if (!form.category_id) return subcategories
    return subcategories.filter(
      (sub) => sub.category_id === form.category_id
    )
  }, [subcategories, form.category_id])

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm(initialForm)
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setForm({
      nombre: product.nombre || '',
      imagen_url: product.imagen_url || '',
      category_id: product.category_id || '',
      subcategory_id: product.subcategory_id || '',
      costo: product.costo ?? '',
      precio: product.precio ?? '',
      stock: product.stock ?? '',
      descripcion: product.descripcion || '',
      mostrar_en_web: product.mostrar_en_web || false,
      mostrar_en_pos: product.mostrar_en_pos || false,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setForm(initialForm)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'category_id' ? { subcategory_id: '' } : {}),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    if (Number(form.precio) < Number(form.costo)) {
      toast.error('El precio no debe ser menor que el costo')
      return
    }

    try {
      setSaving(true)

      if (editingProduct) {
        await updateProduct(editingProduct.id, form)
        toast.success('Producto actualizado')
      } else {
        await createProduct(form)
        toast.success('Producto creado')
      }

      await loadData()
      closeModal()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este producto?')
    if (!confirmed) return

    try {
      await deleteProduct(id)
      toast.success('Producto eliminado')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo eliminar el producto')
    }
  }
  const handleCreateCategory = async () => {
  if (!newCategory.trim()) {
    toast.error('Escribe un nombre para la categoría')
    return
  }

  try {
    await createCategory(newCategory.trim())
    toast.success('Categoría creada')
    setNewCategory('')
    await loadData()
  } catch (error) {
    console.error(error)
    toast.error(error.message || 'No se pudo crear la categoría')
  }
}

const handleDeleteCategory = async (id) => {
  const confirmed = window.confirm(
    '¿Seguro que deseas eliminar esta categoría? También eliminará sus subcategorías.'
  )
  if (!confirmed) return

  try {
    await deleteCategory(id)
    toast.success('Categoría eliminada')
    await loadData()
  } catch (error) {
    console.error(error)
    toast.error(error.message || 'No se pudo eliminar la categoría')
  }
}

const handleCreateSubcategory = async () => {
  if (!subcategoryCategoryId) {
    toast.error('Selecciona una categoría')
    return
  }

  if (!newSubcategory.trim()) {
    toast.error('Escribe un nombre para la subcategoría')
    return
  }

  try {
    await createSubcategory({
      nombre: newSubcategory.trim(),
      category_id: subcategoryCategoryId,
    })
    toast.success('Subcategoría creada')
    setNewSubcategory('')
    setSubcategoryCategoryId('')
    await loadData()
  } catch (error) {
    console.error(error)
    toast.error(error.message || 'No se pudo crear la subcategoría')
  }
}

const handleDeleteSubcategory = async (id) => {
  const confirmed = window.confirm('¿Seguro que deseas eliminar esta subcategoría?')
  if (!confirmed) return

  try {
    await deleteSubcategory(id)
    toast.success('Subcategoría eliminada')
    await loadData()
  } catch (error) {
    console.error(error)
    toast.error(error.message || 'No se pudo eliminar la subcategoría')
  }
}

  const getMargin = (costo, precio) => {
    return Number(precio || 0) - Number(costo || 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Productos</h2>
          <p className="text-sm text-slate-500">
            Administra tu catálogo de productos
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b5bdb] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-3">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nombre}
            </option>
          ))}
        </select>

        <div className="flex items-center rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          Total: {filteredProducts.length} producto(s)
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="p-6 text-slate-500">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-slate-500">
            <Package size={32} />
            <p>No hay productos registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold">Costo</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Margen</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Web</th>
                  <th className="px-4 py-3 font-semibold">POS</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-slate-200">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
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

                    <td className="px-4 py-4 text-emerald-600">
                      {formatCurrency(getMargin(product.costo, product.precio))}
                    </td>

                    <td className="px-4 py-4 text-slate-600">{product.stock}</td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.mostrar_en_web
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.mostrar_en_web ? 'Sí' : 'No'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.mostrar_en_pos
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.mostrar_en_pos ? 'Sí' : 'No'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <h3 className="text-xl font-bold text-slate-900">Categorías</h3>
    <p className="mt-1 text-sm text-slate-500">
      Administra categorías principales
    </p>

    <div className="mt-4 flex gap-3">
      <input
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="Nueva categoría"
        className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
      />
      <button
        type="button"
        onClick={handleCreateCategory}
        className="rounded-2xl bg-[#3b5bdb] px-4 py-3 text-sm font-semibold text-white"
      >
        Agregar
      </button>
    </div>

    <div className="mt-5 space-y-3">
      {categories.length === 0 ? (
        <p className="text-sm text-slate-500">No hay categorías registradas.</p>
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
          >
            <span className="font-medium text-slate-800">{category.nombre}</span>
            <button
              type="button"
              onClick={() => handleDeleteCategory(category.id)}
              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  </div>

  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <h3 className="text-xl font-bold text-slate-900">Subcategorías</h3>
    <p className="mt-1 text-sm text-slate-500">
      Asigna subcategorías a una categoría
    </p>

    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      <select
        value={subcategoryCategoryId}
        onChange={(e) => setSubcategoryCategoryId(e.target.value)}
        className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
      >
        <option value="">Selecciona categoría</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.nombre}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={newSubcategory}
        onChange={(e) => setNewSubcategory(e.target.value)}
        placeholder="Nueva subcategoría"
        className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
      />

      <button
        type="button"
        onClick={handleCreateSubcategory}
        className="rounded-2xl bg-[#3b5bdb] px-4 py-3 text-sm font-semibold text-white"
      >
        Agregar
      </button>
    </div>

    <div className="mt-5 space-y-3">
      {subcategories.length === 0 ? (
        <p className="text-sm text-slate-500">No hay subcategorías registradas.</p>
      ) : (
        subcategories.map((subcategory) => {
          const category = categories.find((cat) => cat.id === subcategory.category_id)

          return (
            <div
              key={subcategory.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-800">{subcategory.nombre}</p>
                <p className="text-xs text-slate-500">
                  {category?.nombre || 'Sin categoría'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSubcategory(subcategory.id)}
                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })
      )}
    </div>
  </div>
</div>
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h3>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                    placeholder="Nombre del producto"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    URL de imagen
                  </label>
                  <input
                    type="text"
                    name="imagen_url"
                    value={form.imagen_url}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Categoría
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Subcategoría
                  </label>
                  <select
                    name="subcategory_id"
                    value={form.subcategory_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  >
                    <option value="">Selecciona una subcategoría</option>
                    {filteredSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Costo
                  </label>
                  <input
                    type="number"
                    name="costo"
                    value={form.costo}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Precio
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                    min="0"
                  />
                </div>

                <div className="flex items-end">
                  <div className="grid w-full grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="mostrar_en_web"
                        checked={form.mostrar_en_web}
                        onChange={handleChange}
                      />
                      Mostrar en web
                    </label>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="mostrar_en_pos"
                        checked={form.mostrar_en_pos}
                        onChange={handleChange}
                      />
                      Mostrar en POS
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#3b5bdb]"
                  placeholder="Descripción del producto"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#3b5bdb] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Guardando...'
                    : editingProduct
                    ? 'Actualizar producto'
                    : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Productos