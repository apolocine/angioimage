import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { ImageService } from '@/lib/services/ImageService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier les permissions
    const userRole = session.user?.role
    if (!['admin', 'doctor', 'assistant'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const examId = formData.get('examId') as string
    const phase = formData.get('phase') as string
    const timeFromInjection = formData.get('timeFromInjection') as string
    const fluoresceinVisible = formData.get('fluoresceinVisible') as string
    const quality = formData.get('quality') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (!examId) {
      return NextResponse.json({ error: 'ID d\'examen requis' }, { status: 400 })
    }

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Préparer les données d'angiographie si fournies
    const angiographyData: any = {}
    if (phase) angiographyData.phase = phase
    if (timeFromInjection) angiographyData.timeFromInjection = parseInt(timeFromInjection)
    if (fluoresceinVisible) angiographyData.fluoresceinVisible = fluoresceinVisible === 'true'
    if (quality) angiographyData.quality = quality

    const image = await ImageService.uploadImage({
      examenId: examId,
      buffer,
      originalName: file.name,
      mimeType: file.type,
      uploadedBy: session.user.id,
      angiography: Object.keys(angiographyData).length > 0 ? angiographyData : undefined
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error: any) {
    console.error('Erreur upload image:', error)
    
    if (error.message.includes('non trouvé') || error.message.includes('non supporté') || error.message.includes('trop volumineux')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}