import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { ImageService } from '@/lib/services/ImageService'

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

    return NextResponse.json(image)
  } catch (error) {
    console.error('Erreur récupération image:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userRole = session.user?.role
    if (!['admin', 'doctor'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    
    const resolvedParams = await params
    const image = await ImageService.updateImage(resolvedParams.id, body)
    
    if (!image) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 })
    }

    return NextResponse.json(image)
  } catch (error) {
    console.error('Erreur mise à jour image:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seuls les admins et docteurs peuvent supprimer
    if (!['admin', 'doctor'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const resolvedParams = await params
    const deleted = await ImageService.deleteImage(resolvedParams.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Image supprimée avec succès' })
  } catch (error) {
    console.error('Erreur suppression image:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}