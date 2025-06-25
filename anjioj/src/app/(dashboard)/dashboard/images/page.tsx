'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  PhotoIcon
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
    patientId?: {
      nom: string
      prenom: string
    }
  }
  angiography?: {
    phase?: string
    quality?: string
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  useEffect(() => {
    fetchImages()
  }, [pagination.page, search, typeFilter])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter })
      })
      
      const response = await fetch(`/api/images?${params}`)
      const data = await response.json()
      
      setImages(data.data || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchImages()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchImages()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleSelectImage = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(images.map(img => img._id))
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

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Images</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos images médicales et examens
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/images/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Télécharger des images
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Filtres et recherche */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom de fichier..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Tous les types</option>
                <option value="angiographie">Angiographie</option>
                <option value="retinographie">Rétinographie</option>
                <option value="oct">OCT</option>
              </select>
              
              <button
                type="submit"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 inline-flex items-center"
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filtrer
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : (
          <>
            {/* Actions de groupe */}
            {images.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedImages.length === images.length && images.length > 0}
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
                    <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                      Supprimer la sélection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Grille d'images */}
            {images.length === 0 ? (
              <div className="p-12 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune image</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par télécharger des images d'examens.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/images/upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Télécharger des images
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
                {images.map((image) => (
                  <div key={image._id} className="relative group bg-gray-50 rounded-lg overflow-hidden">
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image._id)}
                        onChange={() => handleSelectImage(image._id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="aspect-square relative">
                      <Image
                        src={image.thumbnailUrl || image.url}
                        alt={image.originalName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                      />
                      
                      {/* Overlay d'informations */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/images/${image._id}`}
                            className="p-2 bg-white/95 rounded-full hover:bg-white shadow-lg backdrop-blur-sm"
                          >
                            <EyeIcon className="h-4 w-4 text-gray-700" />
                          </Link>
                          <Link
                            href={`/dashboard/images/${image._id}/edit`}
                            className="p-2 bg-white/95 rounded-full hover:bg-white shadow-lg backdrop-blur-sm"
                          >
                            <PencilIcon className="h-4 w-4 text-gray-700" />
                          </Link>
                          <button
                            onClick={() => handleDelete(image._id)}
                            className="p-2 bg-red-500/95 rounded-full hover:bg-red-500 shadow-lg backdrop-blur-sm"
                          >
                            <TrashIcon className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations */}
                    <div className="p-3">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {image.originalName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {image.examenId?.patientId ? 
                          `${image.examenId.patientId.nom} ${image.examenId.patientId.prenom}` : 
                          'Patient inconnu'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {image.dimensions.width} × {image.dimensions.height}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(image.size)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(image.createdAt)}
                      </div>
                      
                      {/* Badge du type d'examen */}
                      {image.examenId?.type && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {image.examenId.type}
                          </span>
                        </div>
                      )}
                      
                      {/* Badge de phase angiographie */}
                      {image.angiography?.phase && (
                        <div className="mt-1">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {image.angiography.phase}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} sur {pagination.pages} ({pagination.total} image{pagination.total > 1 ? 's' : ''})
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}