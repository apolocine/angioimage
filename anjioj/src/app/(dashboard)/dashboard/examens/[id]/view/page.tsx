'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  DocumentIcon,
  CameraIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface Patient {
  _id: string
  nom: string
  prenom: string
  dateNaissance?: string
}

interface Image {
  _id: string
  filename: string
  originalName?: string
  imageType: string
  url: string
  thumbnailUrl?: string
  size?: number
  createdAt: string
  angiography?: {
    phase?: string
  }
}

interface Exam {
  _id: string
  type: string
  date: string
  status: string
  oeil: string
  indication: string
  diagnostic?: string
  patientId: Patient
  images?: Image[]
  createdAt?: string
  updatedAt?: string
  angiographie?: {
    protocole?: string
    fluoresceine?: {
      injected: boolean
      injectionTime?: string
    }
  }
}

export default function ExamViewPage() {
  const params = useParams()
  const examId = params.id as string
  
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({})
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    fetchExam()
  }, [examId])

  const fetchExam = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/examens/${examId}`)
      if (response.ok) {
        const data = await response.json()
        const examData = data.data || data
        console.log('Exam data loaded:', examData)
        console.log('Images data:', examData.images)
        if (examData.images && examData.images.length > 0) {
          console.log('First image sample:', examData.images[0])
        }
        setExam(examData)
      } else {
        console.error('Erreur lors du chargement de l\'examen')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExam = async () => {
    if (!exam || !confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) return

    try {
      const response = await fetch(`/api/examens/${examId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        window.location.href = `/dashboard/patients/${exam.patientId._id}`
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'examen:', error)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchExam() // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
      'planifie': { label: 'Planifié', color: 'bg-blue-100 text-blue-800', icon: CalendarIcon },
      'en_cours': { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      'termine': { label: 'Terminé', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      'annule': { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: XMarkIcon }
    }
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: DocumentIcon }
    const IconComponent = statusInfo.icon
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        <IconComponent className="h-4 w-4 mr-1" />
        {statusInfo.label}
      </span>
    )
  }

  const getImageTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'fond_oeil_normal': 'Fond d\'œil normal',
      'fond_oeil_rouge': 'Fond d\'œil - Rouge',
      'fond_oeil_vert': 'Fond d\'œil - Vert',
      'fond_oeil_bleu': 'Fond d\'œil - Bleu',
      'angiographie_fluoresceine': 'Angiographie Fluorescéine',
      'angiographie_icg': 'Angiographie ICG',
      'oct': 'OCT',
      'retinographie': 'Rétinographie',
      'autofluorescence': 'Autofluorescence',
      'infrarouge': 'Infrarouge',
      'autre': 'Autre'
    }
    return types[type] || type
  }

  const getImageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'fond_oeil_normal': 'bg-gray-100 text-gray-800',
      'fond_oeil_rouge': 'bg-red-100 text-red-800',
      'fond_oeil_vert': 'bg-green-100 text-green-800',
      'fond_oeil_bleu': 'bg-blue-100 text-blue-800',
      'angiographie_fluoresceine': 'bg-yellow-100 text-yellow-800',
      'angiographie_icg': 'bg-purple-100 text-purple-800',
      'oct': 'bg-indigo-100 text-indigo-800',
      'retinographie': 'bg-pink-100 text-pink-800',
      'autofluorescence': 'bg-orange-100 text-orange-800',
      'infrarouge': 'bg-red-100 text-red-800',
      'autre': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const filteredImages = exam?.images?.filter(image => {
    // Filtre par type
    if (filterType !== 'all' && image.imageType !== filterType) {
      return false
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const fileName = (image.originalName || image.filename).toLowerCase()
      if (!fileName.includes(searchLower)) {
        return false
      }
    }
    
    return true
  }) || []

  const imageTypes = Array.from(new Set(exam?.images?.map(img => img.imageType) || []))

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(-1)
  }

  const handleSelectImage = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length && filteredImages.length > 0) {
      setSelectedImages([])
    } else {
      setSelectedImages(filteredImages.map(img => img._id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${selectedImages.length} image(s) ?`
    if (!confirm(confirmMessage)) return

    try {
      await Promise.all(selectedImages.map(imageId => 
        fetch(`/api/images/${imageId}`, { method: 'DELETE' })
      ))
      
      setSelectedImages([])
      fetchExam() // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la suppression en lot:', error)
      alert('Erreur lors de la suppression des images')
    }
  }

  const handleImageLoad = (imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: false }))
  }

  const handleImageLoadStart = (imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: true }))
  }

  const handleGenerateReport = async () => {
    if (!exam || selectedImages.length === 0) {
      alert('Veuillez sélectionner au moins une image pour générer le rapport.')
      return
    }

    setGeneratingReport(true)
    try {
      // Créer un rapport avec les images sélectionnées
      const reportData = {
        title: `Rapport - ${exam.type} ${exam.oeil} - ${exam.patientId.nom} ${exam.patientId.prenom}`,
        patientId: exam.patientId._id,
        examIds: [exam._id],
        imageIds: selectedImages,
        format: 'A4',
        orientation: 'portrait',
        content: {
          introduction: `Rapport d'examen ${exam.type} réalisé le ${formatDate(exam.date)} pour l'œil ${exam.oeil}.`,
          findings: exam.diagnostic || 'Observations en cours d\'analyse.',
          conclusion: '',
          recommendations: ''
        },
        layout: {
          imagesPerRow: 2,
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        }
      }

      // Créer le rapport
      const createResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })

      if (!createResponse.ok) {
        throw new Error('Erreur lors de la création du rapport')
      }

      const newReport = await createResponse.json()

      // Générer le PDF
      const generateResponse = await fetch(`/api/reports/${newReport._id}/generate`, {
        method: 'POST'
      })

      if (!generateResponse.ok) {
        throw new Error('Erreur lors de la génération du PDF')
      }

      // Rediriger vers le rapport généré
      window.open(`/dashboard/reports/${newReport._id}`, '_blank')
      
      // Déselectionner les images
      setSelectedImages([])
      
    } catch (error) {
      console.error('Erreur génération rapport:', error)
      alert('Erreur lors de la génération du rapport PDF')
    } finally {
      setGeneratingReport(false)
    }
  }

  const generatePlaceholderSvg = (imageType: string, filename: string, size: 'small' | 'normal' = 'normal') => {
    const dimensions = size === 'small' ? { width: 64, height: 64, fontSize: 8, y1: 28, y2: 40 } : { width: 200, height: 200, fontSize: 12, y1: 90, y2: 110 }
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${dimensions.width}" height="${dimensions.height}" fill="#f3f4f6"/>
        <text x="${dimensions.width/2}" y="${dimensions.y1}" text-anchor="middle" font-family="Arial" font-size="${dimensions.fontSize}" fill="#6b7280">
          ${getImageTypeLabel(imageType).split(' ')[0]}
        </text>
        <text x="${dimensions.width/2}" y="${dimensions.y2}" text-anchor="middle" font-family="Arial" font-size="${dimensions.fontSize-2}" fill="#9ca3af">
          ${size === 'small' ? 'Image' : (filename || 'Image').slice(0, 15) + '...'}
        </text>
      </svg>
    `)}`
  }

  const nextImage = () => {
    if (lightboxIndex < filteredImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }

  const prevImage = () => {
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <EyeIcon className="h-8 w-8 text-indigo-500 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Examen {exam.type}
                    </h1>
                    <p className="text-sm text-gray-500">
                      <Link 
                        href={`/dashboard/patients/${exam.patientId._id}`}
                        className="hover:text-indigo-600"
                      >
                        {exam.patientId.nom} {exam.patientId.prenom}
                      </Link> • {exam.oeil} • {formatDateTime(exam.date)}
                    </p>
                    <div className="mt-2">
                      {getStatusBadge(exam.status)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/dashboard/examens/${exam._id}/upload`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PhotoIcon className="h-4 w-4 mr-1" />
                    Ajouter images
                  </Link>
                  
                  {exam.status === 'planifie' && (
                    <Link
                      href={`/dashboard/angiography/capture/${exam._id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <CameraIcon className="h-4 w-4 mr-1" />
                      Capturer
                    </Link>
                  )}
                  
                  <button
                    onClick={handleDeleteExam}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations de l'examen */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Détails de l'examen</h2>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type d'examen</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{exam.type}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date et heure</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDateTime(exam.date)}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Œil examiné</dt>
                    <dd className="mt-1 text-sm text-gray-900">{exam.oeil}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="mt-1">{getStatusBadge(exam.status)}</dd>
                  </div>
                  
                  {exam.indication && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Indication</dt>
                      <dd className="mt-1 text-sm text-gray-900">{exam.indication}</dd>
                    </div>
                  )}
                  
                  {exam.diagnostic && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Diagnostic</dt>
                      <dd className="mt-1 text-sm text-gray-900">{exam.diagnostic}</dd>
                    </div>
                  )}
                  
                  {exam.angiographie && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Protocole</dt>
                      <dd className="mt-1 text-sm text-gray-900">{exam.angiographie.protocole}</dd>
                      
                      {exam.angiographie.fluoresceine && (
                        <div className="mt-2">
                          <dt className="text-sm font-medium text-gray-500">Fluorescéine</dt>
                          <dd className="mt-1">
                            {exam.angiographie.fluoresceine.injected ? (
                              <span className="text-sm text-green-600">
                                ✓ Injectée {exam.angiographie.fluoresceine.injectionTime && 
                                  `le ${formatDateTime(exam.angiographie.fluoresceine.injectionTime)}`}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">Non injectée</span>
                            )}
                          </dd>
                        </div>
                      )}
                    </div>
                  )}
                </dl>
              </div>

              {/* Statistiques des images */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total images</span>
                    <span className="text-sm font-medium text-gray-900">{exam.images?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Types d'images</span>
                    <span className="text-sm font-medium text-gray-900">{imageTypes.length}</span>
                  </div>
                  
                  {exam.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Créé le</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(exam.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Galerie d'images */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                {/* Header avec filtres */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <PhotoIcon className="h-6 w-6 text-gray-400 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">
                        Images ({filteredImages.length})
                      </h2>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <Squares2X2Icon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <ListBulletIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <Link
                        href={`/dashboard/examens/${exam._id}/upload`}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Ajouter
                      </Link>
                    </div>
                  </div>

                  {/* Filtres et recherche */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Rechercher par nom de fichier..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">Tous les types</option>
                        {imageTypes.map(type => (
                          <option key={type} value={type}>
                            {getImageTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions de sélection */}
                {filteredImages.length > 0 && (
                  <div className="px-6 py-3 border-b border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">
                      💡 Sélectionnez une ou plusieurs images puis cliquez sur "Générer rapport PDF" pour créer un rapport personnalisé
                    </div>
                    <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedImages.length === filteredImages.length && filteredImages.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {selectedImages.length > 0 
                          ? `${selectedImages.length} sélectionnée(s)`
                          : 'Tout sélectionner'
                        }
                      </span>
                    </div>
                    
                    {selectedImages.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleGenerateReport}
                          disabled={generatingReport}
                          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingReport ? (
                            <>
                              <div className="animate-spin h-4 w-4 inline mr-1 border-2 border-indigo-700 border-t-transparent rounded-full"></div>
                              Génération...
                            </>
                          ) : (
                            <>
                              <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                              Générer rapport PDF
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleDeleteSelected}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          <TrashIcon className="h-4 w-4 inline mr-1" />
                          Supprimer la sélection
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                )}

                <div className="p-6">

                {filteredImages.length === 0 ? (
                  <div className="text-center py-12">
                    <PhotoIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune image</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {filterType === 'all' 
                        ? 'Aucune image n\'a été ajoutée à cet examen'
                        : `Aucune image de type "${getImageTypeLabel(filterType)}"`
                      }
                    </p>
                    <Link
                      href={`/dashboard/examens/${exam._id}/upload`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <PhotoIcon className="h-4 w-4 mr-2" />
                      Ajouter des images
                    </Link>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image, index) => (
                      <div key={image._id} className="relative group bg-gray-50 rounded-lg overflow-hidden">
                        {/* Checkbox de sélection */}
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedImages.includes(image._id)}
                            onChange={() => handleSelectImage(image._id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>

                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                          {imageLoadingStates[image._id] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-indigo-600"></div>
                            </div>
                          )}
                          <img
                            src={image.thumbnailUrl || image.url || `/api/images/${image._id}/preview`}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => openLightbox(index)}
                            onLoadStart={() => handleImageLoadStart(image._id)}
                            onLoad={() => handleImageLoad(image._id)}
                            onError={(e) => {
                              handleImageLoad(image._id)
                              const target = e.target as HTMLImageElement
                              target.src = generatePlaceholderSvg(image.imageType, image.originalName || image.filename, 'normal')
                            }}
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openLightbox(index)}
                                className="p-2 bg-white/95 rounded-full hover:bg-white shadow-lg backdrop-blur-sm"
                                title="Agrandir"
                              >
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-700" />
                              </button>
                              <Link
                                href={`/dashboard/images/${image._id}/edit?examId=${exam._id}`}
                                className="p-2 bg-white/95 rounded-full hover:bg-white shadow-lg backdrop-blur-sm"
                                title="Éditer RGB"
                              >
                                <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-700" />
                              </Link>
                              <Link
                                href={`/dashboard/images/${image._id}?examId=${exam._id}`}
                                className="p-2 bg-white/95 rounded-full hover:bg-white shadow-lg backdrop-blur-sm"
                                title="Voir détails"
                              >
                                <EyeIcon className="h-4 w-4 text-gray-700" />
                              </Link>
                              <button
                                onClick={() => handleDeleteImage(image._id)}
                                className="p-2 bg-red-500/95 rounded-full hover:bg-red-500 shadow-lg backdrop-blur-sm"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImageTypeColor(image.imageType)}`}>
                              {getImageTypeLabel(image.imageType)}
                            </span>
                            {image.angiography?.phase && (
                              <span className="text-xs text-gray-500">{image.angiography.phase}</span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-900 truncate">{image.originalName || image.filename}</p>
                          {image.url && (
                            <p className="text-xs text-gray-500 mt-1">
                              {image.size && formatFileSize(image.size)}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(image.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Mode liste
                  <div className="space-y-3">
                    {filteredImages.map((image, index) => (
                      <div key={image._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(image._id)}
                          onChange={() => handleSelectImage(image._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        
                        <div className="flex-shrink-0 relative">
                          {imageLoadingStates[image._id] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-indigo-600"></div>
                            </div>
                          )}
                          <img
                            src={image.thumbnailUrl || image.url || `/api/images/${image._id}/preview`}
                            alt={`Image ${index + 1}`}
                            className="h-16 w-16 object-cover rounded-lg cursor-pointer"
                            onClick={() => openLightbox(index)}
                            onLoadStart={() => handleImageLoadStart(image._id)}
                            onLoad={() => handleImageLoad(image._id)}
                            onError={(e) => {
                              handleImageLoad(image._id)
                              const target = e.target as HTMLImageElement
                              target.src = generatePlaceholderSvg(image.imageType, image.originalName || image.filename, 'small')
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.originalName || image.filename}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImageTypeColor(image.imageType)}`}>
                              {getImageTypeLabel(image.imageType)}
                            </span>
                            {image.angiography?.phase && (
                              <span className="text-xs text-gray-500">{image.angiography.phase}</span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span>{image.size && formatFileSize(image.size)}</span>
                            <span>{new Date(image.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openLightbox(index)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Agrandir"
                          >
                            <MagnifyingGlassIcon className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/dashboard/images/${image._id}/edit?examId=${exam._id}`}
                            className="p-2 text-gray-400 hover:text-indigo-600"
                            title="Éditer RGB"
                          >
                            <AdjustmentsHorizontalIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/dashboard/images/${image._id}?examId=${exam._id}`}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Voir détails"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteImage(image._id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex >= 0 && filteredImages[lightboxIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-screen p-4">
            <img
              src={filteredImages[lightboxIndex].url || `/api/images/${filteredImages[lightboxIndex]._id}/full`}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            {lightboxIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
            )}
            
            {lightboxIndex < filteredImages.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
              >
                <ArrowLeftIcon className="h-6 w-6 transform rotate-180" />
              </button>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-75 text-white px-4 py-2 rounded-full">
              <p className="text-sm">
                {lightboxIndex + 1} / {filteredImages.length}
              </p>
              <p className="text-xs text-gray-300">
                {getImageTypeLabel(filteredImages[lightboxIndex].imageType)}
                {filteredImages[lightboxIndex].angiography?.phase && ` • ${filteredImages[lightboxIndex].angiography.phase}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}