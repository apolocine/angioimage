'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'doctor' | 'assistant'
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: string
  createdAt: string
  avatar?: string
}

const roleLabels = {
  admin: 'Administrateur',
  doctor: 'Médecin',
  assistant: 'Assistant'
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  doctor: 'bg-blue-100 text-blue-800',
  assistant: 'bg-green-100 text-green-800'
}

const statusLabels = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800'
}

export default function UsersManagementPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>(filter || 'all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      // Simulated data
      setUsers([
        {
          _id: '1',
          name: 'Dr. Jean Martin',
          email: 'jean.martin@angioimage.fr',
          role: 'doctor',
          status: 'active',
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 2592000000).toISOString()
        },
        {
          _id: '2',
          name: 'Marie Dubois',
          email: 'marie.dubois@angioimage.fr',
          role: 'assistant',
          status: 'active',
          lastLogin: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 1296000000).toISOString()
        },
        {
          _id: '3',
          name: 'Admin System',
          email: 'admin@angioimage.fr',
          role: 'admin',
          status: 'active',
          lastLogin: new Date(Date.now() - 1800000).toISOString(),
          createdAt: new Date(Date.now() - 5184000000).toISOString()
        },
        {
          _id: '4',
          name: 'Dr. Sophie Laurent',
          email: 'sophie.laurent@angioimage.fr',
          role: 'doctor',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '5',
          name: 'Pierre Moreau',
          email: 'pierre.moreau@angioimage.fr',
          role: 'assistant',
          status: 'inactive',
          lastLogin: new Date(Date.now() - 2592000000).toISOString(),
          createdAt: new Date(Date.now() - 7776000000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      // TODO: API call
      if (action === 'delete') {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
        setUsers(users.filter(u => u._id !== userId))
      } else {
        setUsers(users.map(u => 
          u._id === userId 
            ? { ...u, status: action === 'activate' ? 'active' : 'inactive' }
            : u
        ))
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return
    
    if (action === 'delete') {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ?`)) return
    }
    
    // TODO: Implement bulk actions
    console.log(`Bulk ${action} for users:`, selectedUsers)
    setSelectedUsers([])
    setShowBulkActions(false)
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Jamais connecté'
    
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (hours < 1) return 'À l\'instant'
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days}j`
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return ShieldCheckIcon
      case 'doctor':
        return UserIcon
      default:
        return UserIcon
    }
  }

  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0)
  }, [selectedUsers])

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
        <Link
          href="/dashboard/admin/users/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez les comptes utilisateurs, leurs rôles et leurs permissions
        </p>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-indigo-700">
              {selectedUsers.length} utilisateur(s) sélectionné(s)
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleBulkAction('activate')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Activer
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="text-sm text-yellow-600 hover:text-yellow-800"
              >
                Désactiver
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
          </div>
          
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="doctor">Médecins</option>
              <option value="assistant">Assistants</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u._id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role)
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleLabels[user.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                            {user.status === 'pending' && <ClockIcon className="h-3 w-3 mr-1" />}
                            {statusLabels[user.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatLastLogin(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {user.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUserAction(user._id, 'activate')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approuver"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleUserAction(user._id, 'delete')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Rejeter"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                            
                            <button className="text-gray-400 hover:text-gray-600">
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Aucun utilisateur trouvé
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-500">Total utilisateurs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </p>
            <p className="text-sm text-gray-500">Actifs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-yellow-600">
              {users.filter(u => u.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-500">En attente</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-600">
              {users.filter(u => u.status === 'inactive').length}
            </p>
            <p className="text-sm text-gray-500">Inactifs</p>
          </div>
        </div>
      </div>
    </div>
  )
}