import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { ImageService } from '@/lib/services/ImageService'
import { StorageService } from '@/lib/services/StorageService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const resolvedParams = await params
    const image = await ImageService.getImageById(resolvedParams.id)
    
    if (!image) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 })
    }

    // Récupérer l'image complète
    try {
      const imageBuffer = await StorageService.getImageBuffer(image.url)
      
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': image.mimeType,
          'Cache-Control': 'public, max-age=31536000',
          'Content-Length': imageBuffer.length.toString(),
          'Content-Disposition': `inline; filename="${image.originalName || image.filename}"`,
        },
      })
    } catch (fileError) {
      console.error('Erreur lecture fichier image:', fileError)
      
      // Retourner une image placeholder en cas d'erreur
      const placeholderSvg = `
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="600" fill="#f3f4f6"/>
          <text x="400" y="300" text-anchor="middle" dy=".35em" font-family="Arial" font-size="24" fill="#6b7280">
            Image non disponible
          </text>
          <text x="400" y="340" text-anchor="middle" dy=".35em" font-family="Arial" font-size="16" fill="#9ca3af">
            ${image.originalName || image.filename}
          </text>
        </svg>
      `
      
      return new NextResponse(placeholderSvg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache',
        },
      })
    }
  } catch (error) {
    console.error('Erreur récupération image complète:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}