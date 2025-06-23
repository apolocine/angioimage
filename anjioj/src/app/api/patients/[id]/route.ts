import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { PatientService } from '@/lib/services/PatientService'
import { patientSchema } from '@/lib/utils/validation'

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
    const patient = await PatientService.getPatientById(resolvedParams.id)
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Erreur récupération patient:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
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

    const body = await request.json()
    const validatedData = await patientSchema.validate(body)
    
    // Convert null values to undefined for optional fields
    const cleanedData: any = {
      ...validatedData,
      email: validatedData.email || undefined,
      telephone: validatedData.telephone || undefined,
      adresse: validatedData.adresse ? {
        rue: validatedData.adresse.rue || undefined,
        ville: validatedData.adresse.ville || undefined,
        codePostal: validatedData.adresse.codePostal || undefined,
        pays: validatedData.adresse.pays || undefined
      } : undefined,
      dossierMedical: validatedData.dossierMedical ? {
        numeroSecu: validatedData.dossierMedical.numeroSecu || undefined,
        medecin: validatedData.dossierMedical.medecin || undefined,
        antecedents: validatedData.dossierMedical.antecedents || undefined,
        allergies: validatedData.dossierMedical.allergies || undefined,
        traitements: validatedData.dossierMedical.traitements || undefined
      } : undefined
    }

    const resolvedParams = await params
    const patient = await PatientService.updatePatient(resolvedParams.id, cleanedData)
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error: any) {
    console.error('Erreur mise à jour patient:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seuls les admins peuvent supprimer
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const resolvedParams = await params
    const deleted = await PatientService.deletePatient(resolvedParams.id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Patient supprimé avec succès' })
  } catch (error) {
    console.error('Erreur suppression patient:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}