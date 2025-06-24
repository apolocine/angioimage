'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeftIcon,
  UserCircleIcon,
  CameraIcon,
  CheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  name: string
  email: string
  phone?: string
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
  }
}

export default function ProfileSettingsPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    language: 'fr',
    timezone: 'Europe/Paris',
    notifications: {
      email: true,
      push: false
    }
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  useEffect(() => {
    // Charger le profil utilisateur
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // TODO: API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrors([])
    
    // Validation
    const errors = []
    if (passwordForm.newPassword.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères')
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas')
    }
    
    if (errors.length > 0) {
      setPasswordErrors(errors)
      return
    }

    setLoading(true)
    try {
      // TODO: API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    
    const labels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort']
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
    
    return {
      strength,
      label: labels[strength],
      color: colors[strength]
    }
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)

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
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez vos informations personnelles et vos préférences
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
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
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
        {/* Profile Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Informations personnelles</h2>
          
          {/* Avatar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo de profil
            </label>
            <div className="flex items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserCircleIcon className="h-20 w-20 text-gray-400" />
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:shadow-lg">
                  <CameraIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="ml-4">
                <button className="text-sm text-indigo-600 hover:text-indigo-800">
                  Changer la photo
                </button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          {/* Language & Timezone */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Préférences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Langue
                </label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuseau horaire
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Notifications
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.notifications.email}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notifications par email
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.notifications.push}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notifications push
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white shadow rounded-lg p-6" id="password">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Changer le mot de passe</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {passwordForm.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.strength * 25}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {passwordErrors.length > 0 && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Erreurs de validation
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}