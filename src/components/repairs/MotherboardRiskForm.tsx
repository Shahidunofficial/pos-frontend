'use client'

import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiChevronDown } from 'react-icons/fi'
import { MOTHERBOARD_CONDITIONS, REPAIR_RISK_OPTIONS, MOTHERBOARD_RISK_CONSENT_TEXT } from '@/API'
import { RepairBillFormState } from '@/hooks/useRepairBillForm'
import ChecklistGrid from './ChecklistGrid'
import AdditionalRiskInput from './AdditionalRiskInput'

interface Props {
  form: RepairBillFormState
  update: <K extends keyof RepairBillFormState>(key: K, value: RepairBillFormState[K]) => void
  toggleMotherboardCondition: (label: string) => void
  toggleRepairRisk: (label: string) => void
  defaultOpen?: boolean
}

export default function MotherboardRiskForm({ form, update, toggleMotherboardCondition, toggleRepairRisk, defaultOpen }: Props) {
  const [open, setOpen] = useState(!!defaultOpen)
  const findingsCount = form.motherboardConditions.length + form.repairRisksAcknowledged.length

  // Auto-expand when the parent flags this as a high-risk repair (e.g. "no power"),
  // without forcing it closed again if the cashier already opened/reviewed it.
  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <FiAlertTriangle className="h-4 w-4" />
          Motherboard &amp; CPU Risk Assessment
          {findingsCount > 0 && (
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900">{findingsCount} noted</span>
          )}
        </span>
        <FiChevronDown className={`h-4 w-4 text-amber-700 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-amber-200 bg-white px-4 pb-4 pt-3">
          <p className="text-xs text-secondary-500">
            Use this for board-level issues (e.g. a &quot;no power&quot; fault) where hidden CPU/PCB damage may exist. Record only what you actually observe, and photograph the board where possible.
          </p>

          <div>
            <p className="mb-2 text-sm font-medium text-secondary-700">A. Pre-existing Condition Found</p>
            <ChecklistGrid options={MOTHERBOARD_CONDITIONS} selected={form.motherboardConditions} onToggle={toggleMotherboardCondition} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-secondary-700">B. Repair Risk Disclosed to Customer</p>
            <ChecklistGrid options={REPAIR_RISK_OPTIONS} selected={form.repairRisksAcknowledged} onToggle={toggleRepairRisk} columns="grid-cols-1 sm:grid-cols-2" />
          </div>

          <AdditionalRiskInput repairRisksAcknowledged={form.repairRisksAcknowledged} toggleRepairRisk={toggleRepairRisk} />

          <div className="rounded-md border border-secondary-200 bg-secondary-50 p-3 text-xs leading-relaxed text-secondary-600">
            {MOTHERBOARD_RISK_CONSENT_TEXT}
          </div>

          <label className="flex items-start gap-2 text-sm font-medium text-secondary-800">
            <input
              type="checkbox"
              checked={form.riskConsentAcknowledged}
              onChange={(e) => update('riskConsentAcknowledged', e.target.checked)}
              className="mt-0.5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            Customer has been informed of the above and acknowledges this risk disclosure.
          </label>
        </div>
      )}
    </div>
  )
}
