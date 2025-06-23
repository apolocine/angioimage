'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CameraIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon
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
  status: string
  patientId: Patient
  angiographie?: {
    fluoresceine?: {
      injected: boolean
      injectionTime?: string
    }
    protocole?: string
    phases?: Array<{
      name: 'precoce' | 'intermediaire' | 'tardive'
      startTime: number
      endTime: number
      imageIds: string[]
    }>
  }
}

interface CaptureSettings {
  autoCapture: boolean
  captureInterval: number // en secondes
  imageQuality: number // 0.1 à 1.0
}

export default function AngiographyCaptePage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // État de capture
  const [isCapturing, setIsCapturing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  
  // Fluorescéine
  const [fluoresceinInjected, setFluoresceinInjected] = useState(false)
  const [injectionTime, setInjectionTime] = useState<Date | null>(null)
  const [timeFromInjection, setTimeFromInjection] = useState(0)
  
  // Images capturées
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  
  // Paramètres
  const [settings, setSettings] = useState<CaptureSettings>({
    autoCapture: false,
    captureInterval: 5,
    imageQuality: 0.8
  })
  
  // Phase actuelle
  const [currentPhase, setCurrentPhase] = useState<'precoce' | 'intermediaire' | 'tardive' | null>(null)

  useEffect(() => {
    if (params.examId) {
      fetchExam(params.examId as string)
    }
  }, [params.examId])

  useEffect(() => {
    initializeCamera()
    return () => {
      stopCamera()
      if (timerRef.current) clearInterval(timerRef.current)
      if (captureTimerRef.current) clearInterval(captureTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (fluoresceinInjected && injectionTime) {
      timerRef.current = setInterval(() => {
        const now = new Date()
        const diffSeconds = Math.floor((now.getTime() - injectionTime.getTime()) / 1000)
        setTimeFromInjection(diffSeconds)
        updateCurrentPhase(diffSeconds)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fluoresceinInjected, injectionTime])

  useEffect(() => {
    if (settings.autoCapture && isCapturing && !isPaused) {
      captureTimerRef.current = setInterval(() => {
        captureImage()
      }, settings.captureInterval * 1000)
    } else {
      if (captureTimerRef.current) {
        clearInterval(captureTimerRef.current)
        captureTimerRef.current = null
      }
    }

    return () => {
      if (captureTimerRef.current) clearInterval(captureTimerRef.current)
    }
  }, [settings.autoCapture, isCapturing, isPaused, settings.captureInterval])

  const fetchExam = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/examens/${id}`)
      if (!response.ok) {
        throw new Error('Examen non trouvé')
      }
      const data = await response.json()
      setExam(data)
      
      // Initialiser les données de fluorescéine si elles existent
      if (data.angiographie?.fluoresceine?.injected) {
        setFluoresceinInjected(true)
        if (data.angiographie.fluoresceine.injectionTime) {
          setInjectionTime(new Date(data.angiographie.fluoresceine.injectionTime))
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true)
        }
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error)
      setError('Impossible d\'accéder à la caméra')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const updateCurrentPhase = (seconds: number) => {
    if (seconds <= 30) {
      setCurrentPhase('precoce')
    } else if (seconds <= 120) {
      setCurrentPhase('intermediaire')
    } else {
      setCurrentPhase('tardive')
    }
  }

  const handleFluoresceinInjection = () => {
    const now = new Date()
    setFluoresceinInjected(true)
    setInjectionTime(now)
    setTimeFromInjection(0)
    
    // Mettre à jour l'examen
    updateExamFluorescein(now)
  }

  const updateExamFluorescein = async (injectionTime: Date) => {
    try {
      await fetch(`/api/examens/${exam?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'angiographie.fluoresceine.injected': true,
          'angiographie.fluoresceine.injectionTime': injectionTime.toISOString()
        })
      })
    } catch (error) {
      console.error('Erreur mise à jour fluorescéine:', error)
    }
  }

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !exam) return

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      // Ajuster la taille du canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Dessiner l'image vidéo sur le canvas
      ctx.drawImage(video, 0, 0)

      // Convertir en blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/jpeg', settings.imageQuality)
      })

      // Créer FormData pour l'upload
      const formData = new FormData()
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      formData.append('file', blob, `angio_${exam._id}_${timestamp}.jpg`)
      formData.append('examId', exam._id)
      
      if (currentPhase) {
        formData.append('phase', currentPhase)
      }
      
      if (timeFromInjection > 0) {
        formData.append('timeFromInjection', timeFromInjection.toString())
      }
      
      formData.append('fluoresceinVisible', fluoresceinInjected.toString())

      // Uploader l'image
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const newImage = await response.json()
        setCapturedImages(prev => [...prev, newImage._id])
      }
    } catch (error) {
      console.error('Erreur capture image:', error)
    }
  }, [exam, currentPhase, timeFromInjection, fluoresceinInjected, settings.imageQuality])

  const startCapture = () => {
    setIsCapturing(true)
    setIsPaused(false)
  }

  const pauseCapture = () => {
    setIsPaused(!isPaused)
  }

  const stopCapture = async () => {
    setIsCapturing(false)
    setIsPaused(false)
    
    // Marquer l'examen comme terminé
    if (exam) {
      try {
        await fetch(`/api/examens/${exam._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'termine' })
        })
        router.push('/dashboard/angiography')
      } catch (error) {
        console.error('Erreur mise à jour statut:', error)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseProgress = () => {
    if (!fluoresceinInjected || timeFromInjection === 0) return 0
    
    switch (currentPhase) {
      case 'precoce':
        return Math.min((timeFromInjection / 30) * 100, 100)
      case 'intermediaire':
        return Math.min(((timeFromInjection - 30) / 90) * 100, 100)
      case 'tardive':
        return Math.min(((timeFromInjection - 120) / 480) * 100, 100)
      default:
        return 0
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

  return (
    <div className="h-screen flex flex-col bg-gray-900">
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
                Capture Angiographie - {exam.patientId.nom} {exam.patientId.prenom}
              </h1>
              <p className="text-sm text-gray-500">
                {exam.oeil} • {new Date(exam.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCapturing && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                Capture en cours
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Zone de capture principale */}
        <div className="flex-1 flex flex-col">
          {/* Preview vidéo */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Contrôles de capture */}
          <div className="bg-gray-800 p-4">
            <div className="flex items-center justify-center space-x-4">
              {!isCapturing ? (
                <button
                  onClick={startCapture}
                  disabled={!cameraReady || !fluoresceinInjected}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Démarrer capture
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseCapture}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isPaused ? <PlayIcon className="h-4 w-4 mr-2" /> : <PauseIcon className="h-4 w-4 mr-2" />}
                    {isPaused ? 'Reprendre' : 'Pause'}
                  </button>
                  
                  <button
                    onClick={captureImage}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <CameraIcon className="h-4 w-4 mr-2" />
                    Capture manuelle
                  </button>
                  
                  <button
                    onClick={stopCapture}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <StopIcon className="h-4 w-4 mr-2" />
                    Terminer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Panel latéral */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Fluorescéine */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fluorescéine</h3>
            
            {!fluoresceinInjected ? (
              <button
                onClick={handleFluoresceinInjection}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Marquer injection
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Fluorescéine injectée</span>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-gray-900">
                    {formatTime(timeFromInjection)}
                  </div>
                  <div className="text-sm text-gray-500">depuis injection</div>
                </div>
                
                {currentPhase && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize">{currentPhase}</span>
                      <span>{Math.round(getPhaseProgress())}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${getPhaseProgress()}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline des phases */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Phases</h3>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${currentPhase === 'precoce' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}>
                <div className="font-medium">Précoce</div>
                <div className="text-sm text-gray-600">0-30 secondes</div>
              </div>
              <div className={`p-3 rounded-lg ${currentPhase === 'intermediaire' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}>
                <div className="font-medium">Intermédiaire</div>
                <div className="text-sm text-gray-600">30-120 secondes</div>
              </div>
              <div className={`p-3 rounded-lg ${currentPhase === 'tardive' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}>
                <div className="font-medium">Tardive</div>
                <div className="text-sm text-gray-600">120+ secondes</div>
              </div>
            </div>
          </div>

          {/* Paramètres */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Paramètres
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoCapture}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoCapture: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm">Capture automatique</span>
                </label>
              </div>
              
              {settings.autoCapture && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalle: {settings.captureInterval}s
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={settings.captureInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, captureInterval: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualité: {Math.round(settings.imageQuality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.imageQuality}
                  onChange={(e) => setSettings(prev => ({ ...prev, imageQuality: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Images capturées */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Images capturées ({capturedImages.length})
            </h3>
            <div className="text-sm text-gray-500">
              Les images sont automatiquement sauvegardées dans la galerie.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}