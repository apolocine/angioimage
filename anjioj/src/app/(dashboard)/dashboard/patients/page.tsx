'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  DocumentIcon,
  CameraIcon
} from '@heroicons/react/24/outline'

interface Patient {
  _id: string
  nom: string
  prenom: string
  dateNaissance: string
  sexe: string
  email?: string
  age?: number
}

interface Exam {
  _id: string
  type: string
  date: string
  status: string
  oeil: string
  indication: string
  patient: {
    _id: string
    nom: string
    prenom: string
  }
  images?: Array<{
    _id: string
    filename: string
    phase?: string
  }>
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [examens, setExamens] = useState<Exam[]>([])
  const [examensLoading, setExamensLoading] = useState(false)
  const [showExamens, setShowExamens] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [pagination.page, search])

  useEffect(() => {
    if (showExamens) {
      fetchExamens()
    }
  }, [showExamens])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      })
      
      const response = await fetch(`/api/patients?${params}`)
      const data = await response.json()
      
      setPatients(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchPatients()
  }

  const fetchExamens = async () => {
    setExamensLoading(true)
    try {
      const response = await fetch('/api/examens')
      const data = await response.json()
      setExamens(data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error)
    } finally {
      setExamensLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return

    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchPatients()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
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
    const statusMap: Record<string, { label: string; color: string }> = {
      'planifie': { label: 'Planifié', color: 'bg-blue-100 text-blue-800' },
      'en_cours': { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
      'termine': { label: 'Terminé', color: 'bg-green-100 text-green-800' },
      'annule': { label: 'Annulé', color: 'bg-red-100 text-red-800' }
    }
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos patients et leurs informations
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Nouveau patient
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex space-x-3">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, prénom ou email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Rechercher
            </button>
          </form>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom / Prénom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Âge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sexe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.nom} {patient.prenom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.age} ans
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.sexe}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/dashboard/patients/${patient._id}`}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/patients/${patient._id}/edit`}
                          className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/patients/${patient._id}/examens/new`}
                          className="text-green-600 hover:text-green-900 inline-flex items-center"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(patient._id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} sur {pagination.pages} ({pagination.total} résultats)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Section Examens */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <DocumentIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Examens récents
            </h2>
          </div>
          <button
            onClick={() => setShowExamens(!showExamens)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {showExamens ? (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-1" />
                Masquer
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-1" />
                Afficher
              </>
            )}
          </button>
        </div>

        {showExamens && (
          <div className="p-6">
            {examensLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              </div>
            ) : examens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun examen trouvé
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type / Œil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Images
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {examens.map((examen) => (
                      <tr key={examen._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {examen.patient.nom} {examen.patient.prenom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{examen.type}</div>
                          <div className="text-sm text-gray-500">{examen.oeil}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(examen.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(examen.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <CameraIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {examen.images?.length || 0} image(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Link
                            href={`/dashboard/examens/${examen._id}/view`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/dashboard/angiography/analysis/${examen._id}`}
                            className="text-green-600 hover:text-green-900 inline-flex items-center"
                          >
                            <DocumentIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteExam(examen._id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}