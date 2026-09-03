import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Product } from '@/API'

interface Props {
  products: Product[]
  loading: boolean
  searchQuery: string
  setSearchQuery: (value: string) => void
  onAdd: (product: Product) => void
}

export default function ProductSearchPanel({ products, loading, searchQuery, setSearchQuery, onAdd }: Props) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-secondary-900 mb-4">Products</h2>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10 mb-4"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-secondary-400">Loading products...</div>
      ) : (
        <div className="max-h-[32rem] overflow-y-auto space-y-2 pr-1">
          {products.length === 0 ? (
            <div className="text-center py-8 text-secondary-400">
              {searchQuery ? `No products found matching "${searchQuery}"` : 'No products available'}
            </div>
          ) : (
            products.map((product) => {
              const variant = product.variants && product.variants[0]
              return (
                <div
                  key={product.id || product._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-secondary-900 truncate">{product.name}</h3>
                    <p className="text-xs text-secondary-400">{product.mainCategory}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-primary-700">
                        LKR {(variant?.sellingPrice ?? product.sellingPrice ?? 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-secondary-400">{variant?.stock ?? 0} in stock</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onAdd(product)}
                    className="ml-3 inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors shrink-0"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
