'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/API/products';
import { merchantApi } from '@/API/merchant';
import { Product } from '@/API/types';
import MainLayout from '@/components/MainLayout';

interface SyncResult {
  productId: string;
  productName: string;
  status: 'pending' | 'syncing' | 'success' | 'error';
  message?: string;
}

export default function MerchantSyncPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
      
      // Initialize sync results
      setSyncResults(data.map(p => ({
        productId: p._id || p.id || '',
        productName: p.name,
        status: 'pending'
      })));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const syncAllProducts = async () => {
    if (!accessToken.trim()) {
      alert('Please enter your Google Access Token first!');
      return;
    }

    if (!confirm(`Sync ${products.length} products to Google Merchant Center?`)) {
      return;
    }

    setSyncing(true);
    setProgress({ current: 0, total: products.length });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productId = product._id || product.id || '';
      
      // Update status to syncing
      setSyncResults(prev => prev.map(r => 
        r.productId === productId 
          ? { ...r, status: 'syncing' }
          : r
      ));

      try {
        const result = await merchantApi.syncProduct({
          product,
          accessToken: accessToken.trim()
        });

        if (result.success) {
          setSyncResults(prev => prev.map(r => 
            r.productId === productId 
              ? { ...r, status: 'success', message: 'Synced successfully' }
              : r
          ));
        } else {
          setSyncResults(prev => prev.map(r => 
            r.productId === productId 
              ? { ...r, status: 'error', message: result.error || 'Failed to sync' }
              : r
          ));
        }
      } catch (error) {
        setSyncResults(prev => prev.map(r => 
          r.productId === productId 
            ? { ...r, status: 'error', message: error instanceof Error ? error.message : 'Network error' }
            : r
        ));
      }

      setProgress({ current: i + 1, total: products.length });

      // Wait 2 seconds between requests
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setSyncing(false);
    alert('Sync completed! Check results below.');
  };

  const syncSingleProduct = async (product: Product) => {
    if (!accessToken.trim()) {
      alert('Please enter your Google Access Token first!');
      return;
    }

    const productId = product._id || product.id || '';

    setSyncResults(prev => prev.map(r => 
      r.productId === productId 
        ? { ...r, status: 'syncing' }
        : r
    ));

    try {
      const result = await merchantApi.syncProduct({
        product,
        accessToken: accessToken.trim()
      });

      if (result.success) {
        setSyncResults(prev => prev.map(r => 
          r.productId === productId 
            ? { ...r, status: 'success', message: 'Synced successfully' }
            : r
        ));
        alert(`✅ ${product.name} synced successfully!`);
      } else {
        setSyncResults(prev => prev.map(r => 
          r.productId === productId 
            ? { ...r, status: 'error', message: result.error || 'Failed' }
            : r
        ));
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      setSyncResults(prev => prev.map(r => 
        r.productId === productId 
          ? { ...r, status: 'error', message: error instanceof Error ? error.message : 'Error' }
          : r
      ));
      alert(`❌ Error syncing ${product.name}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  const successCount = syncResults.filter(r => r.status === 'success').length;
  const errorCount = syncResults.filter(r => r.status === 'error').length;

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Google Merchant Sync
          </h1>
          <p className="text-gray-600 mt-2">
            Sync products to Google Merchant Center for Google Shopping
          </p>
        </div>

        {/* Access Token Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Enter Access Token</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Access Token
              </label>
              <input
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="ya29.a0AfH6SMB..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                Get token from{' '}
                <a 
                  href="https://developers.google.com/oauthplayground/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  OAuth Playground
                </a>
                {' '}→ Content API for Shopping
              </p>
            </div>

            <button
              onClick={syncAllProducts}
              disabled={syncing || !accessToken.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {syncing ? `Syncing... (${progress.current}/${progress.total})` : `Sync All ${products.length} Products`}
            </button>
          </div>
        </div>

        {/* Progress */}
        {syncing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Syncing products...
              </span>
              <span className="text-sm text-blue-700">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Summary */}
        {(successCount > 0 || errorCount > 0) && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Synced</p>
              <p className="text-2xl font-bold text-green-600">{successCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{errorCount}</p>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Products ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const productId = product._id || product.id || '';
                  const syncResult = syncResults.find(r => r.productId === productId);
                  const status = syncResult?.status || 'pending';

                  return (
                    <tr key={productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.images?.[0] && (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.brand}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        LKR {product.sellingPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {status === 'pending' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            Pending
                          </span>
                        )}
                        {status === 'syncing' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center w-fit">
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Syncing...
                          </span>
                        )}
                        {status === 'success' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center w-fit">
                            ✓ Synced
                          </span>
                        )}
                        {status === 'error' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 flex items-center w-fit">
                            ✗ Error
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {(status === 'pending' || status === 'error') && (
                          <button
                            onClick={() => syncSingleProduct(product)}
                            disabled={syncing || !accessToken.trim()}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {status === 'error' ? 'Retry' : 'Sync'}
                          </button>
                        )}
                        {syncResult?.message && status === 'error' && (
                          <p className="text-xs text-red-600 mt-1">
                            {syncResult.message}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

