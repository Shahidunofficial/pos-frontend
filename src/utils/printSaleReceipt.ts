import toast from 'react-hot-toast'
import { salesApi } from '@/API'
import { CartItem } from '@/components/sales/cartTypes'
import { buildCustomSaleReceipt } from './saleReceiptFormatter'
import { printThermalReceipt } from './printThermalReceipt'

export async function printSaleReceipt(saleId: string, cart: CartItem[], cashAmount: number, total: number): Promise<void> {
  try {
    const { receiptText } = await salesApi.getPrintReceipt(saleId)
    const formatted = buildCustomSaleReceipt(receiptText, cart, cashAmount, total)
    printThermalReceipt(formatted)
    toast.success('Receipt sent to printer')
  } catch (error) {
    toast.error('Failed to print receipt')
    console.error(error)
  }
}
