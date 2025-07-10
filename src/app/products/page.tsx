'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apiService, Product, productsApi, categoriesApi, Category } from '../../API'
import React from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [stockModal, setStockModal] = useState<{ isOpen: boolean; productId: string; currentStock: number }>({
    isOpen: false,
    productId: '',
    currentStock: 0
  })
  const [pricingModal, setPricingModal] = useState<{ isOpen: boolean; productId: string; currentPrice: number }>({
    isOpen: false,
    productId: '',
    currentPrice: 0
  })
  const [stockChange, setStockChange] = useState<number>(0)
  const [profitMargin, setProfitMargin] = useState<number>(20)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (error) {
      toast.error('Failed to fetch categories')
      console.error(error)
    }
  }

  // Helper function to check if a product belongs to a category or its subcategories
  const isProductInCategory = (product: Product, categoryId: string): boolean => {
    if (!categoryId) return true;
    if (product.mainCategory === categoryId) return true;
    if (product.subCategory === categoryId) return true;
    if (product.subSubCategory === categoryId) return true;

    // Find the selected category in the hierarchy
    const findCategory = (cats: Category[]): Category | undefined => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat;
        if (cat.subCategories) {
          const found = findCategory(cat.subCategories);
          if (found) return found;
        }
      }
      return undefined;
    };

    const selectedCategory = findCategory(categories);
    if (!selectedCategory) return false;

    // Check if product's category is in the selected category's hierarchy
    const isInHierarchy = (category: Category): boolean => {
      if (product.mainCategory === category.id) return true;
      if (product.subCategory === category.id) return true;
      if (product.subSubCategory === category.id) return true;
      
      return category.subCategories?.some(isInHierarchy) || false;
    };

    return isInHierarchy(selectedCategory);
  };

  // Filter products based on search query and selected category
  const filteredProducts = products.filter(product =>
    (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     product.mainCategory.toLowerCase().includes(searchQuery.toLowerCase())) &&
    isProductInCategory(product, selectedCategory)
  )

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await apiService.getProducts()
      setProducts(data)
    } catch (error) {
      toast.error('Failed to fetch products')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Handle quick stock update
  const handleStockUpdate = async () => {
    try {
      await productsApi.quickStockUpdate(stockModal.productId, stockChange)
      toast.success('Stock updated successfully')
      setStockModal({ isOpen: false, productId: '', currentStock: 0 })
      setStockChange(0)
      fetchProducts() // Refresh the list
    } catch (error) {
      toast.error('Failed to update stock')
      console.error(error)
    }
  }

  // Handle proportional pricing update
  const handlePricingUpdate = async () => {
    try {
      await productsApi.updateProportionalPricing(pricingModal.productId, pricingModal.currentPrice, profitMargin)
      toast.success('Pricing updated successfully')
      setPricingModal({ isOpen: false, productId: '', currentPrice: 0 })
      fetchProducts() // Refresh the list
    } catch (error) {
      toast.error('Failed to update pricing')
      console.error(error)
    }
  }

  // Open stock modal
  const openStockModal = (productId: string, currentStock: number) => {
    setStockModal({ isOpen: true, productId, currentStock })
    setStockChange(0)
  }

  // Open pricing modal
  const openPricingModal = (productId: string, currentPrice: number) => {
    setPricingModal({ isOpen: true, productId, currentPrice })
  }

  // Helper function to render category options recursively
  const renderCategoryOptions = (categories: Category[]) => {
    return categories.map(category => (
      <React.Fragment key={category.id}>
        <option value={category.id}>{category.name}</option>
        {category.subCategories?.map(subCategory => (
          <React.Fragment key={subCategory.id}>
            <option value={subCategory.id}>&nbsp;&nbsp;└─ {subCategory.name}</option>
            {subCategory.subCategories?.map(subSubCategory => (
              <option key={subSubCategory.id} value={subSubCategory.id}>
                &nbsp;&nbsp;&nbsp;&nbsp;└─ {subSubCategory.name}
              </option>
            ))}
          </React.Fragment>
        ))}
      </React.Fragment>
    ));
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading products...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-primary-100 p-2 rounded-lg">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-primary-600" />
              </span>
              Products Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your inventory and product catalog efficiently
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/products/new"
              className="btn-primary flex items-center gap-x-2 hover:scale-105 transition-transform duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or category..."
                className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow duration-200"
              />
            </div>
            <div className="w-full sm:w-72">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-lg border-0 py-3 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 font-mono transition-shadow duration-200"
              >
                <option value="">All Categories</option>
                {renderCategoryOptions(categories)}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quick Actions
                  </th>
                  <th scope="col" className="relative py-4 pl-3 pr-6">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gray-100 rounded-full p-3">
                          <PlusIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 max-w-sm">
                          {searchQuery 
                            ? `No products found matching "${searchQuery}"`
                            : "No products found. Add your first product to get started."
                          }
                        </p>
                        <Link 
                          href="/products/new" 
                          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                        >
                          Add Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr 
                      key={product.id || product._id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                        <div className="flex items-center">
                          {product.images && product.images[0] && (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                        <div className="flex flex-col gap-1.5">
                          {categories.find(cat => cat.id === product.mainCategory)?.name && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                              {categories.find(cat => cat.id === product.mainCategory)?.name}
                            </span>
                          )}
                          {product.subCategory && categories.find(cat => cat.id === product.subCategory)?.name && (
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20">
                              {categories.find(cat => cat.id === product.subCategory)?.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="text-gray-900 font-medium">
                          LKR {Number(product.sellingPrice || 0).toFixed(2)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          Base: LKR {Number(product.basePrice || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {(() => {
                          const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                          return (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              totalStock > 10
                                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                : totalStock > 0
                                ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                            }`}>
                              {totalStock} in stock
                            </span>
                          );
                        })()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openStockModal(product.id || product._id || '', product.variants[0]?.stock || 0)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                          >
                            Stock +/-
                          </button>
                          <button
                            onClick={() => openPricingModal(product.id || product._id || '', product.purchasedPrice || 0)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                          >
                            Price %
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <Link
                          href={`/products/${product.id || product._id}/edit`}
                          className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                        >
                          Edit<span className="sr-only">, {product.name}</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Update Modal */}
        {stockModal.isOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Stock</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Change</label>
                  <input
                    type="number"
                    value={stockChange}
                    onChange={(e) => setStockChange(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Enter stock change"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setStockModal({ isOpen: false, productId: '', currentStock: 0 })}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStockUpdate}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Update Modal */}
        {pricingModal.isOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Pricing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profit Margin (%)</label>
                  <input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Enter profit margin percentage"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPricingModal({ isOpen: false, productId: '', currentPrice: 0 })}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePricingUpdate}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Update Pricing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 