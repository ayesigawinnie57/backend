import { Link } from 'react-router-dom'
import type { Product } from '../lib/api'
import ProductCard from '../components/ProductCard'

export default function Recommended({ products }: { products: Product[] }) {
  const slice = products.slice(6, 12)

  if (!slice.length) return null

  return (
    <div className="bg-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[20px] font-extrabold text-[#071A2B]">Recommended for You</p>
            <p className="text-[12px] text-[#64748B] mt-0.5">Picked based on what shoppers love</p>
          </div>
          <Link to="/shop" className="text-[13px] font-semibold text-[#1E3A8A]">See All →</Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {slice.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}
