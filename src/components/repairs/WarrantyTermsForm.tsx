'use client'

import { FiShield } from 'react-icons/fi'
import { WARRANTY_PRESETS, RECOMMENDED_WARRANTY_ID_BY_REPAIR_TYPE } from '@/API'
import { RepairBillFormState } from '@/hooks/useRepairBillForm'
import WarrantyVoidConditionsInput from './WarrantyVoidConditionsInput'

interface Props {
  form: RepairBillFormState
  update: <K extends keyof RepairBillFormState>(key: K, value: RepairBillFormState[K]) => void
  addVoidCondition: (text: string) => void
  removeVoidCondition: (text: string) => void
}

export default function WarrantyTermsForm({ form, update, addVoidCondition, removeVoidCondition }: Props) {
  const recommendedId = RECOMMENDED_WARRANTY_ID_BY_REPAIR_TYPE[form.repairType]

  const applyPreset = (months: number, coverage: string) => {
    update('warrantyMonths', months)
    update('warrantyCoverage', coverage)
  }

  return (
    <div className="rounded-lg border border-secondary-200 bg-white p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary-800">
        <FiShield className="h-4 w-4 text-primary-600" />
        Warranty Terms
      </p>

      <div className="flex flex-wrap gap-2">
        {WARRANTY_PRESETS.map((preset) => {
          const active = form.warrantyMonths === preset.months && form.warrantyCoverage === preset.coverage
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.months, preset.coverage)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                active
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
              }`}
            >
              {preset.label}
              {recommendedId === preset.id && (
                <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                  Suggested
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-secondary-700">Period (months)</label>
          <input
            type="number"
            min={0}
            value={form.warrantyMonths}
            onChange={(e) => update('warrantyMonths', Number(e.target.value))}
            className="input-field mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-secondary-700">Coverage Details</label>
          <input
            value={form.warrantyCoverage}
            onChange={(e) => update('warrantyCoverage', e.target.value)}
            placeholder="e.g. Touch fault / manufacturing fault only"
            className="input-field mt-1.5"
          />
        </div>
      </div>

      {form.warrantyMonths > 0 && (
        <WarrantyVoidConditionsInput
          conditions={form.warrantyVoidConditions}
          addVoidCondition={addVoidCondition}
          removeVoidCondition={removeVoidCondition}
        />
      )}
    </div>
  )
}
