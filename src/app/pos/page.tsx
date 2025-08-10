'use client'

import { Toaster } from 'react-hot-toast'
import MainLayout from '@/components/MainLayout'

export default function POSPage() {
  return (
    <>
      <Toaster position="top-right" />
      <MainLayout>
        <div className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Point of Sale System</h1>
                
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Welcome to the Cashier POS System
                  </h2>
                  <p className="text-gray-500 mb-6">
                    This is where the cashier interface will be implemented.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-800">
                      🎯 POS interface coming soon! This page will contain the cashier's point-of-sale functionality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  )
}