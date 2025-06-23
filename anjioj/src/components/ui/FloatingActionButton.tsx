'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  PlusIcon,
  UserGroupIcon,
  DocumentIcon,
  PhotoIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface FloatingAction {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  show: (pathname: string) => boolean
}

const floatingActions: FloatingAction[] = [
  {
    name: 'Nouveau Patient',
    href: '/dashboard/patients/new',
    icon: UserGroupIcon,
    color: 'bg-blue-600 hover:bg-blue-700',
    show: (pathname) => pathname.includes('/patients')
  },
  {
    name: 'Nouvel Examen',
    href: '/dashboard/angiography',
    icon: DocumentIcon,
    color: 'bg-green-600 hover:bg-green-700',
    show: (pathname) => pathname.includes('/patients') || pathname.includes('/examens')
  },
  {
    name: 'Capturer Images',
    href: '/dashboard/angiography',
    icon: CameraIcon,
    color: 'bg-purple-600 hover:bg-purple-700',
    show: (pathname) => pathname.includes('/angiography') || pathname.includes('/examens')
  },
  {
    name: 'Uploader Images',
    href: '/dashboard/images',
    icon: PhotoIcon,
    color: 'bg-orange-600 hover:bg-orange-700',
    show: (pathname) => pathname.includes('/images') || pathname.includes('/examens')
  }
]

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const visibleActions = floatingActions.filter(action => action.show(pathname))

  if (visibleActions.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-3">
        {/* Actions secondaires */}
        {isOpen && (
          <div className="flex flex-col items-end space-y-2">
            {visibleActions.slice(1).map((action, index) => (
              <div
                key={action.name}
                className="flex items-center space-x-3 animate-pulse"
              >
                <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium opacity-90">
                  {action.name}
                </div>
                <Link
                  href={action.href}
                  className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg text-white transition-all duration-200 hover:scale-110 ${action.color}`}
                  onClick={() => setIsOpen(false)}
                >
                  <action.icon className="h-6 w-6" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Bouton principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white transition-all duration-200 hover:scale-110 ${
            isOpen 
              ? 'bg-red-600 hover:bg-red-700 rotate-45' 
              : visibleActions[0]?.color || 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : visibleActions[0] ? (
            (() => {
              const Icon = visibleActions[0].icon;
              return <Icon className="h-6 w-6" />;
            })()
          ) : (
            <PlusIcon className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  )
}