import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const DURATION = 12 * 3600 + 45 * 60 + 30

export default function Deals() {
  const [remaining, setRemaining] = useState(DURATION)

  useEffect(() => {
    const id = setInterval(() => setRemaining(r => r > 0 ? r - 1 : DURATION), 1000)
    return () => clearInterval(id)
  }, [])

  const h = String(Math.floor(remaining / 3600)).padStart(2, '0')
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')
  const s = String(remaining % 60).padStart(2, '0')

  return (
    <div className="bg-[#F8FAFC] px-5 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#071A2B] rounded-3xl p-7 flex flex-col items-center">
          {/* badge */}
          <div className="bg-[rgba(34,197,94,0.2)] rounded-full px-3 py-1 mb-4">
            <span className="text-[#1E3A8A] text-[11px] font-semibold" style={{ color: '#22c55e' }}>Limited Time Offer</span>
          </div>
          {/* heading */}
          <p className="text-[30px] font-extrabold text-[#F8FAFC] text-center leading-[38px] mb-2.5">
            Up to <span className="text-[#1E3A8A]" style={{ color: '#22c55e' }}>50% Off</span>{'\n'}
            <br />on Top Brands
          </p>
          <p className="text-[14px] text-[#94A3B8] text-center mb-6">Don't miss our biggest sale of the season.</p>
          {/* timer */}
          <div className="flex gap-3 mb-6">
            {[[h, 'Hours'], [m, 'Mins'], [s, 'Secs']].map(([val, label]) => (
              <div key={label} className="bg-white/[0.08] rounded-2xl px-4 py-3 flex flex-col items-center min-w-[70px]">
                <span className="text-[28px] font-extrabold text-[#F8FAFC]">{val}</span>
                <span className="text-[11px] text-[#94A3B8]">{label}</span>
              </div>
            ))}
          </div>
          <Link
            to="/shop?sale=true"
            className="bg-[#1E3A8A] text-white font-bold text-[15px] px-10 py-3.5 rounded-full hover:bg-blue-700 transition"
            style={{ backgroundColor: '#22c55e' }}
          >
            Grab the Deal
          </Link>
        </div>
      </div>
    </div>
  )
}
