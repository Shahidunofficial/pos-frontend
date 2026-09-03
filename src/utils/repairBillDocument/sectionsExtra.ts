import { RepairBill } from '@/API'
import { escapeHtml, money } from './helpers'

export function renderMotherboardRisk(bill: RepairBill): string {
  if (!bill.motherboardConditions.length && !bill.repairRisksAcknowledged.length) return ''

  const list = (items: string[]) => `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
  const consent = bill.riskConsentAcknowledged
    ? 'Customer has been informed and acknowledges this risk disclosure.'
    : 'Risk disclosure NOT yet acknowledged by customer.'

  return `
    <section>
      <h2>Motherboard / CPU Risk Assessment</h2>
      <div class="risk-box">
        ${bill.motherboardConditions.length ? `<strong>A. Pre-existing condition found:</strong>${list(bill.motherboardConditions)}` : ''}
        ${bill.repairRisksAcknowledged.length ? `<strong>B. Repair risk disclosed to customer:</strong>${list(bill.repairRisksAcknowledged)}` : ''}
        <strong>${consent}</strong>
      </div>
    </section>
  `
}

export function renderPartsTable(bill: RepairBill): string {
  if (!bill.parts.length) return ''

  const rows = bill.parts
    .map(
      (p) => `
      <tr>
        <td>${escapeHtml(p.name)}${p.productId ? '' : ' <em>(custom)</em>'}</td>
        <td class="num">${p.quantity}</td>
        <td class="num">${money(p.price)}</td>
        <td class="num">${money(p.price * p.quantity)}</td>
      </tr>`,
    )
    .join('')

  return `
    <section>
      <h2>Parts Used</h2>
      <table>
        <thead><tr><th>Part</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `
}

export function renderCostAndWarranty(bill: RepairBill): string {
  const voidList = bill.warrantyVoidConditions?.length
    ? `<div class="void-title">Void if:</div><ul>${bill.warrantyVoidConditions
        .map((c) => `<li>${escapeHtml(c)}</li>`)
        .join('')}</ul>`
    : ''
  const warranty =
    bill.warrantyMonths > 0
      ? `${bill.warrantyMonths} month(s)${bill.warrantyCoverage ? ` &mdash; ${escapeHtml(bill.warrantyCoverage)}` : ''}.${voidList}`
      : 'No warranty provided for this repair.'

  return `
    <section>
      <div class="totals">
        <div><span>Parts</span><span>${money(bill.partsCost)}</span></div>
        <div><span>Labor</span><span>${money(bill.laborCost)}</span></div>
        <div><span>Other</span><span>${money(bill.otherCharges)}</span></div>
        <div class="grand"><span>Total</span><span>${money(bill.total)}</span></div>
      </div>
    </section>
    <section>
      <h2>Warranty Terms</h2>
      <div class="warranty-box">${warranty}</div>
    </section>
  `
}

export function renderSignatures(bill: RepairBill): string {
  return `
    <p class="approval-note">
      By signing below, the customer confirms they have reviewed this bill and approves the technician to
      proceed with the repair as described above.
      ${bill.customerApproved ? '<strong>&#10003; Customer approved to proceed.</strong>' : ''}
    </p>
    <div class="signatures">
      <div class="sig-block"><div class="sig-line">Customer Signature &amp; Date</div></div>
      <div class="sig-block"><div class="sig-line">Technician Signature &amp; Date</div></div>
    </div>
    <p class="footer-note">Device accepted as described above. Please retain this bill for pickup.</p>
  `
}
