import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { productsApi, Product } from '@/API'

export function useAvailableProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setProducts(await productsApi.getAvailable())
    } catch {
      toast.error('Failed to fetch available products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { products, loading, refresh }
}
