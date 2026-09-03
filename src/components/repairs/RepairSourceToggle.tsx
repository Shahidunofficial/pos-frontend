interface Props {
  source: 'walkin' | 'appointment'
  setSource: (source: 'walkin' | 'appointment') => void
}

export default function RepairSourceToggle({ source, setSource }: Props) {
  const tabs: { id: 'walkin' | 'appointment'; label: string }[] = [
    { id: 'walkin', label: 'Walk-in Customer' },
    { id: 'appointment', label: 'From Online Appointment' },
  ]

  return (
    <div className="inline-flex rounded-lg border border-secondary-200 bg-secondary-50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setSource(tab.id)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            source === tab.id ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-500 hover:text-secondary-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
