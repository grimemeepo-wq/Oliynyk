'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { CartItem } from '@/lib/types'

const CART_KEY = 'oliynyk-cart'

interface CartContextType {
  cart: CartItem[]
  cartCount: number
  cartOpen: boolean
  setCartOpen: (v: boolean) => void
  addToCart: (item: Omit<CartItem, 'key'>) => void
  changeQty: (idx: number, delta: number) => void
  removeItem: (idx: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) setCart(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch {}
  }, [cart])

  const addToCart = useCallback((item: Omit<CartItem, 'key'>) => {
    const key = `${item.product.id}|${item.optionLabel}|${item.finalPrice}`
    setCart(prev => {
      const ex = prev.find(c => c.key === key)
      if (ex) return prev.map(c => c.key === key ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, key }]
    })
    setCartOpen(true)
  }, [])

  const changeQty = useCallback((idx: number, delta: number) => {
    setCart(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], qty: next[idx].qty + delta }
      if (next[idx].qty <= 0) next.splice(idx, 1)
      return next
    })
  }, [])

  const removeItem = useCallback((idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  return (
    <CartContext.Provider value={{ cart, cartCount, cartOpen, setCartOpen, addToCart, changeQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
