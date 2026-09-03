interface Props {
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
  columns?: string
}

export default function ChecklistGrid({ options, selected, onToggle, columns = 'grid-cols-2 sm:grid-cols-3' }: Props) {
  return (
    <div className={`grid ${columns} gap-2`}>
      {options.map((option) => (
        <label
          key={option}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
            selected.includes(option) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 text-secondary-600'
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
          {option}
        </label>
      ))}
    </div>
  )
}
