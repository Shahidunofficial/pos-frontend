'use client'

import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'

export default function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-secondary-200 bg-white/90 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-secondary-700 lg:hidden" onClick={onOpenSidebar}>
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 items-center justify-between">
        <div className="text-sm font-semibold text-secondary-900 lg:hidden">CellCare POS</div>

        <div className="ml-auto flex items-center gap-x-4">
          {user && (
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-secondary-900">{user.name}</span>
              <span className="text-xs capitalize text-secondary-400">{user.role}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-x-1.5 rounded-lg px-3 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-red-600 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
