import { useState } from 'react'
import toast from 'react-hot-toast'
import { repairBillsApi, RepairAppointment } from '@/API'
import { printRepairReceipt } from '@/utils/printRepairReceipt'
import { RepairBillFormState, ChecklistField, emptyRepairBillForm } from './repairBillFormTypes'
import { useRepairBillLists } from './useRepairBillLists'

export type { RepairBillFormState } from './repairBillFormTypes'

function validate(form: RepairBillFormState): string | null {
  if (!form.customerName.trim() || !form.contactNumber.trim()) return 'Customer name and contact number are required'
  if (!form.faultDescription.trim()) return 'Please describe the fault status of the device'
  const hasFindings = form.motherboardConditions.length > 0 || form.repairRisksAcknowledged.length > 0
  if (hasFindings && !form.riskConsentAcknowledged) {
    return 'Please confirm the customer acknowledges the motherboard/CPU risk disclosure'
  }
  if (!form.customerApproved) {
    return 'Please confirm the customer has signed this bill and approved proceeding with the repair'
  }
  return null
}

export function useRepairBillForm(onDone: () => void) {
  const [form, setForm] = useState<RepairBillFormState>(emptyRepairBillForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = <K extends keyof RepairBillFormState>(key: K, value: RepairBillFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleInList = (field: ChecklistField, label: string) =>
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(label) ? prev[field].filter((d) => d !== label) : [...prev[field], label],
    }))

  const toggleDamage = (label: string) => toggleInList('preExistingDamages', label)
  const toggleMotherboardCondition = (label: string) => toggleInList('motherboardConditions', label)
  const toggleRepairRisk = (label: string) => toggleInList('repairRisksAcknowledged', label)

  const { addPart, updatePart, removePart, addVoidCondition, removeVoidCondition } = useRepairBillLists(setForm)

  const applyAppointment = (appt: RepairAppointment) => {
    const name = typeof appt.userId === 'object' ? appt.userId.name : ''
    setForm((prev) => ({
      ...prev,
      appointmentId: appt._id,
      customerName: name,
      contactNumber: appt.contactNumber,
      deviceBrand: appt.deviceBrand,
      deviceModel: appt.deviceModel,
      repairType: appt.repairType,
      faultDescription: appt.issueDescription || prev.faultDescription,
    }))
  }

  const partsCost = form.parts.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const total = partsCost + form.laborCost + form.otherCharges

  const submit = async () => {
    const error = validate(form)
    if (error) return toast.error(error)

    setIsSubmitting(true)
    try {
      const bill = await repairBillsApi.create({ ...form, partsCost })
      await printRepairReceipt(bill._id)
      toast.success('Repair bill created')
      setForm(emptyRepairBillForm)
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create repair bill')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    update,
    toggleDamage,
    toggleMotherboardCondition,
    toggleRepairRisk,
    addPart,
    updatePart,
    removePart,
    addVoidCondition,
    removeVoidCondition,
    applyAppointment,
    partsCost,
    total,
    isSubmitting,
    submit,
  }
}
