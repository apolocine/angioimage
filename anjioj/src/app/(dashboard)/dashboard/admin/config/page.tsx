'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface SystemConfig {
  database: {
    host: string
    port: number
    name: string
    connectionStatus: 'connected' | 'disconnected' | 'error'
    poolSize: number
    backupFrequency: string
  }
  storage: {
    provider: string
    region: string
    bucket: string
    maxFileSize: string
    allowedTypes: string[]
  }
  email: {
    provider: string
    host: string
    port: number
    secure: boolean
    testConnection: boolean
  }
  security: {
    jwtExpiration: string
    sessionTimeout: string
    maxLoginAttempts: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  system: {
    version: string
    environment: string
    debugMode: boolean
    maintenanceMode: boolean
    logLevel: string
  }
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      // Simulated data
      setConfig({
        database: {
          host: 'localhost',
          port: 27017,
          name: 'angiographiedb',
          connectionStatus: 'connected',
          poolSize: 10,
          backupFrequency: 'daily'
        },
        storage: {
          provider: 'Local',
          region: 'eu-west-1',
          bucket: 'angioimage-storage',
          maxFileSize: '100MB',
          allowedTypes: ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf']
        },
        email: {
          provider: 'SMTP',
          host: 'smtp.gmail.com',
          port: 587,
          secure: true,
          testConnection: true
        },
        security: {
          jwtExpiration: '7d',
          sessionTimeout: '24h',
          maxLoginAttempts: 5,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        },
        system: {
          version: '1.0.0',
          environment: 'development',
          debugMode: true,
          maintenanceMode: false,
          logLevel: 'info'
        }
      })
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    } finally {
      setSaving(false)
    }
  }

  const handleConfigChange = (section: keyof SystemConfig, key: string, value: any) => {
    if (!config) return
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }))
  }

  const testDatabaseConnection = async () => {
    try {
      // TODO: Test connection API call
      setMessage({ type: 'success', text: 'Connexion à la base de données réussie' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Échec de la connexion à la base de données' })
    }
  }

  const testEmailConnection = async () => {
    try {
      // TODO: Test email API call
      setMessage({ type: 'success', text: 'Configuration email testée avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Échec du test email' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement de la configuration</p>
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
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration système</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez les paramètres avancés du système
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
                <CheckIcon className="h-5 w-5 text-green-400" />
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

      {/* Warning Banner */}
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Attention
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Les modifications de configuration peuvent affecter le fonctionnement du système. 
                Assurez-vous de comprendre l'impact de chaque paramètre avant de sauvegarder.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Database Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <CircleStackIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Base de données</h2>
            <div className="ml-auto flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                config.database.connectionStatus === 'connected' ? 'bg-green-500' :
                config.database.connectionStatus === 'disconnected' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 capitalize">
                {config.database.connectionStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Host
              </label>
              <input
                type="text"
                value={config.database.host}
                onChange={(e) => handleConfigChange('database', 'host', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port
              </label>
              <input
                type="number"
                value={config.database.port}
                onChange={(e) => handleConfigChange('database', 'port', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la base
              </label>
              <input
                type="text"
                value={config.database.name}
                onChange={(e) => handleConfigChange('database', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence de sauvegarde
              </label>
              <select
                value={config.database.backupFrequency}
                onChange={(e) => handleConfigChange('database', 'backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="hourly">Chaque heure</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={testDatabaseConnection}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Tester la connexion
            </button>
          </div>
        </div>

        {/* Storage Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <CloudIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Stockage</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur
              </label>
              <select
                value={config.storage.provider}
                onChange={(e) => handleConfigChange('storage', 'provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Local">Stockage local</option>
                <option value="AWS S3">Amazon S3</option>
                <option value="Google Cloud">Google Cloud Storage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille max des fichiers
              </label>
              <input
                type="text"
                value={config.storage.maxFileSize}
                onChange={(e) => handleConfigChange('storage', 'maxFileSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types de fichiers autorisés
            </label>
            <div className="flex flex-wrap gap-2">
              {config.storage.allowedTypes.map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Security Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Sécurité</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration JWT
              </label>
              <input
                type="text"
                value={config.security.jwtExpiration}
                onChange={(e) => handleConfigChange('security', 'jwtExpiration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout de session
              </label>
              <input
                type="text"
                value={config.security.sessionTimeout}
                onChange={(e) => handleConfigChange('security', 'sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max tentatives de connexion
              </label>
              <input
                type="number"
                value={config.security.maxLoginAttempts}
                onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longueur min mot de passe
              </label>
              <input
                type="number"
                value={config.security.passwordPolicy.minLength}
                onChange={(e) => handleConfigChange('security', 'passwordPolicy', {
                  ...config.security.passwordPolicy,
                  minLength: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.security.passwordPolicy.requireUppercase}
                onChange={(e) => handleConfigChange('security', 'passwordPolicy', {
                  ...config.security.passwordPolicy,
                  requireUppercase: e.target.checked
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Exiger des majuscules
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.security.passwordPolicy.requireNumbers}
                onChange={(e) => handleConfigChange('security', 'passwordPolicy', {
                  ...config.security.passwordPolicy,
                  requireNumbers: e.target.checked
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Exiger des chiffres
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.security.passwordPolicy.requireSpecialChars}
                onChange={(e) => handleConfigChange('security', 'passwordPolicy', {
                  ...config.security.passwordPolicy,
                  requireSpecialChars: e.target.checked
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Exiger des caractères spéciaux
              </span>
            </label>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Cog6ToothIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Système</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version
              </label>
              <input
                type="text"
                value={config.system.version}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environnement
              </label>
              <select
                value={config.system.environment}
                onChange={(e) => handleConfigChange('system', 'environment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="development">Développement</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de log
              </label>
              <select
                value={config.system.logLevel}
                onChange={(e) => handleConfigChange('system', 'logLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.system.debugMode}
                onChange={(e) => handleConfigChange('system', 'debugMode', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mode debug
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.system.maintenanceMode}
                onChange={(e) => handleConfigChange('system', 'maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mode maintenance
              </span>
            </label>
          </div>

          {config.system.maintenanceMode && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Le mode maintenance est activé. Les utilisateurs non-admin ne pourront pas accéder au système.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}