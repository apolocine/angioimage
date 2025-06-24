'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CalendarDaysIcon,
  ServerIcon
} from '@heroicons/react/24/outline'

interface Backup {
  id: string
  date: string
  size: string
  type: 'manual' | 'auto'
  status: 'completed' | 'failed' | 'in_progress'
}

interface BackupSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  retention: number
}

export default function BackupSettingsPage() {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      size: '125 MB',
      type: 'manual',
      status: 'completed'
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      size: '122 MB',
      type: 'auto',
      status: 'completed'
    },
    {
      id: '3',
      date: new Date(Date.now() - 172800000).toISOString(),
      size: '120 MB',
      type: 'auto',
      status: 'completed'
    }
  ])

  const [schedule, setSchedule] = useState<BackupSchedule>({
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    retention: 7
  })

  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleManualBackup = async () => {
    setIsBackingUp(true)
    setMessage(null)
    
    try {
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulation
      
      const newBackup: Backup = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        size: '125 MB',
        type: 'manual',
        status: 'completed'
      }
      
      setBackups([newBackup, ...backups])
      setMessage({ type: 'success', text: 'Sauvegarde effectuée avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async (backupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cette action remplacera toutes les données actuelles.')) {
      return
    }

    setIsRestoring(true)
    setMessage(null)
    
    try {
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulation
      setMessage({ type: 'success', text: 'Restauration effectuée avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la restauration' })
    } finally {
      setIsRestoring(false)
    }
  }

  const handleDownloadBackup = (backupId: string) => {
    // TODO: Implement download
    console.log('Downloading backup:', backupId)
  }

  const handleScheduleChange = (key: keyof BackupSchedule, value: any) => {
    setSchedule(prev => ({ ...prev, [key]: value }))
    // TODO: Save to API
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)
    
    if (days === 0) return 'Aujourd\'hui'
    if (days === 1) return 'Hier'
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        <h1 className="text-2xl font-bold text-gray-900">Sauvegarde et restauration</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez les sauvegardes de vos données et restaurez-les si nécessaire
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Manual Backup */}
        <div className="bg-white shadow rounded-lg p-6" id="export">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">Sauvegarde manuelle</h2>
            <p className="mt-1 text-sm text-gray-500">
              Créez une sauvegarde instantanée de toutes vos données
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <ServerIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Données à sauvegarder
                  </p>
                  <p className="text-xs text-gray-500">
                    Patients, examens, images, rapports, paramètres
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-600">~125 MB</span>
            </div>

            <button
              onClick={handleManualBackup}
              disabled={isBackingUp || isRestoring}
              className={`
                w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white
                ${isBackingUp || isRestoring
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
                }
              `}
            >
              {isBackingUp ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  Créer une sauvegarde
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              💡 Conseil : Effectuez des sauvegardes régulières pour éviter toute perte de données
            </p>
          </div>
        </div>

        {/* Automatic Backup */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">Sauvegarde automatique</h2>
            <p className="mt-1 text-sm text-gray-500">
              Planifiez des sauvegardes automatiques régulières
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Activer les sauvegardes automatiques
              </span>
              <button
                onClick={() => handleScheduleChange('enabled', !schedule.enabled)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${schedule.enabled ? 'bg-indigo-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${schedule.enabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </label>

            {schedule.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence
                  </label>
                  <select
                    value={schedule.frequency}
                    onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de sauvegarde
                  </label>
                  <input
                    type="time"
                    value={schedule.time}
                    onChange={(e) => handleScheduleChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Heure locale (fuseau horaire Europe/Paris)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rétention des sauvegardes
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={schedule.retention}
                      onChange={(e) => handleScheduleChange('retention', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">jours</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Les sauvegardes plus anciennes seront automatiquement supprimées
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    Prochaine sauvegarde : 
                    <span className="ml-1 font-medium">
                      {schedule.frequency === 'daily' ? 'Demain' : 
                       schedule.frequency === 'weekly' ? 'Dans 7 jours' : 
                       'Dans 30 jours'} à {schedule.time}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Historique des sauvegardes</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {backups.map((backup) => (
            <div key={backup.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${backup.status === 'completed' ? 'bg-green-100' : 
                     backup.status === 'failed' ? 'bg-red-100' :
                     'bg-yellow-100'}
                  `}>
                    {backup.status === 'completed' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : backup.status === 'failed' ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    ) : (
                      <ClockIcon className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(backup.date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {backup.type === 'manual' ? 'Sauvegarde manuelle' : 'Sauvegarde automatique'} • {backup.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadBackup(backup.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Télécharger"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleRestore(backup.id)}
                    disabled={isRestoring}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <DocumentArrowUpIcon className="h-4 w-4 mr-1" />
                    Restaurer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {backups.length === 0 && (
          <div className="text-center py-12">
            <CloudArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Aucune sauvegarde disponible
            </p>
          </div>
        )}
      </div>

      {/* Import Data */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Importer des données</h2>
          <p className="mt-1 text-sm text-gray-500">
            Restaurez des données à partir d'un fichier de sauvegarde
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Glissez-déposez un fichier de sauvegarde ici
          </p>
          <p className="text-xs text-gray-500">ou</p>
          <button className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Sélectionner un fichier
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Formats acceptés : .backup, .zip • Taille max : 500 MB
          </p>
        </div>
      </div>
    </div>
  )
}