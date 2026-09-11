import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { adminProductsApi, type ApiProduct } from '../../lib/api'
import ErrorBanner, { parseError } from '../ErrorBanner'

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminProductsApi.list()
      .then(({ data }) => setProducts(Array.isArray(data) ? data : (data as any).results ?? []))
      .catch(err => setError(parseError(err, 'Failed to load products.')))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await adminProductsApi.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(parseError(err, 'Failed to delete product.'))
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-[#071A2B]">Products ({products.length})</h1>
        <button
          onClick={() => navigate('/admin/products/add')}
          className="flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:opacity-90"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" /></div>
      ) : products.length === 0 && !error ? (
        <p className="text-center text-[#64748B] text-[14px] py-20">No products yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map(item => (
            <div key={item.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3">
              {item.image
                ? <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                : <div className="w-14 h-14 rounded-lg bg-[#F8FAFC] shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#071A2B] truncate">{item.name}</p>
                <p className="text-[13px] font-bold text-[#22C55E]">UGX {Number(item.price).toLocaleString()}</p>
                <p className="text-[11px] text-[#64748B] capitalize">{item.category?.name ?? '—'}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/admin/products/${item.id}`)}
                  className="w-8 h-8 rounded-lg bg-[#6366f118] flex items-center justify-center hover:opacity-80"
                >
                  <Pencil size={14} color="#6366f1" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="w-8 h-8 rounded-lg bg-[#ef444418] flex items-center justify-center hover:opacity-80"
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
