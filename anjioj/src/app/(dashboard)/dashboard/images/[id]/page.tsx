'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface ImageData {
  _id: string
  filename: string
  originalName: string
  url: string
  thumbnailUrl?: string
  size: number
  dimensions: {
    width: number
    height: number
  }
  mimeType: string
  status: string
  createdAt: string
  examenId?: {
    _id: string
    type: string
    date: string
    oeil: string
    patientId?: {
      nom: string
      prenom: string
    }
  }
  angiography?: {
    phase?: string
    timeFromInjection?: number
    fluoresceinVisible?: boolean
    quality?: string
  }
  metadata?: any
  processing?: {
    annotations?: Array<{
      type: string
      coordinates: any
      text?: string
      color?: string
      createdAt: string
    }>
  }
}

export default function ImageViewerPage() {
  const params = useParams()
  const [image, setImage] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (params.id) {
      fetchImage(params.id as string)
    }
  }, [params.id])

  const fetchImage = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/images/${id}`)
      if (!response.ok) {
        throw new Error('Image non trouvée')
      }
      const data = await response.json()
      setImage(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.25, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.25, 0.1))
  }

  const handleZoomReset = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDelete = async () => {
    if (!image || !confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

    try {
      const response = await fetch(`/api/images/${image._id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        window.location.href = '/dashboard/images'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
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
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  if (error || !image) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <Link
            href="/dashboard/images"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux images
          </Link>
        </div>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Image non trouvée'}
        </div>
      </div>
    )
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Header */}
      <div className={`${isFullscreen ? 'absolute top-0 left-0 right-0 z-10' : ''} bg-white border-b border-gray-200 px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/images"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Retour aux images
            </Link>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{image.originalName}</h1>
              {image.examenId?.patientId && (
                <p className="text-sm text-gray-500">
                  Patient: {image.examenId.patientId.nom} {image.examenId.patientId.prenom} 
                  {image.examenId && ` • ${image.examenId.type} • ${image.examenId.oeil}`}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Contrôles du viewer */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white rounded"
                title="Zoom arrière"
              >
                <MagnifyingGlassMinusIcon className="h-4 w-4" />
              </button>
              
              <span className="px-2 text-sm font-medium">
                {Math.round(zoom * 100)}%
              </span>
              
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white rounded"
                title="Zoom avant"
              >
                <MagnifyingGlassPlusIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleZoomReset}
                className="p-2 hover:bg-white rounded text-xs"
                title="Taille réelle"
              >
                1:1
              </button>
            </div>
            
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title={showInfo ? "Masquer les infos" : "Afficher les infos"}
            >
              {showInfo ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? 
                <ArrowsPointingInIcon className="h-5 w-5" /> : 
                <ArrowsPointingOutIcon className="h-5 w-5" />
              }
            </button>
            
            <Link
              href={`/dashboard/images/${image._id}/edit`}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Éditer"
            >
              <PencilIcon className="h-5 w-5" />
            </Link>
            
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:text-red-700"
              title="Supprimer"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Viewer principal */}
        <div className={`${showInfo && !isFullscreen ? 'flex-1' : 'w-full'} ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-120px)]'} bg-gray-900 overflow-hidden relative`}>
          <div 
            className="w-full h-full flex items-center justify-center cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <Image
                src={image.url}
                alt={image.originalName}
                width={image.dimensions.width}
                height={image.dimensions.height}
                className="max-w-none"
                style={{ 
                  maxWidth: 'none',
                  maxHeight: 'none'
                }}
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Panel d'informations */}
        {showInfo && !isFullscreen && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <InformationCircleIcon className="h-4 w-4 mr-2" />
                  Informations générales
                </h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Nom du fichier</dt>
                    <dd className="text-gray-900 font-medium">{image.filename}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Taille</dt>
                    <dd className="text-gray-900">{formatFileSize(image.size)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Dimensions</dt>
                    <dd className="text-gray-900">{image.dimensions.width} × {image.dimensions.height} px</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Format</dt>
                    <dd className="text-gray-900">{image.mimeType}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Date d'upload</dt>
                    <dd className="text-gray-900">{formatDate(image.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              {/* Informations de l'examen */}
              {image.examenId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Examen</h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Type</dt>
                      <dd className="text-gray-900 capitalize">{image.examenId.type}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Œil</dt>
                      <dd className="text-gray-900">{image.examenId.oeil}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Date</dt>
                      <dd className="text-gray-900">{formatDate(image.examenId.date)}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Informations d'angiographie */}
              {image.angiography && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Angiographie</h3>
                  <dl className="space-y-2 text-sm">
                    {image.angiography.phase && (
                      <div>
                        <dt className="text-gray-500">Phase</dt>
                        <dd>
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded capitalize">
                            {image.angiography.phase}
                          </span>
                        </dd>
                      </div>
                    )}
                    {image.angiography.timeFromInjection !== undefined && (
                      <div>
                        <dt className="text-gray-500">Temps depuis injection</dt>
                        <dd className="text-gray-900">{image.angiography.timeFromInjection}s</dd>
                      </div>
                    )}
                    {image.angiography.fluoresceinVisible !== undefined && (
                      <div>
                        <dt className="text-gray-500">Fluorescéine visible</dt>
                        <dd className="text-gray-900">{image.angiography.fluoresceinVisible ? 'Oui' : 'Non'}</dd>
                      </div>
                    )}
                    {image.angiography.quality && (
                      <div>
                        <dt className="text-gray-500">Qualité</dt>
                        <dd>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${
                            image.angiography.quality === 'excellente' ? 'bg-green-100 text-green-800' :
                            image.angiography.quality === 'bonne' ? 'bg-blue-100 text-blue-800' :
                            image.angiography.quality === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {image.angiography.quality}
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Annotations */}
              {image.processing?.annotations && image.processing.annotations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Annotations</h3>
                  <div className="space-y-2">
                    {image.processing.annotations.map((annotation, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium capitalize">{annotation.type}</div>
                        {annotation.text && (
                          <div className="text-gray-600">{annotation.text}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(annotation.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}