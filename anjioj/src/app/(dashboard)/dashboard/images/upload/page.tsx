'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

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
  patientId: Patient
}

interface UploadFile {
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  examId?: string
  phase?: string
  timeFromInjection?: number
  fluoresceinVisible?: boolean
  quality?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchExams(selectedPatient)
    } else {
      setExams([])
      setSelectedExam('')
    }
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const data = await response.json()
      setPatients(data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error)
    }
  }

  const fetchExams = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/examens`)
      const data = await response.json()
      setExams(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    
    const processedFiles: UploadFile[] = newFiles
      .filter(file => validImageTypes.includes(file.type))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending' as const,
        examId: selectedExam
      }))

    setFiles(prev => [...prev, ...processedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const updateFileMetadata = (index: number, metadata: Partial<UploadFile>) => {
    setFiles(prev => {
      const newFiles = [...prev]
      newFiles[index] = { ...newFiles[index], ...metadata }
      return newFiles
    })
  }

  const uploadFiles = async () => {
    if (!selectedExam) {
      alert('Veuillez sélectionner un examen')
      return
    }

    setLoading(true)

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i]
      
      if (fileData.status !== 'pending') continue

      try {
        // Mettre à jour le statut
        updateFileMetadata(i, { status: 'uploading', progress: 0 })

        const formData = new FormData()
        formData.append('file', fileData.file)
        formData.append('examId', selectedExam)
        
        if (fileData.phase) formData.append('phase', fileData.phase)
        if (fileData.timeFromInjection) formData.append('timeFromInjection', fileData.timeFromInjection.toString())
        if (fileData.fluoresceinVisible !== undefined) formData.append('fluoresceinVisible', fileData.fluoresceinVisible.toString())
        if (fileData.quality) formData.append('quality', fileData.quality)

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          updateFileMetadata(i, { status: 'success', progress: 100 })
        } else {
          const error = await response.json()
          updateFileMetadata(i, { 
            status: 'error', 
            error: error.error || 'Erreur lors de l\'upload'
          })
        }
      } catch (error) {
        updateFileMetadata(i, { 
          status: 'error', 
          error: 'Erreur de connexion' 
        })
      }
    }

    setLoading(false)
  }

  const hasSuccessfulUploads = files.some(f => f.status === 'success')
  const hasErrors = files.some(f => f.status === 'error')
  const canUpload = selectedExam && files.some(f => f.status === 'pending')

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/images"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour aux images
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Télécharger des images</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sélectionnez un patient et un examen, puis glissez-déposez vos images
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Sélection patient/examen */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.nom} {patient.prenom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Examen
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                disabled={!selectedPatient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Sélectionner un examen</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>
                    {exam.type} - {new Date(exam.date).toLocaleDateString('fr-FR')} - {exam.oeil}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone de drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                Glissez-déposez vos images ici
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ou{' '}
                <label className="text-indigo-600 cursor-pointer hover:text-indigo-500">
                  parcourez vos fichiers
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Formats supportés: JPEG, PNG, GIF, WebP (max 50MB par fichier)
              </p>
            </div>
          </div>

          {/* Liste des fichiers */}
          {files.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Fichiers sélectionnés ({files.length})
              </h3>
              
              <div className="space-y-4">
                {files.map((fileData, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Preview */}
                      <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={fileData.preview}
                          alt={fileData.file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Informations du fichier */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{fileData.file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Statut */}
                            {fileData.status === 'success' && (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            )}
                            {fileData.status === 'error' && (
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                            )}
                            
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Métadonnées d'angiographie */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Phase</label>
                            <select
                              value={fileData.phase || ''}
                              onChange={(e) => updateFileMetadata(index, { phase: e.target.value })}
                              className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="">Non spécifiée</option>
                              <option value="precoce">Précoce</option>
                              <option value="intermediaire">Intermédiaire</option>
                              <option value="tardive">Tardive</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Temps (sec)</label>
                            <input
                              type="number"
                              value={fileData.timeFromInjection || ''}
                              onChange={(e) => updateFileMetadata(index, { 
                                timeFromInjection: e.target.value ? parseInt(e.target.value) : undefined 
                              })}
                              placeholder="0"
                              className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 rounded"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Fluorescéine</label>
                            <select
                              value={fileData.fluoresceinVisible?.toString() || ''}
                              onChange={(e) => updateFileMetadata(index, { 
                                fluoresceinVisible: e.target.value ? e.target.value === 'true' : undefined 
                              })}
                              className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="">Non spécifié</option>
                              <option value="true">Visible</option>
                              <option value="false">Non visible</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Qualité</label>
                            <select
                              value={fileData.quality || ''}
                              onChange={(e) => updateFileMetadata(index, { quality: e.target.value })}
                              className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="">Non spécifiée</option>
                              <option value="excellente">Excellente</option>
                              <option value="bonne">Bonne</option>
                              <option value="moyenne">Moyenne</option>
                              <option value="mauvaise">Mauvaise</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        {fileData.status === 'uploading' && (
                          <div className="mt-3">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${fileData.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Message d'erreur */}
                        {fileData.status === 'error' && fileData.error && (
                          <div className="mt-2 text-sm text-red-600">
                            {fileData.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {hasSuccessfulUploads && (
                <span className="text-green-600">
                  {files.filter(f => f.status === 'success').length} fichier(s) uploadé(s) avec succès
                </span>
              )}
              {hasErrors && (
                <span className="text-red-600 ml-4">
                  {files.filter(f => f.status === 'error').length} erreur(s)
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              {hasSuccessfulUploads && (
                <Link
                  href="/dashboard/images"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Voir les images
                </Link>
              )}
              
              <button
                onClick={uploadFiles}
                disabled={!canUpload || loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Upload en cours...' : 'Télécharger les images'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}