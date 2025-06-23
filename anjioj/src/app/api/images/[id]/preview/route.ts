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

    // Récupérer le fichier thumbnail ou l'image complète si pas de thumbnail
    const imageUrl = image.thumbnailUrl || image.url
    
    try {
      const imageBuffer = await StorageService.getImageBuffer(imageUrl)
      
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': image.mimeType,
          'Cache-Control': 'public, max-age=31536000',
          'Content-Length': imageBuffer.length.toString(),
        },
      })
    } catch (fileError) {
      console.error('Erreur lecture fichier image:', fileError)
      
      // Retourner une image placeholder en cas d'erreur
      const placeholderSvg = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#f3f4f6"/>
          <text x="100" y="100" text-anchor="middle" dy=".35em" font-family="Arial" font-size="14" fill="#6b7280">
            Image non disponible
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
    console.error('Erreur récupération preview image:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}