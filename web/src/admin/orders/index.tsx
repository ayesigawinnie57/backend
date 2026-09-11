import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Package, ChevronRight } from 'lucide-react'
import { adminOrdersApi, type ApiAdminOrder } from '../../lib/api'
import ErrorBanner, { parseError } from '../ErrorBanner'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',   color: '#92400e', bg: '#fef3c7' },
  processing: { label: 'Confirmed', color: '#1e40af', bg: '#dbeafe' },
  shipped:    { label: 'Shipped',   color: '#6d28d9', bg: '#ede9fe' },
  delivered:  { label: 'Delivered', color: '#166534', bg: '#dcfce7' },
  cancelled:  { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2' },
}

const TABS = [
  { key: '', label: 'All', icon: ShoppingBag },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'processing', label: 'Confirmed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('')
  const [orders, setOrders] = useState<ApiAdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    adminOrdersApi.list(tab || undefined)
      .then(({ data }) => setOrders(Array.isArray(data) ? data : (data as any).results ?? []))
      .catch(err => setError(parseError(err, 'Failed to load orders.')))
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <div className="p-8">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-xl font-extrabold text-[#071A2B]">Orders</h1>
        <span className="text-[13px] text-[#64748B] font-semibold">{orders.length} total</span>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold transition-colors ${
              tab === key ? 'bg-[#071A2B] border-[#071A2B] text-white' : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#071A2B]'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" /></div>
      ) : orders.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#94A3B8]">
          <ShoppingBag size={40} />
          <p className="text-[14px] font-semibold">No orders found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => {
            const meta = STATUS_META[order.status] ?? STATUS_META.pending
            return (
              <button
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.code}`)}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-left hover:border-[#071A2B] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-extrabold text-[#071A2B] tracking-wide">{order.code}</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ backgroundColor: meta.bg, color: meta.color }}>{meta.label}</span>
                </div>
                <p className="text-[12px] text-[#64748B] truncate mb-2">
                  {order.items.map((i: any) => i.product?.name ?? 'Item').join(', ')}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
                  <span>{formatDate(order.created_at)}</span>
                  <span>·</span>
                  <span className="font-bold text-[#22C55E]">UGX {Number(order.total).toLocaleString()}</span>
                  <span>·</span>
                  <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  <ChevronRight size={14} className="ml-auto text-[#CBD5E1]" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
