'use client'

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RoleSelection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const isNewStore = searchParams.get('new') === 'true';

  const handleAdminLogin = () => {
    if (isNewStore) {
      // Navigate to store signup
      router.push(`/login/store-signup?email=${encodeURIComponent(email)}`);
    } else {
      // Navigate to admin login
      router.push(`/login/admin?email=${encodeURIComponent(email)}`);
    }
  };

  const handleCashierLogin = () => {
    // For cashier, we need to ask for username
    router.push('/login/cashier');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isNewStore ? 'Setup Your Store' : 'Choose Your Role'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isNewStore 
              ? `Welcome! Let's set up your store with ${email}` 
              : `Welcome back ${email}! Please select how you want to continue.`
            }
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <button
              onClick={handleAdminLogin}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <div className="flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-.732 5.162-2.348 7.335-4.622.145-.153.145-.42 0-.573A11.955 11.955 0 0112 2.944z" />
                </svg>
{isNewStore ? 'Setup Store as Admin' : 'Continue as Admin'}
              </div>
            </button>
            
            <button
              onClick={handleCashierLogin}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <div className="flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Continue as Cashier
              </div>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}