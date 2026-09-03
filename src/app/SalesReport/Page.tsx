'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, ChartBarIcon, CurrencyDollarIcon, ShoppingBagIcon, PrinterIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { SalesReportApi, SalesOverview, DailySalesReport, MonthlySalesReport, InventoryAnalysis, Sale } from '../../API/SalesReport'
import MainLayout from '../../components/MainLayout'

export default function SalesReportPage() {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<SalesOverview | null>(null)
  const [dailyReport, setDailyReport] = useState<DailySalesReport | null>(null)
  const [monthlyReport, setMonthlyReport] = useState<MonthlySalesReport | null>(null)
  const [inventoryAnalysis, setInventoryAnalysis] = useState<InventoryAnalysis | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'monthly' | 'products' | 'inventory'>('overview')

  // Fetch sales overview
  const fetchOverview = async () => {
    try {
      const data = await SalesReportApi.getSalesOverview()
      setOverview(data)
    } catch (error) {
      toast.error('Failed to fetch sales overview')
      console.error(error)
    }
  }

  // Fetch daily report
  const fetchDailyReport = async (date: string) => {
    try {
      const data = await SalesReportApi.getDailySalesReport(date)
      setDailyReport(data)
    } catch (error) {
      toast.error('Failed to fetch daily report')
      console.error(error)
    }
  }

  // Fetch monthly report
  const fetchMonthlyReport = async (month: number, year: number) => {
    try {
      const data = await SalesReportApi.getMonthlySalesReport(month, year)
      setMonthlyReport(data)
    } catch (error) {
      toast.error('Failed to fetch monthly report')
      console.error(error)
    }
  }

  // Fetch inventory analysis
  const fetchInventoryAnalysis = async () => {
    try {
      const data = await SalesReportApi.getInventoryAnalysis()
      setInventoryAnalysis(data)
    } catch (error) {
      toast.error('Failed to fetch inventory analysis')
      console.error(error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchOverview(),
          fetchDailyReport(selectedDate),
          fetchMonthlyReport(selectedMonth, selectedYear),
          fetchInventoryAnalysis()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load some data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedDate, selectedMonth, selectedYear])

  // Local receipt generation
  const generateReceiptContent = (sale: Sale) => {
    const date = new Date(sale.createdAt).toLocaleString()
    let receiptContent = `
      ===================================
                SALES RECEIPT
      ===================================
      Date: ${date}
      Receipt #: ${sale.id}
      Customer: ${sale.customerName || 'Walk-in Customer'}
      ===================================
      Items:
      ${sale.items.map(item => `
      ${item.productId}
      Qty: ${item.quantity} x $${item.price.toFixed(2)}
      Subtotal: $${(item.quantity * item.price).toFixed(2)}
      `).join('\n')}
      ===================================
      Total Amount: $${sale.total.toFixed(2)}
      ===================================
      
      Warranty Terms & Conditions:
      ${sale.warrantyTerms || 'Standard warranty applies'}
      
      Terms & Conditions:
      ${sale.termsAndConditions || 'Standard terms apply'}
      
      Thank you for your business!
      ===================================
    `
    return receiptContent
  }

  const printReceipt = async (sale: Sale) => {
    try {
      const receiptContent = generateReceiptContent(sale)
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 12px; 
                  margin: 0; 
                  padding: 20px;
                  white-space: pre-wrap;
                }
              </style>
            </head>
            <body>${receiptContent}</body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
      toast.success('Receipt ready for printing')
    } catch (error) {
      toast.error('Failed to generate receipt')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 animate-fade-in">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading sales reports...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
    <div className="px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-secondary-900">Sales Reports</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Comprehensive sales analytics and reporting
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'daily', name: 'Daily Report', icon: CalendarIcon },
            { id: 'monthly', name: 'Monthly Report', icon: CurrencyDollarIcon },
            { id: 'products', name: 'Product Analytics', icon: ShoppingBagIcon },
            { id: 'inventory', name: 'Inventory Analysis', icon: ArchiveBoxIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <tab.icon
                className={`${
                  activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                } -ml-0.5 mr-2 h-5 w-5`}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="mt-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card animate-slide-up">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${overview?.todaysRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card animate-slide-up">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Today's Sales</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {overview?.todaysSales || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card animate-slide-up">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">MTD Revenue</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${overview?.monthToDateRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card animate-slide-up">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">MTD Sales</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {overview?.monthToDateSales || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview?.topSellingProducts?.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantitySold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.totalRevenue?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.averagePrice?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                  {(!overview?.topSellingProducts || overview.topSellingProducts.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No products data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Daily Report Tab */}
      {activeTab === 'daily' && (
        <div className="mt-8 space-y-6">
          {/* Date Selector */}
          <div className="card">
            <div className="flex items-center space-x-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Select Date:
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field w-48"
              />
            </div>
          </div>

          {dailyReport && (
            <>
              {/* Daily Stats */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dailyReport?.totalSales || 0}
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${dailyReport?.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
                  <p className="text-2xl font-semibold text-green-600">
                    ${dailyReport?.totalProfit?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${dailyReport?.averageOrderValue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {/* Daily Transactions */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Transactions for {dailyReport?.date || 'Today'}</h3>
                </div>
                {(!dailyReport?.transactions || dailyReport.transactions.length === 0) ? (
                  <p className="text-gray-500 text-center py-8">No transactions on this date</p>
                ) : (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Sale ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Profit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailyReport.transactions.map((sale) => (
                          <tr key={sale.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{sale.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sale.customerName || 'Walk-in Customer'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${sale.total?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              ${sale.profit?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sale.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => printReceipt(sale)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                              >
                                <PrinterIcon className="h-4 w-4 mr-1" />
                                Print Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Monthly Report Tab */}
      {activeTab === 'monthly' && (
        <div className="mt-8 space-y-6">
          {/* Month/Year Selector */}
          <div className="card">
            <div className="flex items-center space-x-4">
              <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                Select Month:
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="input-field w-32"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Year:
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field w-24"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={2020 + i} value={2020 + i}>
                    {2020 + i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {monthlyReport && (
            <>
              {/* Monthly Stats */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {monthlyReport?.totalSales || 0}
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${monthlyReport?.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${monthlyReport?.averageOrderValue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {/* Daily Breakdown Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Daily Sales for {monthlyReport?.month || 'Current Month'} {monthlyReport?.year || new Date().getFullYear()}
                </h3>
                <div className="space-y-2">
                  {monthlyReport?.dailyBreakdown
                    ?.filter(day => day.totalSales > 0)
                    .map((day) => (
                      <div key={day.date} className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-900">{day.date}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{day.totalSales} sales</span>
                          <span className="text-sm font-medium text-gray-900">${day.totalRevenue?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    ))}
                  {(!monthlyReport?.dailyBreakdown || monthlyReport.dailyBreakdown.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No sales data available for this month</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && overview && (
        <div className="mt-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Average Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview.topSellingProducts.map((product, index) => (
                    <tr key={product.productId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantitySold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.totalRevenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.averagePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          index === 0 ? 'bg-green-100 text-green-800' :
                          index < 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {index === 0 ? 'Top Seller' : index < 3 ? 'Good' : 'Average'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Analysis Tab */}
      {activeTab === 'inventory' && inventoryAnalysis && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">Total Invested Amount</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ${inventoryAnalysis?.totalInvestedAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">Expected Profit</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ${inventoryAnalysis?.expectedProfit?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">Current Stock Value</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ${inventoryAnalysis?.currentStockValue?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Inventory Details</h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Purchase Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Selling Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Promo Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Invested Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Profit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryAnalysis?.products?.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.currentStock || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.purchasePrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.sellingPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.promotionalPrice?.toFixed(2) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.investedAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.expectedProfit?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                  {(!inventoryAnalysis?.products || inventoryAnalysis.products.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No inventory data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  )
}
