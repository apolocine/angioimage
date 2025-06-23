'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import NewExamModal from '@/components/modals/NewExamModal'

interface Patient {
  _id: string
  nom: string
  prenom: string
  email?: string
}

export default function NewExamPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatient()
  }, [patientId])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data)
      } else {
        console.error('Erreur API:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Erreur lors du chargement du patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    router.push('/dashboard/angiography')
  }

  const handleClose = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient non trouvé</h2>
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Nouvel examen pour {patient.nom} {patient.prenom}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Créer un nouvel examen angiographique pour ce patient
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewExamModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        preselectedPatientId={patientId}
      />
    </>
  )
}