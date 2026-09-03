import { ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Product } from '@/API'
import { CartItem } from './cartTypes'

interface Props {
  cart: CartItem[]
  products: Product[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  cashAmount: number
  setCashAmount: (value: number) => void
  total: number
}

export default function CartPanel({ cart, products, onUpdateQuantity, onRemove, cashAmount, setCashAmount, total }: Props) {
  const balance = cashAmount - total

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-secondary-900 mb-4">Cart</h2>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-secondary-400">
          <ShoppingCartIcon className="h-12 w-12 text-secondary-200" />
          <p className="text-sm">No items in cart. Add products to begin.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {cart.map((item) => {
            const maxStock = products.find((p) => (p.id || p._id) === item.productId)?.variants?.[0]?.stock
            return (
              <div key={item.productId} className="flex items-center gap-3 rounded-lg border border-secondary-100 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">{item.name}</p>
                  <p className="text-xs text-secondary-400">LKR {item.price.toFixed(2)} each</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={maxStock ?? item.quantity}
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                  className="input-field w-16 text-center"
                />
                <span className="w-24 text-right text-sm font-semibold text-secondary-900">
                  LKR {(item.price * item.quantity).toFixed(2)}
                </span>
                <button onClick={() => onRemove(item.productId)} className="text-secondary-400 hover:text-red-600 transition-colors">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 space-y-3 border-t border-secondary-100 pt-4">
        <div className="flex items-center justify-between text-base font-semibold text-secondary-900">
          <span>Total</span>
          <span>LKR {total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-secondary-700">Cash Amount</label>
          <input
            type="number"
            min={total}
            step="0.01"
            value={cashAmount}
            onChange={(e) => setCashAmount(Number(e.target.value))}
            className="input-field w-32 text-right"
          />
        </div>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-secondary-700">Balance</span>
          <span className={balance < 0 ? 'text-red-600' : 'text-green-600'}>LKR {balance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
