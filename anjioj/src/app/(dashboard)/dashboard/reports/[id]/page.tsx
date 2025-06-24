'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  DocumentIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  DocumentTextIcon
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
}

interface Template {
  _id: string
  name: string
  description: string
  category: string
  isDefault: boolean
}

interface Report {
  _id: string
  title: string
  patientId: Patient
  examIds: Exam[]
  imageIds: string[]
  templateId?: Template
  status: 'draft' | 'final' | 'archived'
  format: string
  orientation: string
  content: {
    introduction?: string
    conclusion?: string
    findings?: string
    recommendations?: string
  }
  layout: {
    imagesPerRow: number
    includeHeader: boolean
    includeFooter: boolean
    includePageNumbers: boolean
  }
  metadata: {
    generatedAt?: string
    generatedBy?: {
      name: string
      email: string
    } | null
    pageCount?: number
    fileSize?: number
    filePath?: string
  }
  createdAt: string
  updatedAt: string
}

export default function ReportViewerPage() {
  const params = useParams()
  const reportId = params.id as string
  
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [loadingPdf, setLoadingPdf] = useState(false)

  useEffect(() => {
    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      if (!response.ok) {
        throw new Error('Rapport non trouvé')
      }
      const data = await response.json()
      setReport(data)
      
      // Si le rapport a déjà été généré, charger le PDF
      if (data.metadata.filePath) {
        setPdfUrl(`/api/reports/${reportId}/download`)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePdf = async () => {
    setLoadingPdf(true)
    try {
      const response = await fetch(`/api/reports/${reportId}/generate`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPdfUrl(`/api/reports/${reportId}/download`)
        // Rafraîchir les données du rapport
        fetchReport()
      } else {
        throw new Error('Erreur lors de la génération du PDF')
      }
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setLoadingPdf(false)
    }
  }

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        window.location.href = '/dashboard/reports'
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression du rapport')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      final: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      draft: 'Brouillon',
      final: 'Final',
      archived: 'Archivé'
    }
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
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
      <div className="flex items-center justify-center min-h-96">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux rapports
          </Link>
        </div>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Rapport non trouvé'}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour aux rapports
        </Link>
        
        <div className="mt-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {report.patientId.nom} {report.patientId.prenom}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDate(report.createdAt)}
              </div>
              <div>
                {getStatusBadge(report.status)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {!pdfUrl ? (
              <button
                onClick={handleGeneratePdf}
                disabled={loadingPdf}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loadingPdf ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    Générer PDF
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Télécharger
                </button>
                
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Imprimer
                </button>
              </>
            )}
            
            <Link
              href={`/dashboard/reports/generator?edit=${report._id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Éditer
            </Link>
            
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewer PDF */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Aperçu du rapport</h2>
            </div>
            <div className="p-4">
              {pdfUrl ? (
                <div className="w-full" style={{ height: '700px' }}>
                  <iframe
                    src={`${pdfUrl}#toolbar=1`}
                    className="w-full h-full border border-gray-300 rounded"
                    title="Aperçu du rapport PDF"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <DocumentIcon className="h-16 w-16 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Rapport non généré
                  </h3>
                  <p className="text-center mb-6">
                    Le PDF de ce rapport n'a pas encore été généré.
                    Cliquez sur "Générer PDF" pour créer le document.
                  </p>
                  <button
                    onClick={handleGeneratePdf}
                    disabled={loadingPdf}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loadingPdf ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <DocumentIcon className="h-4 w-4 mr-2" />
                        Générer PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations du rapport */}
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              Informations générales
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Patient</dt>
                <dd className="text-gray-900 font-medium">
                  {report.patientId.nom} {report.patientId.prenom}
                </dd>
                <dd className="text-gray-500">
                  Né(e) le {new Date(report.patientId.dateNaissance).toLocaleDateString('fr-FR')}
                </dd>
              </div>
              
              <div>
                <dt className="text-gray-500">Format</dt>
                <dd className="text-gray-900">
                  {report.format} • {report.orientation}
                </dd>
              </div>
              
              <div>
                <dt className="text-gray-500">Examens inclus</dt>
                <dd className="text-gray-900">{report.examIds.length}</dd>
              </div>
              
              <div>
                <dt className="text-gray-500">Images incluses</dt>
                <dd className="text-gray-900">{report.imageIds.length}</dd>
              </div>
              
              <div>
                <dt className="text-gray-500">Créé par</dt>
                <dd className="text-gray-900">
                  {report.metadata.generatedBy?.name || 'Utilisateur inconnu'}
                </dd>
              </div>
              
              <div>
                <dt className="text-gray-500">Créé le</dt>
                <dd className="text-gray-900">{formatDate(report.createdAt)}</dd>
              </div>
              
              {report.metadata.generatedAt && (
                <div>
                  <dt className="text-gray-500">PDF généré le</dt>
                  <dd className="text-gray-900">{formatDate(report.metadata.generatedAt)}</dd>
                </div>
              )}
              
              {report.metadata.pageCount && (
                <div>
                  <dt className="text-gray-500">Nombre de pages</dt>
                  <dd className="text-gray-900">{report.metadata.pageCount}</dd>
                </div>
              )}
              
              {report.metadata.fileSize && (
                <div>
                  <dt className="text-gray-500">Taille du fichier</dt>
                  <dd className="text-gray-900">{formatFileSize(report.metadata.fileSize)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Examens */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Examens inclus
            </h3>
            <div className="space-y-3">
              {report.examIds.map((exam) => (
                <div key={exam._id} className="border border-gray-200 rounded p-3">
                  <div className="font-medium text-gray-900">
                    {exam.type} - {exam.oeil}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(exam.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {exam.indication}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Images par ligne</dt>
                <dd className="text-gray-900">{report.layout.imagesPerRow}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">En-tête</dt>
                <dd className="text-gray-900">{report.layout.includeHeader ? 'Oui' : 'Non'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Pied de page</dt>
                <dd className="text-gray-900">{report.layout.includeFooter ? 'Oui' : 'Non'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Numérotation</dt>
                <dd className="text-gray-900">{report.layout.includePageNumbers ? 'Oui' : 'Non'}</dd>
              </div>
            </dl>
          </div>

          {/* Template actuel */}
          {report.templateId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Template
              </h3>
              <div className="space-y-2">
                <div>
                  <dt className="text-gray-500 text-sm">Nom</dt>
                  <dd className="text-gray-900 font-medium">{report.templateId.name}</dd>
                </div>
                {report.templateId.description && (
                  <div>
                    <dt className="text-gray-500 text-sm">Description</dt>
                    <dd className="text-gray-900 text-sm">{report.templateId.description}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500 text-sm">Catégorie</dt>
                  <dd className="text-gray-900 text-sm capitalize">{report.templateId.category}</dd>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  Pour changer le template, utilisez le bouton "Éditer" ci-dessus
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}