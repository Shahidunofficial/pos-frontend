'use client'

import { useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'

interface Props {
  conditions: string[]
  addVoidCondition: (text: string) => void
  removeVoidCondition: (text: string) => void
}

export default function WarrantyVoidConditionsInput({ conditions, addVoidCondition, removeVoidCondition }: Props) {
  const [text, setText] = useState('')

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    addVoidCondition(trimmed)
    setText('')
  }

  return (
    <div className="mt-4 rounded-md border border-secondary-200 bg-secondary-50 p-3">
      <span className="text-xs font-medium text-secondary-700">Warranty void conditions:</span>

      {conditions.length > 0 && (
        <ul className="mt-2 space-y-1">
          {conditions.map((c) => (
            <li key={c} className="flex items-center justify-between gap-2 text-xs text-secondary-600">
              <span>&bull; {c}</span>
              <button
                type="button"
                onClick={() => removeVoidCondition(c)}
                className="text-secondary-400 hover:text-red-600"
                aria-label={`Remove ${c}`}
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Add another void condition..."
          className="input-field flex-1 text-xs"
        />
        <button type="button" onClick={handleAdd} className="btn-secondary inline-flex items-center gap-1 px-3 text-xs">
          <FiPlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  )
}
