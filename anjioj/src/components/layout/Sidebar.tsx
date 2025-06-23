'use client'

import { useState } from 'react'
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
  ArrowRightOnRectangleIcon,
  DocumentIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Patients', 
    href: '/dashboard/patients', 
    icon: UserGroupIcon,
    subItems: [
      { name: 'Liste des patients', href: '/dashboard/patients', icon: UserGroupIcon },
      { name: 'Nouveau patient', href: '/dashboard/patients/new', icon: PlusIcon }
    ]
  },
  { 
    name: 'Examens', 
    href: '/dashboard/examens', 
    icon: DocumentIcon,
    subItems: [
      { name: 'Tous les examens', href: '/dashboard/examens', icon: ClipboardDocumentListIcon },
      { name: 'Examens programmés', href: '/dashboard/examens/scheduled', icon: DocumentIcon },
      { name: 'Examens terminés', href: '/dashboard/examens/completed', icon: DocumentTextIcon }
    ]
  },
  { name: 'Images', href: '/dashboard/images', icon: PhotoIcon },
  { name: 'Angiographie', href: '/dashboard/angiography', icon: BeakerIcon },
  { name: 'Rapports', href: '/dashboard/reports', icon: DocumentTextIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center h-16 px-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">AnjioJ</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const isExpanded = expandedItems.includes(item.name)
          const hasSubItems = item.subItems && item.subItems.length > 0

          return (
            <div key={item.name}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={`
                      group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md
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
                    <span className="flex-1 text-left">{item.name}</span>
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`
                              group flex items-center px-2 py-2 text-sm rounded-md
                              ${isSubActive 
                                ? 'bg-gray-700 text-white' 
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }
                            `}
                          >
                            <subItem.icon
                              className={`mr-3 h-4 w-4 ${
                                isSubActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                              }`}
                              aria-hidden="true"
                            />
                            {subItem.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
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
              )}
            </div>
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