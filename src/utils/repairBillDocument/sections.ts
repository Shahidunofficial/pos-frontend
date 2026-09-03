import { RepairBill, REPAIR_TYPES } from '@/API'
import { STORE_NAME, STORE_ADDRESS, STORE_PHONE, escapeHtml, formatDate } from './helpers'

function repairTypeLabel(value: string): string {
  return REPAIR_TYPES.find((t) => t.value === value)?.label || value.replace(/_/g, ' ')
}

export function renderHeader(bill: RepairBill, logoUrl?: string): string {
  return `
    <div class="header">
      <div class="brand">
        ${logoUrl ? `<img class="logo" src="${logoUrl}" alt="${STORE_NAME} logo" />` : ''}
        <div>
          <h1>${STORE_NAME}</h1>
          <div class="meta">${STORE_ADDRESS} &nbsp;|&nbsp; ${STORE_PHONE}</div>
        </div>
      </div>
      <div class="bill-id">
        <div>Bill #: ${escapeHtml(bill._id)}</div>
        <div>Date: ${formatDate(bill.createdAt)}</div>
      </div>
    </div>
    <div class="title">Repair Job Bill</div>
  `
}

export function renderPartyInfo(bill: RepairBill): string {
  return `
    <section>
      <h2>Customer &amp; Device</h2>
      <div class="grid-2">
        <div><span class="label">Customer:</span> ${escapeHtml(bill.customerName)}</div>
        <div><span class="label">Contact:</span> ${escapeHtml(bill.contactNumber)}</div>
        <div><span class="label">Device:</span> ${escapeHtml(bill.deviceBrand)} ${escapeHtml(bill.deviceModel)}</div>
        <div><span class="label">Repair Type:</span> ${repairTypeLabel(bill.repairType)}</div>
      </div>
    </section>
  `
}

export function renderFaultAndDamage(bill: RepairBill): string {
  const damages = bill.preExistingDamages.length
    ? `<ul class="damage-grid">${bill.preExistingDamages.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`
    : '<p>None noted at intake.</p>'
  const notes = bill.damageNotes ? `<p>${escapeHtml(bill.damageNotes)}</p>` : ''

  return `
    <section>
      <h2>Fault Status</h2>
      <p>${escapeHtml(bill.faultDescription)}</p>
    </section>
    <section>
      <h2>Pre-existing Damages</h2>
      ${damages}
      ${notes}
    </section>
  `
}
