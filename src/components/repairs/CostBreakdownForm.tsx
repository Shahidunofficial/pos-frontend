import { RepairBillFormState } from '@/hooks/useRepairBillForm'

interface Props {
  form: RepairBillFormState
  update: <K extends keyof RepairBillFormState>(key: K, value: RepairBillFormState[K]) => void
  partsCost: number
  total: number
}

export default function CostBreakdownForm({ form, update, partsCost, total }: Props) {
  const field = (label: string, key: 'laborCost' | 'otherCharges') => (
    <div>
      <label className="block text-sm font-medium text-secondary-700">{label}</label>
      <input
        type="number"
        min={0}
        step="0.01"
        value={form[key]}
        onChange={(e) => update(key, Number(e.target.value))}
        className="input-field mt-1.5"
      />
    </div>
  )

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700">Parts Cost</label>
          <div className="input-field mt-1.5 bg-secondary-50 text-secondary-600">LKR {partsCost.toFixed(2)}</div>
        </div>
        {field('Labor Cost', 'laborCost')}
        {field('Other Charges', 'otherCharges')}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-secondary-100 pt-4 text-base font-semibold text-secondary-900">
        <span>Total</span>
        <span>LKR {total.toFixed(2)}</span>
      </div>
    </div>
  )
}
