import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../components/ProductCard'

export type CartItem = Product & { quantity: number }

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isInCart: (id: number) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    addToCart: (product, quantity = 1) =>
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id)
        if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        return [...prev, { ...product, quantity }]
      }),
    removeFromCart: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
    updateQuantity: (id, quantity) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => i.id === id ? { ...i, quantity } : i)
      ),
    clearCart: () => setItems([]),
    isInCart: (id) => items.some((i) => i.id === id),
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
