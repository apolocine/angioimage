import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { PatientService } from '@/lib/services/PatientService'
import { patientSchema } from '@/lib/utils/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const result = await PatientService.getPatients({
      page,
      limit,
      search
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur API patients:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
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
    const validatedData = await patientSchema.validate(body)

    const patient = await PatientService.createPatient({
      ...validatedData,
      createdBy: session.user.id
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error: any) {
    console.error('Erreur création patient:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}