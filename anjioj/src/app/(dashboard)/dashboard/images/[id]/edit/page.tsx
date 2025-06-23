'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon
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
}

interface RGBSettings {
  red: number
  green: number
  blue: number
  brightness: number
  contrast: number
  saturation: number
}

const DEFAULT_SETTINGS: RGBSettings = {
  red: 100,
  green: 100,
  blue: 100,
  brightness: 100,
  contrast: 100,
  saturation: 100
}

export default function ImageEditPage() {
  const params = useParams()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageRef = useRef<HTMLImageElement>(null)
  
  const [image, setImage] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<RGBSettings>(DEFAULT_SETTINGS)
  const [originalSettings] = useState<RGBSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchImage(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (imageLoaded && canvasRef.current && originalImageRef.current) {
      applyFilters()
    }
  }, [settings, imageLoaded])

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

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    if (canvasRef.current && originalImageRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = originalImageRef.current

      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      if (ctx) {
        ctx.drawImage(img, 0, 0)
      }
    }
  }, [])

  const applyFilters = useCallback(() => {
    if (!canvasRef.current || !originalImageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = originalImageRef.current

    if (!ctx) return

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Appliquer les filtres CSS au contexte
    const filters = [
      `brightness(${settings.brightness}%)`,
      `contrast(${settings.contrast}%)`,
      `saturate(${settings.saturation}%)`
    ]
    
    ctx.filter = filters.join(' ')
    ctx.drawImage(img, 0, 0)

    // Appliquer les ajustements RGB
    if (settings.red !== 100 || settings.green !== 100 || settings.blue !== 100) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, (data[i] * settings.red) / 100)     // Red
        data[i + 1] = Math.min(255, (data[i + 1] * settings.green) / 100) // Green
        data[i + 2] = Math.min(255, (data[i + 2] * settings.blue) / 100)  // Blue
      }

      ctx.putImageData(imageData, 0, 0)
    }
  }, [settings])

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  const saveImage = async () => {
    if (!canvasRef.current || !image) return

    setSaving(true)
    try {
      // Convertir le canvas en blob
      const canvas = canvasRef.current
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/jpeg', 0.9)
      })

      // Créer FormData pour l'upload
      const formData = new FormData()
      formData.append('file', blob, `edited_${image.originalName}`)
      if (image.examenId?._id) {
        formData.append('examId', image.examenId._id)
      }

      // Uploader la nouvelle image
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const newImage = await response.json()
        router.push(`/dashboard/images/${newImage._id}`)
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de l\'image')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)

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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/dashboard/images/${image._id}`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Retour au viewer
            </Link>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Éditeur RGB - {image.originalName}
              </h1>
              {image.examenId?.patientId && (
                <p className="text-sm text-gray-500">
                  Patient: {image.examenId.patientId.nom} {image.examenId.patientId.prenom} 
                  {image.examenId && ` • ${image.examenId.type} • ${image.examenId.oeil}`}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={resetSettings}
              disabled={!hasChanges}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
              Réinitialiser
            </button>
            
            <button
              onClick={saveImage}
              disabled={!hasChanges || saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="animate-spin h-4 w-4 mr-1" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel de contrôles */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto flex-shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ajustements RGB</h3>
              
              {/* Red Channel */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canal Rouge: {settings.red}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.red}
                  onChange={(e) => setSettings(prev => ({ ...prev, red: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider-red"
                />
              </div>

              {/* Green Channel */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canal Vert: {settings.green}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.green}
                  onChange={(e) => setSettings(prev => ({ ...prev, green: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider-green"
                />
              </div>

              {/* Blue Channel */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canal Bleu: {settings.blue}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.blue}
                  onChange={(e) => setSettings(prev => ({ ...prev, blue: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-blue"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ajustements généraux</h3>
              
              {/* Brightness */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Luminosité: {settings.brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.brightness}
                  onChange={(e) => setSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraste: {settings.contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.contrast}
                  onChange={(e) => setSettings(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saturation: {settings.saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.saturation}
                  onChange={(e) => setSettings(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Préréglages</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSettings({ red: 150, green: 100, blue: 100, brightness: 110, contrast: 110, saturation: 100 })}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Renforcer le rouge (vaisseaux)
                </button>
                <button
                  onClick={() => setSettings({ red: 100, green: 150, blue: 100, brightness: 110, contrast: 110, saturation: 100 })}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Renforcer le vert (fond d'œil)
                </button>
                <button
                  onClick={() => setSettings({ red: 120, green: 120, blue: 120, brightness: 120, contrast: 130, saturation: 90 })}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Améliorer le contraste
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Zone d'édition */}
        <div className="flex-1 bg-gray-900 overflow-auto">
          <div className="h-full flex items-center justify-center p-4">
            <div className="relative">
              {/* Image originale (cachée, utilisée pour les calculs) */}
              <img
                ref={originalImageRef}
                src={image.url}
                alt={image.originalName}
                onLoad={handleImageLoad}
                className="hidden"
                crossOrigin="anonymous"
              />
              
              {/* Canvas pour l'image éditée */}
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain border border-gray-600"
                style={{
                  maxWidth: 'calc(100vw - 320px - 2rem)',
                  maxHeight: 'calc(100vh - 120px - 2rem)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}