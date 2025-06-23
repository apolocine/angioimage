'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  PhotoIcon,
  TrashIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Exam {
  _id: string
  type: string
  date: string
  status: string
  oeil: string
  indication: string
  patientId: {
    _id: string
    nom: string
    prenom: string
  }
}

interface UploadedImage {
  file: File
  preview: string
  imageType?: string
  phase?: string
  uploaded?: boolean
  error?: string
}

export default function ExamUploadPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchExam()
  }, [examId])

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/examens/${examId}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data.data || data)
      } else {
        console.error('Erreur lors du chargement de l\'examen')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      // Validation du type de fichier
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier ${file.name} n'est pas une image valide`)
        return
      }

      // Validation de la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: UploadedImage = {
          file,
          preview: e.target?.result as string,
          imageType: 'fond_oeil_normal', // Valeur par défaut
          phase: 'precoce' // Valeur par défaut
        }
        setImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    
    // Simuler la sélection de fichiers
    const input = fileInputRef.current
    if (input) {
      const dt = new DataTransfer()
      files.forEach(file => dt.items.add(file))
      input.files = dt.files
      handleFileSelect({ target: input } as any)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const updateImagePhase = (index: number, phase: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, phase } : img
    ))
  }

  const updateImageType = (index: number, imageType: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, imageType } : img
    ))
  }

  const uploadImages = async () => {
    if (images.length === 0) return

    setUploading(true)
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      if (image.uploaded) continue

      try {
        const formData = new FormData()
        formData.append('file', image.file)
        formData.append('examId', examId)
        formData.append('imageType', image.imageType || 'fond_oeil_normal')
        formData.append('phase', image.phase || 'precoce')

        // Simuler le progrès d'upload
        setUploadProgress(prev => ({ ...prev, [i]: 0 }))

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          setImages(prev => prev.map((img, idx) => 
            idx === i ? { ...img, uploaded: true } : img
          ))
          setUploadProgress(prev => ({ ...prev, [i]: 100 }))
        } else {
          const errorData = await response.json()
          setImages(prev => prev.map((img, idx) => 
            idx === i ? { ...img, error: errorData.error || 'Erreur d\'upload' } : img
          ))
        }
      } catch (error) {
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, error: 'Erreur de connexion' } : img
        ))
      }
    }

    setUploading(false)
    
    // Rediriger vers la page de vue de l'examen après upload
    setTimeout(() => {
      router.push(`/dashboard/examens/${examId}/view`)
    }, 1000)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Examen non trouvé</h2>
          <Link
            href="/dashboard/patients"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Retour aux patients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/dashboard/patients/${exam.patientId._id}`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Retour au patient
            </Link>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <PhotoIcon className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Ajouter des images
                  </h1>
                  <p className="text-sm text-gray-500">
                    Examen {exam.type} - {exam.patientId.nom} {exam.patientId.prenom} • {exam.oeil}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(exam.date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sélectionner les images</h2>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            >
              <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <div className="mb-4">
                <p className="text-lg text-gray-600">Glissez-déposez vos images ici</p>
                <p className="text-sm text-gray-400">ou</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Choisir des fichiers
              </button>
              
              <p className="text-xs text-gray-400 mt-2">
                Formats acceptés: JPG, PNG, GIF • Taille max: 10MB par image
              </p>
            </div>
          </div>

          {/* Images Preview */}
          {images.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Images sélectionnées ({images.length})
                </h2>
                
                <button
                  onClick={uploadImages}
                  disabled={uploading || images.every(img => img.uploaded)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  {uploading ? 'Upload en cours...' : 'Uploader les images'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="relative mb-3">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>

                      {image.uploaded && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded flex items-center justify-center">
                          <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        </div>
                      )}

                      {image.error && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded flex items-center justify-center">
                          <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 truncate">{image.file.name}</p>
                      
                      <select
                        value={image.imageType}
                        onChange={(e) => updateImageType(index, e.target.value)}
                        disabled={image.uploaded}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                      >
                        <option value="fond_oeil_normal">Fond d'œil normal</option>
                        <option value="fond_oeil_rouge">Fond d'œil - lumière rouge</option>
                        <option value="fond_oeil_vert">Fond d'œil - lumière verte</option>
                        <option value="fond_oeil_bleu">Fond d'œil - lumière bleue</option>
                        <option value="angiographie_fluoresceine">Angiographie fluorescéine</option>
                        <option value="angiographie_icg">Angiographie ICG</option>
                        <option value="oct">OCT</option>
                        <option value="retinographie">Rétinographie</option>
                        <option value="autofluorescence">Autofluorescence</option>
                        <option value="infrarouge">Infrarouge</option>
                        <option value="autre">Autre</option>
                      </select>
                      
                      <select
                        value={image.phase}
                        onChange={(e) => updateImagePhase(index, e.target.value)}
                        disabled={image.uploaded}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                      >
                        <option value="precoce">Phase précoce</option>
                        <option value="intermediaire">Phase intermédiaire</option>
                        <option value="tardive">Phase tardive</option>
                        <option value="autre">Autre</option>
                      </select>

                      {uploadProgress[index] !== undefined && !image.uploaded && !image.error && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[index]}%` }}
                          />
                        </div>
                      )}

                      {image.error && (
                        <p className="text-xs text-red-600">{image.error}</p>
                      )}

                      {image.uploaded && (
                        <p className="text-xs text-green-600">✓ Image uploadée</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}