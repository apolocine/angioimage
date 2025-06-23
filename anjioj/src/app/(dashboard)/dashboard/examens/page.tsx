'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CalendarIcon,
  EyeIcon,
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CameraIcon,
  PhotoIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Patient {
  _id: string
  nom: string
  prenom: string
  dateNaissance?: string
}

interface Exam {
  _id: string
  type: string
  date: string
  status: string
  oeil: string
  indication: string
  patientId: Patient
  images?: Array<{
    _id: string
    filename: string
    type?: string
    phase?: string
  }>
  createdAt?: string
  updatedAt?: string
}

interface FilterState {
  search: string
  status: string
  type: string
  dateFrom: string
  dateTo: string
}

export default function ExamensPage() {
  const [examens, setExamens] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'tous',
    type: 'tous',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchExamens()
  }, [])

  const fetchExamens = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/examens')
      if (response.ok) {
        const data = await response.json()
        setExamens(data.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) return

    try {
      const response = await fetch(`/api/examens/${examId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchExamens()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'examen:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      'planifie': { 
        label: 'Planifié', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CalendarIcon
      },
      'en_cours': { 
        label: 'En cours', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon
      },
      'termine': { 
        label: 'Terminé', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon
      },
      'annule': { 
        label: 'Annulé', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircleIcon
      }
    }
    
    const statusInfo = statusMap[status] || statusMap['planifie']
    const Icon = statusInfo.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </span>
    )
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'angiographie': 'Angiographie',
      'oct': 'OCT',
      'retinographie': 'Rétinographie',
      'fond_oeil': 'Fond d\'œil'
    }
    return types[type] || type
  }

  // Filtrage des examens
  const filteredExamens = examens.filter(exam => {
    // Filtre de recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const patientName = `${exam.patientId.nom} ${exam.patientId.prenom}`.toLowerCase()
      if (!patientName.includes(search) && !exam.indication.toLowerCase().includes(search)) {
        return false
      }
    }

    // Filtre de status
    if (filters.status !== 'tous' && exam.status !== filters.status) {
      return false
    }

    // Filtre de type
    if (filters.type !== 'tous' && exam.type !== filters.type) {
      return false
    }

    // Filtre de date
    const examDate = new Date(exam.date)
    if (filters.dateFrom && examDate < new Date(filters.dateFrom)) {
      return false
    }
    if (filters.dateTo && examDate > new Date(filters.dateTo)) {
      return false
    }

    return true
  })

  // Statistiques
  const stats = {
    total: examens.length,
    planifies: examens.filter(e => e.status === 'planifie').length,
    enCours: examens.filter(e => e.status === 'en_cours').length,
    termines: examens.filter(e => e.status === 'termine').length,
    totalImages: examens.reduce((acc, exam) => acc + (exam.images?.length || 0), 0)
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tous les examens</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestion et suivi de tous les examens patients
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-5 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <DocumentIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Planifiés</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.planifies}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">En cours</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.enCours}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Terminés</p>
                <p className="text-2xl font-semibold text-green-600">{stats.termines}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <PhotoIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Images</p>
                <p className="text-2xl font-semibold text-purple-600">{stats.totalImages}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Rechercher patient ou indication..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="planifie">Planifiés</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminés</option>
              <option value="annule">Annulés</option>
            </select>
          </div>

          <div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="tous">Tous les types</option>
              <option value="angiographie">Angiographie</option>
              <option value="oct">OCT</option>
              <option value="retinographie">Rétinographie</option>
              <option value="fond_oeil">Fond d'œil</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              placeholder="Date début"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              placeholder="Date fin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des examens */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : filteredExamens.length === 0 ? (
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun examen trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun examen ne correspond aux critères de recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type / Œil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date / Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indication
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExamens.map((examen) => (
                  <tr key={examen._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/patients/${examen.patientId._id}`}
                        className="group flex items-center text-sm"
                      >
                        <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                            {examen.patientId.nom} {examen.patientId.prenom}
                          </div>
                          {examen.patientId.dateNaissance && (
                            <div className="text-xs text-gray-500">
                              Né(e) le {new Date(examen.patientId.dateNaissance).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTypeLabel(examen.type)}</div>
                      <div className="text-xs text-gray-500">{examen.oeil}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(examen.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(examen.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CameraIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{examen.images?.length || 0}</span>
                        {examen.images && examen.images.length > 0 && (
                          <div className="ml-2 flex -space-x-1">
                            {examen.images.slice(0, 3).map((img, idx) => (
                              <div key={img._id} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white" />
                            ))}
                            {examen.images.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                                <span className="text-xs">+{examen.images.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs" title={examen.indication}>
                        {examen.indication}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/dashboard/examens/${examen._id}/view`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        
                        {examen.status === 'planifie' && (
                          <Link
                            href={`/dashboard/angiography/capture/${examen._id}`}
                            className="text-green-600 hover:text-green-900"
                            title="Capturer des images"
                          >
                            <CameraIcon className="h-5 w-5" />
                          </Link>
                        )}
                        
                        <Link
                          href={`/dashboard/examens/${examen._id}/upload`}
                          className="text-purple-600 hover:text-purple-900"
                          title="Ajouter des images"
                        >
                          <PhotoIcon className="h-5 w-5" />
                        </Link>
                        
                        {examen.status === 'termine' && (
                          <Link
                            href={`/dashboard/angiography/analysis/${examen._id}`}
                            className="text-orange-600 hover:text-orange-900"
                            title="Analyser"
                          >
                            <DocumentIcon className="h-5 w-5" />
                          </Link>
                        )}
                        
                        <button
                          onClick={() => handleDeleteExam(examen._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}