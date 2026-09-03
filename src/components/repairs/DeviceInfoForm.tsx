import { REPAIR_TYPES } from '@/API'
import { RepairBillFormState } from '@/hooks/useRepairBillForm'

interface Props {
  form: RepairBillFormState
  update: <K extends keyof RepairBillFormState>(key: K, value: RepairBillFormState[K]) => void
  readOnlyDevice?: boolean
}

export default function DeviceInfoForm({ form, update, readOnlyDevice }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-secondary-700">Customer Name</label>
        <input
          value={form.customerName}
          onChange={(e) => update('customerName', e.target.value)}
          className="input-field mt-1.5"
          placeholder="Enter customer name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-700">Contact Number</label>
        <input
          value={form.contactNumber}
          onChange={(e) => update('contactNumber', e.target.value)}
          className="input-field mt-1.5"
          placeholder="07XXXXXXXX"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-700">Device Brand</label>
        <input
          value={form.deviceBrand}
          onChange={(e) => update('deviceBrand', e.target.value)}
          disabled={readOnlyDevice}
          className="input-field mt-1.5 disabled:bg-secondary-50"
          placeholder="e.g. Apple"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-700">Device Model</label>
        <input
          value={form.deviceModel}
          onChange={(e) => update('deviceModel', e.target.value)}
          disabled={readOnlyDevice}
          className="input-field mt-1.5 disabled:bg-secondary-50"
          placeholder="e.g. iPhone 13 Pro"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-secondary-700">Repair Type</label>
        <select
          value={form.repairType}
          onChange={(e) => update('repairType', e.target.value as RepairBillFormState['repairType'])}
          className="input-field mt-1.5"
        >
          {REPAIR_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
