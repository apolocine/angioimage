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
  CalendarIcon,
  DocumentIcon,
  EyeIcon,
  PlusIcon,
  CameraIcon,
  PhotoIcon,
  ClockIcon,
  CheckCircleIcon
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

interface Exam {
  _id: string
  type: string
  date: string
  status: string
  oeil: string
  indication: string
  images?: Array<{
    _id: string
    filename: string
    imageType?: string
    phase?: string
  }>
}

export default function PatientDetailPage() {
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [examens, setExamens] = useState<Exam[]>([])
  const [examensLoading, setExamensLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPatient(params.id as string)
      fetchExamens(params.id as string)
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

  const fetchExamens = async (patientId: string) => {
    setExamensLoading(true)
    try {
      const response = await fetch(`/api/patients/${patientId}/examens`)
      if (response.ok) {
        const data = await response.json()
        console.log('Examens reçus:', data) // Debug
        setExamens(Array.isArray(data) ? data : data.data || [])
      } else {
        console.error('Erreur API examens:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error)
    } finally {
      setExamensLoading(false)
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

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) return

    try {
      const response = await fetch(`/api/examens/${examId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchExamens(params.id as string)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'examen:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
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

      {/* Section Examens */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <DocumentIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Examens ({examens.length})
            </h2>
          </div>
          <Link
            href={`/dashboard/patients/${patient._id}/examens/new`}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nouvel examen
          </Link>
        </div>

        <div className="p-6">
          {examensLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            </div>
          ) : examens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DocumentIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun examen pour ce patient</p>
              <Link
                href={`/dashboard/patients/${patient._id}/examens/new`}
                className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Créer le premier examen
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Examens programmés */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Examens programmés ({examens.filter(e => e.status === 'planifie').length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examens.filter(e => e.status === 'planifie').map((examen) => (
                    <div key={examen._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-base font-medium text-gray-900">{examen.type}</h4>
                            {getStatusBadge(examen.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {formatDateTime(examen.date)}
                            </div>
                            <div className="flex items-center">
                              <EyeIcon className="h-4 w-4 mr-2" />
                              {examen.oeil}
                            </div>
                          </div>
                        </div>
                      </div>

                      {examen.indication && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-700 mb-1">Indication :</p>
                          <p className="text-sm text-gray-600">{examen.indication}</p>
                        </div>
                      )}

                      {/* Images par type */}
                      {examen.images && examen.images.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Images ({examen.images.length})</p>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(
                              examen.images.reduce((acc, img) => {
                                const type = img.imageType || 'autre'
                                if (!acc[type]) acc[type] = []
                                acc[type].push(img)
                                return acc
                              }, {} as Record<string, typeof examen.images>)
                            ).map(([type, images]) => (
                              <div key={type} className="text-center">
                                <div className="bg-gray-100 p-2 rounded">
                                  <CameraIcon className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                                  <p className="text-xs text-gray-600">
                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <p className="text-xs font-medium text-gray-900">{images.length}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex space-x-3">
                          <Link
                            href={`/dashboard/examens/${examen._id}/view`}
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Voir
                          </Link>
                          <Link
                            href={`/dashboard/angiography/capture/${examen._id}`}
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-900"
                            title="Capturer des images"
                          >
                            <CameraIcon className="h-4 w-4 mr-1" />
                            Capturer
                          </Link>
                          <Link
                            href={`/dashboard/examens/${examen._id}/upload`}
                            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-900"
                            title="Ajouter des images"
                          >
                            <PhotoIcon className="h-4 w-4 mr-1" />
                            Ajouter
                          </Link>
                        </div>
                        <button
                          onClick={() => handleDeleteExam(examen._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {examens.filter(e => e.status === 'planifie').length === 0 && (
                  <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucun examen programmé</p>
                    <Link
                      href={`/dashboard/patients/${patient._id}/examens/new`}
                      className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Programmer un examen
                    </Link>
                  </div>
                )}
              </div>

              {/* Examens en cours */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  Examens en cours ({examens.filter(e => e.status === 'en_cours').length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examens.filter(e => e.status === 'en_cours').map((examen) => (
                    <div key={examen._id} className="border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-yellow-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-base font-medium text-gray-900">{examen.type}</h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              En cours
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {formatDateTime(examen.date)}
                            </div>
                            <div className="flex items-center">
                              <EyeIcon className="h-4 w-4 mr-2" />
                              {examen.oeil}
                            </div>
                          </div>
                        </div>
                      </div>

                      {examen.indication && (
                        <div className="mb-4 p-3 bg-yellow-100 rounded-md">
                          <p className="text-sm font-medium text-gray-700 mb-1">Indication :</p>
                          <p className="text-sm text-gray-600">{examen.indication}</p>
                        </div>
                      )}

                      {/* Images par type */}
                      {examen.images && examen.images.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Images en cours ({examen.images.length})</p>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(
                              examen.images.reduce((acc, img) => {
                                const type = img.imageType || 'autre'
                                if (!acc[type]) acc[type] = []
                                acc[type].push(img)
                                return acc
                              }, {} as Record<string, typeof examen.images>)
                            ).map(([type, images]) => (
                              <div key={type} className="text-center">
                                <div className="bg-yellow-200 p-2 rounded">
                                  <CameraIcon className="h-6 w-6 mx-auto text-yellow-600 mb-1" />
                                  <p className="text-xs text-gray-600">
                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <p className="text-xs font-medium text-gray-900">{images.length}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-yellow-200">
                        <div className="flex space-x-3">
                          <Link
                            href={`/dashboard/angiography/capture/${examen._id}`}
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-900"
                            title="Continuer la capture"
                          >
                            <CameraIcon className="h-4 w-4 mr-1" />
                            Continuer
                          </Link>
                          <Link
                            href={`/dashboard/examens/${examen._id}/view`}
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Voir
                          </Link>
                          <Link
                            href={`/dashboard/examens/${examen._id}/upload`}
                            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-900"
                            title="Ajouter des images"
                          >
                            <PhotoIcon className="h-4 w-4 mr-1" />
                            Ajouter
                          </Link>
                        </div>
                        <button
                          onClick={() => handleDeleteExam(examen._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {examens.filter(e => e.status === 'en_cours').length === 0 && (
                  <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucun examen en cours</p>
                  </div>
                )}
              </div>

              {/* Examens terminés */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <DocumentIcon className="h-5 w-5 mr-2 text-green-500" />
                  Examens terminés ({examens.filter(e => e.status === 'termine').length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examens.filter(e => e.status === 'termine').map((examen) => (
                    <div key={examen._id} className="border border-green-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-green-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{examen.type}</h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Terminé
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{examen.oeil}</p>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDateTime(examen.date)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <CameraIcon className="h-3 w-3 mr-1" />
                            {examen.images?.length || 0} image(s)
                          </div>
                        </div>
                      </div>

                      {/* Miniatures des types d'images */}
                      {examen.images && examen.images.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {Array.from(new Set(examen.images.map(img => img.imageType || 'autre')))
                              .slice(0, 4)
                              .map(type => (
                                <div
                                  key={type}
                                  className="inline-flex items-center px-2 py-1 bg-green-200 text-green-800 text-xs rounded"
                                  title={type.replace(/_/g, ' ')}
                                >
                                  {type.split('_')[0]}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-green-200">
                        <div className="flex space-x-2">
                          <Link
                            href={`/dashboard/examens/${examen._id}/view`}
                            className="text-indigo-600 hover:text-indigo-900 text-xs"
                            title="Voir les images"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/dashboard/angiography/analysis/${examen._id}`}
                            className="text-green-600 hover:text-green-900 text-xs"
                            title="Analyser"
                          >
                            <DocumentIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/dashboard/examens/${examen._id}/upload`}
                            className="text-purple-600 hover:text-purple-900 text-xs"
                            title="Ajouter des images"
                          >
                            <PhotoIcon className="h-4 w-4" />
                          </Link>
                        </div>
                        <button
                          onClick={() => handleDeleteExam(examen._id)}
                          className="text-red-600 hover:text-red-900 text-xs"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {examens.filter(e => e.status === 'termine').length === 0 && (
                  <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
                    <DocumentIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucun examen terminé</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}