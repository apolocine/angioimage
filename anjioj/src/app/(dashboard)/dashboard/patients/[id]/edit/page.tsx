'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { patientSchema, PatientInput } from '@/lib/utils/validation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function EditPatientPage() {
  const params = useParams()
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PatientInput>({
    resolver: yupResolver(patientSchema)
  })

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
      
      // Formater la date pour l'input date
      const formattedData = {
        ...data,
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance).toISOString().split('T')[0] : ''
      }
      
      reset(formattedData)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PatientInput) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/patients/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || 'Une erreur est survenue')
      } else {
        router.push(`/dashboard/patients/${params.id}`)
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  if (error && !patient) {
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
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/patients/${params.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour au patient
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            Modifier le patient - {patient?.nom} {patient?.prenom}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                {...register('nom')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                {...register('prenom')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              />
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date de naissance
              </label>
              <input
                {...register('dateNaissance')}
                type="date"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              />
              {errors.dateNaissance && (
                <p className="mt-1 text-sm text-red-600">{errors.dateNaissance.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sexe
              </label>
              <select
                {...register('sexe')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              {errors.sexe && (
                <p className="mt-1 text-sm text-red-600">{errors.sexe.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                {...register('telephone')}
                type="tel"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              />
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rue
                </label>
                <input
                  {...register('adresse.rue')}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  {...register('adresse.ville')}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <input
                  {...register('adresse.codePostal')}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dossier médical</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Numéro de sécurité sociale
                </label>
                <input
                  {...register('dossierMedical.numeroSecu')}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Médecin traitant
                </label>
                <input
                  {...register('dossierMedical.medecin')}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/patients/${params.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}