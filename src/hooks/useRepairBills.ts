import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { repairBillsApi, RepairBill, RepairBillStatus } from '@/API'
import { printRepairReceipt } from '@/utils/printRepairReceipt'

export function useRepairBills() {
  const [bills, setBills] = useState<RepairBill[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setBills(await repairBillsApi.getAll())
    } catch {
      toast.error('Failed to load repair bills')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setStatus = async (id: string, status: RepairBillStatus) => {
    try {
      const updated = await repairBillsApi.updateStatus(id, status)
      setBills((prev) => prev.map((b) => (b._id === id ? updated : b)))
    } catch {
      toast.error('Failed to update status')
    }
  }

  return { bills, loading, refresh, setStatus, reprint: printRepairReceipt }
}
