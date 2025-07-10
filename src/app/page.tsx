'use client'

import { useState, useEffect } from 'react'
import { CurrencyDollarIcon, ShoppingCartIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface SalesOverview {
  totalSales: number
  totalRevenue: number
  averageOrderValue: number
  totalProducts: number
  topSellingProducts: ProductSalesReport[]
}

interface ProductSalesReport {
  productId: string
  name: string
  totalQuantitySold: number
  totalRevenue: number
  averagePrice: number
}

interface Sale {
  _id: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  total: number
  createdAt: string
  customerName?: string
}

export default function Home() {
  const [overview, setOverview] = useState<SalesOverview>({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    topSellingProducts: []
  })
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch sales overview
      const overviewResponse = await fetch('http://localhost:3001/reports/overview')
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json()
        setOverview(overviewData)
      }

      // Fetch recent sales using the new analytics endpoint
      const today = new Date()
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      const startDate = thirtyDaysAgo.toISOString().split('T')[0]
      const endDate = today.toISOString().split('T')[0]
      
      const salesResponse = await fetch(`http://localhost:3001/reports/date-range?startDate=${startDate}&endDate=${endDate}`)
      if (salesResponse.ok) {
        const salesData = await salesResponse.json()
        // Get the most recent 5 sales
        setRecentSales(salesData.slice(-5).reverse())
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const stats = overview ? [
    { 
      name: 'Total Sales', 
      value: `$${overview.totalRevenue.toFixed(2)}`, 
      change: `${overview.totalSales} transactions`, 
      changeType: 'positive' as const, 
      icon: CurrencyDollarIcon 
    },
    { 
      name: 'Average Order', 
      value: `$${overview.averageOrderValue.toFixed(2)}`, 
      change: 'Per transaction', 
      changeType: 'positive' as const, 
      icon: ShoppingCartIcon 
    },
    { 
      name: 'Total Products', 
      value: overview.totalProducts.toString(), 
      change: 'In inventory', 
      changeType: 'positive' as const, 
      icon: UserGroupIcon 
    },
    { 
      name: 'Revenue', 
      value: `$${overview.totalRevenue.toFixed(2)}`, 
      change: 'All time', 
      changeType: 'positive' as const, 
      icon: ChartBarIcon 
    },
  ] : [
    { name: 'Total Sales', value: '$0.00', change: 'Loading...', changeType: 'positive' as const, icon: CurrencyDollarIcon },
    { name: 'Average Order', value: '$0.00', change: 'Loading...', changeType: 'positive' as const, icon: ShoppingCartIcon },
    { name: 'Total Products', value: '0', change: 'Loading...', changeType: 'positive' as const, icon: UserGroupIcon },
    { name: 'Revenue', value: '$0.00', change: 'Loading...', changeType: 'positive' as const, icon: ChartBarIcon },
  ]

  return (
    <div className="py-10 animate-fade-in">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="card animate-slide-up">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-secondary-500">{stat.name}</h3>
                  <div className="mt-1">
                    <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
                    <p className="mt-1 text-sm text-secondary-500">
                      <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                        {stat.change}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Sales */}
          <div className="card">
            <h3 className="text-base font-semibold text-secondary-900">Recent Sales</h3>
            <div className="mt-6 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading recent sales...</div>
                  ) : recentSales.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No recent sales</div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">Sale ID</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">Customer</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">Amount</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentSales.map((sale) => (
                          <tr key={sale._id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-900">#{sale._id}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-900">
                              {sale.customerName || 'Walk-in Customer'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-900">
                              ${sale.total.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Popular Products */}
          <div className="card">
            <h3 className="text-base font-semibold text-secondary-900">Popular Products</h3>
            <div className="mt-6 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading popular products...</div>
                  ) : !overview?.topSellingProducts?.length ? (
                    <div className="text-center py-8 text-gray-500">No product data available</div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">Product</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">Sold</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {overview.topSellingProducts.map((product: ProductSalesReport) => (
                          <tr key={product.productId}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-900">
                              {product.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-900">
                              {product.totalQuantitySold} units
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-900">
                              ${product.totalRevenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 