export default function SidebarBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex shrink-0 items-center gap-x-2 ${compact ? 'h-14' : 'h-16'}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 text-sm font-bold text-white shadow-sm">
        CC
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-base font-bold text-secondary-900">CellCare POS</span>
        <span className="text-xs text-secondary-400">Store Terminal</span>
      </div>
    </div>
  )
}
