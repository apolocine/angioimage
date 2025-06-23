'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import NewExamModal from '@/components/modals/NewExamModal'

interface Patient {
  _id: string
  nom: string
  prenom: string
}

interface Exam {
  _id: string
  type: string
  date: string
  oeil: string
  status: string
  patientId: Patient
  praticien?: {
    _id: string
    name: string
  }
  angiographie?: {
    fluoresceine?: {
      injected: boolean
      injectionTime?: string
    }
    protocole?: string
  }
}

export default function AngiographyPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [filteredExams, setFilteredExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('tous')
  const [showNewExamModal, setShowNewExamModal] = useState(false)

  useEffect(() => {
    fetchExams()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [exams, selectedDate, statusFilter])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/examens?type=angiographie')
      if (!response.ok) {
        console.error('Erreur API:', response.status)
        setExams([])
        return
      }
      const result = await response.json()
      setExams(result.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error)
      setExams([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = exams.filter(exam => exam.type === 'angiographie')

    if (selectedDate) {
      filtered = filtered.filter(exam => 
        new Date(exam.date).toISOString().split('T')[0] === selectedDate
      )
    }

    if (statusFilter !== 'tous') {
      filtered = filtered.filter(exam => exam.status === statusFilter)
    }

    setFilteredExams(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'planifie': { color: 'bg-blue-100 text-blue-800', label: 'Planifié' },
      'en_cours': { color: 'bg-yellow-100 text-yellow-800', label: 'En cours' },
      'termine': { color: 'bg-green-100 text-green-800', label: 'Terminé' },
      'annule': { color: 'bg-red-100 text-red-800', label: 'Annulé' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planifie
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const todayExams = filteredExams.filter(exam => 
    new Date(exam.date).toDateString() === new Date().toDateString()
  )

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning Angiographie</h1>
          <p className="text-gray-600">Gestion des examens angiographiques</p>
        </div>
        <button
          onClick={() => setShowNewExamModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvel examen
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Examens aujourd'hui
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {todayExams.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    En cours
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {exams.filter(e => e.status === 'en_cours').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Patients cette semaine
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(exams.map(e => e.patientId._id)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="tous">Tous</option>
              <option value="planifie">Planifiés</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminés</option>
              <option value="annule">Annulés</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0])
              setStatusFilter('tous')
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Examens ({filteredExams.length})
          </h3>
        </div>
        
        {filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun examen</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun examen angiographique trouvé pour les critères sélectionnés.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredExams.map((exam) => (
              <div key={exam._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {exam.patientId.nom} {exam.patientId.prenom}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(exam.date)} • {exam.oeil} • {exam.angiographie?.protocole || 'Protocole standard'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(exam.status)}
                    
                    {exam.status === 'planifie' && (
                      <Link
                        href={`/dashboard/angiography/capture/${exam._id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Démarrer
                      </Link>
                    )}
                    
                    {exam.status === 'en_cours' && (
                      <Link
                        href={`/dashboard/angiography/capture/${exam._id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                      >
                        Continuer
                      </Link>
                    )}
                    
                    {exam.status === 'termine' && (
                      <Link
                        href={`/dashboard/angiography/analysis/${exam._id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Analyser
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nouvel Examen */}
      <NewExamModal 
        isOpen={showNewExamModal}
        onClose={() => setShowNewExamModal(false)}
        onSuccess={() => {
          fetchExams() // Refresh the exams list
        }}
      />
    </div>
  )
}