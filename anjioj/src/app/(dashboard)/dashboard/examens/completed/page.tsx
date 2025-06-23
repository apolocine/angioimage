'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CalendarIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CameraIcon,
  PhotoIcon,
  DocumentIcon,
  CheckCircleIcon
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
    imageType?: string
    phase?: string
  }>
  createdAt?: string
  updatedAt?: string
}

export default function CompletedExamensPage() {
  const [examens, setExamens] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchExamens()
  }, [])

  const fetchExamens = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/examens?status=termine')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen terminé ?')) return

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
    if (search) {
      const searchLower = search.toLowerCase()
      const patientName = `${exam.patientId.nom} ${exam.patientId.prenom}`.toLowerCase()
      if (!patientName.includes(searchLower) && !exam.indication.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Filtre de date
    const examDate = new Date(exam.date)
    if (dateFrom && examDate < new Date(dateFrom)) {
      return false
    }
    if (dateTo && examDate > new Date(dateTo)) {
      return false
    }

    return true
  })

  // Groupement par mois
  const examsByMonth = filteredExamens.reduce((acc, exam) => {
    const date = new Date(exam.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(exam)
    return acc
  }, {} as Record<string, Exam[]>)

  // Tri des examens par date dans chaque groupe
  Object.keys(examsByMonth).forEach(month => {
    examsByMonth[month].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // Statistiques
  const totalImages = examens.reduce((acc, exam) => acc + (exam.images?.length || 0), 0)
  const thisMonthExams = examens.filter(exam => {
    const examDate = new Date(exam.date)
    const now = new Date()
    return examDate.getMonth() === now.getMonth() && examDate.getFullYear() === now.getFullYear()
  })

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examens terminés</h1>
          <p className="mt-1 text-sm text-gray-600">
            Historique et analyse des examens réalisés
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total terminés</p>
                <p className="text-2xl font-semibold text-green-600">{examens.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Ce mois-ci</p>
                <p className="text-2xl font-semibold text-blue-600">{thisMonthExams.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <PhotoIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Images totales</p>
                <p className="text-2xl font-semibold text-purple-600">{totalImages}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher patient ou indication..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Date début"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Date fin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des examens par mois */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : Object.keys(examsByMonth).length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun examen terminé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun examen terminé ne correspond aux critères de recherche.
            </p>
          </div>
        ) : (
          Object.entries(examsByMonth)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, exams]) => (
              <div key={month} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      {new Date(month + '-01').toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </h3>
                    <span className="text-sm text-gray-500">{exams.length} examen(s)</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {exams.map((exam) => (
                    <div key={exam._id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <Link
                                  href={`/dashboard/patients/${exam.patientId._id}`}
                                  className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                                >
                                  {exam.patientId.nom} {exam.patientId.prenom}
                                </Link>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{getTypeLabel(exam.type)}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{exam.oeil}</span>
                              </div>
                              
                              <div className="mt-1 flex items-center space-x-4">
                                <div className="flex items-center text-sm text-gray-500">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  {formatDateTime(exam.date)}
                                </div>
                                
                                {exam.images && exam.images.length > 0 && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <CameraIcon className="h-4 w-4 mr-1" />
                                    {exam.images.length} image(s)
                                    
                                    {/* Miniatures des types d'images */}
                                    <div className="ml-2 flex space-x-1">
                                      {Array.from(new Set(exam.images.map(img => img.imageType || 'autre')))
                                        .slice(0, 3)
                                        .map(type => (
                                          <div
                                            key={type}
                                            className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center"
                                            title={type.replace(/_/g, ' ')}
                                          >
                                            <div className="w-2 h-2 rounded bg-gray-400"></div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {exam.indication && (
                                <p className="mt-2 text-sm text-gray-600 truncate">
                                  {exam.indication}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/dashboard/examens/${exam._id}/view`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            title="Voir les images"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Voir
                          </Link>
                          
                          <Link
                            href={`/dashboard/angiography/analysis/${exam._id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            title="Analyser"
                          >
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            Analyser
                          </Link>
                          
                          <Link
                            href={`/dashboard/examens/${exam._id}/upload`}
                            className="text-purple-600 hover:text-purple-900"
                            title="Ajouter des images"
                          >
                            <PhotoIcon className="h-5 w-5" />
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteExam(exam._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}