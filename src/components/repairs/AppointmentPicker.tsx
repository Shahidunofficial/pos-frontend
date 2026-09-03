import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { appointmentsApi, RepairAppointment } from '@/API'

interface Props {
  selectedId?: string
  onSelect: (appointment: RepairAppointment) => void
}

export default function AppointmentPicker({ selectedId, onSelect }: Props) {
  const [appointments, setAppointments] = useState<RepairAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentsApi
      .getAllAdmin()
      .then((all) => setAppointments(all.filter((a) => a.status === 'pending' || a.status === 'confirmed')))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-secondary-400 py-4">Loading appointments...</p>
  if (appointments.length === 0) {
    return <p className="text-sm text-secondary-400 py-4">No pending online appointments found.</p>
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {appointments.map((appt) => {
        const customerName = typeof appt.userId === 'object' ? appt.userId.name : 'Customer'
        return (
          <button
            key={appt._id}
            type="button"
            onClick={() => onSelect(appt)}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              selectedId === appt._id ? 'border-primary-500 bg-primary-50' : 'border-secondary-100 hover:border-primary-200'
            }`}
          >
            <p className="text-sm font-medium text-secondary-900">
              {customerName} &middot; {appt.deviceBrand} {appt.deviceModel}
            </p>
            <p className="text-xs text-secondary-400">
              {appt.repairType.replace(/_/g, ' ')} &middot; {new Date(appt.scheduledAt).toLocaleString()}
            </p>
          </button>
        )
      })}
    </div>
  )
}
