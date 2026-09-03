'use client'

import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { Product, RepairPart } from '@/API'
import { useAvailableProducts } from '@/hooks/useAvailableProducts'
import PartSearchBox from './PartSearchBox'

interface Props {
  parts: RepairPart[]
  addPart: (part: RepairPart) => void
  updatePart: (index: number, updates: Partial<RepairPart>) => void
  removePart: (index: number) => void
  partsCost: number
}

export default function RepairPartsForm({ parts, addPart, updatePart, removePart, partsCost }: Props) {
  const { products, loading } = useAvailableProducts()

  const handleSelectProduct = (product: Product) => {
    const price = product.variants?.[0]?.sellingPrice ?? product.sellingPrice ?? 0
    addPart({ productId: product.id || product._id, name: product.name, price, quantity: 1 })
  }

  const handleAddCustom = () => addPart({ name: '', price: 0, quantity: 1 })

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-secondary-900 mb-1">Parts Used</h2>
      <p className="text-xs text-secondary-400 mb-4">
        Select from the product catalog or add a custom part not in stock. Price is always editable.
      </p>

      <PartSearchBox products={products} loading={loading} onSelect={handleSelectProduct} />
      <button
        type="button"
        onClick={handleAddCustom}
        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        <FiPlus className="h-4 w-4" /> Add Custom Part
      </button>

      {parts.length > 0 && (
        <div className="mt-4 space-y-2">
          {parts.map((part, index) => (
            <div key={index} className="flex items-center gap-2 rounded-lg border border-secondary-100 p-2">
              {part.productId ? (
                <span className="flex-1 truncate text-sm text-secondary-800">{part.name}</span>
              ) : (
                <input
                  value={part.name}
                  onChange={(e) => updatePart(index, { name: e.target.value })}
                  placeholder="Part name"
                  className="input-field flex-1 py-1.5 text-sm"
                />
              )}
              <input
                type="number"
                min={0}
                step="0.01"
                value={part.price}
                onChange={(e) => updatePart(index, { price: Number(e.target.value) })}
                className="input-field w-24 py-1.5 text-sm"
                title="Price"
              />
              <input
                type="number"
                min={1}
                value={part.quantity}
                onChange={(e) => updatePart(index, { quantity: Number(e.target.value) })}
                className="input-field w-16 py-1.5 text-sm"
                title="Qty"
              />
              <button type="button" onClick={() => removePart(index)} className="text-secondary-400 hover:text-red-600">
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-secondary-100 pt-3 text-sm font-semibold text-secondary-900">
        <span>Parts Subtotal</span>
        <span>LKR {partsCost.toFixed(2)}</span>
      </div>
    </div>
  )
}
