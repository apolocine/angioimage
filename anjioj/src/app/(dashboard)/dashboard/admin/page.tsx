'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  UsersIcon,
  ChartBarIcon,
  ServerIcon,
  Cog8ToothIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface SystemStats {
  users: {
    total: number
    active: number
    new: number
    trend: number
  }
  patients: {
    total: number
    new: number
    trend: number
  }
  exams: {
    total: number
    today: number
    trend: number
  }
  images: {
    total: number
    size: string
    trend: number
  }
  reports: {
    total: number
    thisMonth: number
    trend: number
  }
  storage: {
    used: string
    total: string
    percentage: number
  }
}

interface SystemAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: string
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])

  useEffect(() => {
    // Check if user is admin
    if (session && session.user?.role !== 'admin') {
      router.push('/dashboard')
    } else if (session) {
      fetchSystemStats()
    }
  }, [session, router])

  const fetchSystemStats = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      // Simulated data
      setStats({
        users: {
          total: 12,
          active: 8,
          new: 3,
          trend: 15
        },
        patients: {
          total: 1234,
          new: 45,
          trend: 8
        },
        exams: {
          total: 5678,
          today: 23,
          trend: -5
        },
        images: {
          total: 12456,
          size: '45.6 GB',
          trend: 12
        },
        reports: {
          total: 892,
          thisMonth: 67,
          trend: 20
        },
        storage: {
          used: '145 GB',
          total: '500 GB',
          percentage: 29
        }
      })

      setAlerts([
        {
          id: '1',
          type: 'warning',
          message: 'Espace de stockage bientôt insuffisant (71% utilisé)',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'info',
          message: '3 nouveaux utilisateurs en attente d\'approbation',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement des statistiques</p>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Utilisateurs',
      value: stats.users.total,
      detail: `${stats.users.active} actifs`,
      icon: UsersIcon,
      trend: stats.users.trend,
      href: '/dashboard/admin/users'
    },
    {
      name: 'Patients',
      value: stats.patients.total.toLocaleString(),
      detail: `+${stats.patients.new} ce mois`,
      icon: UsersIcon,
      trend: stats.patients.trend,
      href: '/dashboard/patients'
    },
    {
      name: 'Examens',
      value: stats.exams.total.toLocaleString(),
      detail: `${stats.exams.today} aujourd'hui`,
      icon: DocumentTextIcon,
      trend: stats.exams.trend,
      href: '/dashboard/examens/completed'
    },
    {
      name: 'Images',
      value: stats.images.total.toLocaleString(),
      detail: stats.images.size,
      icon: PhotoIcon,
      trend: stats.images.trend,
      href: '/dashboard/images'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d'ensemble du système et gestion administrative
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`
                rounded-md p-4 flex items-start
                ${alert.type === 'warning' ? 'bg-yellow-50' :
                  alert.type === 'error' ? 'bg-red-50' : 'bg-blue-50'}
              `}
            >
              <ExclamationTriangleIcon className={`
                h-5 w-5 mr-3 flex-shrink-0
                ${alert.type === 'warning' ? 'text-yellow-400' :
                  alert.type === 'error' ? 'text-red-400' : 'text-blue-400'}
              `} />
              <div className="flex-1">
                <p className={`
                  text-sm font-medium
                  ${alert.type === 'warning' ? 'text-yellow-800' :
                    alert.type === 'error' ? 'text-red-800' : 'text-blue-800'}
                `}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      {stat.trend !== 0 && (
                        <div className={`
                          ml-2 flex items-baseline text-sm font-semibold
                          ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}
                        `}>
                          {stat.trend > 0 ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                          )}
                          <span className="ml-1">{Math.abs(stat.trend)}%</span>
                        </div>
                      )}
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {stat.detail}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Management */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h2>
            <UsersIcon className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard/admin/users"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Voir tous les utilisateurs</span>
              <span className="text-sm text-gray-500">{stats.users.total}</span>
            </Link>
            <Link
              href="/dashboard/admin/users?filter=pending"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Utilisateurs en attente</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {stats.users.new}
              </span>
            </Link>
            <Link
              href="/dashboard/admin/users/new"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Créer un utilisateur
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Informations système</h2>
            <ServerIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Espace de stockage</span>
                <span className="text-sm text-gray-500">
                  {stats.storage.used} / {stats.storage.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${stats.storage.percentage}%` }}
                />
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Version application</span>
                <span className="text-sm font-medium text-gray-700">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Base de données</span>
                <span className="text-sm font-medium text-gray-700">MongoDB 6.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Dernière sauvegarde</span>
                <span className="text-sm font-medium text-gray-700">Il y a 2 heures</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Activité récente</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Dr. Martin</span> a créé un nouvel examen
                </p>
                <p className="text-xs text-gray-500">Il y a 10 minutes</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Admin</span> a ajouté un nouvel utilisateur
                </p>
                <p className="text-xs text-gray-500">Il y a 1 heure</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhotoIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Dr. Dubois</span> a importé 25 images
                </p>
                <p className="text-xs text-gray-500">Il y a 3 heures</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50">
          <Link
            href="/dashboard/admin/logs"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Voir tous les logs →
          </Link>
        </div>
      </div>

      {/* Admin Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/admin/stats"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Statistiques</p>
            <p className="text-xs text-gray-500">Analyses détaillées</p>
          </div>
        </Link>
        
        <Link
          href="/dashboard/admin/logs"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Logs système</p>
            <p className="text-xs text-gray-500">Activité et erreurs</p>
          </div>
        </Link>
        
        <Link
          href="/dashboard/admin/config"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <Cog8ToothIcon className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Configuration</p>
            <p className="text-xs text-gray-500">Paramètres avancés</p>
          </div>
        </Link>
        
        <Link
          href="/dashboard/settings/backup"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <ServerIcon className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Maintenance</p>
            <p className="text-xs text-gray-500">Backup et restore</p>
          </div>
        </Link>
      </div>
    </div>
  )
}