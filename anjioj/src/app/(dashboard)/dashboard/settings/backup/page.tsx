'use client'

import { useState, useEffect } from 'react'
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
  ServerIcon,
  ArchiveBoxIcon,
  TrashIcon,
  DocumentIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface BackupInfo {
  name: string
  timestamp: string
  size: number
  collections: string[]
  documentCount: number
  isLatest?: boolean
}

interface BackupStats {
  totalBackups: number
  totalSize: number
  lastBackup?: string
  collections: {
    name: string
    count: number
  }[]
}

export default function BackupSettingsPage() {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ action: string; backup?: string } | null>(null)

  useEffect(() => {
    fetchBackups()
    fetchStats()
  }, [])

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/backup/list')
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des backups:', error)
      setMessage({ type: 'error', text: 'Impossible de charger la liste des backups' })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/backup/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const createBackup = async () => {
    setCreating(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: `Backup manuel depuis l'interface`
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: `Backup créé avec succès: ${data.backup.name}` })
        fetchBackups()
        fetchStats()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Erreur lors de la création du backup' })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la création du backup' })
    } finally {
      setCreating(false)
    }
  }

  const restoreBackup = async (backupName: string) => {
    setRestoring(backupName)
    setMessage(null)
    setShowConfirmDialog(null)
    
    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupName })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessage({ 
          type: 'success', 
          text: `Base de données restaurée avec succès depuis: ${backupName}` 
        })
        
        // Recharger les stats après restauration
        setTimeout(() => {
          fetchStats()
        }, 2000)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Erreur lors de la restauration' })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la restauration' })
    } finally {
      setRestoring(null)
    }
  }

  const deleteBackup = async (backupName: string) => {
    setShowConfirmDialog(null)
    setMessage(null)
    
    try {
      const response = await fetch(`/api/backup/${encodeURIComponent(backupName)}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Backup supprimé: ${backupName}` })
        fetchBackups()
        fetchStats()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression' })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const downloadBackup = async (backupName: string) => {
    try {
      const response = await fetch(`/api/backup/${encodeURIComponent(backupName)}/download`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${backupName}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setMessage({ type: 'success', text: 'Téléchargement du backup démarré' })
      } else {
        setMessage({ type: 'error', text: 'Erreur lors du téléchargement' })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement' })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('fr-FR', {
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

      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des sauvegardes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Créez et gérez les sauvegardes de votre base de données
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => fetchBackups()}
            disabled={loading}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={createBackup}
            disabled={creating}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {creating ? (
              <>
                <ClockIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Création en cours...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
                Créer un backup
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message d'alerte */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50' :
          message.type === 'error' ? 'bg-red-50' :
          'bg-yellow-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : message.type === 'error' ? (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' :
                message.type === 'error' ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              État de la base de données
            </h3>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 px-4 py-5 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Total des backups</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalBackups}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Espace utilisé</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatFileSize(stats.totalSize)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Dernier backup</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {stats.lastBackup ? formatDate(stats.lastBackup) : 'Aucun'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 mb-2">Collections</dt>
                <dd className="space-y-1">
                  {stats.collections.slice(0, 3).map(col => (
                    <div key={col.name} className="text-xs text-gray-900">
                      {col.name}: <span className="font-medium">{col.count}</span>
                    </div>
                  ))}
                  {stats.collections.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{stats.collections.length - 3} autres...
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Liste des backups */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Historique des sauvegardes
          </h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <ClockIcon className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun backup</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre premier backup
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {backups.map((backup) => (
              <li key={backup.name}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ArchiveBoxIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {backup.name}
                          </p>
                          {backup.isLatest && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Dernier
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <CalendarDaysIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {formatDate(backup.timestamp)}
                          <span className="mx-2">•</span>
                          <ServerIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {formatFileSize(backup.size)}
                          <span className="mx-2">•</span>
                          <DocumentIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {backup.documentCount} documents
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          Collections: {backup.collections.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadBackup(backup.name)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        title="Télécharger"
                      >
                        <CloudArrowDownIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowConfirmDialog({ action: 'restore', backup: backup.name })}
                        disabled={restoring === backup.name}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        title="Restaurer"
                      >
                        {restoring === backup.name ? (
                          <ClockIcon className="animate-spin h-4 w-4" />
                        ) : (
                          <ArrowPathIcon className="h-4 w-4" />
                        )}
                      </button>
                      {!backup.isLatest && (
                        <button
                          onClick={() => setShowConfirmDialog({ action: 'delete', backup: backup.name })}
                          className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Note d'information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <DocumentIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Informations sur les sauvegardes
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Les backups incluent: patients, examens, images, rapports, paramètres et templates</li>
                <li>Le backup "latest" est automatiquement mis à jour à chaque nouvelle sauvegarde</li>
                <li>Les backups peuvent être téléchargés au format ZIP pour archivage externe</li>
                <li>La restauration remplace toutes les données actuelles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue de confirmation */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {showConfirmDialog.action === 'restore' ? 'Restaurer le backup' : 'Supprimer le backup'}
                </h3>
                <div className="mt-2">
                  {showConfirmDialog.action === 'restore' ? (
                    <>
                      <p className="text-sm text-gray-500">
                        Cette action va remplacer toutes les données actuelles de la base de données 
                        par celles du backup sélectionné.
                      </p>
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        ⚠️ Cette opération est irréversible !
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer ce backup ? Cette action est irréversible.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => {
                  if (showConfirmDialog.action === 'restore' && showConfirmDialog.backup) {
                    restoreBackup(showConfirmDialog.backup)
                  } else if (showConfirmDialog.action === 'delete' && showConfirmDialog.backup) {
                    deleteBackup(showConfirmDialog.backup)
                  }
                }}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                  showConfirmDialog.action === 'restore' 
                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {showConfirmDialog.action === 'restore' ? 'Restaurer' : 'Supprimer'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDialog(null)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}