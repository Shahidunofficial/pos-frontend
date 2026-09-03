import { RepairPart } from '@/API'
import { RepairBillFormState } from './repairBillFormTypes'

type SetForm = (updater: (prev: RepairBillFormState) => RepairBillFormState) => void

// Manages the two freeform list fields on the repair bill form: the parts
// used (catalog or custom) and the warranty void conditions.
export function useRepairBillLists(setForm: SetForm) {
  const addPart = (part: RepairPart) => setForm((prev) => ({ ...prev, parts: [...prev.parts, part] }))

  const updatePart = (index: number, updates: Partial<RepairPart>) =>
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.map((p, i) => (i === index ? { ...p, ...updates } : p)),
    }))

  const removePart = (index: number) =>
    setForm((prev) => ({ ...prev, parts: prev.parts.filter((_, i) => i !== index) }))

  const addVoidCondition = (text: string) =>
    setForm((prev) =>
      prev.warrantyVoidConditions.includes(text)
        ? prev
        : { ...prev, warrantyVoidConditions: [...prev.warrantyVoidConditions, text] },
    )

  const removeVoidCondition = (text: string) =>
    setForm((prev) => ({
      ...prev,
      warrantyVoidConditions: prev.warrantyVoidConditions.filter((c) => c !== text),
    }))

  return { addPart, updatePart, removePart, addVoidCondition, removeVoidCondition }
}
