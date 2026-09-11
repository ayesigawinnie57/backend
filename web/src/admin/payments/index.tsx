import { useEffect, useMemo, useState } from 'react'
import { CreditCard, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react'
import { adminPaymentsApi, type ApiPayment } from '../../lib/api'

const STATUS_CONFIG = {
  completed: { color: '#10b981', bg: '#f0fdf4', icon: CheckCircle2, label: 'Completed' },
  pending:   { color: '#f59e0b', bg: '#fffbeb', icon: Clock,         label: 'Pending'   },
  failed:    { color: '#ef4444', bg: '#fef2f2', icon: XCircle,       label: 'Failed'    },
  invalid:   { color: '#94a3b8', bg: '#f8fafc', icon: AlertCircle,   label: 'Invalid'   },
}

const FILTERS = ['all', 'completed', 'pending', 'failed', 'invalid'] as const
type Filter = typeof FILTERS[number]

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-UG', { day: 'numeric', month: 'short' })
}

export default function AdminPayments() {
  const [allPayments, setAllPayments] = useState<ApiPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const fetchPayments = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const { data } = await adminPaymentsApi.list()
      setAllPayments(Array.isArray(data) ? data : (data as any).results ?? [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchPayments() }, [])

  const filtered = useMemo(
    () => filter === 'all' ? allPayments : allPayments.filter(p => p.status === filter),
    [allPayments, filter]
  )

  const stats = useMemo(() => ({
    total: allPayments.length,
    collected: allPayments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    pending: allPayments.filter(p => p.status === 'pending').length,
    failed: allPayments.filter(p => p.status === 'failed').length,
    counts: Object.fromEntries(FILTERS.map(f => [f, f === 'all' ? allPayments.length : allPayments.filter(p => p.status === f).length])),
  }), [allPayments])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CreditCard size={20} color="#071A2B" />
          <h1 className="text-xl font-extrabold text-[#071A2B]">Payments</h1>
        </div>
        <button onClick={() => fetchPayments(true)} disabled={refreshing} className="p-1.5 hover:opacity-70 disabled:opacity-40">
          <RefreshCw size={16} color="#64748B" className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 text-center">
          <p className="text-[16px] font-extrabold text-[#071A2B]">{stats.total}</p>
          <p className="text-[10px] text-[#64748B] font-semibold">Total</p>
        </div>
        <div className="bg-white border border-[#10b98130] rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp size={12} color="#10b981" />
            <p className="text-[13px] font-extrabold text-[#10b981]">UGX {stats.collected.toLocaleString()}</p>
          </div>
          <p className="text-[10px] text-[#64748B] font-semibold">Collected</p>
        </div>
        <div className={`bg-white border rounded-xl p-3 text-center ${stats.pending > 0 ? 'border-[#f59e0b30]' : 'border-[#E2E8F0]'}`}>
          <p className={`text-[16px] font-extrabold ${stats.pending > 0 ? 'text-[#f59e0b]' : 'text-[#071A2B]'}`}>{stats.pending}</p>
          <p className="text-[10px] text-[#64748B] font-semibold">Pending</p>
        </div>
        <div className={`bg-white border rounded-xl p-3 text-center ${stats.failed > 0 ? 'border-[#ef444430]' : 'border-[#E2E8F0]'}`}>
          <p className={`text-[16px] font-extrabold ${stats.failed > 0 ? 'text-[#ef4444]' : 'text-[#071A2B]'}`}>{stats.failed}</p>
          <p className="text-[10px] text-[#64748B] font-semibold">Failed</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold transition-colors ${
              filter === f ? 'bg-[#071A2B] border-[#071A2B] text-white' : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#071A2B]'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {stats.counts[f] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`}>
                {stats.counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#64748B] text-[14px] py-20">No payments found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(p => {
            const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending
            const Icon = cfg.icon
            return (
              <div key={p.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3 border-l-4" style={{ borderLeftColor: cfg.color }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                    <Icon size={16} color={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[15px] font-extrabold text-[#071A2B]">{p.currency} {Number(p.amount).toLocaleString()}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    {p.order_code && <p className="text-[12px] text-[#64748B] font-semibold">Order #{p.order_code}</p>}
                    <p className="text-[10px] text-[#94A3B8] truncate">{p.pesapal_order_tracking_id}</p>
                  </div>
                </div>
                <div className="flex justify-between border-t border-[#F1F5F9] pt-2">
                  <p className="text-[11px] text-[#64748B] font-semibold">{p.payment_method || 'Pesapal'}</p>
                  <p className="text-[11px] text-[#94A3B8]">{timeAgo(p.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
