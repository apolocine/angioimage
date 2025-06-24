import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import ReportTemplate from '@/lib/db/models/ReportTemplate'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    // Construction de la requête
    const query: any = {}
    
    if (category) {
      query.category = category
    }
    
    if (active !== null) {
      query.isActive = active === 'true'
    }

    const templates = await ReportTemplate.find(query)
      .sort({ isDefault: -1, name: 1 })
      .lean()

    return NextResponse.json({
      data: templates
    })
  } catch (error) {
    console.error('Erreur GET /api/reports/templates:', error)
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
      name,
      description,
      category,
      isDefault,
      layout,
      sections,
      styling
    } = body

    // Validation des données
    if (!name || !category) {
      return NextResponse.json(
        { message: 'Nom et catégorie obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier l'unicité du nom
    const existingTemplate = await ReportTemplate.findOne({ name })
    if (existingTemplate) {
      return NextResponse.json(
        { message: 'Un template avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Si on définit comme défaut, retirer le défaut des autres templates de la même catégorie
    if (isDefault) {
      await ReportTemplate.updateMany(
        { category, isDefault: true },
        { isDefault: false }
      )
    }

    const templateData = {
      name,
      description: description || '',
      category,
      isDefault: isDefault || false,
      isActive: true,
      layout: layout || {
        format: 'A4',
        orientation: 'portrait',
        imagesPerRow: 2,
        margins: { top: 25, right: 25, bottom: 25, left: 25 }
      },
      sections: sections || {
        header: { enabled: true, content: 'Rapport d\'Examen Ophtalmologique', height: 60 },
        footer: { enabled: true, content: 'Page {{pageNumber}} sur {{totalPages}}', height: 30 },
        patientInfo: { enabled: true, position: 'top', fields: ['nom', 'prenom', 'dateNaissance', 'age'] },
        examInfo: { enabled: true, includeDetails: true },
        introduction: { enabled: true },
        images: { enabled: true, showMetadata: true, groupByExam: true },
        findings: { enabled: true },
        conclusion: { enabled: true },
        recommendations: { enabled: false }
      },
      styling: styling || {
        fontFamily: 'Arial, sans-serif',
        fontSize: { title: 18, heading: 14, body: 11, caption: 9 },
        colors: { primary: '#2563eb', secondary: '#64748b', text: '#1f2937', background: '#ffffff' },
        spacing: { sectionGap: 15, paragraphGap: 8 }
      },
      createdBy: session.user.id
    }

    const template = new ReportTemplate(templateData)
    await template.save()

    // Populate les références pour la réponse
    await template.populate({
      path: 'createdBy',
      select: 'nom email'
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/reports/templates:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}