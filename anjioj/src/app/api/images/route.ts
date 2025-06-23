import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { ImageService } from '@/lib/services/ImageService'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const examId = searchParams.get('examId') || ''
    const patientId = searchParams.get('patientId') || ''
    const type = searchParams.get('type') || ''

    const result = await ImageService.getImages({
      page,
      limit,
      search,
      examId: examId || undefined,
      patientId: patientId || undefined,
      type: type || undefined
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur API images:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}