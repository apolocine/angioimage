'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  KeyIcon,
  ClockIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Session {
  id: string
  device: string
  browser: string
  location: string
  ipAddress: string
  lastActive: string
  current: boolean
}

interface ActivityLog {
  id: string
  action: string
  timestamp: string
  ipAddress: string
  success: boolean
}

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      // Simulated data
      setSessions([
        {
          id: '1',
          device: 'MacBook Pro',
          browser: 'Chrome 120',
          location: 'Paris, France',
          ipAddress: '192.168.1.1',
          lastActive: new Date().toISOString(),
          current: true
        },
        {
          id: '2',
          device: 'iPhone 14',
          browser: 'Safari',
          location: 'Lyon, France',
          ipAddress: '192.168.1.2',
          lastActive: new Date(Date.now() - 3600000).toISOString(),
          current: false
        }
      ])

      setActivityLogs([
        {
          id: '1',
          action: 'Connexion réussie',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
          success: true
        },
        {
          id: '2',
          action: 'Modification du mot de passe',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          ipAddress: '192.168.1.1',
          success: true
        },
        {
          id: '3',
          action: 'Tentative de connexion échouée',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          ipAddress: '192.168.1.100',
          success: false
        }
      ])
    } catch (error) {
      console.error('Error fetching security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cette session ?')) return

    try {
      // TODO: API call
      setSessions(sessions.filter(s => s.id !== sessionId))
      setMessage({ type: 'success', text: 'Session révoquée avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la révocation de la session' })
    }
  }

  const handleToggleTwoFactor = () => {
    setShowTwoFactorModal(true)
  }

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('phone') || device.toLowerCase().includes('mobile')) {
      return DevicePhoneMobileIcon
    }
    return ComputerDesktopIcon
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour aux paramètres
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sécurité</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez vos paramètres de sécurité et surveillez l'activité de votre compte
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Sessions */}
          <div className="bg-white shadow rounded-lg p-6" id="sessions">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Sessions actives</h2>
              <p className="mt-1 text-sm text-gray-500">
                Gérez les appareils connectés à votre compte
              </p>
            </div>

            <div className="space-y-4">
              {sessions.map((session) => {
                const Icon = getDeviceIcon(session.device)
                return (
                  <div
                    key={session.id}
                    className={`
                      border rounded-lg p-4
                      ${session.current ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <Icon className={`h-6 w-6 mt-0.5 ${
                          session.current ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <p className={`text-sm font-medium ${
                              session.current ? 'text-indigo-900' : 'text-gray-900'
                            }`}>
                              {session.device}
                            </p>
                            {session.current && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                Session actuelle
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {session.browser} • {session.location}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            IP: {session.ipAddress} • {formatRelativeTime(session.lastActive)}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4">
              <button className="text-sm text-red-600 hover:text-red-800">
                Révoquer toutes les autres sessions
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Authentification à deux facteurs</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
              </div>
              <ShieldCheckIcon className={`h-8 w-8 ${
                twoFactorEnabled ? 'text-green-500' : 'text-gray-300'
              }`} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}
                `}>
                  <KeyIcon className={`h-5 w-5 ${
                    twoFactorEnabled ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {twoFactorEnabled ? 'Activée' : 'Désactivée'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {twoFactorEnabled 
                      ? 'Votre compte est protégé par 2FA'
                      : 'Activez la 2FA pour plus de sécurité'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleTwoFactor}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md
                  ${twoFactorEnabled
                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                    : 'text-white bg-indigo-600 hover:bg-indigo-700'
                  }
                `}
              >
                {twoFactorEnabled ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Activité récente</h2>
              <p className="mt-1 text-sm text-gray-500">
                Consultez l'historique des actions sur votre compte
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adresse IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatRelativeTime(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Succès
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Échec
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Voir tout l'historique
              </button>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Clés API</h2>
              <p className="mt-1 text-sm text-gray-500">
                Gérez les clés d'accès pour les intégrations tierces
              </p>
            </div>

            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Aucune clé API créée
              </p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Créer une clé API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}