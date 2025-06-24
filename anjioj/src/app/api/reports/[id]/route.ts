import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Report from '@/lib/db/models/Report'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
    const report = await Report.findById(id)
      .populate([
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
          select: 'name email'
        }
      ])
    
    if (!report) {
      return NextResponse.json({ message: 'Rapport non trouvé' }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erreur GET /api/reports/[id]:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
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
      layout,
      status
    } = body

    const report = await Report.findById(id)
    if (!report) {
      return NextResponse.json({ message: 'Rapport non trouvé' }, { status: 404 })
    }

    // Mise à jour des champs
    if (title !== undefined) report.title = title
    if (patientId !== undefined) report.patientId = patientId
    if (examIds !== undefined) report.examIds = examIds
    if (imageIds !== undefined) report.imageIds = imageIds
    if (templateId !== undefined) report.templateId = templateId
    if (format !== undefined) report.format = format
    if (orientation !== undefined) report.orientation = orientation
    if (status !== undefined) report.status = status

    if (content) {
      report.content = {
        introduction: content.introduction || report.content.introduction,
        conclusion: content.conclusion || report.content.conclusion,
        findings: content.findings || report.content.findings,
        recommendations: content.recommendations || report.content.recommendations
      }
    }

    if (layout) {
      report.layout = {
        imagesPerRow: layout.imagesPerRow || report.layout.imagesPerRow,
        includeHeader: layout.includeHeader !== undefined ? layout.includeHeader : report.layout.includeHeader,
        includeFooter: layout.includeFooter !== undefined ? layout.includeFooter : report.layout.includeFooter,
        includePageNumbers: layout.includePageNumbers !== undefined ? layout.includePageNumbers : report.layout.includePageNumbers,
        margins: layout.margins || report.layout.margins
      }
    }

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

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erreur PUT /api/reports/[id]:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
    const report = await Report.findById(id)
    if (!report) {
      return NextResponse.json({ message: 'Rapport non trouvé' }, { status: 404 })
    }

    // TODO: Supprimer aussi le fichier PDF généré s'il existe
    if (report.metadata.filePath) {
      // Supprimer le fichier du système de fichiers
      // fs.unlinkSync(report.metadata.filePath)
    }

    await Report.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Rapport supprimé avec succès' })
  } catch (error) {
    console.error('Erreur DELETE /api/reports/[id]:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}