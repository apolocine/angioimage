'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface SettingsTab {
  name: string
  href: string
  icon: any
  description: string
}

const tabs: SettingsTab[] = [
  {
    name: 'Profil',
    href: '/dashboard/settings/profile',
    icon: UserCircleIcon,
    description: 'Gérez vos informations personnelles et préférences'
  },
  {
    name: 'Application',
    href: '/dashboard/settings/application',
    icon: Cog6ToothIcon,
    description: 'Configurez les paramètres généraux de l\'application'
  },
  {
    name: 'Sécurité',
    href: '/dashboard/settings/security',
    icon: ShieldCheckIcon,
    description: 'Gérez vos paramètres de sécurité et connexions'
  },
  {
    name: 'Sauvegarde',
    href: '/dashboard/settings/backup',
    icon: CloudArrowUpIcon,
    description: 'Sauvegardez et restaurez vos données'
  }
]

export default function SettingsPage() {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez vos préférences et la configuration de l'application
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                relative rounded-lg border p-6 hover:shadow-md transition-shadow
                ${isActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-lg
                    ${isActive ? 'bg-indigo-600' : 'bg-gray-100'}
                  `}>
                    <tab.icon className={`
                      h-6 w-6
                      ${isActive ? 'text-white' : 'text-gray-600'}
                    `} />
                  </div>
                  <div className="ml-4">
                    <h3 className={`
                      text-lg font-medium
                      ${isActive ? 'text-indigo-900' : 'text-gray-900'}
                    `}>
                      {tab.name}
                    </h3>
                    <p className={`
                      mt-1 text-sm
                      ${isActive ? 'text-indigo-700' : 'text-gray-500'}
                    `}>
                      {tab.description}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className={`
                  h-5 w-5
                  ${isActive ? 'text-indigo-600' : 'text-gray-400'}
                `} />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/settings/profile#password"
            className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm text-gray-700">Changer le mot de passe</span>
          </Link>
          
          <Link
            href="/dashboard/settings/backup#export"
            className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <CloudArrowUpIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm text-gray-700">Exporter les données</span>
          </Link>
          
          <Link
            href="/dashboard/settings/security#sessions"
            className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <UserCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm text-gray-700">Voir les sessions actives</span>
          </Link>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-blue-700">
              Les modifications apportées aux paramètres sont automatiquement sauvegardées.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}