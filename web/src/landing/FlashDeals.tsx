import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi, toFlashSale, type FlashSale } from '../lib/api'
import { Link as RouterLink } from 'react-router-dom'

function useCountdown(endsAt: Date) {
  const calc = () => Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000))
  const [remaining, setRemaining] = useState(calc)

  useEffect(() => {
    const id = setInterval(() => setRemaining(calc), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const h = String(Math.floor(remaining / 3600)).padStart(2, '0')
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')
  const s = String(remaining % 60).padStart(2, '0')
  return { h, m, s, expired: remaining === 0 }
}

function FlashCard({ sale }: { sale: FlashSale }) {
  const { h, m, s, expired } = useCountdown(sale.endsAt)
  const { product } = sale

  return (
    <RouterLink
      to={`/shop/${product.slug}`}
      className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
    >
      <div className="relative bg-[#F8FAFC] aspect-square overflow-hidden">
        {product.image
          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
        }
        <div className="absolute top-1 left-1 bg-[#EF4444] rounded-[6px] px-1 py-0.5">
          <span className="text-white text-[8px] font-bold">-{sale.discountPct}%</span>
        </div>
      </div>

      <div className="p-[7px] flex flex-col gap-1">
        <p className="text-[10px] font-bold text-[#071A2B] leading-[14px] truncate">{product.name}</p>

        <div className="flex items-center flex-wrap gap-1">
          <span className="text-[10px] font-extrabold text-[#EF4444]">UGX {sale.flashPrice.toLocaleString()}</span>
          <span className="text-[8px] text-[#94A3B8] line-through">UGX {product.price.toLocaleString()}</span>
        </div>

        {/* stock bar */}
        <div>
          <div className="w-full h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#EF4444] rounded-full"
              style={{ width: `${Math.round((sale.stockLeft / sale.stockLimit) * 100)}%` }}
            />
          </div>
          <p className="text-[8px] text-[#64748B] mt-0.5">{sale.stockLeft} left</p>
        </div>

        {/* per-product countdown */}
        <div className="flex items-center gap-0.5">
          {expired
            ? <span className="text-[8px] text-[#EF4444] font-semibold">Expired</span>
            : <>
                <span className="text-[8px] text-[#64748B]">Ends:</span>
                {[[h, 'h'], [m, 'm'], [s, 's']].map(([val, unit], i) => (
                  <span key={unit} className="flex items-center gap-0.5">
                    <span className="bg-[#071A2B] rounded px-1 py-0.5 flex items-baseline gap-0.5">
                      <span className="text-white text-[8px] font-extrabold">{val}</span>
                      <span className="text-[#BBF7D0] text-[7px]">{unit}</span>
                    </span>
                    {i < 2 && <span className="text-[#071A2B] text-[8px] font-bold">:</span>}
                  </span>
                ))}
              </>
          }
        </div>
      </div>
    </RouterLink>
  )
}

export default function FlashDeals({ products: _ }: { products: unknown[] }) {
  const [sales, setSales] = useState<FlashSale[]>([])

  useEffect(() => {
    productsApi.flashSales().then(({ data }) => {
      const raw = Array.isArray(data) ? data : (data as any).results ?? []
      setSales(raw.map(toFlashSale))
    }).catch(() => undefined)
  }, [])

  if (!sales.length) return null

  return (
    <div className="bg-[#FFEDD5] px-4 py-6 border-t border-b border-[#FDBA74]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-3.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[20px] leading-none">🔥</span>
              <p className="text-[21px] font-extrabold text-[#071A2B]">Flash Deals</p>
            </div>
            <p className="text-[12px] text-[#64748B] mt-0.5">Big savings, available right now</p>
          </div>
          <Link to="/deals" className="text-[13px] font-bold text-[#1E3A8A]">See All →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sales.map(s => <FlashCard key={s.id} sale={s} />)}
        </div>
      </div>
    </div>
  )
}
