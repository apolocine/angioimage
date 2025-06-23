'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface Patient {
  _id: string
  nom: string
  prenom: string
  dateNaissance: string
  sexe: string
  email?: string
  telephone?: string
  age?: number
  adresse?: {
    rue?: string
    ville?: string
    codePostal?: string
    pays?: string
  }
  dossierMedical?: {
    numeroSecu?: string
    medecin?: string
    antecedents?: string[]
    allergies?: string[]
    traitements?: string[]
  }
  createdAt?: string
  updatedAt?: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchPatient(params.id as string)
    }
  }, [params.id])

  const fetchPatient = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/patients/${id}`)
      if (!response.ok) {
        throw new Error('Patient non trouvé')
      }
      const data = await response.json()
      setPatient(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!patient || !confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return

    try {
      const response = await fetch(`/api/patients/${patient._id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        window.location.href = '/dashboard/patients'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <Link
            href="/dashboard/patients"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux patients
          </Link>
        </div>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Patient non trouvé'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/patients"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour aux patients
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {patient.nom} {patient.prenom}
              </h1>
              <p className="text-sm text-gray-500">
                {patient.age} ans • {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/patients/${patient._id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Éditer
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Supprimer
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
              <dl className="space-y-3">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                    <dd className="text-sm text-gray-900">{formatDate(patient.dateNaissance)}</dd>
                  </div>
                </div>
                
                {patient.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{patient.email}</dd>
                    </div>
                  </div>
                )}
                
                {patient.telephone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                      <dd className="text-sm text-gray-900">{patient.telephone}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Adresse */}
            {patient.adresse && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse</h3>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div className="text-sm text-gray-900">
                    {patient.adresse.rue && <div>{patient.adresse.rue}</div>}
                    <div>
                      {patient.adresse.codePostal} {patient.adresse.ville}
                    </div>
                    {patient.adresse.pays && <div>{patient.adresse.pays}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dossier médical */}
          {patient.dossierMedical && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dossier médical</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {patient.dossierMedical.numeroSecu && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Numéro de sécurité sociale</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patient.dossierMedical.numeroSecu}</dd>
                  </div>
                )}
                
                {patient.dossierMedical.medecin && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Médecin traitant</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patient.dossierMedical.medecin}</dd>
                  </div>
                )}
                
                {patient.dossierMedical.antecedents && patient.dossierMedical.antecedents.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Antécédents</dt>
                    <dd className="mt-1">
                      {patient.dossierMedical.antecedents.map((antecedent, index) => (
                        <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {antecedent}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                
                {patient.dossierMedical.allergies && patient.dossierMedical.allergies.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                    <dd className="mt-1">
                      {patient.dossierMedical.allergies.map((allergie, index) => (
                        <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {allergie}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                
                {patient.dossierMedical.traitements && patient.dossierMedical.traitements.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Traitements actuels</dt>
                    <dd className="mt-1">
                      {patient.dossierMedical.traitements.map((traitement, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {traitement}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Métadonnées */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div>Créé le : {patient.createdAt ? formatDate(patient.createdAt) : 'N/A'}</div>
              {patient.updatedAt && patient.updatedAt !== patient.createdAt && (
                <div>Modifié le : {formatDate(patient.updatedAt)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}