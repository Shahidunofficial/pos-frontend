import { CartItem } from '@/components/sales/cartTypes'

// Backend receipt text truncates product names; this reinserts full names and
// re-renders totals using the exact cash/balance the cashier entered at checkout.
export function buildCustomSaleReceipt(receiptText: string, cart: CartItem[], cashAmount: number, total: number): string {
  const lines = receiptText.split('\n')
  const customLines: string[] = []
  let inProductSection = false
  let productProcessed = false

  for (const line of lines) {
    if (line.includes('Cust:') || line.includes('Customer:')) {
      inProductSection = true
      customLines.push(line)
      continue
    }

    if (line.includes('Subtotal:')) {
      if (!productProcessed) {
        cart.forEach((item) => {
          customLines.push(item.name)
          const qty = `${item.quantity}x`
          const unitPrice = item.price.toFixed(2)
          const lineTotal = (item.quantity * item.price).toFixed(2)
          customLines.push(`  ${qty.padEnd(8)}${unitPrice.padStart(8)}${lineTotal.padStart(12)}`)
        })
        customLines.push('----------------------------------')
        customLines.push(`Total:${total.toFixed(2).padStart(28)}`)
        customLines.push(`Cash:${cashAmount.toFixed(2).padStart(29)}`)
        customLines.push(`Balance:${(cashAmount - total).toFixed(2).padStart(26)}`)
        customLines.push('----------------------------------')
        productProcessed = true
      }
      inProductSection = false
      customLines.push(line)
      continue
    }

    const isOriginalProductLine =
      inProductSection &&
      (line.match(/^\s*\d+x\s+\d+\.\d+\s+\d+\.\d+$/) ||
        line.match(/^.+\.\.\.\s*$/) ||
        line.match(/^.+\s+\d+x\s+\d+\.\d+\s+\d+\.\d+$/) ||
        line.includes('---'))
    if (isOriginalProductLine) continue

    customLines.push(line)
  }

  return customLines.join('\n')
}
