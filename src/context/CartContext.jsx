import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'kk_cart_v1'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage unavailable — cart just won't persist, not fatal
    }
  }, [items])

  function addItem(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id)
      const maxQty = product.stock_quantity ?? 99
      if (existing) {
        const nextQty = Math.min(existing.qty + qty, maxQty)
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, qty: nextQty } : i
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] ?? null,
          maxQty,
          qty: Math.min(qty, maxQty),
        },
      ]
    })
    setIsOpen(true)
  }

  function updateQty(productId, qty) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product_id === productId
            ? { ...i, qty: Math.max(1, Math.min(qty, i.maxQty ?? 99)) }
            : i
        )
    )
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
