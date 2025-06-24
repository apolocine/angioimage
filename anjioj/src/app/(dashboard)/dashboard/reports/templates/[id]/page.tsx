'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PhotoIcon,
  Cog6ToothIcon,
  PencilIcon,
  StarIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ReportTemplate {
  _id: string
  name: string
  description?: string
  category: string
  isDefault: boolean
  isActive: boolean
  layout: {
    format: string
    orientation: string
    imagesPerPage: number
    imagesPerRow: number
    margins: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  sections: any
  styling: any
  createdBy: {
    nom: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'general': 'Général',
    'angiography': 'Angiographie',
    'oct': 'OCT',
    'retinography': 'Rétinographie',
    'custom': 'Personnalisé'
  }
  return labels[category] || category
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'general': 'bg-gray-100 text-gray-800',
    'angiography': 'bg-blue-100 text-blue-800',
    'oct': 'bg-green-100 text-green-800',
    'retinography': 'bg-purple-100 text-purple-800',
    'custom': 'bg-orange-100 text-orange-800'
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

export default function TemplateViewPage() {
  const params = useParams()
  const templateId = params.id as string
  
  const [template, setTemplate] = useState<ReportTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch(`/api/reports/templates/${templateId}`)
        if (!response.ok) {
          throw new Error('Template non trouvé')
        }
        
        const data = await response.json()
        setTemplate(data)
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        setError('Erreur lors du chargement du template')
      } finally {
        setLoading(false)
      }
    }

    if (templateId) {
      loadTemplate()
    }
  }, [templateId])

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
        <PhotoIcon className="h-6 w-6 text-gray-400" />
      </div>
    ))

    return (
      <div className={`grid ${gridClass} w-full h-48 p-4 border rounded bg-white`}>
        {items}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Template non trouvé'}</p>
        <Link
          href="/dashboard/reports/templates"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour aux templates
        </Link>
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
          <Link
            href={`/dashboard/reports/templates/${template._id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Éditer
          </Link>
        </div>
      </div>

      {/* Template Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {template.name}
              </h1>
              {template.isDefault && (
                <StarIconSolid className="h-6 w-6 text-yellow-400 ml-3" />
              )}
            </div>
            <p className="mt-2 text-gray-600">
              {template.description || 'Aucune description'}
            </p>
          </div>
          <div className="ml-6">
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(template.category)}`}>
              {getCategoryLabel(template.category)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Créé le {new Date(template.createdAt).toLocaleDateString('fr-FR')}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <UserIcon className="h-4 w-4 mr-2" />
            Par {template.createdBy.nom}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            {template.isActive ? 'Actif' : 'Inactif'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration du layout */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <PhotoIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Layout des photos</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Aperçu ({template.layout.imagesPerPage} photo{template.layout.imagesPerPage > 1 ? 's' : ''} par page)
              </h3>
              {getLayoutPreview(template.layout.imagesPerPage)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Format:</span>
                <br />
                {template.layout.format}
              </div>
              <div>
                <span className="font-medium text-gray-700">Orientation:</span>
                <br />
                {template.layout.orientation === 'portrait' ? 'Portrait' : 'Paysage'}
              </div>
              <div>
                <span className="font-medium text-gray-700">Images par ligne:</span>
                <br />
                {template.layout.imagesPerRow}
              </div>
              <div>
                <span className="font-medium text-gray-700">Marges:</span>
                <br />
                {template.layout.margins.top}mm
              </div>
            </div>
          </div>
        </div>

        {/* Configuration des sections */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Cog6ToothIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Sections du rapport</h2>
          </div>

          <div className="space-y-3">
            {Object.entries(template.sections).map(([key, section]: [string, any]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    section.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {section.enabled ? 'Activée' : 'Désactivée'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Informations de style */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex items-center mb-6">
            <EyeIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Configuration du style</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Police</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Famille: {template.styling.fontFamily}</div>
                <div>Titre: {template.styling.fontSize.title}px</div>
                <div>En-tête: {template.styling.fontSize.heading}px</div>
                <div>Corps: {template.styling.fontSize.body}px</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Couleurs</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2 border"
                    style={{ backgroundColor: template.styling.colors.primary }}
                  />
                  <span className="text-sm text-gray-600">Primaire</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2 border"
                    style={{ backgroundColor: template.styling.colors.secondary }}
                  />
                  <span className="text-sm text-gray-600">Secondaire</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2 border"
                    style={{ backgroundColor: template.styling.colors.text }}
                  />
                  <span className="text-sm text-gray-600">Texte</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Espacement</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Entre sections: {template.styling.spacing.sectionGap}px</div>
                <div>Entre paragraphes: {template.styling.spacing.paragraphGap}px</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}