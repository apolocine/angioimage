import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

export interface UploadResult {
  filename: string
  url: string
  thumbnailUrl?: string
  size: number
  dimensions: {
    width: number
    height: number
  }
  mimeType: string
}

export class StorageService {
  private static uploadDir = path.join(process.cwd(), 'public', 'uploads')
  private static imagesDir = path.join(this.uploadDir, 'images')
  private static thumbnailsDir = path.join(this.uploadDir, 'thumbnails')

  static async init() {
    // Créer les dossiers s'ils n'existent pas
    await this.ensureDirectoryExists(this.uploadDir)
    await this.ensureDirectoryExists(this.imagesDir)
    await this.ensureDirectoryExists(this.thumbnailsDir)
  }

  private static async ensureDirectoryExists(dirPath: string) {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
    }
  }

  static async saveImage(
    buffer: Buffer, 
    originalName: string,
    options: {
      patientId?: string
      examId?: string
      generateThumbnail?: boolean
    } = {}
  ): Promise<UploadResult> {
    await this.init()

    // Générer un nom de fichier unique
    const ext = path.extname(originalName).toLowerCase()
    const baseName = path.basename(originalName, ext)
    const timestamp = Date.now()
    const filename = `${baseName}_${timestamp}${ext}`
    
    const imagePath = path.join(this.imagesDir, filename)
    const imageUrl = `/uploads/images/${filename}`

    // Optimiser et sauvegarder l'image
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    // Optimiser selon le type d'image
    let optimizedImage = image
    if (ext === '.jpg' || ext === '.jpeg') {
      optimizedImage = image.jpeg({ quality: 90, progressive: true })
    } else if (ext === '.png') {
      optimizedImage = image.png({ compressionLevel: 6 })
    } else if (ext === '.webp') {
      optimizedImage = image.webp({ quality: 90 })
    }

    await optimizedImage.toFile(imagePath)

    const result: UploadResult = {
      filename,
      url: imageUrl,
      size: (await fs.stat(imagePath)).size,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      },
      mimeType: this.getMimeType(ext)
    }

    // Générer une miniature si demandé
    if (options.generateThumbnail) {
      const thumbnailFilename = `thumb_${filename}`
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename)
      
      await image
        .resize(300, 300, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath)
      
      result.thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`
    }

    return result
  }

  static async deleteImage(filename: string) {
    try {
      const imagePath = path.join(this.imagesDir, filename)
      await fs.unlink(imagePath)
      
      // Supprimer aussi la miniature si elle existe
      const thumbnailFilename = `thumb_${filename}`
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename)
      try {
        await fs.unlink(thumbnailPath)
      } catch {
        // Ignore si la miniature n'existe pas
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error)
      throw error
    }
  }

  private static getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff'
    }
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
  }

  static async getImageMetadata(buffer: Buffer) {
    try {
      const image = sharp(buffer)
      const metadata = await image.metadata()
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        density: metadata.density,
        hasProfile: metadata.hasProfile,
        hasAlpha: metadata.hasAlpha
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction des métadonnées:', error)
      return null
    }
  }

  static isValidImageType(mimeType: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ]
    return validTypes.includes(mimeType.toLowerCase())
  }

  static isValidImageSize(size: number): boolean {
    const maxSize = 50 * 1024 * 1024 // 50MB
    return size <= maxSize
  }
}