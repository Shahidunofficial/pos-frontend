'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, ShoppingCartIcon, PlusIcon } from '@heroicons/react/24/outline'
import { apiService, Product } from '../../../API'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

const saleSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  customerPhone: z.string().optional(),
})

type SaleFormData = z.infer<typeof saleSchema>

export default function NewSalePage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
  })

  // Filter products based on search query and stock availability
  const filteredProducts = products.filter(product =>
      (product.variants && product.variants.some(v => v.stock > 0)) && 
  ((product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
   (product.mainCategory?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
  )

  // Fetch available products from backend
  const fetchAvailableProducts = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAvailableProducts()
      setProducts(data)
    } catch (error) {
      toast.error('Failed to fetch available products')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailableProducts()
  }, [])

  const addToCart = (product: Product) => {
    const productId = product._id || product.id
    if (!productId) return
    
    // Get the default variant (first variant)
    const defaultVariant = product.variants && product.variants[0]
    if (!defaultVariant) {
      toast.error('No variant available for this product')
      return
    }
    
    // Check if adding one more would exceed stock
    const existingItem = cart.find(item => item.productId === productId)
    const currentQuantity = existingItem ? existingItem.quantity : 0
    
    if (currentQuantity >= defaultVariant.stock) {
      toast.error(`Cannot add more. Only ${defaultVariant.stock} in stock`)
      return
    }

    setCart((prev) => {
      if (existingItem) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId, name: product.name, price: defaultVariant.sellingPrice, quantity: 1 }]
    })
    toast.success(`${product.name} added to cart`)
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
    toast.success('Item removed from cart')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    
    // Check stock limit
    const product = products.find(p => (p._id || p.id) === productId)
    const defaultVariant = product?.variants && product.variants[0]
    if (defaultVariant && quantity > defaultVariant.stock) {
      toast.error(`Cannot exceed stock limit of ${defaultVariant.stock}`)
      return
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const onSubmit = async (data: SaleFormData) => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setIsSubmitting(true)
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        customerName: data.customerName || undefined,
      }

      const sale = await apiService.createSale(saleData)
      
      // Automatically generate and print receipt
      await printReceipt(sale._id || sale.id || '')
      
      toast.success('Sale completed successfully')
      
      // Refresh products to get updated stock
      await fetchAvailableProducts()
      
      // Clear cart and form
      setCart([])
      
      // Redirect to sales page or stay for next sale
      // router.push('/sales')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete sale')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Print receipt function
  const printReceipt = async (saleId: string) => {
    try {
      const { receiptText } = await apiService.getPrintReceipt(saleId)
      
      // For 80mm thermal printer, we can use the Web API or create a print-friendly format
      const printWindow = window.open('', '_blank', 'width=300,height=600')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - Sale #${saleId}</title>
              <style>
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 12px; 
                  margin: 0; 
                  padding: 10px;
                  width: 80mm;
                  line-height: 1.2;
                }
                pre { 
                  margin: 0; 
                  white-space: pre-wrap; 
                  font-size: 10px;
                }
                .receipt-container {
                  width: 100%;
                  max-width: 80mm;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                <div class="no-print" style="text-align: center; margin-bottom: 10px;">
                  <button onclick="window.print()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Receipt</button>
                  <button onclick="window.close()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 8px;">Close</button>
                </div>
                <pre>${receiptText}</pre>
              </div>
              <script>
                // Auto-print for thermal printers
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 500);
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
      
      toast.success('Receipt generated for 80mm printer')
    } catch (error) {
      toast.error('Failed to print receipt')
      console.error(error)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-secondary-900">New Sale</h1>
          <p className="mt-2 text-sm text-secondary-600">Create a new sale transaction.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Products</h2>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 mb-4"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? `No products found matching "${searchQuery}"` : 'No products available'}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.mainCategory}</p>
                      <p className="text-sm font-semibold text-green-600">
                        LKR {((product.variants && product.variants[0]?.sellingPrice || product.sellingPrice || 0)).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.variants && product.variants[0]?.stock || 0} in stock
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Cart and Customer Information */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Cart</h2>
              <div className="mt-4 flow-root">
                <div className="table-container">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-secondary-900">
                          Product
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">
                          Quantity
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">
                          Price
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {cart.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-secondary-500">
                            <div className="flex flex-col items-center gap-2">
                              <ShoppingCartIcon className="h-12 w-12 text-secondary-300" />
                              <p>No items in cart. Add products to begin.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        cart.map((item) => (
                          <tr key={item.productId} className="hover:bg-secondary-50 transition-colors">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-secondary-900">
                              {item.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-600">
                              <input
                                type="number"
                                min="1"
                                max={products.find(p => p.id === item.productId)?.variants && products.find(p => p.id === item.productId)?.variants[0]?.stock || item.quantity}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                                className="input-field w-20"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-600">
                              LKR {(item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.productId)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-secondary-50">
                      <tr>
                        <th
                          scope="row"
                          colSpan={2}
                          className="pl-4 pr-3 py-4 text-right text-sm font-semibold text-secondary-900"
                        >
                          Total
                        </th>
                        <td className="px-3 py-4 text-sm font-semibold text-secondary-900">
                          LKR {calculateTotal().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="card animate-slide-up">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-secondary-700">
                    Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="customerName"
                      {...register('customerName')}
                      className="input-field"
                      placeholder="Enter customer name"
                    />
                    {errors.customerName && (
                      <p className="mt-2 text-sm text-red-600">{errors.customerName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-secondary-700">
                    Email (Optional)
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      id="customerEmail"
                      {...register('customerEmail')}
                      className="input-field"
                      placeholder="Enter customer email"
                    />
                    {errors.customerEmail && (
                      <p className="mt-2 text-sm text-red-600">{errors.customerEmail.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-secondary-700">
                    Phone (Optional)
                  </label>
                  <div className="mt-2">
                    <input
                      type="tel"
                      id="customerPhone"
                      {...register('customerPhone')}
                      className="input-field"
                      placeholder="Enter customer phone"
                    />
                    {errors.customerPhone && (
                      <p className="mt-2 text-sm text-red-600">{errors.customerPhone.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : `Complete Sale (LKR ${calculateTotal().toFixed(2)})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 