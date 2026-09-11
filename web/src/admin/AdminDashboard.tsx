import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ShoppingBag, Grid2X2, Zap, Users, CreditCard, Plus, List } from 'lucide-react'
import { adminProductsApi, adminFlashSalesApi, adminUsersApi, type ApiFlashSaleItem } from '../lib/api'
import ErrorBanner from './ErrorBanner'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [productCount, setProductCount] = useState(0)
  const [flashSales, setFlashSales] = useState<ApiFlashSaleItem[]>([])
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      adminProductsApi.list().then(({ data }) => {
        const arr = Array.isArray(data) ? data : (data as any).results ?? []
        setProductCount(arr.length)
      }),
      adminFlashSalesApi.list().then(({ data }) => setFlashSales(Array.isArray(data) ? data : (data as any).results ?? [])),
      adminUsersApi.list().then(({ data }) => setUserCount(Array.isArray(data) ? data.length : (data as any).count ?? 0)),
    ])
      .catch(() => setError('Failed to load dashboard data. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const activeFlash = flashSales.filter(s => s.is_active && !s.is_expired).length

  const pages = [
    {
      label: 'Products', desc: `${productCount} total products`, icon: Package, color: '#6366f1',
      actions: [{ label: 'View All', route: '/admin/products' }, { label: 'Add New', route: '/admin/products/add' }],
    },
    {
      label: 'Flash Sales', desc: `${activeFlash} active sale${activeFlash !== 1 ? 's' : ''}`, icon: Zap, color: '#F97316',
      actions: [{ label: 'Manage', route: '/admin/flashsales' }],
    },
    {
      label: 'Categories', desc: 'Organise your products', icon: Grid2X2, color: '#10b981',
      actions: [{ label: 'View All', route: '/admin/categories' }, { label: 'Add New', route: '/admin/categories/add' }],
    },
    {
      label: 'Orders', desc: 'Track & manage orders', icon: ShoppingBag, color: '#f59e0b',
      actions: [{ label: 'View All', route: '/admin/orders' }],
    },
    {
      label: 'Users', desc: `${userCount} registered user${userCount !== 1 ? 's' : ''}`, icon: Users, color: '#8b5cf6',
      actions: [{ label: 'View All', route: '/admin/users' }],
    },
    {
      label: 'Payments', desc: 'Pesapal transactions', icon: CreditCard, color: '#0ea5e9',
      actions: [{ label: 'View All', route: '/admin/payments' }],
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[13px] text-[#64748B]">Welcome back,</p>
        <h1 className="text-3xl font-extrabold text-[#071A2B]">Admin</h1>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <h2 className="text-[15px] font-bold text-[#071A2B] mb-4">Manage</h2>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {pages.map(({ label, desc, icon: Icon, color, actions }) => (
            <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
                <Icon size={20} color={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-extrabold text-[#071A2B]">{label}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">{desc}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {actions.map(({ label: aLabel, route }) => (
                  <button
                    key={aLabel}
                    onClick={() => navigate(route)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-opacity hover:opacity-80"
                    style={{ borderColor: color + '40', backgroundColor: color + '0d', color }}
                  >
                    {aLabel === 'Add New' ? <Plus size={12} /> : <List size={12} />}
                    {aLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
