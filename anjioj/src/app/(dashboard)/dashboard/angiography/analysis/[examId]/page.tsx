'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  ChartBarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

interface Patient {
  _id: string
  nom: string
  prenom: string
}

interface ImageData {
  _id: string
  filename: string
  originalName: string
  url: string
  angiography?: {
    phase?: string
    timeFromInjection?: number
    fluoresceinVisible?: boolean
    quality?: string
  }
  createdAt: string
}

interface Exam {
  _id: string
  type: string
  date: string
  oeil: string
  status: string
  patientId: Patient
  angiographie?: {
    fluoresceine?: {
      injected: boolean
      injectionTime?: string
    }
    protocole?: string
  }
}

export default function AngiographyAnalysisPage() {
  const params = useParams()
  
  const [exam, setExam] = useState<Exam | null>(null)
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // État du player
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // ms entre images
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  // Refs
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (params.examId) {
      fetchExam(params.examId as string)
      fetchImages(params.examId as string)
    }
  }, [params.examId])

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => {
          if (prev >= images.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, playbackSpeed)
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [isPlaying, playbackSpeed, images.length])

  const fetchExam = async (id: string) => {
    try {
      const response = await fetch(`/api/examens/${id}`)
      if (!response.ok) throw new Error('Examen non trouvé')
      const data = await response.json()
      setExam(data)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const fetchImages = async (examId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/images?examId=${examId}`)
      const data = await response.json()
      
      // Trier les images par temps depuis injection
      const sortedImages = (data.data || []).sort((a: ImageData, b: ImageData) => {
        const timeA = a.angiography?.timeFromInjection || 0
        const timeB = b.angiography?.timeFromInjection || 0
        return timeA - timeB
      })
      
      setImages(sortedImages)
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const previousImage = () => {
    setCurrentImageIndex(prev => Math.max(0, prev - 1))
  }

  const nextImage = () => {
    setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
    setIsPlaying(false)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.25, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.25, 0.1))
  }

  const resetView = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const currentImage = images[currentImageIndex]
  
  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'precoce': return 'bg-green-100 text-green-800'
      case 'intermediaire': return 'bg-yellow-100 text-yellow-800'
      case 'tardive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const generateReport = async () => {
    try {
      const response = await fetch(`/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam?._id,
          type: 'angiographie'
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapport_angiographie_${exam?.patientId.nom}_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erreur génération rapport:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <Link
            href="/dashboard/angiography"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour au planning
          </Link>
        </div>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Examen non trouvé'}
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Link
            href="/dashboard/angiography"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour au planning
          </Link>
        </div>
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune image</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aucune image n'a été capturée pour cet examen.
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/angiography"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Retour
            </Link>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Analyse Angiographie - {exam.patientId.nom} {exam.patientId.prenom}
              </h1>
              <p className="text-sm text-gray-500">
                {exam.oeil} • {new Date(exam.date).toLocaleDateString('fr-FR')} • {images.length} images
              </p>
            </div>
          </div>
          
          <button
            onClick={generateReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Générer rapport
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Viewer principal */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4">
            {currentImage && (
              <div
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                }}
                className="transition-transform duration-200"
              >
                <Image
                  src={currentImage.url}
                  alt={currentImage.originalName}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  unoptimized
                />
              </div>
            )}
          </div>
          
          {/* Contrôles */}
          <div className="bg-gray-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={previousImage}
                disabled={currentImageIndex === 0}
                className="p-2 text-white hover:text-gray-300 disabled:opacity-50"
              >
                <ArrowLeftCircleIcon className="h-6 w-6" />
              </button>
              
              <button
                onClick={togglePlayback}
                className="p-2 text-white hover:text-gray-300"
              >
                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
              </button>
              
              <button
                onClick={nextImage}
                disabled={currentImageIndex === images.length - 1}
                className="p-2 text-white hover:text-gray-300 disabled:opacity-50"
              >
                <ArrowRightCircleIcon className="h-6 w-6" />
              </button>
              
              <div className="text-white text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">Vitesse:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                  className="px-2 py-1 bg-gray-700 text-white rounded text-sm"
                >
                  <option value={2000}>0.5x</option>
                  <option value={1000}>1x</option>
                  <option value={500}>2x</option>
                  <option value={250}>4x</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1 text-white hover:text-gray-300"
                >
                  <MagnifyingGlassMinusIcon className="h-5 w-5" />
                </button>
                
                <span className="text-white text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  className="p-1 text-white hover:text-gray-300"
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </button>
                
                <button
                  onClick={resetView}
                  className="p-1 text-white hover:text-gray-300"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel latéral */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Timeline */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {images.map((image, index) => (
                <button
                  key={image._id}
                  onClick={() => goToImage(index)}
                  className={`w-full text-left p-2 rounded-lg border ${
                    index === currentImageIndex ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {formatTime(image.angiography?.timeFromInjection)}
                      </div>
                      {image.angiography?.phase && (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPhaseColor(image.angiography.phase)}`}>
                          {image.angiography.phase}
                        </span>
                      )}
                    </div>
                    <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 ml-2">
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Informations image actuelle */}
          {currentImage && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Image actuelle</h3>
              
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Temps depuis injection</dt>
                  <dd className="text-gray-900 font-medium">
                    {formatTime(currentImage.angiography?.timeFromInjection)}
                  </dd>
                </div>
                
                {currentImage.angiography?.phase && (
                  <div>
                    <dt className="text-gray-500">Phase</dt>
                    <dd>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${getPhaseColor(currentImage.angiography.phase)}`}>
                        {currentImage.angiography.phase}
                      </span>
                    </dd>
                  </div>
                )}
                
                {currentImage.angiography?.fluoresceinVisible !== undefined && (
                  <div>
                    <dt className="text-gray-500">Fluorescéine visible</dt>
                    <dd className="text-gray-900">
                      {currentImage.angiography.fluoresceinVisible ? 'Oui' : 'Non'}
                    </dd>
                  </div>
                )}
                
                {currentImage.angiography?.quality && (
                  <div>
                    <dt className="text-gray-500">Qualité</dt>
                    <dd>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${
                        currentImage.angiography.quality === 'excellente' ? 'bg-green-100 text-green-800' :
                        currentImage.angiography.quality === 'bonne' ? 'bg-blue-100 text-blue-800' :
                        currentImage.angiography.quality === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {currentImage.angiography.quality}
                      </span>
                    </dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-gray-500">Capture</dt>
                  <dd className="text-gray-900">
                    {new Date(currentImage.createdAt).toLocaleTimeString('fr-FR')}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Statistiques */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Images par phase</div>
                <div className="mt-2 space-y-1">
                  {['precoce', 'intermediaire', 'tardive'].map(phase => {
                    const count = images.filter(img => img.angiography?.phase === phase).length
                    return (
                      <div key={phase} className="flex justify-between text-sm">
                        <span className="capitalize">{phase}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Durée totale</div>
                <div className="text-lg font-medium">
                  {formatTime(Math.max(...images.map(img => img.angiography?.timeFromInjection || 0)))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Qualité moyenne</div>
                <div className="text-sm">
                  {images.filter(img => img.angiography?.quality === 'excellente').length > images.length / 2 ? 'Excellente' :
                   images.filter(img => img.angiography?.quality === 'bonne').length > images.length / 2 ? 'Bonne' : 
                   'Variable'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}