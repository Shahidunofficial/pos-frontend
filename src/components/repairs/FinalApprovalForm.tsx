'use client'

import { FiEdit3 } from 'react-icons/fi'
import { RepairBillFormState } from '@/hooks/useRepairBillForm'

interface Props {
  form: RepairBillFormState
  update: <K extends keyof RepairBillFormState>(key: K, value: RepairBillFormState[K]) => void
}

// Final gate before a bill can be created: staff must confirm the customer
// has actually reviewed and signed the bill before work proceeds.
export default function FinalApprovalForm({ form, update }: Props) {
  return (
    <div className="card border-2 border-primary-200 bg-primary-50/40">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-secondary-900">
        <FiEdit3 className="h-4 w-4 text-primary-600" />
        Customer Approval to Proceed
      </p>
      <p className="mb-3 text-xs text-secondary-600">
        The customer must sign the printed bill to approve the repair job before work begins. Confirm the
        signature has been obtained before creating this bill.
      </p>
      <label className="flex items-start gap-2 text-sm font-medium text-secondary-800">
        <input
          type="checkbox"
          checked={form.customerApproved}
          onChange={(e) => update('customerApproved', e.target.checked)}
          className="mt-0.5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
        />
        Customer has signed this bill and approves proceeding with the repair as described above.
      </label>
    </div>
  )
}
