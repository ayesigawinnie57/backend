import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Product } from '../components/ProductCard'
import { tokenStore } from './auth'
import api from './api'

type WishlistContextValue = {
  items: Product[]
  hydrated: boolean
  isWishlisted: (id: number) => boolean
  toggleWishlist: (product: Product) => void
  removeFromWishlist: (id: number) => void
}

const WISHLIST_KEY = 'majo_wishlist'
const WishlistContext = createContext<WishlistContextValue | null>(null)

const toProduct = (raw: any): Product => ({
  id: raw.product_id,
  name: raw.product_name,
  price: Number(raw.product_price),
  image: raw.product_image ?? undefined,
  slug: raw.product_slug || undefined,
  category: raw.product_category || '',
  rating: Number(raw.product_rating ?? 0),
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Hydrate: try backend first, fall back to AsyncStorage
  useEffect(() => {
    ;(async () => {
      const token = await tokenStore.getAccess()
      if (token) {
        try {
          const { data } = await api.get('/api/auth/wishlist/')
          setItems((data as any[]).map(toProduct))
          setIsLoggedIn(true)
          setHydrated(true)
          return
        } catch { }
      }
      const raw = await AsyncStorage.getItem(WISHLIST_KEY)
      if (raw) { try { setItems(JSON.parse(raw)) } catch { } }
      setHydrated(true)
    })()
  }, [])

  // Persist to AsyncStorage for guests
  useEffect(() => {
    if (!hydrated || isLoggedIn) return
    AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
  }, [items, hydrated, isLoggedIn])

  const toggleWishlist = async (product: Product) => {
    const wishlisted = items.some(i => i.id === product.id)
    setItems(current =>
      wishlisted
        ? current.filter(i => i.id !== product.id)
        : [...current, product]
    )
    const token = await tokenStore.getAccess()
    if (token) {
      if (wishlisted) {
        api.delete(`/api/auth/wishlist/${product.id}/`).catch(() => {})
      } else {
        api.post('/api/auth/wishlist/', {
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image ?? null,
          product_slug: product.slug ?? '',
          product_category: product.category,
          product_rating: product.rating,
        }).catch(() => {})
      }
    }
  }

  const removeFromWishlist = async (id: number) => {
    setItems(current => current.filter(i => i.id !== id))
    const token = await tokenStore.getAccess()
    if (token) api.delete(`/api/auth/wishlist/${id}/`).catch(() => {})
  }

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    hydrated,
    isWishlisted: (id) => items.some(i => i.id === id),
    toggleWishlist,
    removeFromWishlist,
  }), [items, hydrated])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const value = useContext(WishlistContext)
  if (!value) throw new Error('useWishlist must be used inside WishlistProvider')
  return value
}
