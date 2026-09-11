import { useEffect, useState } from 'react'
import { Users, ShieldCheck, User, Search } from 'lucide-react'
import { adminUsersApi, type ApiAdminUser } from '../../lib/api'

export default function AdminUsers() {
  const [users, setUsers] = useState<ApiAdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminUsersApi.list()
      .then(({ data }) => setUsers(Array.isArray(data) ? data : (data as any).results ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={20} color="#071A2B" />
          <h1 className="text-xl font-extrabold text-[#071A2B]">Users</h1>
        </div>
        <span className="text-[12px] font-semibold text-[#64748B]">{users.length} total</span>
      </div>

      <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 mb-6">
        <Search size={14} color="#94A3B8" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 text-[13px] text-[#071A2B] outline-none bg-transparent placeholder:text-[#CBD5E1]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#64748B] text-[14px] py-20">No users found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(u => (
            <div key={u.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3">
              {u.avatar
                ? <img src={u.avatar} className="w-11 h-11 rounded-full object-cover shrink-0" />
                : <div className="w-11 h-11 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0"><User size={18} color="#94A3B8" /></div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-[#071A2B] truncate">{u.name}</p>
                  {u.is_staff && (
                    <span className="flex items-center gap-1 bg-[#6366f118] text-[#6366f1] text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                      <ShieldCheck size={10} /> Staff
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#64748B] truncate">{u.email}</p>
                {u.phone && <p className="text-[11px] text-[#94A3B8]">{u.phone}</p>}
              </div>
              <p className="text-[11px] text-[#94A3B8] shrink-0">{new Date(u.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
