import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Grid2X2, ShoppingBag, Zap, Users, CreditCard, LogOut } from 'lucide-react'
import { LOGO } from '../lib/api'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/flashsales', label: 'Flash Sales', icon: Zap },
  { to: '/admin/categories', label: 'Categories', icon: Grid2X2 },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-[#071A2B] flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <img src={LOGO} alt="Majo Gadgets" className="h-8 w-auto object-contain" />
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">Admin Panel</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-[13px] font-semibold text-white/40 hover:text-white border-t border-white/10 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
