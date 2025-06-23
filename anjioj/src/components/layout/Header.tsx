'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BellIcon, 
  UserCircleIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname.includes('/patients')) return 'Gestion des Patients'
    if (pathname.includes('/examens')) return 'Examens'
    if (pathname.includes('/angiography')) return 'Angiographie'
    if (pathname.includes('/images')) return 'Images'
    if (pathname.includes('/reports')) return 'Rapports'
    if (pathname.includes('/settings')) return 'Paramètres'
    return 'Dashboard'
  }

  const quickActions = [
    {
      name: 'Nouveau Patient',
      href: '/dashboard/patients/new',
      icon: UserGroupIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Nouvel Examen',
      href: '/dashboard/angiography',
      icon: DocumentIcon,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center space-x-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
            <p className="text-sm text-gray-500">
              Bienvenue, {session?.user?.name || 'Utilisateur'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Barre de recherche */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${action.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                title={action.name}
              >
                <action.icon className="h-4 w-4 mr-1" />
                <span className="hidden lg:block">{action.name}</span>
              </Link>
            ))}
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 relative">
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Profile utilisateur */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="text-sm">
              <p className="font-medium text-gray-700">{session?.user?.name}</p>
              <p className="text-gray-500 capitalize">{session?.user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}