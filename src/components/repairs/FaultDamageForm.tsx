import { DAMAGE_OPTIONS } from '@/API'
import { RepairBillFormState } from '@/hooks/useRepairBillForm'
import ChecklistGrid from './ChecklistGrid'

interface Props {
  form: RepairBillFormState
  update: <K extends keyof RepairBillFormState>(key: K, value: RepairBillFormState[K]) => void
  toggleDamage: (label: string) => void
}

export default function FaultDamageForm({ form, update, toggleDamage }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-secondary-700">Fault Status (required)</label>
        <p className="text-xs text-secondary-400 mb-1.5">Describe the issue reported by the customer, e.g. &quot;Screen flickers, battery drains in 2 hours&quot;.</p>
        <textarea
          value={form.faultDescription}
          onChange={(e) => update('faultDescription', e.target.value)}
          rows={3}
          className="input-field"
          placeholder="Describe the fault..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Pre-existing Damages</label>
        <p className="text-xs text-secondary-400 mb-2">Note any cosmetic/physical damage found at intake, so it&apos;s recorded before repair work begins.</p>
        <ChecklistGrid options={DAMAGE_OPTIONS} selected={form.preExistingDamages} onToggle={toggleDamage} />
        <textarea
          value={form.damageNotes}
          onChange={(e) => update('damageNotes', e.target.value)}
          rows={2}
          className="input-field mt-2"
          placeholder="Additional damage notes (optional)"
        />
      </div>
    </div>
  )
}
