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

    const resolvedParams = await params
    await dbConnect()

    const exam = await Exam.findById(resolvedParams.id)
      .populate('patientId', 'nom prenom email dateNaissance')
      .populate('praticien', 'name email')
      .lean()
    
    if (!exam) {
      return NextResponse.json({ error: 'Examen non trouvé' }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error('Erreur récupération examen:', error)
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

    // Vérifier les permissions
    const userRole = session.user?.role
    if (!['admin', 'doctor'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const resolvedParams = await params
    const body = await request.json()
    
    await dbConnect()

    const exam = await Exam.findByIdAndUpdate(
      resolvedParams.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('patientId', 'nom prenom email')
     .populate('praticien', 'name email')
     .lean()

    if (!exam) {
      return NextResponse.json({ error: 'Examen non trouvé' }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error: any) {
    console.error('Erreur mise à jour examen:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
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

    // Vérifier les permissions - seuls admin et docteur peuvent supprimer
    const userRole = session.user?.role
    if (!['admin', 'doctor'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const resolvedParams = await params
    await dbConnect()

    const exam = await Exam.findByIdAndDelete(resolvedParams.id)
    
    if (!exam) {
      return NextResponse.json({ error: 'Examen non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Examen supprimé avec succès' })
  } catch (error) {
    console.error('Erreur suppression examen:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}