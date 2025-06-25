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
          path: 'templateId',
          select: 'name description category isDefault'
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
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
    const body = await request.json()
    console.log('PUT /api/reports/[id] - Session user:', session.user)
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

    // Construire l'objet de mise à jour
    const updateData: any = {}
    const unsetData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (patientId !== undefined) updateData.patientId = patientId
    if (examIds !== undefined) updateData.examIds = examIds
    if (imageIds !== undefined) updateData.imageIds = imageIds
    if (format !== undefined) updateData.format = format
    if (orientation !== undefined) updateData.orientation = orientation
    if (status !== undefined) updateData.status = status
    
    // Gérer templateId
    if (templateId !== undefined && templateId !== '' && templateId !== null) {
      updateData.templateId = templateId
    } else if (templateId === '' || templateId === null) {
      unsetData.templateId = 1
    }
    
    // Gérer le contenu
    if (content) {
      updateData['content.header'] = content.header
      updateData['content.introduction'] = content.introduction
      updateData['content.conclusion'] = content.conclusion
      updateData['content.findings'] = content.findings
      updateData['content.recommendations'] = content.recommendations
    }
    
    // Gérer le layout
    if (layout) {
      if (layout.imagesPerRow !== undefined) updateData['layout.imagesPerRow'] = layout.imagesPerRow
      if (layout.includeHeader !== undefined) updateData['layout.includeHeader'] = layout.includeHeader
      if (layout.includeFooter !== undefined) updateData['layout.includeFooter'] = layout.includeFooter
      if (layout.includePageNumbers !== undefined) updateData['layout.includePageNumbers'] = layout.includePageNumbers
      
      // Gérer les marges
      if (layout.margins) {
        updateData['layout.margins.top'] = layout.margins.top || 20
        updateData['layout.margins.right'] = layout.margins.right || 20
        updateData['layout.margins.bottom'] = layout.margins.bottom || 20
        updateData['layout.margins.left'] = layout.margins.left || 20
      }
    }
    
    // S'assurer que metadata.generatedBy existe
    updateData['metadata.generatedBy'] = session.user.id

    // Construire la requête de mise à jour
    const updateQuery: any = { $set: updateData }
    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData
    }

    // Mettre à jour le document
    const report = await Report.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true, runValidators: true }
    )
    
    if (!report) {
      return NextResponse.json({ message: 'Rapport non trouvé' }, { status: 404 })
    }

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
        path: 'templateId',
        select: 'name description category'
      },
      {
        path: 'metadata.generatedBy',
        select: 'name email'
      }
    ])

    return NextResponse.json(report)
  } catch (error: any) {
    console.error('Erreur PUT /api/reports/[id]:', error)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }))
      console.error('Erreurs de validation:', validationErrors)
      return NextResponse.json({ 
        message: 'Erreur de validation', 
        errors: validationErrors 
      }, { status: 400 })
    }
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
    const body = await request.json()
    
    // Pour PATCH, on ne met à jour que les champs fournis
    const updateData: any = {}
    const unsetData: any = {}
    
    // Gérer templateId spécifiquement
    if ('templateId' in body) {
      if (body.templateId && body.templateId !== '') {
        updateData.templateId = body.templateId
      } else {
        unsetData.templateId = 1
      }
    }
    
    // Ajouter d'autres champs si fournis
    Object.keys(body).forEach(key => {
      if (key !== 'templateId' && body[key] !== undefined) {
        updateData[key] = body[key]
      }
    })
    
    // Construire la requête de mise à jour
    const updateQuery: any = {}
    if (Object.keys(updateData).length > 0) {
      updateQuery.$set = updateData
    }
    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData
    }

    // Mettre à jour le document
    const report = await Report.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true, runValidators: true }
    )
    
    if (!report) {
      return NextResponse.json({ message: 'Rapport non trouvé' }, { status: 404 })
    }

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
        path: 'templateId',
        select: 'name description category'
      },
      {
        path: 'metadata.generatedBy',
        select: 'name email'
      }
    ])

    return NextResponse.json(report)
  } catch (error: any) {
    console.error('Erreur PATCH /api/reports/[id]:', error)
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