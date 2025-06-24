import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import ReportTemplate from '@/lib/db/models/ReportTemplate'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const template = await ReportTemplate.findById(id)
    if (!template) {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erreur GET /api/reports/templates/[id]:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const {
      name,
      description,
      category,
      isDefault,
      isActive,
      layout,
      sections,
      styling
    } = body

    const template = await ReportTemplate.findById(id)
    if (!template) {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 })
    }

    // Vérifier l'unicité du nom (sauf pour le template actuel)
    if (name && name !== template.name) {
      const existingTemplate = await ReportTemplate.findOne({ 
        name, 
        _id: { $ne: id } 
      })
      if (existingTemplate) {
        return NextResponse.json(
          { message: 'Un template avec ce nom existe déjà' },
          { status: 400 }
        )
      }
    }

    // Si on définit comme défaut, retirer le défaut des autres templates de la même catégorie
    if (isDefault && !template.isDefault) {
      await ReportTemplate.updateMany(
        { 
          category: category || template.category, 
          isDefault: true,
          _id: { $ne: id }
        },
        { isDefault: false }
      )
    }

    // Mise à jour des champs
    if (name !== undefined) template.name = name
    if (description !== undefined) template.description = description
    if (category !== undefined) template.category = category
    if (isDefault !== undefined) template.isDefault = isDefault
    if (isActive !== undefined) template.isActive = isActive
    if (layout !== undefined) template.layout = { ...template.layout, ...layout }
    if (sections !== undefined) template.sections = { ...template.sections, ...sections }
    if (styling !== undefined) template.styling = { ...template.styling, ...styling }

    await template.save()

    // Populate les références pour la réponse
    await template.populate({
      path: 'createdBy',
      select: 'nom email'
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erreur PUT /api/reports/templates/[id]:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const template = await ReportTemplate.findById(id)
    
    if (!template) {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 })
    }

    // Mise à jour partielle (utilisé pour des actions comme toggle default)
    Object.keys(body).forEach(key => {
      if (key === 'isDefault' && body[key] && !template.isDefault) {
        // Si on active le défaut, désactiver les autres de la même catégorie
        ReportTemplate.updateMany(
          { 
            category: template.category, 
            isDefault: true,
            _id: { $ne: id }
          },
          { isDefault: false }
        ).exec()
      }
      template[key as keyof typeof template] = body[key]
    })

    await template.save()

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erreur PATCH /api/reports/templates/[id]:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const template = await ReportTemplate.findById(id)
    if (!template) {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 })
    }

    // Empêcher la suppression des templates par défaut
    if (template.isDefault) {
      return NextResponse.json(
        { message: 'Impossible de supprimer un template par défaut' },
        { status: 400 }
      )
    }

    await ReportTemplate.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Template supprimé avec succès' })
  } catch (error) {
    console.error('Erreur DELETE /api/reports/templates/[id]:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}