'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  HomeIcon, 
  UserGroupIcon, 
  PhotoIcon, 
  BeakerIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Patients', href: '/dashboard/patients', icon: UserGroupIcon },
  { name: 'Images', href: '/dashboard/images', icon: PhotoIcon },
  { name: 'Angiographie', href: '/dashboard/angiography', icon: BeakerIcon },
  { name: 'Rapports', href: '/dashboard/reports', icon: DocumentTextIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center h-16 px-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">AnjioJ</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isActive 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon
                className={`mr-3 h-6 w-6 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="px-2 py-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <ArrowRightOnRectangleIcon
            className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300"
            aria-hidden="true"
          />
          Déconnexion
        </button>
      </div>
    </div>
  )
}