import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import { Exam } from '@/lib/db/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const resolvedParams = await params
    const exams = await Exam.find({ patientId: resolvedParams.id })
      .populate('patientId', 'nom prenom')
      .sort({ date: -1 })
      .lean()

    return NextResponse.json({ data: exams })
  } catch (error) {
    console.error('Erreur récupération examens:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const exam = new Exam({
      ...body,
      patientId: resolvedParams.id,
      createdBy: session.user.id,
      praticien: session.user.id
    })

    await exam.save()
    
    const populatedExam = await Exam.findById(exam._id)
      .populate('patientId', 'nom prenom')
      .populate('praticien', 'name')
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