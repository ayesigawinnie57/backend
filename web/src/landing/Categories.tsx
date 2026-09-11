import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi, type ApiCategory } from '../lib/api'

const fallback: ApiCategory[] = [
  { id: 1, name: 'Electronics', slug: 'electronics', image: null },
  { id: 2, name: 'Fashion', slug: 'fashion', image: null },
  { id: 3, name: 'Home & Living', slug: 'home-living', image: null },
  { id: 4, name: 'Sports', slug: 'sports', image: null },
  { id: 5, name: 'Beauty', slug: 'beauty', image: null },
  { id: 6, name: 'Books', slug: 'books', image: null },
  { id: 7, name: 'Toys', slug: 'toys', image: null },
  { id: 8, name: 'Groceries', slug: 'groceries', image: null },
]

const emojis: Record<string, string> = {
  electronics: '📱', fashion: '👗', 'home-living': '🛋️',
  sports: '⚽', beauty: '💄', books: '📚', toys: '🧸', groceries: '🛒',
}

export default function Categories() {
  const [cats, setCats] = useState<ApiCategory[]>(fallback)

  useEffect(() => {
    productsApi.categories().then(({ data }) => {
      const raw = Array.isArray(data) ? data : (data as any).results ?? []
      if (raw.length) setCats(raw)
    }).catch(() => undefined)
  }, [])

  return (
    <section id="categories" className="py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-2">Shop by Category</h2>
          <p className="text-gray-500 text-sm">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {cats.map(cat => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden">
                {cat.image
                  ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
                  : <span className="text-xl">{emojis[cat.slug] ?? '🛍️'}</span>
                }
              </div>
              <span className="text-[10px] font-semibold text-navy text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
