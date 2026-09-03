import { PrinterIcon } from '@heroicons/react/24/outline'
import { FiAlertTriangle } from 'react-icons/fi'
import { RepairBill, RepairBillStatus } from '@/API'

interface Props {
  bills: RepairBill[]
  onStatusChange: (id: string, status: RepairBillStatus) => void
  onReprint: (id: string) => void
}

const STATUS_OPTIONS: RepairBillStatus[] = ['pending', 'in_progress', 'completed']

export default function RepairBillsTable({ bills, onStatusChange, onReprint }: Props) {
  if (bills.length === 0) {
    return <div className="card text-center py-12 text-secondary-400">No repair bills yet.</div>
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-secondary-100">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase text-secondary-400">
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Device</th>
            <th className="py-2 pr-4">Fault</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Warranty</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100">
          {bills.map((bill) => (
            <tr key={bill._id} className="text-sm">
              <td className="py-3 pr-4">
                <div className="font-medium text-secondary-900">{bill.customerName}</div>
                <div className="text-xs text-secondary-400">{bill.contactNumber}</div>
              </td>
              <td className="py-3 pr-4 text-secondary-700">
                <div className="flex items-center gap-1.5">
                  {bill.deviceBrand} {bill.deviceModel}
                  {(bill.motherboardConditions?.length > 0 || bill.repairRisksAcknowledged?.length > 0) && (
                    <FiAlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" title="Motherboard/CPU risk noted" />
                  )}
                </div>
              </td>
              <td className="py-3 pr-4 text-secondary-500 max-w-xs truncate">{bill.faultDescription}</td>
              <td className="py-3 pr-4 font-semibold text-secondary-900">LKR {bill.total.toFixed(2)}</td>
              <td className="py-3 pr-4 text-secondary-500">
                {bill.warrantyMonths > 0 ? `${bill.warrantyMonths} mo` : 'None'}
              </td>
              <td className="py-3 pr-4">
                <select
                  value={bill.status}
                  onChange={(e) => onStatusChange(bill._id, e.target.value as RepairBillStatus)}
                  className="rounded-md border border-secondary-200 text-xs py-1 px-2 capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-3 pr-4 text-right">
                <button
                  onClick={() => onReprint(bill._id)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <PrinterIcon className="h-4 w-4" /> Print
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
