import { useState } from 'react'
import toast from 'react-hot-toast'
import { Product } from '@/API'
import { CartItem } from '@/components/sales/cartTypes'

export function useSaleCart(products: Product[]) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (product: Product) => {
    const productId = product._id || product.id
    const variant = product.variants?.[0]
    if (!productId || !variant) return toast.error('No variant available for this product')

    const existing = cart.find((i) => i.productId === productId)
    if ((existing?.quantity ?? 0) >= variant.stock) return toast.error(`Cannot add more. Only ${variant.stock} in stock`)

    setCart((prev) =>
      existing
        ? prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { productId, name: product.name || '', price: variant.sellingPrice, quantity: 1 }],
    )
    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    const maxStock = products.find((p) => (p._id || p.id) === productId)?.variants?.[0]?.stock
    if (maxStock !== undefined && quantity > maxStock) return toast.error(`Cannot exceed stock limit of ${maxStock}`)
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)))
  }

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((i) => i.productId !== productId))
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return { cart, setCart, addToCart, updateQuantity, removeFromCart, total }
}
