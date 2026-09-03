'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import RepairSourceToggle from '@/components/repairs/RepairSourceToggle'
import AppointmentPicker from '@/components/repairs/AppointmentPicker'
import DeviceInfoForm from '@/components/repairs/DeviceInfoForm'
import FaultDamageForm from '@/components/repairs/FaultDamageForm'
import MotherboardRiskForm from '@/components/repairs/MotherboardRiskForm'
import WarrantyTermsForm from '@/components/repairs/WarrantyTermsForm'
import RepairPartsForm from '@/components/repairs/RepairPartsForm'
import CostBreakdownForm from '@/components/repairs/CostBreakdownForm'
import FinalApprovalForm from '@/components/repairs/FinalApprovalForm'
import { useRepairBillForm } from '@/hooks/useRepairBillForm'

export default function NewRepairBillPage() {
  const router = useRouter()
  const [source, setSource] = useState<'walkin' | 'appointment'>('walkin')
  const {
    form, update, toggleDamage, toggleMotherboardCondition, toggleRepairRisk,
    addPart, updatePart, removePart, addVoidCondition, removeVoidCondition,
    applyAppointment, partsCost, total, isSubmitting, submit,
  } = useRepairBillForm(() => router.push('/repairs'))

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-secondary-900">New Repair Bill</h1>
        <p className="mt-1 text-sm text-secondary-600">
          Create a separate bill for a phone repair job, including fault status and any pre-existing damage.
        </p>

        <div className="mt-6">
          <RepairSourceToggle source={source} setSource={setSource} />
        </div>

        <div className="mt-6 space-y-6">
          {source === 'appointment' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-3">Select Appointment</h2>
              <AppointmentPicker selectedId={form.appointmentId} onSelect={applyAppointment} />
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Customer & Device</h2>
            <DeviceInfoForm form={form} update={update} readOnlyDevice={source === 'appointment' && !!form.appointmentId} />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Fault & Damage Report</h2>
            <FaultDamageForm form={form} update={update} toggleDamage={toggleDamage} />
          </div>

          <MotherboardRiskForm
            form={form}
            update={update}
            toggleMotherboardCondition={toggleMotherboardCondition}
            toggleRepairRisk={toggleRepairRisk}
            defaultOpen={form.repairType === 'iphone_no_power'}
          />

          <WarrantyTermsForm form={form} update={update} addVoidCondition={addVoidCondition} removeVoidCondition={removeVoidCondition} />

          <RepairPartsForm parts={form.parts} addPart={addPart} updatePart={updatePart} removePart={removePart} partsCost={partsCost} />

          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Cost Breakdown</h2>
            <CostBreakdownForm form={form} update={update} partsCost={partsCost} total={total} />
          </div>

          <FinalApprovalForm form={form} update={update} />

          <div className="flex justify-end gap-x-3">
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            <button type="button" disabled={isSubmitting} onClick={submit} className="btn-primary disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Create & Print Bill'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
