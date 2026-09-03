import toast from 'react-hot-toast'
import { repairBillsApi } from '@/API'
import { buildRepairBillHtml } from './repairBillDocument'
import { printA4Document } from './printA4Document'

// Repair bills print as a full A4 page (with a signature area) rather than
// an 80mm thermal receipt, since the customer needs to sign a physical copy.
export async function printRepairReceipt(billId: string): Promise<void> {
  try {
    const bill = await repairBillsApi.getById(billId)
    const logoUrl = `${window.location.origin}/assets/logo.png`
    printA4Document(buildRepairBillHtml(bill, logoUrl))
    toast.success('Repair bill sent to printer')
  } catch (error) {
    toast.error('Failed to print repair bill')
    console.error(error)
  }
}
