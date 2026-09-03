'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from './navigation'

export default function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-secondary-400 group-hover:text-primary-600'}`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
