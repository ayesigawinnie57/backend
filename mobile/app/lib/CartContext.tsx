import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Product } from '../components/ProductCard'
import { tokenStore } from './auth'
import api from './api'

export type CartItem = Product & { quantity: number }

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  hydrated: boolean
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isInCart: (id: number) => boolean
}

const CART_KEY = 'majo_cart'
const CartContext = createContext<CartContextValue | null>(null)

const toCartItem = (raw: any): CartItem => ({
  id: raw.product_id,
  name: raw.product_name,
  price: Number(raw.product_price),
  image: raw.product_image ?? undefined,
  slug: raw.product_slug || undefined,
  category: raw.product_category || '',
  rating: Number(raw.product_rating ?? 0),
  quantity: raw.quantity,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Hydrate: try backend first, fall back to AsyncStorage
  useEffect(() => {
    ;(async () => {
      const token = await tokenStore.getAccess()
      if (token) {
        try {
          const { data } = await api.get('/api/auth/cart/')
          setItems((data as any[]).map(toCartItem))
          setIsLoggedIn(true)
          setHydrated(true)
          return
        } catch { }
      }
      // Guest: load from AsyncStorage
      const raw = await AsyncStorage.getItem(CART_KEY)
      if (raw) { try { setItems(JSON.parse(raw)) } catch { } }
      setHydrated(true)
    })()
  }, [])

  // Persist to AsyncStorage for guests
  useEffect(() => {
    if (!hydrated || isLoggedIn) return
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, hydrated, isLoggedIn])

  const addToCart = async (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      return [...prev, { ...product, quantity }]
    })
    const token = await tokenStore.getAccess()
    if (token) {
      api.post('/api/auth/cart/', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image ?? null,
        product_slug: product.slug ?? '',
        product_category: product.category,
        product_rating: product.rating,
        quantity,
      }).catch(() => {})
    }
  }

  const removeFromCart = async (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
    const token = await tokenStore.getAccess()
    if (token) api.delete(`/api/auth/cart/${id}/`).catch(() => {})
  }

  const updateQuantity = async (id: number, quantity: number) => {
    setItems(prev =>
      quantity <= 0
        ? prev.filter(i => i.id !== id)
        : prev.map(i => i.id === id ? { ...i, quantity } : i)
    )
    const token = await tokenStore.getAccess()
    if (token) {
      if (quantity <= 0) api.delete(`/api/auth/cart/${id}/`).catch(() => {})
      else api.patch(`/api/auth/cart/${id}/`, { quantity }).catch(() => {})
    }
  }

  const clearCart = async () => {
    setItems([])
    const token = await tokenStore.getAccess()
    if (token) api.delete('/api/auth/cart/').catch(() => {})
    else AsyncStorage.removeItem(CART_KEY)
  }

  const value = useMemo<CartContextValue>(() => ({
    items,
    hydrated,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart: (id) => items.some(i => i.id === id),
  }), [items, hydrated])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
