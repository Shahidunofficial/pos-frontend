'use client'

import { useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { REPAIR_RISK_OPTIONS } from '@/API'

interface Props {
  repairRisksAcknowledged: string[]
  toggleRepairRisk: (label: string) => void
}

export default function AdditionalRiskInput({ repairRisksAcknowledged, toggleRepairRisk }: Props) {
  const [text, setText] = useState('')
  const customRisks = repairRisksAcknowledged.filter((r) => !REPAIR_RISK_OPTIONS.includes(r))

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed || repairRisksAcknowledged.includes(trimmed)) return
    toggleRepairRisk(trimmed)
    setText('')
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-secondary-700">Additional Risk (type your own)</p>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Describe another risk to disclose to the customer..."
          className="input-field flex-1 text-sm"
        />
        <button type="button" onClick={handleAdd} className="btn-secondary inline-flex items-center gap-1 px-3 text-sm">
          <FiPlus className="h-4 w-4" /> Add
        </button>
      </div>

      {customRisks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {customRisks.map((risk) => (
            <span key={risk} className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-900">
              {risk}
              <button type="button" onClick={() => toggleRepairRisk(risk)} className="text-amber-700 hover:text-amber-900">
                <FiX className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
