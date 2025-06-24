'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { examSchema, ExamInput } from '@/lib/utils/validation'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Patient {
  _id: string
  nom: string
  prenom: string
  email?: string
}

interface NewExamModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedPatientId?: string
}

const protocolOptions = [
  'Protocole standard DMLA',
  'Protocole rétinopathie diabétique',
  'Protocole néovascularisation',
  'Protocole inflammation intraoculaire',
  'Protocole tumeur choroïdienne',
  'Protocole pathologie vasculaire rétinienne'
]

export default function NewExamModal({ isOpen, onClose, onSuccess, preselectedPatientId }: NewExamModalProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<ExamInput>({
    resolver: yupResolver(examSchema) as any,
    defaultValues: {
      type: 'angiographie',
      date: new Date(),
      patientId: preselectedPatientId || '',
      angiographie: {
        protocole: protocolOptions[0]
      }
    }
  })

  const watchType = watch('type')

  useEffect(() => {
    if (isOpen) {
      fetchPatients()
      // Set default date to now + 1 hour
      const defaultDate = new Date()
      defaultDate.setHours(defaultDate.getHours() + 1)
      setValue('date', defaultDate)
    }
  }, [isOpen, setValue])

  // Separate effect to set patient ID after patients are loaded
  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      // Verify the patient exists in the list before setting
      const patientExists = patients.some(p => p._id === preselectedPatientId)
      if (patientExists) {
        console.log('Setting preselected patient:', preselectedPatientId)
        setValue('patientId', preselectedPatientId)
        // Force form to update
        setTimeout(() => {
          const currentValue = getValues('patientId')
          console.log('Current patient value after set:', currentValue)
        }, 100)
      } else {
        console.warn('Preselected patient not found in list:', preselectedPatientId)
      }
    }
  }, [preselectedPatientId, patients, setValue, getValues])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const data = await response.json()
      setPatients(data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error)
    }
  }

  const onSubmit = async (data: ExamInput) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/examens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          status: 'planifie'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création')
      }

      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="relative inline-block align-middle bg-white rounded-lg px-6 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div>
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Nouvel examen angiographique
              </h3>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Patient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                    {preselectedPatientId && (
                      <span className="ml-2 text-xs text-indigo-600">
                        (présélectionné)
                      </span>
                    )}
                  </label>
                  <select
                    {...register('patientId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    defaultValue={preselectedPatientId || ''}
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.nom} {patient.prenom}
                      </option>
                    ))}
                  </select>
                  {errors.patientId && (
                    <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
                  )}
                </div>

                {/* Date et heure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure *
                  </label>
                  <input
                    type="datetime-local"
                    {...register('date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                {/* Œil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Œil *
                  </label>
                  <select
                    {...register('oeil')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="OD">Œil droit (OD)</option>
                    <option value="OS">Œil gauche (OS)</option>
                    <option value="OU">Les deux yeux (OU)</option>
                  </select>
                  {errors.oeil && (
                    <p className="mt-1 text-sm text-red-600">{errors.oeil.message}</p>
                  )}
                </div>

                {/* Indication */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indication *
                  </label>
                  <textarea
                    {...register('indication')}
                    rows={3}
                    placeholder="Raison de l'examen..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.indication && (
                    <p className="mt-1 text-sm text-red-600">{errors.indication.message}</p>
                  )}
                </div>

                {/* Protocole angiographie */}
                {watchType === 'angiographie' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protocole angiographique *
                    </label>
                    <select
                      {...register('angiographie.protocole')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {protocolOptions.map(protocol => (
                        <option key={protocol} value={protocol}>
                          {protocol}
                        </option>
                      ))}
                    </select>
                    {errors.angiographie?.protocole && (
                      <p className="mt-1 text-sm text-red-600">{errors.angiographie.protocole.message}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Créer l\'examen'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}