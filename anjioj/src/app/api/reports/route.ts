import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Report from '@/lib/db/models/Report'
import Patient from '@/lib/db/models/Patient'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const examId = searchParams.get('examId') || ''

    // Construction de la requête
    const query: any = {}
    
    if (status) {
      query.status = status
    }
    
    if (examId) {
      query.examIds = examId
    }

    if (search) {
      // Recherche dans le titre ou le nom du patient
      const patients = await Patient.find({
        $or: [
          { nom: { $regex: search, $options: 'i' } },
          { prenom: { $regex: search, $options: 'i' } }
        ]
      }).select('_id')
      
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { patientId: { $in: patients.map(p => p._id) } }
      ]
    }

    // Pagination
    const skip = (page - 1) * limit
    
    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query)
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })
  } catch (error) {
    console.error('Erreur GET /api/reports:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const {
      title,
      patientId,
      examIds,
      imageIds,
      templateId,
      format,
      orientation,
      content,
      layout
    } = body

    // Validation des données
    if (!title || !patientId || !examIds?.length) {
      return NextResponse.json(
        { message: 'Données manquantes (titre, patient, examens)' },
        { status: 400 }
      )
    }

    // Vérifier que le patient existe
    const patient = await Patient.findById(patientId)
    if (!patient) {
      return NextResponse.json({ message: 'Patient non trouvé' }, { status: 404 })
    }

    // Créer le rapport
    const reportData = {
      title,
      patientId,
      examIds: examIds || [],
      imageIds: imageIds || [],
      templateId: templateId || undefined,
      format: format || 'A4',
      orientation: orientation || 'portrait',
      content: {
        header: content?.header || '',
        introduction: content?.introduction || '',
        conclusion: content?.conclusion || '',
        findings: content?.findings || '',
        recommendations: content?.recommendations || ''
      },
      layout: {
        imagesPerRow: layout?.imagesPerRow || 2,
        includeHeader: layout?.includeHeader !== false,
        includeFooter: layout?.includeFooter !== false,
        includePageNumbers: layout?.includePageNumbers !== false,
        margins: layout?.margins || {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      status: 'draft',
      metadata: {
        generatedBy: session.user.id
      }
    }

    const report = new Report(reportData)
    await report.save()

    // Populate les références pour la réponse
    await report.populate([
      {
        path: 'patientId',
        select: 'nom prenom dateNaissance'
      },
      {
        path: 'examIds',
        select: 'type date oeil indication'
      },
      {
        path: 'metadata.generatedBy',
        select: 'nom email'
      }
    ])

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/reports:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}