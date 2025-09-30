'use client'

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

function StoreSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storeSignup } = useAuth();
  
  const [formData, setFormData] = useState({
    storeName: '',
    adminEmail: searchParams.get('email') || '',
    adminPassword: '',
    adminName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.storeName || !formData.adminEmail || !formData.adminPassword || !formData.adminName) {
      setError('All fields are required');
      return;
    }

    if (formData.adminPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await storeSignup(formData);
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Store setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set Up Your Store
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your admin account and get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                id="storeName"
                name="storeName"
                type="text"
                required
                value={formData.storeName}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="My Store"
              />
            </div>

            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
                Admin Name
              </label>
              <input
                id="adminName"
                name="adminName"
                type="text"
                required
                value={formData.adminName}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <input
                id="adminEmail"
                name="adminEmail"
                type="email"
                required
                value={formData.adminEmail}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="admin@store.com"
              />
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <input
                id="adminPassword"
                name="adminPassword"
                type="password"
                required
                value={formData.adminPassword}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting up...' : 'Create Store & Admin Account'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StoreSignup() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StoreSignupContent />
    </Suspense>
  );
}