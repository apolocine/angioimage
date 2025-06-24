'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PhotoIcon,
  Cog6ToothIcon,
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

// Schema de validation
const templateSchema = yup.object({
  name: yup.string().required('Nom obligatoire').min(3, 'Minimum 3 caractères'),
  description: yup.string().default(''),
  category: yup.string().required('Catégorie obligatoire'),
  imagesPerPage: yup.number().required('Layout obligatoire').oneOf([1, 2, 4, 6], 'Layout non valide'),
  format: yup.string().required('Format obligatoire'),
  orientation: yup.string().required('Orientation obligatoire'),
  isDefault: yup.boolean().default(false)
})

interface FormData {
  name: string
  description: string
  category: string
  imagesPerPage: number
  format: string
  orientation: string
  isDefault: boolean
}

const photoLayouts = [
  { value: 1, label: '1 photo par page', description: 'Photo grande taille', preview: '█' },
  { value: 2, label: '2 photos par page', description: 'Photos moyennes', preview: '██' },
  { value: 4, label: '4 photos par page', description: 'Photos petites en grille 2x2', preview: '████' },
  { value: 6, label: '6 photos par page', description: 'Photos petites en grille 2x3', preview: '██████' }
]

const categories = [
  { value: 'angiography', label: 'Angiographie' },
  { value: 'retinography', label: 'Rétinographie' },
  { value: 'general', label: 'Général' },
  { value: 'custom', label: 'Personnalisé' }
]

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [loadingTemplate, setLoadingTemplate] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(templateSchema),
    defaultValues: {
      imagesPerPage: 2,
      format: 'A4',
      orientation: 'portrait',
      isDefault: false
    }
  })

  const watchedValues = watch()

  // Charger le template existant
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch(`/api/reports/templates/${templateId}`)
        if (!response.ok) {
          throw new Error('Template non trouvé')
        }
        
        const template = await response.json()
        
        // Pré-remplir le formulaire
        setValue('name', template.name)
        setValue('description', template.description || '')
        setValue('category', template.category)
        setValue('imagesPerPage', template.layout.imagesPerPage || template.layout.imagesPerRow)
        setValue('format', template.layout.format)
        setValue('orientation', template.layout.orientation)
        setValue('isDefault', template.isDefault)
        
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        setMessage({ 
          type: 'error', 
          text: 'Erreur lors du chargement du template' 
        })
      } finally {
        setLoadingTemplate(false)
      }
    }

    if (templateId) {
      loadTemplate()
    }
  }, [templateId, setValue])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setMessage(null)

    try {
      const templateData = {
        name: data.name,
        description: data.description,
        category: data.category,
        isDefault: data.isDefault,
        layout: {
          format: data.format,
          orientation: data.orientation,
          imagesPerPage: data.imagesPerPage,
          imagesPerRow: data.imagesPerPage === 1 ? 1 : data.imagesPerPage === 2 ? 2 : data.imagesPerPage === 4 ? 2 : 2,
          margins: { top: 25, right: 25, bottom: 25, left: 25 }
        },
        sections: {
          header: { enabled: true, content: 'Rapport d\'Examen Ophtalmologique', height: 60 },
          footer: { enabled: true, content: 'Page {{pageNumber}} sur {{totalPages}}', height: 30 },
          patientInfo: { enabled: true, position: 'top', fields: ['nom', 'prenom', 'dateNaissance', 'age'] },
          examInfo: { enabled: true, includeDetails: true },
          introduction: { enabled: true },
          images: { enabled: true, showMetadata: true, groupByExam: true },
          findings: { enabled: true },
          conclusion: { enabled: true },
          recommendations: { enabled: false }
        },
        styling: {
          fontFamily: 'Arial, sans-serif',
          fontSize: { title: 18, heading: 14, body: 11, caption: 9 },
          colors: { primary: '#2563eb', secondary: '#64748b', text: '#1f2937', background: '#ffffff' },
          spacing: { sectionGap: 15, paragraphGap: 8 }
        }
      }

      const response = await fetch(`/api/reports/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la mise à jour')
      }

      setMessage({ type: 'success', text: 'Template mis à jour avec succès' })
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/dashboard/reports/templates')
      }, 2000)

    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
      })
    } finally {
      setLoading(false)
    }
  }

  const getLayoutPreview = (imagesPerPage: number) => {
    const gridClass = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 gap-2',
      4: 'grid-cols-2 gap-1',
      6: 'grid-cols-2 gap-1'
    }[imagesPerPage] || 'grid-cols-2'

    const itemCount = imagesPerPage
    const items = Array.from({ length: itemCount }, (_, i) => (
      <div key={i} className="bg-gray-200 rounded aspect-square flex items-center justify-center">
        <PhotoIcon className="h-4 w-4 text-gray-400" />
      </div>
    ))

    return (
      <div className={`grid ${gridClass} w-full h-32 p-2 border rounded bg-white`}>
        {items}
      </div>
    )
  }

  if (loadingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/reports/templates"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux templates
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {previewMode ? 'Édition' : 'Aperçu'}
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Éditer le template</h1>
        <p className="mt-1 text-sm text-gray-600">
          Modifiez les paramètres de votre template de rapport
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations générales */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du template *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ex: Rapport Angiographie Standard"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Description du template..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isDefault')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Template par défaut pour cette catégorie
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Layout des photos */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <PhotoIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Layout des photos</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {photoLayouts.map((layout) => (
                  <label
                    key={layout.value}
                    className={`relative block p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      watchedValues.imagesPerPage === layout.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('imagesPerPage')}
                      value={layout.value}
                      className="sr-only"
                    />
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-mono">
                          {layout.preview}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {layout.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {layout.description}
                        </div>
                      </div>
                    </div>
                    {watchedValues.imagesPerPage === layout.value && (
                      <div className="absolute top-2 right-2">
                        <CheckIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Configuration page */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <Cog6ToothIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Configuration de la page</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format de page
                  </label>
                  <select
                    {...register('format')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="Letter">Letter (8.5 × 11 in)</option>
                    <option value="Legal">Legal (8.5 × 14 in)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orientation
                  </label>
                  <select
                    {...register('orientation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Paysage</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <Link
                href="/dashboard/reports/templates"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </div>

        {/* Aperçu */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu du layout</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  {watchedValues.imagesPerPage} photo{watchedValues.imagesPerPage > 1 ? 's' : ''} par page
                </div>
                {getLayoutPreview(watchedValues.imagesPerPage)}
              </div>

              <div className="text-sm text-gray-500">
                <div>Format: {watchedValues.format}</div>
                <div>Orientation: {watchedValues.orientation === 'portrait' ? 'Portrait' : 'Paysage'}</div>
                <div>Catégorie: {categories.find(c => c.value === watchedValues.category)?.label || 'Non sélectionnée'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}