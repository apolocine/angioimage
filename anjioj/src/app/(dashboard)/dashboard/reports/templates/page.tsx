'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  Square3Stack3DIcon,
  StarIcon,
  DocumentDuplicateIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ReportTemplate {
  _id: string
  name: string
  description?: string
  category: 'general' | 'angiography' | 'oct' | 'retinography' | 'custom'
  isDefault: boolean
  isActive: boolean
  layout: {
    format: string
    orientation: string
    imagesPerPage: number
    imagesPerRow: number
  }
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

export default function ReportTemplatesPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports/templates')
      const data = await response.json()
      if (response.ok) {
        setTemplates(data.data || [])
      } else {
        console.error('Erreur lors du chargement des templates:', data.message)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      const response = await fetch(`/api/reports/templates/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchTemplates()
      } else {
        console.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleToggleDefault = async (id: string, isDefault: boolean) => {
    try {
      const response = await fetch(`/api/reports/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isDefault: !isDefault })
      })
      
      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDuplicate = async (template: ReportTemplate) => {
    try {
      const response = await fetch('/api/reports/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...template,
          name: `${template.name} (Copie)`,
          isDefault: false,
          _id: undefined,
          createdAt: undefined,
          updatedAt: undefined
        })
      })
      
      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      general: 'Général',
      angiography: 'Angiographie',
      oct: 'OCT',
      retinography: 'Rétinographie',
      custom: 'Personnalisé'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      angiography: 'bg-green-100 text-green-800',
      oct: 'bg-purple-100 text-purple-800',
      retinography: 'bg-yellow-100 text-yellow-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredTemplates = templates.filter(template =>
    filter === '' || template.category === filter
  )

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux rapports
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Templates de rapports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos modèles de rapports personnalisés
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/reports/templates/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouveau template
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1 text-sm rounded-full border ${
              filter === ''
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tous
          </button>
          {['general', 'angiography', 'oct', 'retinography', 'custom'].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === category
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {template.name}
                      </h3>
                      {template.isDefault && (
                        <StarIconSolid className="h-4 w-4 text-yellow-400 ml-2" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {template.description || 'Aucune description'}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCategoryColor(template.category)}`}>
                      {getCategoryLabel(template.category)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Square3Stack3DIcon className="h-4 w-4 mr-2" />
                    {template.layout.format} • {template.layout.orientation} • {template.layout.imagesPerPage || template.layout.imagesPerRow} photos/page
                  </div>
                  <div className="text-sm text-gray-500">
                    Créé par {template.createdBy.nom} • {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleDefault(template._id, template.isDefault)}
                      className={`p-1 rounded ${template.isDefault ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      title={template.isDefault ? 'Retirer le défaut' : 'Définir par défaut'}
                    >
                      {template.isDefault ? (
                        <StarIconSolid className="h-4 w-4" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Dupliquer"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/reports/templates/${template._id}`}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    
                    <Link
                      href={`/dashboard/reports/templates/${template._id}/edit`}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Éditer"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun template trouvé
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter 
                  ? `Aucun template dans la catégorie "${getCategoryLabel(filter)}"`
                  : 'Commencez par créer votre premier template de rapport.'
                }
              </p>
              {!filter && (
                <div className="mt-6">
                  <Link
                    href="/dashboard/reports/templates/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouveau template
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}