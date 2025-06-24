'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CalendarDaysIcon,
  PhotoIcon,
  CheckIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  dateFormat: string
  unitSystem: 'metric' | 'imperial'
  imageQuality: 'low' | 'medium' | 'high' | 'original'
  autoSave: {
    enabled: boolean
    interval: number
  }
}

export default function ApplicationSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'auto',
    dateFormat: 'DD/MM/YYYY',
    unitSystem: 'metric',
    imageQuality: 'high',
    autoSave: {
      enabled: true,
      interval: 5
    }
  })
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    // TODO: API call to save settings
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // Auto-save after change
    handleSave()
  }

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: '2024-12-31' },
    { value: 'DD.MM.YYYY', label: '31.12.2024' }
  ]

  const imageQualities = [
    { value: 'low', label: 'Basse (compression élevée)', description: 'Économise de l\'espace' },
    { value: 'medium', label: 'Moyenne', description: 'Équilibre qualité/taille' },
    { value: 'high', label: 'Haute', description: 'Qualité optimale' },
    { value: 'original', label: 'Originale', description: 'Aucune compression' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux paramètres
          </Link>
        </div>
        {saved && (
          <div className="flex items-center text-sm text-green-600">
            <CheckIcon className="h-4 w-4 mr-1" />
            Sauvegardé
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration de l'application</h1>
        <p className="mt-1 text-sm text-gray-600">
          Personnalisez le comportement et l'apparence de l'application
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Apparence</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Thème de l'interface
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleChange('theme', 'light')}
                className={`
                  flex flex-col items-center p-4 rounded-lg border-2 transition-all
                  ${settings.theme === 'light'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <SunIcon className={`h-8 w-8 mb-2 ${
                  settings.theme === 'light' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  settings.theme === 'light' ? 'text-indigo-900' : 'text-gray-700'
                }`}>
                  Clair
                </span>
              </button>

              <button
                onClick={() => handleChange('theme', 'dark')}
                className={`
                  flex flex-col items-center p-4 rounded-lg border-2 transition-all
                  ${settings.theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <MoonIcon className={`h-8 w-8 mb-2 ${
                  settings.theme === 'dark' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  settings.theme === 'dark' ? 'text-indigo-900' : 'text-gray-700'
                }`}>
                  Sombre
                </span>
              </button>

              <button
                onClick={() => handleChange('theme', 'auto')}
                className={`
                  flex flex-col items-center p-4 rounded-lg border-2 transition-all
                  ${settings.theme === 'auto'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <ComputerDesktopIcon className={`h-8 w-8 mb-2 ${
                  settings.theme === 'auto' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  settings.theme === 'auto' ? 'text-indigo-900' : 'text-gray-700'
                }`}>
                  Automatique
                </span>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Le mode automatique suit les préférences de votre système
            </p>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Paramètres régionaux</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="inline h-4 w-4 mr-1" />
                Format de date
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {dateFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Système d'unités
              </label>
              <select
                value={settings.unitSystem}
                onChange={(e) => handleChange('unitSystem', e.target.value as 'metric' | 'imperial')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="metric">Métrique (mm, cm)</option>
                <option value="imperial">Impérial (inches)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            <PhotoIcon className="inline h-5 w-5 mr-2" />
            Gestion des images
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Qualité d'image par défaut
            </label>
            <div className="space-y-2">
              {imageQualities.map(quality => (
                <label
                  key={quality.value}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                    ${settings.imageQuality === quality.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      value={quality.value}
                      checked={settings.imageQuality === quality.value}
                      onChange={(e) => handleChange('imageQuality', e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className={`text-sm font-medium ${
                        settings.imageQuality === quality.value ? 'text-indigo-900' : 'text-gray-700'
                      }`}>
                        {quality.label}
                      </span>
                      <p className={`text-xs ${
                        settings.imageQuality === quality.value ? 'text-indigo-700' : 'text-gray-500'
                      }`}>
                        {quality.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-save Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            <CloudArrowUpIcon className="inline h-5 w-5 mr-2" />
            Sauvegarde automatique
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoSave.enabled}
                onChange={(e) => handleChange('autoSave', {
                  ...settings.autoSave,
                  enabled: e.target.checked
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Activer la sauvegarde automatique
              </span>
            </label>

            {settings.autoSave.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalle de sauvegarde
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={settings.autoSave.interval}
                    onChange={(e) => handleChange('autoSave', {
                      ...settings.autoSave,
                      interval: parseInt(e.target.value)
                    })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-700 w-20">
                    {settings.autoSave.interval} min
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Les données seront sauvegardées automatiquement toutes les {settings.autoSave.interval} minutes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Les modifications sont automatiquement sauvegardées
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}