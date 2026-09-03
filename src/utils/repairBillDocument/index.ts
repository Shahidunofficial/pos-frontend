import { RepairBill } from '@/API'
import { A4_REPAIR_BILL_STYLES } from './styles'
import { renderHeader, renderPartyInfo, renderFaultAndDamage } from './sections'
import { renderMotherboardRisk, renderPartsTable, renderCostAndWarranty, renderSignatures } from './sectionsExtra'

// Builds a full, printable A4 HTML document for a repair job bill: logo top-
// left, everything sized to fit one page, with a signature area at the end.
export function buildRepairBillHtml(bill: RepairBill, logoUrl?: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Repair Bill ${bill._id}</title>
    <style>${A4_REPAIR_BILL_STYLES}</style>
  </head>
  <body>
    ${renderHeader(bill, logoUrl)}
    ${renderPartyInfo(bill)}
    ${renderFaultAndDamage(bill)}
    ${renderMotherboardRisk(bill)}
    ${renderPartsTable(bill)}
    ${renderCostAndWarranty(bill)}
    ${renderSignatures(bill)}
    <script>
      window.onload = function () { window.print(); };
    </script>
  </body>
</html>`
}
