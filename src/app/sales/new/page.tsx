'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import MainLayout from '@/components/MainLayout'
import ProductSearchPanel from '@/components/sales/ProductSearchPanel'
import CartPanel from '@/components/sales/CartPanel'
import CustomerInfoForm, { SaleFormData } from '@/components/sales/CustomerInfoForm'
import { salesApi } from '@/API'
import { printSaleReceipt } from '@/utils/printSaleReceipt'
import { useAvailableProducts } from '@/hooks/useAvailableProducts'
import { useSaleCart } from '@/hooks/useSaleCart'

const saleSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  customerPhone: z.string().optional(),
})

export default function NewSalePage() {
  const router = useRouter()
  const { products, loading, refresh } = useAvailableProducts()
  const { cart, setCart, addToCart, updateQuantity, removeFromCart, total } = useSaleCart(products)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cashAmount, setCashAmount] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaleFormData>({ resolver: zodResolver(saleSchema) })

  const filteredProducts = products.filter(
    (p) =>
      p.variants?.some((v) => v.stock > 0) &&
      ((p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.mainCategory?.toLowerCase() || '').includes(searchQuery.toLowerCase())),
  )

  const onSubmit = async (data: SaleFormData) => {
    if (cart.length === 0) return toast.error('Cart is empty')
    setIsSubmitting(true)
    try {
      const sale = await salesApi.create({
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerName: data.customerName,
      })
      await printSaleReceipt(sale._id || sale.id || '', cart, cashAmount, total)
      toast.success('Sale completed successfully')
      await refresh()
      setCart([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete sale')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-secondary-900">New Sale</h1>
        <p className="mt-1 text-sm text-secondary-600">Search products, build the cart, and complete checkout.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProductSearchPanel
            products={filteredProducts}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAdd={addToCart}
          />

          <div className="space-y-6">
            <CartPanel
              cart={cart}
              products={products}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              cashAmount={cashAmount}
              setCashAmount={setCashAmount}
              total={total}
            />
            <CustomerInfoForm register={register} errors={errors} />
            <div className="flex justify-end gap-x-3">
              <button type="button" onClick={() => router.back()} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || cart.length === 0} className="btn-primary disabled:opacity-50">
                {isSubmitting ? 'Processing...' : `Complete Sale (LKR ${total.toFixed(2)})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
