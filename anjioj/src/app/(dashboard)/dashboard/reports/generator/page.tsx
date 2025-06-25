'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  Cog6ToothIcon,
  UserIcon,
  BeakerIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Patient {
  _id: string
  nom: string
  prenom: string
  dateNaissance: string
}

interface Exam {
  _id: string
  type: string
  date: string
  oeil: string
  indication: string
  diagnostic?: string
}

interface ImageData {
  _id: string
  filename: string
  originalName: string
  url: string
  thumbnailUrl?: string
  imageType: string
}

interface ReportTemplate {
  _id: string
  name: string
  description?: string
  category: string
}

interface ReportData {
  title: string
  patientId: string
  examIds: string[]
  imageIds: string[]
  templateId?: string
  format: 'A4' | 'A5' | 'Letter'
  orientation: 'portrait' | 'landscape'
  content: {
    header: string
    introduction: string
    conclusion: string
    findings: string
    recommendations: string
  }
  layout: {
    imagesPerRow: number
    includeHeader: boolean
    includeFooter: boolean
    includePageNumbers: boolean
    margins?: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
}

export default function ReportGeneratorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [patients, setPatients] = useState<Patient[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [images, setImages] = useState<ImageData[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // États pour l'autocomplétion
  const [patientSearch, setPatientSearch] = useState('')
  const [patientSuggestions, setPatientSuggestions] = useState<Patient[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  const [reportData, setReportData] = useState<ReportData>({
    title: '',
    patientId: '',
    examIds: [],
    imageIds: [],
    templateId: '',
    format: 'A4',
    orientation: 'portrait',
    content: {
      header: '',
      introduction: '',
      conclusion: '',
      findings: '',
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
  })

  const steps = [
    { id: 1, name: 'Sélection données', icon: UserIcon },
    { id: 2, name: 'Configuration', icon: Cog6ToothIcon },
    { id: 3, name: 'Contenu', icon: DocumentTextIcon },
    { id: 4, name: 'Aperçu', icon: EyeIcon }
  ]

  useEffect(() => {
    fetchTemplates()
    if (editId) {
      loadExistingReport(editId)
    }
  }, [editId])

  useEffect(() => {
    if (reportData.patientId && !isEditing) {
      fetchExams(reportData.patientId)
    }
  }, [reportData.patientId])

  useEffect(() => {
    if (reportData.examIds.length > 0 && !isEditing) {
      fetchImages(reportData.examIds)
    }
  }, [reportData.examIds])

  // Effet pour l'autocomplétion des patients
  useEffect(() => {
    const searchPatients = async () => {
      if (patientSearch.length < 2) {
        setPatientSuggestions([])
        setShowSuggestions(false)
        return
      }

      setSearchLoading(true)
      try {
        const response = await fetch(`/api/patients/search?q=${encodeURIComponent(patientSearch)}&limit=10`)
        const data = await response.json()
        if (response.ok) {
          setPatientSuggestions(data.data || [])
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Erreur recherche patients:', error)
      } finally {
        setSearchLoading(false)
      }
    }

    const timeoutId = setTimeout(searchPatients, 300) // Délai de 300ms
    return () => clearTimeout(timeoutId)
  }, [patientSearch])

  const handlePatientSearch = (value: string) => {
    setPatientSearch(value)
    if (!value.trim()) {
      setSelectedPatient(null)
      setReportData(prev => ({ ...prev, patientId: '' }))
    }
  }

  const handlePatientSelectFromAutocomplete = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientSearch(`${patient.nom} ${patient.prenom}`)
    setShowSuggestions(false)
    setReportData(prev => ({
      ...prev,
      patientId: patient._id,
      examIds: [],
      imageIds: [],
      title: `Rapport d'examen - ${patient.nom} ${patient.prenom}`
    }))
    setExams([])
    setImages([])
  }

  const handlePatientClear = () => {
    setSelectedPatient(null)
    setPatientSearch('')
    setShowSuggestions(false)
    setReportData(prev => ({
      ...prev,
      patientId: '',
      examIds: [],
      imageIds: [],
      title: ''
    }))
    setExams([])
    setImages([])
  }

  const fetchExams = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/examens`)
      const data = await response.json()
      if (response.ok) {
        setExams(data.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error)
    }
  }

  const fetchImages = async (examIds: string[]) => {
    console.log('fetchImages called with examIds:', examIds)
    setLoadingImages(true)
    try {
      if (examIds.length === 0) {
        setImages([])
        return
      }

      const promises = examIds.map(examId => 
        fetch(`/api/examens/${examId}/images`)
          .then(res => {
            console.log(`Response for exam ${examId}:`, res.status)
            return res.json()
          })
          .then(data => {
            console.log(`Images for exam ${examId}:`, data)
            return data
          })
      )
      
      const results = await Promise.all(promises)
      const allImages = results.flatMap(result => result.data || [])
      console.log('All images loaded:', allImages)
      setImages(allImages)
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error)
    } finally {
      setLoadingImages(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/reports/templates')
      const data = await response.json()
      if (response.ok) {
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
    }
  }

  const loadExistingReport = async (reportId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      const data = await response.json()
      if (response.ok) {
        console.log('Loaded report:', data)
        console.log('Report content:', data.content)
        console.log('Header value:', data.content?.header)
        
        // Extraire les IDs depuis les objets populés
        const patientId = data.patientId?._id || data.patientId
        const examIds = data.examIds?.map((exam: any) => 
          typeof exam === 'object' ? exam._id : exam
        ) || []
        const imageIds = data.imageIds?.map((img: any) => 
          typeof img === 'object' ? img._id : img
        ) || []
        const templateId = data.templateId?._id || data.templateId || ''
        
        // Mettre à jour le reportData avec les bonnes valeurs
        setReportData({
          title: data.title || '',
          patientId: patientId,
          examIds: examIds,
          imageIds: imageIds,
          templateId: templateId,
          format: data.format || 'A4',
          orientation: data.orientation || 'portrait',
          content: {
            header: data.content?.header || '',
            introduction: data.content?.introduction || '',
            conclusion: data.content?.conclusion || '',
            findings: data.content?.findings || '',
            recommendations: data.content?.recommendations || ''
          },
          layout: {
            imagesPerRow: data.layout?.imagesPerRow || 2,
            includeHeader: data.layout?.includeHeader !== false,
            includeFooter: data.layout?.includeFooter !== false,
            includePageNumbers: data.layout?.includePageNumbers !== false,
            margins: data.layout?.margins || {
              top: 20,
              right: 20,
              bottom: 20,
              left: 20
            }
          }
        })
        
        // Charger les examens si un patient est sélectionné
        if (patientId) {
          // Récupérer les infos du patient pour l'autocomplétion
          try {
            const patientResponse = await fetch(`/api/patients/${patientId}`)
            if (patientResponse.ok) {
              const patientData = await patientResponse.json()
              const patient = patientData.data || patientData
              setSelectedPatient(patient)
              setPatientSearch(`${patient.nom} ${patient.prenom}`)
            }
          } catch (error) {
            console.error('Erreur chargement patient:', error)
          }
          
          await fetchExams(patientId)
        }
        
        // Charger les images si des examens sont sélectionnés
        if (examIds.length > 0) {
          await fetchImages(examIds)
        }
        
        // Marquer comme édition pour éviter les reset
        setIsEditing(true)
        
        // Aller directement à l'étape 3 (Contenu) pour l'édition
        setCurrentStep(3)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rapport:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePatientSelect = async (patientId: string) => {
    try {
      // Récupérer les infos du patient
      const response = await fetch(`/api/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        const patient = data.data || data
        
        // Mettre à jour l'état de l'autocomplétion
        setSelectedPatient(patient)
        setPatientSearch(`${patient.nom} ${patient.prenom}`)
        
        // Mettre à jour le reportData
        setReportData(prev => ({
          ...prev,
          patientId,
          examIds: [],
          imageIds: [],
          title: `Rapport d'examen - ${patient.nom} ${patient.prenom}`
        }))
        setExams([])
        setImages([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement du patient:', error)
    }
  }

  const handleExamToggle = (examId: string) => {
    setReportData(prev => ({
      ...prev,
      examIds: prev.examIds.includes(examId)
        ? prev.examIds.filter(id => id !== examId)
        : [...prev.examIds, examId]
    }))
  }

  const handleImageToggle = (imageId: string) => {
    setReportData(prev => ({
      ...prev,
      imageIds: prev.imageIds.includes(imageId)
        ? prev.imageIds.filter(id => id !== imageId)
        : [...prev.imageIds, imageId]
    }))
  }

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      const endpoint = editId ? `/api/reports/${editId}` : '/api/reports'
      const method = editId ? 'PUT' : 'POST'
      
      // Étape 1: Créer ou mettre à jour le rapport en base
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const reportId = data._id || editId
        
        // Étape 2: Régénérer le fichier PDF/HTML (toujours nécessaire pour refléter les changements)
        const generateResponse = await fetch(`/api/reports/${reportId}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            format: 'pdf' // Format par défaut, peut être modifié plus tard
          })
        })
        
        if (generateResponse.ok) {
          router.push(`/dashboard/reports/${reportId}`)
        } else {
          console.error('Erreur lors de la génération du fichier')
          // Même si la génération échoue, on peut toujours voir le rapport
          router.push(`/dashboard/reports/${reportId}`)
        }
      } else {
        console.error('Erreur lors de la sauvegarde:', data.message)
        alert('Erreur lors de la sauvegarde du rapport')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du rapport')
    } finally {
      setGenerating(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return reportData.patientId && reportData.examIds.length > 0
      case 2:
        return reportData.title && reportData.format
      case 3:
        return true
      case 4:
        return reportData.imageIds.length > 0
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rechercher un patient</h3>
              <div className="relative">
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  onFocus={() => patientSuggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Tapez le nom ou prénom du patient..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-indigo-600 rounded-full"></div>
                  </div>
                )}
                
                {selectedPatient && (
                  <button
                    onClick={handlePatientClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}

                {/* Liste des suggestions */}
                {showSuggestions && patientSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {patientSuggestions.map((patient) => (
                      <button
                        key={patient._id}
                        onClick={() => handlePatientSelectFromAutocomplete(patient)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {patient.nom} {patient.prenom}
                        </div>
                        <div className="text-sm text-gray-500">
                          Né(e) le {new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Affichage quand aucun résultat */}
                {showSuggestions && patientSuggestions.length === 0 && patientSearch.length >= 2 && !searchLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    Aucun patient trouvé pour "{patientSearch}"
                  </div>
                )}
              </div>

              {/* Affichage du patient sélectionné */}
              {selectedPatient && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-indigo-900">
                        Patient sélectionné: {selectedPatient.nom} {selectedPatient.prenom}
                      </div>
                      <div className="text-sm text-indigo-700">
                        Né(e) le {new Date(selectedPatient.dateNaissance).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <CheckIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              )}
            </div>

            {reportData.patientId && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sélectionnez les examens</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {exams.map((exam) => (
                    <label
                      key={exam._id}
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={reportData.examIds.includes(exam._id)}
                        onChange={() => handleExamToggle(exam._id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {exam.type} - {exam.oeil}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(exam.date).toLocaleDateString('fr-FR')} • {exam.indication}
                        </div>
                      </div>
                    </label>
                  ))}
                  {exams.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Aucun examen trouvé pour ce patient
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du rapport
              </label>
              <input
                type="text"
                value={reportData.title}
                onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={reportData.templateId}
                onChange={(e) => setReportData(prev => ({ ...prev, templateId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Template par défaut</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
              {reportData.templateId && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Template sélectionné:</strong> {templates.find(t => t._id === reportData.templateId)?.name}
                  </p>
                  {templates.find(t => t._id === reportData.templateId)?.description && (
                    <p className="text-sm text-blue-600 mt-1">
                      {templates.find(t => t._id === reportData.templateId)?.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={reportData.format}
                  onChange={(e) => setReportData(prev => ({ ...prev, format: e.target.value as 'A4' | 'A5' | 'Letter' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <select
                  value={reportData.orientation}
                  onChange={(e) => setReportData(prev => ({ ...prev, orientation: e.target.value as 'portrait' | 'landscape' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Paysage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images par ligne: {reportData.layout.imagesPerRow}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={reportData.layout.imagesPerRow}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  layout: { ...prev.layout, imagesPerRow: parseInt(e.target.value) }
                }))}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Options d'affichage</h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportData.layout.includeHeader}
                  onChange={(e) => setReportData(prev => ({
                    ...prev,
                    layout: { ...prev.layout, includeHeader: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                />
                Inclure l'en-tête
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportData.layout.includeFooter}
                  onChange={(e) => setReportData(prev => ({
                    ...prev,
                    layout: { ...prev.layout, includeFooter: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                />
                Inclure le pied de page
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportData.layout.includePageNumbers}
                  onChange={(e) => setReportData(prev => ({
                    ...prev,
                    layout: { ...prev.layout, includePageNumbers: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                />
                Numéroter les pages
              </label>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                En-tête
              </label>
              <textarea
                value={reportData.content.header}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  content: { ...prev.content, header: e.target.value }
                }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="En-tête du rapport (titre, informations du cabinet, etc.)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Introduction
              </label>
              <textarea
                value={reportData.content.introduction}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  content: { ...prev.content, introduction: e.target.value }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Introduction du rapport..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observations
              </label>
              <textarea
                value={reportData.content.findings}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  content: { ...prev.content, findings: e.target.value }
                }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Observations et constatations..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conclusion
              </label>
              <textarea
                value={reportData.content.conclusion}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  content: { ...prev.content, conclusion: e.target.value }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Conclusion du rapport..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommandations
              </label>
              <textarea
                value={reportData.content.recommendations}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  content: { ...prev.content, recommendations: e.target.value }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Recommandations et suivi..."
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Sélectionnez les images à inclure
                </h3>
                <div className="flex items-center gap-3">
                  {loadingImages && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full mr-2"></div>
                      Chargement des images...
                    </div>
                  )}
                  {!loadingImages && reportData.examIds.length > 0 && (
                    <button
                      onClick={() => fetchImages(reportData.examIds)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      🔄 Recharger les images
                    </button>
                  )}
                </div>
              </div>

              {loadingImages ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-500">Chargement des images des examens...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                  {images.map((image) => (
                    <div key={image._id} className="relative">
                      <label className="block cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportData.imageIds.includes(image._id)}
                          onChange={() => handleImageToggle(image._id)}
                          className="absolute top-2 left-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded z-10"
                        />
                        <div className={`relative aspect-square border-2 rounded-lg overflow-hidden ${
                          reportData.imageIds.includes(image._id)
                            ? 'border-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          <Image
                            src={image.thumbnailUrl || image.url}
                            alt={image.originalName}
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        </div>
                      </label>
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        {image.originalName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {image.imageType}
                      </p>
                    </div>
                  ))}
                  {images.length === 0 && !loadingImages && (
                    <div className="col-span-full text-center py-8">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        {reportData.examIds.length === 0 
                          ? 'Sélectionnez d\'abord des examens à l\'étape 1'
                          : 'Aucune image disponible pour les examens sélectionnés'
                        }
                      </p>
                      {reportData.examIds.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400 space-y-1">
                          <p>Examens sélectionnés: {reportData.examIds.length}</p>
                          <p>IDs: {reportData.examIds.slice(0, 2).join(', ')}{reportData.examIds.length > 2 ? '...' : ''}</p>
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                console.log('Examens sélectionnés:', reportData.examIds)
                                console.log('Images chargées:', images)
                                fetchImages(reportData.examIds)
                              }}
                              className="block text-indigo-600 hover:text-indigo-800 underline"
                            >
                              🔍 Debug: Tester le chargement
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/debug/images')
                                  const data = await response.json()
                                  console.log('📊 Stats base de données:', data)
                                  alert(`Total images: ${data.stats.totalImages}, Total examens: ${data.stats.totalExams}`)
                                } catch (error) {
                                  console.error('Erreur debug:', error)
                                }
                              }}
                              className="block text-purple-600 hover:text-purple-800 underline"
                            >
                              📊 Stats base de données
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {reportData.imageIds.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Aperçu du rapport</h4>
                <dl className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Patient:</dt>
                    <dd className="text-gray-900">
                      {selectedPatient ? `${selectedPatient.nom} ${selectedPatient.prenom}` : 'Non sélectionné'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Examens:</dt>
                    <dd className="text-gray-900">{reportData.examIds.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Images:</dt>
                    <dd className="text-gray-900">{reportData.imageIds.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Format:</dt>
                    <dd className="text-gray-900">{reportData.format} {reportData.orientation}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Template:</dt>
                    <dd className="text-gray-900">
                      {reportData.templateId 
                        ? templates.find(t => t._id === reportData.templateId)?.name || 'Template personnalisé'
                        : 'Template par défaut'
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour aux rapports
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {editId ? 'Édition du rapport' : 'Nouveau rapport'}
        </h1>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  {stepIdx !== steps.length - 1 && (
                    <div className="h-0.5 w-full bg-gray-200" />
                  )}
                </div>
                <div
                  className={`relative w-8 h-8 flex items-center justify-center rounded-full ${
                    step.id === currentStep
                      ? 'bg-indigo-600 text-white'
                      : step.id < currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-500'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                  <span className="text-xs font-medium text-gray-500">
                    {step.name}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Précédent
        </button>

        {currentStep === steps.length ? (
          <button
            onClick={handleGenerateReport}
            disabled={!canProceed() || generating}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                {editId ? 'Mise à jour et régénération...' : 'Génération...'}
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                {editId ? 'Mettre à jour et régénérer' : 'Générer le rapport'}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </button>
        )}
      </div>
    </div>
  )
}