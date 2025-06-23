'use client'

import { useSession } from 'next-auth/react'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">
            Bienvenue, {session?.user?.name || 'Utilisateur'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="text-sm">
              <p className="font-medium text-gray-700">{session?.user?.name}</p>
              <p className="text-gray-500">{session?.user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}