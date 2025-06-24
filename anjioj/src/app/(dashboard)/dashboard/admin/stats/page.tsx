'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface ChartData {
  name: string
  value: number
}

interface StatisticsData {
  users: {
    total: number
    growth: ChartData[]
    byRole: ChartData[]
  }
  patients: {
    total: number
    growth: ChartData[]
    byAge: ChartData[]
  }
  exams: {
    total: number
    growth: ChartData[]
    byType: ChartData[]
    byStatus: ChartData[]
  }
  images: {
    total: number
    totalSize: string
    growth: ChartData[]
    byType: ChartData[]
  }
  reports: {
    total: number
    growth: ChartData[]
    byStatus: ChartData[]
  }
}

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatisticsData | null>(null)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchStatistics()
  }, [timeRange])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      // Simulated data
      setStats({
        users: {
          total: 45,
          growth: [
            { name: 'Jan', value: 30 },
            { name: 'Fév', value: 35 },
            { name: 'Mar', value: 42 },
            { name: 'Avr', value: 45 }
          ],
          byRole: [
            { name: 'Médecins', value: 25 },
            { name: 'Assistants', value: 18 },
            { name: 'Admins', value: 2 }
          ]
        },
        patients: {
          total: 2847,
          growth: [
            { name: 'Jan', value: 2450 },
            { name: 'Fév', value: 2650 },
            { name: 'Mar', value: 2750 },
            { name: 'Avr', value: 2847 }
          ],
          byAge: [
            { name: '18-30', value: 345 },
            { name: '31-50', value: 892 },
            { name: '51-70', value: 1245 },
            { name: '70+', value: 365 }
          ]
        },
        exams: {
          total: 8934,
          growth: [
            { name: 'Jan', value: 7800 },
            { name: 'Fév', value: 8200 },
            { name: 'Mar', value: 8600 },
            { name: 'Avr', value: 8934 }
          ],
          byType: [
            { name: 'Angiographie', value: 6234 },
            { name: 'Rétinographie', value: 2700 }
          ],
          byStatus: [
            { name: 'Terminés', value: 8234 },
            { name: 'En cours', value: 45 },
            { name: 'Planifiés', value: 655 }
          ]
        },
        images: {
          total: 45672,
          totalSize: '2.4 TB',
          growth: [
            { name: 'Jan', value: 38000 },
            { name: 'Fév', value: 41000 },
            { name: 'Mar', value: 43500 },
            { name: 'Avr', value: 45672 }
          ],
          byType: [
            { name: 'Précoce', value: 18234 },
            { name: 'Intermédiaire', value: 15432 },
            { name: 'Tardive', value: 12006 }
          ]
        },
        reports: {
          total: 1245,
          growth: [
            { name: 'Jan', value: 1050 },
            { name: 'Fév', value: 1150 },
            { name: 'Mar', value: 1200 },
            { name: 'Avr', value: 1245 }
          ],
          byStatus: [
            { name: 'Finalisés', value: 1156 },
            { name: 'Brouillons', value: 89 }
          ]
        }
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGrowth = (data: ChartData[]) => {
    if (data.length < 2) return 0
    const current = data[data.length - 1].value
    const previous = data[data.length - 2].value
    return Math.round(((current - previous) / previous) * 100)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à l'admin
          </Link>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">3 derniers mois</option>
          <option value="1y">12 derniers mois</option>
        </select>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques détaillées</h1>
        <p className="mt-1 text-sm text-gray-600">
          Analyses approfondies de l'utilisation du système
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Utilisateurs actifs
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.users.total}
                    </div>
                    <div className={`
                      ml-2 flex items-baseline text-sm font-semibold
                      ${calculateGrowth(stats.users.growth) > 0 ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {calculateGrowth(stats.users.growth) > 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      )}
                      <span className="ml-1">{Math.abs(calculateGrowth(stats.users.growth))}%</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Patients
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.patients.total.toLocaleString()}
                    </div>
                    <div className={`
                      ml-2 flex items-baseline text-sm font-semibold
                      ${calculateGrowth(stats.patients.growth) > 0 ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {calculateGrowth(stats.patients.growth) > 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      )}
                      <span className="ml-1">{Math.abs(calculateGrowth(stats.patients.growth))}%</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Examens
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.exams.total.toLocaleString()}
                    </div>
                    <div className={`
                      ml-2 flex items-baseline text-sm font-semibold
                      ${calculateGrowth(stats.exams.growth) > 0 ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {calculateGrowth(stats.exams.growth) > 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      )}
                      <span className="ml-1">{Math.abs(calculateGrowth(stats.exams.growth))}%</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhotoIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Images
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.images.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stats.images.totalSize}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users by Role */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Utilisateurs par rôle</h3>
          <div className="space-y-3">
            {stats.users.byRole.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.name}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(item.value / stats.users.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exams by Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Examens par statut</h3>
          <div className="space-y-3">
            {stats.exams.byStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.name}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${
                        item.name === 'Terminés' ? 'bg-green-600' :
                        item.name === 'En cours' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${(item.value / stats.exams.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images by Type */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Images par phase</h3>
          <div className="space-y-3">
            {stats.images.byType.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.name}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(item.value / stats.images.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports by Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rapports par statut</h3>
          <div className="space-y-3">
            {stats.reports.byStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.name}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${
                        item.name === 'Finalisés' ? 'bg-green-600' : 'bg-orange-600'
                      }`}
                      style={{ width: `${(item.value / stats.reports.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Charts (Simplified) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Évolution temporelle</h3>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Croissance des patients</h4>
            <div className="flex items-end space-x-2 h-32">
              {stats.patients.growth.map((item, index) => (
                <div key={item.name} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(item.value / Math.max(...stats.patients.growth.map(d => d.value))) * 100}%`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-1">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Croissance des examens</h4>
            <div className="flex items-end space-x-2 h-32">
              {stats.exams.growth.map((item, index) => (
                <div key={item.name} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ 
                      height: `${(item.value / Math.max(...stats.exams.growth.map(d => d.value))) * 100}%`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-1">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}