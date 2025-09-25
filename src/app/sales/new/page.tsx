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
  const [cashAmount, setCashAmount] = useState<number>(0)

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
      return [...prev, { 
        productId, 
        name: product.name || '',
        price: defaultVariant.sellingPrice, 
        quantity: 1 
      }]
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
          quantity: item.quantity,
          name: item.name,
          price: item.price
        })),
        customerName: data.customerName || undefined,
        cashAmount: cashAmount,
        total: calculateTotal(),
        balance: cashAmount - calculateTotal()
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

  // Create a custom receipt with full product names
  const createCustomReceipt = (receiptText: string) => {
    const lines = receiptText.split('\n');
    const customLines = [];
    let inProductSection = false;
    let productProcessed = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect start of product section (after customer info)
      if (line.includes('Cust:') || line.includes('Customer:')) {
        inProductSection = true;
        customLines.push(line);
        continue;
      }
      
      // Detect end of product section (subtotal line)
      if (line.includes('Subtotal:')) {
        // Add our custom product lines before subtotal if we haven't already
        if (!productProcessed) {
          cart.forEach(item => {
            // Add full product name
            customLines.push(item.name);
            // Add quantity and pricing with better spacing for 80mm width
            const qty = `${item.quantity}x`;
            const unitPrice = item.price.toFixed(2);
            const total = (item.quantity * item.price).toFixed(2);
            // Use wider spacing for 80mm receipt
            const spacedLine = `  ${qty.padEnd(8)}${unitPrice.padStart(8)}${total.padStart(12)}`;
            customLines.push(spacedLine);
          });
          customLines.push('----------------------------------');
          
          // Add cash amount and balance
          const total = calculateTotal().toFixed(2);
          const cash = cashAmount.toFixed(2);
          const balance = (cashAmount - calculateTotal()).toFixed(2);
          
          customLines.push(`Total:${total.padStart(28)}`);
          customLines.push(`Cash:${cash.padStart(29)}`);
          customLines.push(`Balance:${balance.padStart(26)}`);
          customLines.push('----------------------------------');
          productProcessed = true;
        }
        
        inProductSection = false;
        customLines.push(line);
        continue;
      }
      
      // Skip original product lines if we're in product section
      if (inProductSection && (
        line.match(/^\s*\d+x\s+\d+\.\d+\s+\d+\.\d+$/) || // Quantity line
        line.match(/^.+\.\.\.\s*$/) || // Truncated product name
        line.match(/^.+\s+\d+x\s+\d+\.\d+\s+\d+\.\d+$/) || // Full product line
        line.includes('---') // Separator lines in product section
      )) {
        continue;
      }
      
      // Add all other lines
      customLines.push(line);
    }
    
    return customLines.join('\n');
  };

  // Print receipt function
  const printReceipt = async (saleId: string) => {
    try {
      const { receiptText } = await apiService.getPrintReceipt(saleId)
      
      // Debug: Log the original receipt text
      console.log('Original receipt text:', receiptText);
      console.log('Cart items:', cart);
      
      const formattedReceiptText = createCustomReceipt(receiptText)
      
      // Debug: Log the formatted receipt text
      console.log('Formatted receipt text:', formattedReceiptText);

      // Calculate dynamic height based on content
      const lineHeight = 17; // Font size in px
      const padding = 2; // 1mm padding top and bottom
      const lines = formattedReceiptText.split('\n').length;
      const contentHeight = (lines * lineHeight * 1.2) + (padding * 2); // 1.2 is line-height
      const pageHeightMm = Math.max(contentHeight * 0.264583, 50); // Convert px to mm, minimum 50mm

      // Create an iframe for printing with preview
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position: fixed; right: 0; top: 0; width: 80mm; height: 100%; border: none; background: white; box-shadow: -2px 0 5px rgba(0,0,0,0.1); z-index: 9999;';
      document.body.appendChild(iframe);
      
      // Write the receipt content to the iframe
      const doc = iframe.contentWindow?.document;
      if (!doc) {
        throw new Error('Could not access iframe document');
      }

      const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <style>
              @page {
                margin: 0mm;
                size: 80mm auto;
                page-break-after: avoid;
                page-break-before: avoid;
                page-break-inside: avoid;
              }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 25px; 
                margin: 0mm; 
                padding: 2mm;
                width: 76mm; /* 80mm - 2mm padding on each side */
                line-height: 1.2;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                min-height: auto;
                overflow: visible;
              }
      pre { 
        margin: 0; 
        white-space: pre; 
        font-size: 17px;
        page-break-inside: avoid;
        page-break-before: avoid;
        page-break-after: avoid;
        width: 78mm; /* Match body width */
        font-family: 'Courier New', monospace;
        line-height: 1.4;
      }
      .product-line {
        margin-bottom: 4px;
      }
      .product-name {
        display: block;
        width: 100%;
        font-weight: bold;
        margin-bottom: 1px;
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
        overflow: visible;
        line-height: 1.2;
      }
      .product-details {
        display: flex;
        justify-content: space-between;
        padding-left: 8px;
      }
      .product-quantity-price {
        flex: 1;
      }
      .product-total {
        text-align: right;
        min-width: 70px;
      }
      .payment-details {
        margin-top: 10px;
        border-top: 1px dashed #000;
        padding-top: 5px;
      }
      .payment-line {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
      }
      .total-line {
        font-weight: bold;
        border-top: 1px dashed #000;
        border-bottom: 1px dashed #000;
        padding: 3px 0;
        margin: 3px 0;
      }
              .receipt-content {
                width: 100%;
                max-width: 78mm;
                overflow-wrap: break-word;
                word-break: break-word;
                page-break-after: avoid;
                page-break-before: avoid;
                page-break-inside: avoid;
                display: inline-block;
              }
       @media print {
         @page {
           size: 80mm auto;
           margin: 0mm;
           page-break-after: avoid;
           page-break-before: avoid;
           page-break-inside: avoid;
         }
         html, body {
           width: 80mm;
           margin: 0mm;
           padding: 0mm;
           page-break-after: avoid;
           page-break-before: avoid;
           page-break-inside: avoid;
           height: auto;
           min-height: auto;
         }
         * {
           page-break-inside: avoid !important;
           page-break-after: avoid !important;
           page-break-before: avoid !important;
         }
         .receipt-content {
           page-break-inside: avoid !important;
           display: block;
         }
       }
    </style>
  </head>
  <body>
    <div class="receipt-content">
      <pre>${formattedReceiptText}</pre>
    </div>
    <script>
      // Automatically print without dialog
      window.onload = function() {
        const mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function(mql) {
          if (!mql.matches) {
            // After printing is done, remove the iframe
            window.frameElement && window.frameElement.remove();
          }
        });
        
        window.print();
      };
    </script>
  </body>
</html>`;
      
      doc.open();
      doc.write(htmlContent);
      doc.close();

      // Get list of available printers
      if ('getPrinters' in iframe.contentWindow?.navigator) {
        try {
          const printers = await (iframe.contentWindow.navigator as any).getPrinters();
          console.log('Available printers:', printers);
          
          // You can select a specific printer here
          // const thermalPrinter = printers.find(p => p.name.includes('thermal'));
        } catch (e) {
          console.log('Printer enumeration not supported');
        }
      }

      // Try to use silent printing if available
      if ('webkitPrint' in iframe.contentWindow) {
        // For Chromium-based browsers with silent printing
        (iframe.contentWindow as any).webkitPrint({
          silent: true,
          printBackground: false,
          deviceName: 'Xprinter XP-T361U', // Your thermal printer name
          marginType: 'none',
          shouldPrintBackgrounds: false,
          shouldPrintSelectionOnly: false,
          mediaSize: { 
            width_microns: 80000,  // 80mm in microns
            height_microns: Math.round(pageHeightMm * 1000), // Dynamic height in microns
            is_continuous_feed: true,
            custom_display_name: '80mm Receipt'
          },
          scaleFactor: 100,
          headerFooterEnabled: false
        });
      } else if ('mozPrint' in iframe.contentWindow) {
        // For Firefox with silent printing
        (iframe.contentWindow as any).mozPrint({
          silent: true,
          printerName: 'Xprinter XP-T361U', // Your thermal printer name
          marginType: 'none',
          paperWidth: '80mm',
          paperHeight: pageHeightMm + 'mm'
        });
      } else {
        // For standard printing, add specific thermal printer settings
        const printWindow = iframe.contentWindow;
        if (printWindow) {
          // Add thermal printer specific styles
          const thermalStyle = printWindow.document.createElement('style');
          thermalStyle.textContent = `
            @media print {
              @page {
                size: 80mm auto !important;
                margin: 0mm !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                page-break-inside: avoid !important;
              }
              html, body {
                width: 80mm !important;
                margin: 0mm !important;
                padding: 0mm !important;
                height: auto !important;
                page-break-inside: avoid !important;
              }
              * {
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
              }
            }
          `;
          printWindow.document.head.appendChild(thermalStyle);
          
          // Call print with a slight delay to ensure styles are applied
          setTimeout(() => {
            printWindow.print();
          }, 100);
        }
      }

      // Listen for print completion
      const checkPrintCompletion = setInterval(() => {
        if (iframe.contentWindow?.document.readyState === 'complete') {
          clearInterval(checkPrintCompletion);
          document.body.removeChild(iframe);
        }
      }, 1000);

      toast.success('Receipt sent to printer');
    } catch (error) {
      toast.error('Failed to print receipt');
      console.error(error);
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
                            <td className="py-4 pl-4 pr-3 text-sm font-medium text-secondary-900">
                              <div style={{ maxWidth: '300px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                {item.name}
                              </div>
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
                      <tr>
                        <th
                          scope="row"
                          colSpan={2}
                          className="pl-4 pr-3 py-4 text-right text-sm font-medium text-secondary-900"
                        >
                          Cash Amount
                        </th>
                        <td className="px-3 py-4 text-sm text-secondary-900">
                          <input
                            type="number"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(Number(e.target.value))}
                            className="input-field w-32"
                            min={calculateTotal()}
                            step="0.01"
                          />
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <th
                          scope="row"
                          colSpan={2}
                          className="pl-4 pr-3 py-4 text-right text-sm font-medium text-secondary-900"
                        >
                          Balance
                        </th>
                        <td className="px-3 py-4 text-sm font-semibold text-green-600">
                          LKR {(cashAmount - calculateTotal()).toFixed(2)}
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