'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CalendarIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CameraIcon,
  PhotoIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  DocumentIcon
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

export default function ScheduledExamensPage() {
  const [examens, setExamens] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchExamens()
  }, [])

  const fetchExamens = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/examens?status=planifie')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen programmé ?')) return

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

  const startExam = async (examId: string) => {
    try {
      const response = await fetch(`/api/examens/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'en_cours'
        })
      })
      
      if (response.ok) {
        fetchExamens()
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'examen:', error)
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
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

  const isToday = (dateString: string) => {
    const examDate = new Date(dateString).toDateString()
    const today = new Date().toDateString()
    return examDate === today
  }

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date()
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
    if (selectedDate) {
      const examDate = new Date(exam.date).toISOString().split('T')[0]
      if (examDate !== selectedDate) {
        return false
      }
    }

    return true
  })

  // Groupement par date
  const examsByDate = filteredExamens.reduce((acc, exam) => {
    const date = new Date(exam.date).toISOString().split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(exam)
    return acc
  }, {} as Record<string, Exam[]>)

  // Tri des examens par heure dans chaque groupe
  Object.keys(examsByDate).forEach(date => {
    examsByDate[date].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  const todayExams = examens.filter(exam => isToday(exam.date))
  const overdueExams = examens.filter(exam => isOverdue(exam.date))

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examens programmés</h1>
          <p className="mt-1 text-sm text-gray-600">
            Planification et gestion des examens à venir
          </p>
        </div>
        <Link
          href="/dashboard/angiography"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvel examen
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Aujourd'hui</p>
                <p className="text-2xl font-semibold text-blue-600">{todayExams.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-red-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">En retard</p>
                <p className="text-2xl font-semibold text-red-600">{overdueExams.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <DocumentIcon className="h-8 w-8 text-green-500" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total programmés</p>
                <p className="text-2xl font-semibold text-green-600">{examens.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des examens par date */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : Object.keys(examsByDate).length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun examen programmé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun examen ne correspond aux critères de recherche.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/angiography"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Programmer un examen
              </Link>
            </div>
          </div>
        ) : (
          Object.entries(examsByDate)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, exams]) => (
              <div key={date} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      {new Date(date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {isToday(date) && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Aujourd'hui
                        </span>
                      )}
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
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-500" />
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
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {formatTime(exam.date)}
                                  {isOverdue(exam.date) && (
                                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                      En retard
                                    </span>
                                  )}
                                </div>
                                
                                {exam.images && exam.images.length > 0 && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <CameraIcon className="h-4 w-4 mr-1" />
                                    {exam.images.length} image(s)
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
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          
                          <button
                            onClick={() => startExam(exam._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            title="Démarrer l'examen"
                          >
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Démarrer
                          </button>
                          
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