'use client'

import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import MainLayout from '@/components/MainLayout'
import RepairBillsTable from '@/components/repairs/RepairBillsTable'
import { useRepairBills } from '@/hooks/useRepairBills'

export default function RepairBillsPage() {
  const { bills, loading, setStatus, reprint } = useRepairBills()

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-secondary-900">Repair Billing</h1>
            <p className="mt-1 text-sm text-secondary-600">Walk-in and appointment-based phone repair bills.</p>
          </div>
          <Link href="/repairs/new" className="btn-primary mt-4 sm:mt-0 inline-flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" /> New Repair Bill
          </Link>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="card text-center py-12 text-secondary-400">Loading repair bills...</div>
          ) : (
            <RepairBillsTable bills={bills} onStatusChange={setStatus} onReprint={reprint} />
          )}
        </div>
      </div>
    </MainLayout>
  )
}
