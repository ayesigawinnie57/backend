import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi, toProduct, type Product } from '../lib/api'

const messages = [
  'Crystal-clear sound for every moment.',
  'Stay ahead with smart features on your wrist.',
  'Protect your phone with standout style.',
  'Move further with comfort built into every step.',
  'Make every workout feel better and stronger.',
  'Hydration made easy wherever the day takes you.',
]

export default function Hero() {
  const [products, setProducts] = useState<(Product & { message: string })[]>([])
  const [index, setIndex] = useState(0)
  const [sliding, setSliding] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    productsApi.list().then(({ data }) => {
      const raw: any[] = Array.isArray(data) ? data : (data as any).results ?? []
      setProducts(raw.slice(0, 6).map((p, i) => ({ ...toProduct(p), message: messages[i % messages.length] })))
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (products.length < 2) return
    const id = setInterval(() => {
      if (!trackRef.current) return
      setSliding(true)
      trackRef.current.style.transition = 'transform 550ms cubic-bezier(0.37,0,0.63,1)'
      trackRef.current.style.transform = 'translateX(-100%)'
      setTimeout(() => {
        setIndex(i => (i + 1) % products.length)
        if (trackRef.current) {
          trackRef.current.style.transition = 'none'
          trackRef.current.style.transform = 'translateX(0)'
        }
        setSliding(false)
      }, 560)
    }, 3500)
    return () => clearInterval(id)
  }, [products.length])

  const cur = products[index]
  const next = products.length > 1 ? products[(index + 1) % products.length] : cur

  if (!cur || !next) return null

  const renderBanner = (p: typeof cur) => (
    <div className="relative w-full shrink-0 h-[190px] rounded-[20px] overflow-hidden border border-[#E2E8F0] shadow-md bg-[#F8FAFC]">
      {p.image && <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />}
      {/* gradient left-to-right exactly like mobile SVG */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(7,26,43,0.9) 0%, rgba(7,26,43,0.62) 42%, rgba(7,26,43,0.18) 72%, rgba(7,26,43,0) 100%)' }} />
      {/* badge */}
      <div className="absolute top-3 left-3.5 bg-[#1E3A8A] rounded-[6px] px-1.5 py-1">
        <span className="text-white text-[8px] font-extrabold">{p.originalPrice ? 'LIMITED OFFER' : 'JUST ADDED'}</span>
      </div>
      {/* copy */}
      <div className="absolute inset-0 flex flex-col justify-center pt-10 pl-3.5 w-[66%]">
        <p className="text-[#1E3A8A] text-[10px] font-extrabold uppercase mb-1.5">Fresh pick for you</p>
        <p className="text-[#F8FAFC] text-[21px] font-extrabold leading-[25px] mb-1.5 line-clamp-2">{p.name}</p>
        <p className="text-[#94A3B8] text-[12px] leading-[17px] mb-2.5 line-clamp-2">{p.message}</p>
        <p className="text-[#F8FAFC] text-[14px] font-extrabold mb-2">UGX {p.price.toLocaleString()}</p>
        <Link to="/shop" className="self-start bg-[#1E3A8A] text-white text-[11px] font-extrabold px-2.5 py-[7px] rounded-lg">Shop Now →</Link>
      </div>
    </div>
  )

  return (
    <div className="bg-[#F8FAFC] px-5 py-6 flex flex-col items-center">
      {/* viewport */}
      <div className="w-full overflow-hidden rounded-[20px]">
        <div ref={trackRef} className="flex w-[200%]" style={{ transform: 'translateX(0)' }}>
          <div className="w-1/2 px-0">{renderBanner(cur)}</div>
          <div className="w-1/2 px-0">{renderBanner(next)}</div>
        </div>
      </div>
      {/* dots */}
      {products.length > 1 && (
        <div className="flex gap-[5px] mt-3 mb-2">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === index ? 18 : 6, backgroundColor: i === index ? '#1E3A8A' : '#E2E8F0' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
