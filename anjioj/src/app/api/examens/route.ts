import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import { Exam } from '@/lib/db/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('Tentative de connexion à la base de données...')
    await dbConnect()
    console.log('Connexion à la base de données réussie')

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construction de la requête
    const query: any = {}
    
    if (type) {
      query.type = type
    }
    
    if (patientId) {
      query.patientId = patientId
    }
    
    if (status) {
      query.status = status
    }

    console.log('Recherche d\'examens avec query:', query)
    const exams = await Exam.find(query)
      .populate('patientId', 'nom prenom email dateNaissance')
      .populate('praticien', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(offset)
      .lean()

    console.log('Examens trouvés:', exams.length)
    const totalCount = await Exam.countDocuments(query)

    return NextResponse.json({
      data: exams,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: totalCount > offset + exams.length
      }
    })
  } catch (error) {
    console.error('Erreur récupération examens:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier les permissions
    const userRole = session.user?.role
    if (!['admin', 'doctor'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    
    await dbConnect()

    const exam = new Exam({
      ...body,
      createdBy: session.user.id,
      praticien: session.user.id,
      status: body.status || 'planifie'
    })

    await exam.save()
    
    const populatedExam = await Exam.findById(exam._id)
      .populate('patientId', 'nom prenom email')
      .populate('praticien', 'name email')
      .lean()

    return NextResponse.json(populatedExam, { status: 201 })
  } catch (error: any) {
    console.error('Erreur création examen:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}