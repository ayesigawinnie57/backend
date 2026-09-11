import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../components/ProductCard'

type WishlistContextValue = {
  items: Product[]
  isWishlisted: (id: number) => boolean
  toggleWishlist: (product: Product) => void
  removeFromWishlist: (id: number) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    isWishlisted: (id) => items.some(item => item.id === id),
    toggleWishlist: (product) => setItems(current => current.some(item => item.id === product.id)
      ? current.filter(item => item.id !== product.id)
      : [...current, product]),
    removeFromWishlist: (id) => setItems(current => current.filter(item => item.id !== id)),
  }), [items])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const value = useContext(WishlistContext)
  if (!value) throw new Error('useWishlist must be used inside WishlistProvider')
  return value
}
