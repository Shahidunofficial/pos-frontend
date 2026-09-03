'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Product } from '@/API'

interface Props {
  products: Product[]
  loading: boolean
  onSelect: (product: Product) => void
}

export default function PartSearchBox({ products, loading, onSelect }: Props) {
  const [query, setQuery] = useState('')

  const matches = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : []

  const handleSelect = (product: Product) => {
    onSelect(product)
    setQuery('')
  }

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loading ? 'Loading products...' : 'Search product catalog by name...'}
          disabled={loading}
          className="input-field pl-9"
        />
      </div>

      {query.trim() && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-secondary-200 bg-white shadow-lg">
          {matches.length === 0 ? (
            <div className="px-3 py-2 text-sm text-secondary-400">No matching product. Use &quot;Add Custom Part&quot; below.</div>
          ) : (
            matches.map((product) => {
              const price = product.variants?.[0]?.sellingPrice ?? product.sellingPrice ?? 0
              return (
                <button
                  key={product.id || product._id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-primary-50"
                >
                  <span className="truncate text-secondary-800">{product.name}</span>
                  <span className="ml-3 shrink-0 font-medium text-primary-700">LKR {price.toFixed(2)}</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
