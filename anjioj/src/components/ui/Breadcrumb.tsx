'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

export default function Breadcrumb() {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Dashboard', href: '/dashboard' }
    ]

    let currentPath = '/dashboard'

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`

      // Noms personnalisés pour les segments
      let segmentName = segment
      
      // Mapping des noms de segments
      const segmentMapping: Record<string, string> = {
        'patients': 'Patients',
        'examens': 'Examens',
        'angiography': 'Angiographie',
        'images': 'Images',
        'reports': 'Rapports',
        'settings': 'Paramètres',
        'new': 'Nouveau',
        'edit': 'Modifier',
        'view': 'Voir',
        'upload': 'Upload',
        'capture': 'Capture',
        'analysis': 'Analyse',
        'scheduled': 'Programmés',
        'completed': 'Terminés'
      }

      // Si c'est un ID (24 caractères hexadécimaux), on essaie de récupérer le nom
      if (/^[0-9a-fA-F]{24}$/.test(segment)) {
        // Pour les patients, on peut récupérer le nom du patient
        if (segments[i-1] === 'patients') {
          segmentName = 'Patient' // On pourrait faire un appel API ici pour récupérer le nom
        } else if (segments[i-1] === 'examens') {
          segmentName = 'Examen'
        } else {
          segmentName = 'Détails'
        }
      } else {
        segmentName = segmentMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      }

      breadcrumbs.push({
        name: segmentName,
        href: currentPath
      })
    }

    // Marquer le dernier élément comme actuel
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].current = true
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Ne pas afficher les breadcrumbs sur la page dashboard principale
  if (pathname === '/dashboard') {
    return null
  }

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </li>
        
        {breadcrumbs.slice(1).map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              {item.current ? (
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-indigo-600 md:ml-2"
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}