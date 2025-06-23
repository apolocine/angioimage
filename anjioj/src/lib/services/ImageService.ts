import dbConnect from '@/lib/db/mongodb'
import { Image, Exam } from '@/lib/db/models'
import { IImage } from '@/lib/db/models/Image'
import { StorageService } from './StorageService'

export interface CreateImageData {
  examenId: string
  buffer: Buffer
  originalName: string
  mimeType: string
  uploadedBy: string
  angiography?: {
    phase?: 'precoce' | 'intermediaire' | 'tardive'
    timeFromInjection?: number
    fluoresceinVisible?: boolean
    quality?: 'excellente' | 'bonne' | 'moyenne' | 'mauvaise'
  }
}

export interface PaginationOptions {
  page: number
  limit: number
  search?: string
  examId?: string
  patientId?: string
  type?: string
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export class ImageService {
  static async uploadImage(data: CreateImageData): Promise<IImage> {
    await dbConnect()

    // Vérifier que l'examen existe
    const exam = await Exam.findById(data.examenId)
    if (!exam) {
      throw new Error('Examen non trouvé')
    }

    // Valider le type et la taille du fichier
    if (!StorageService.isValidImageType(data.mimeType)) {
      throw new Error('Type de fichier non supporté')
    }

    if (!StorageService.isValidImageSize(data.buffer.length)) {
      throw new Error('Fichier trop volumineux (max 50MB)')
    }

    try {
      // Sauvegarder le fichier physique
      const uploadResult = await StorageService.saveImage(
        data.buffer,
        data.originalName,
        {
          patientId: exam.patientId.toString(),
          examId: data.examenId,
          generateThumbnail: true
        }
      )

      // Extraire les métadonnées de l'image
      const imageMetadata = await StorageService.getImageMetadata(data.buffer)

      // Créer l'enregistrement en base
      const image = new Image({
        examenId: data.examenId,
        filename: uploadResult.filename,
        originalName: data.originalName,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        mimeType: data.mimeType,
        size: uploadResult.size,
        dimensions: uploadResult.dimensions,
        metadata: {
          medical: {
            modality: exam.type,
            acquisitionTime: new Date()
          },
          ...imageMetadata && {
            format: imageMetadata.format,
            density: imageMetadata.density,
            hasProfile: imageMetadata.hasProfile,
            hasAlpha: imageMetadata.hasAlpha
          }
        },
        processing: {
          isProcessed: false,
          edits: [],
          annotations: []
        },
        angiography: data.angiography,
        status: 'ready',
        uploadedBy: data.uploadedBy
      })

      await image.save()
      return image.toJSON()
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error)
      throw error
    }
  }

  static async getImages(options: PaginationOptions): Promise<PaginatedResult<IImage>> {
    await dbConnect()
    
    const { page = 1, limit = 20, search = '', examId, patientId, type } = options
    const skip = (page - 1) * limit

    let query: any = {}
    
    // Filtres
    if (examId) {
      query.examenId = examId
    }

    if (patientId) {
      // Rechercher les examens du patient
      const exams = await Exam.find({ patientId }).select('_id')
      const examIds = exams.map(exam => exam._id)
      query.examenId = { $in: examIds }
    }

    if (type) {
      query['metadata.medical.modality'] = type
    }

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { filename: { $regex: search, $options: 'i' } }
      ]
    }

    const [images, total] = await Promise.all([
      Image.find(query)
        .populate({
          path: 'examenId',
          populate: {
            path: 'patientId',
            select: 'nom prenom'
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Image.countDocuments(query)
    ])

    return {
      data: images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async getImageById(id: string): Promise<IImage | null> {
    await dbConnect()
    
    const image = await Image.findById(id)
      .populate({
        path: 'examenId',
        populate: {
          path: 'patientId',
          select: 'nom prenom'
        }
      })
      .lean()
    
    return image
  }

  static async updateImage(id: string, data: Partial<IImage>): Promise<IImage | null> {
    await dbConnect()
    
    const image = await Image.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean()
    
    return image
  }

  static async deleteImage(id: string): Promise<boolean> {
    await dbConnect()
    
    try {
      const image = await Image.findById(id)
      if (!image) {
        return false
      }

      // Supprimer le fichier physique
      await StorageService.deleteImage(image.filename)
      
      // Supprimer l'enregistrement en base
      await Image.findByIdAndDelete(id)
      
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error)
      throw error
    }
  }

  static async addAnnotation(
    imageId: string, 
    annotation: {
      type: 'arrow' | 'circle' | 'text' | 'measurement'
      coordinates: { x: number; y: number; x2?: number; y2?: number }
      text?: string
      color?: string
      createdBy: string
    }
  ): Promise<IImage | null> {
    await dbConnect()
    
    const image = await Image.findByIdAndUpdate(
      imageId,
      { 
        $push: { 
          'processing.annotations': {
            ...annotation,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).lean()
    
    return image
  }

  static async getImagesByExam(examId: string): Promise<IImage[]> {
    await dbConnect()
    
    const images = await Image.find({ examenId: examId })
      .sort({ createdAt: 1 })
      .lean()
    
    return images
  }

  static async getStatistics() {
    await dbConnect()
    
    const stats = await Image.aggregate([
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' },
          byStatus: {
            $push: '$status'
          },
          byType: {
            $push: '$metadata.medical.modality'
          }
        }
      }
    ])

    return stats[0] || {
      totalImages: 0,
      totalSize: 0,
      avgSize: 0,
      byStatus: [],
      byType: []
    }
  }
}