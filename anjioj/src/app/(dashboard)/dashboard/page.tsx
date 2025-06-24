'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline'

interface Stat {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon?: any
}

interface RecentExam {
  id: string
  patientName: string
  type: string
  oeil: string
  timeAgo: string
  status: string
  statusColor: string
}

interface StatsResponse {
  stats: Stat[]
  recentExams: RecentExam[]
  metadata: {
    lastUpdated: string
    period: {
      today: string
      weekAgo: string
    }
  }
}

const defaultStats = [
  { name: 'Total Patients', value: '0', icon: UserGroupIcon, change: '0%', changeType: 'positive' as 'positive' | 'negative' },
  { name: 'Examens du jour', value: '0', icon: CalendarIcon, change: '0%', changeType: 'positive' as 'positive' | 'negative' },
  { name: 'Images traitées', value: '0', icon: PhotoIcon, change: '0%', changeType: 'positive' as 'positive' | 'negative' },
  { name: 'Rapports générés', value: '0', icon: DocumentTextIcon, change: '0%', changeType: 'positive' as 'positive' | 'negative' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(defaultStats)
  const [recentExams, setRecentExams] = useState<RecentExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      const data: StatsResponse = await response.json()
      
      if (response.ok) {
        // Combiner les statistiques avec les icônes
        const statsWithIcons = data.stats.map((stat, index) => ({
          ...stat,
          icon: defaultStats[index].icon
        }))
        setStats(statsWithIcons)
        setRecentExams(data.recentExams || [])
        setLastUpdated(data.metadata.lastUpdated)
        setError('')
      } else {
        throw new Error('Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error)
      setError('Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="mt-1 text-sm text-gray-600">
              Vue d'ensemble de votre activité
            </p>
          </div>
          <div className="text-right">
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Dernière mise à jour: {new Date(lastUpdated).toLocaleTimeString('fr-FR')}
              </p>
            )}
            <button
              onClick={fetchStats}
              disabled={loading}
              className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : '🔄 Actualiser'}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <div
              key={stat.name}
              className={`relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden transition-opacity ${
                loading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <dt>
                <div className="absolute bg-indigo-500 rounded-md p-3">
                  <IconComponent className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {loading ? '...' : stat.change}
                </p>
              </dd>
            </div>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Examens récents
            {loading && (
              <span className="ml-2 text-xs text-gray-500">Chargement...</span>
            )}
          </h2>
          <div className="space-y-3">
            {recentExams.length > 0 ? (
              recentExams.map((exam) => {
                const getStatusClasses = (color: string) => {
                  switch (color) {
                    case 'green':
                      return 'text-green-800 bg-green-100'
                    case 'yellow':
                      return 'text-yellow-800 bg-yellow-100'
                    case 'gray':
                    default:
                      return 'text-gray-800 bg-gray-100'
                  }
                }
                
                return (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{exam.patientName}</p>
                      <p className="text-sm text-gray-500">
                        {exam.type}{exam.oeil ? ` - ${exam.oeil}` : ''} • {exam.timeAgo}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(exam.statusColor)}`}>
                      {exam.status}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                {loading ? (
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                ) : (
                  <p>Aucun examen récent trouvé</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <Link 
              href="/dashboard/patients/new" 
              className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="font-medium text-indigo-900">Nouveau patient</span>
              </div>
              <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            
            <Link 
              href="/dashboard/examens" 
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">Gérer les examens</span>
              </div>
              <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            
            <Link 
              href="/dashboard/images/upload" 
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center">
                <PhotoIcon className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">Importer des images</span>
              </div>
              <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            
            <Link 
              href="/dashboard/reports/generator" 
              className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-orange-600 mr-3" />
                <span className="font-medium text-orange-900">Générer un rapport</span>
              </div>
              <span className="text-orange-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}