import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Report from '@/lib/db/models/Report'
import ReportTemplate from '@/lib/db/models/ReportTemplate'
import Image from '@/lib/db/models/Image'
import path from 'path'
import fs from 'fs'

// Note: Pour une implémentation complète, il faudrait installer des packages comme:
// - puppeteer (génération PDF)
// - @react-pdf/renderer (alternative React)
// - jsPDF (génération côté client)

export async function POST(
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
          select: 'name layout sections styling'
        }
      ])
    
    if (!report) {
      return NextResponse.json({ message: 'Rapport non trouvé' }, { status: 404 })
    }

    // Récupérer les images du rapport
    const images = await Image.find({
      _id: { $in: report.imageIds }
    }).lean()
    
    // Charger les images en base64 pour les inclure dans le HTML
    const imagesWithBase64 = await Promise.all(images.map(async (img: any) => {
      try {
        // Pour l'instant, utiliser un placeholder
        // En production, il faudrait récupérer l'image réelle
        const placeholderSvg = generateImagePlaceholder(img.imageType, img.originalName)
        return {
          ...img,
          base64: placeholderSvg
        }
      } catch (error) {
        console.error('Erreur chargement image:', error)
        return {
          ...img,
          base64: null
        }
      }
    }))

    // TODO: Implémenter la génération PDF
    // Ceci est un exemple simplifié - dans la réalité il faudrait:
    // 1. Générer le HTML du rapport avec les données
    // 2. Convertir en PDF avec puppeteer ou similaire
    // 3. Sauvegarder le fichier
    // 4. Mettre à jour le rapport avec les métadonnées

    // Simulation de génération PDF avec template
    const pdfContent = await generatePdfContent(report, imagesWithBase64)
    
    // Créer le répertoire de stockage s'il n'existe pas
    const reportsDir = path.join(process.cwd(), 'storage', 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Nom du fichier PDF
    const filename = `rapport-${report._id}-${Date.now()}.pdf`
    const filePath = path.join(reportsDir, filename)

    // TODO: Remplacer par la vraie génération PDF
    // Pour l'instant, on crée juste un fichier texte
    fs.writeFileSync(filePath, pdfContent)

    // Mettre à jour le rapport avec les métadonnées
    report.metadata.generatedAt = new Date()
    report.metadata.filePath = filePath
    report.metadata.fileSize = fs.statSync(filePath).size
    report.metadata.pageCount = Math.ceil(images.length / report.layout.imagesPerRow) + 2 // Estimation
    report.status = 'final'

    await report.save()

    return NextResponse.json({
      message: 'PDF généré avec succès',
      metadata: {
        filename,
        fileSize: report.metadata.fileSize,
        pageCount: report.metadata.pageCount
      }
    })
  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return NextResponse.json({ message: 'Erreur lors de la génération PDF' }, { status: 500 })
  }
}

function generateImagePlaceholder(imageType: string, filename: string) {
  const typeLabels: Record<string, string> = {
    'fond_oeil_normal': 'Fond d\'œil normal',
    'fond_oeil_rouge': 'Fond d\'œil rouge',
    'angiographie_fluoresceine': 'Angiographie',
    'oct': 'OCT',
    'retinographie': 'Rétinographie'
  }
  
  const typeColors: Record<string, string> = {
    'fond_oeil_normal': '#fef3c7',
    'fond_oeil_rouge': '#fee2e2',
    'angiographie_fluoresceine': '#dbeafe',
    'oct': '#dcfce7',
    'retinographie': '#f3e8ff'
  }
  
  const label = typeLabels[imageType] || 'Image'
  const bgColor = typeColors[imageType] || '#e5e7eb'
  
  const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <circle cx="150" cy="130" r="60" fill="none" stroke="#6b7280" stroke-width="2"/>
    <text x="150" y="200" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#374151">${label}</text>
    <text x="150" y="220" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#6b7280">${filename || 'Image'}</text>
  </svg>`
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

async function generatePdfContent(report: any, images: any[]) {
  // Sécurité pour les données nulles/undefined
  const patient = report.patientId || {}
  const examens = report.examIds || []
  const content = report.content || {}
  
  // Utiliser le template s'il est défini, sinon utiliser les valeurs par défaut
  const template = report.templateId || {}
  const templateLayout = template.layout || {}
  const templateSections = template.sections || {}
  const templateStyling = template.styling || {}
  
  // Combiner les layouts (template prioritaire)
  const layout = {
    imagesPerPage: templateLayout.imagesPerPage || report.layout?.imagesPerRow || 2,
    imagesPerRow: templateLayout.imagesPerRow || report.layout?.imagesPerRow || 2,
    format: templateLayout.format || report.format || 'A4',
    orientation: templateLayout.orientation || report.orientation || 'portrait',
    margins: templateLayout.margins || report.layout?.margins || { top: 20, right: 20, bottom: 20, left: 20 },
    includeHeader: templateSections.header?.enabled !== false ? (report.layout?.includeHeader !== false) : false,
    includeFooter: templateSections.footer?.enabled !== false ? (report.layout?.includeFooter !== false) : false,
    includePageNumbers: report.layout?.includePageNumbers !== false
  }

  // Calculer l'âge du patient
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Non renseigné'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age + ' ans'
  }

  // Styles basés sur le template
  const fontFamily = templateStyling.fontFamily || 'Arial, sans-serif'
  const colors = templateStyling.colors || {
    primary: '#2563eb',
    secondary: '#64748b', 
    text: '#1f2937',
    background: '#ffffff'
  }
  const fontSize = templateStyling.fontSize || {
    title: 24,
    heading: 16,
    body: 12,
    caption: 10
  }
  const spacing = templateStyling.spacing || {
    sectionGap: 25,
    paragraphGap: 15
  }

  // Déterminer les colonnes de grille selon imagesPerPage
  const getGridColumns = (imagesPerPage: number) => {
    switch (imagesPerPage) {
      case 1: return 1
      case 2: return 1 // 2 images verticalement
      case 4: return 2 // grille 2x2
      case 6: return 2 // grille 2x3
      default: return layout.imagesPerRow || 2
    }
  }

  // Génération du contenu HTML avec template
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${template.name ? `${template.name} - ` : ''}Rapport d'Examen Ophtalmologique</title>
  <style>
    body { 
      font-family: ${fontFamily}; 
      margin: ${layout.margins.top}px ${layout.margins.right}px ${layout.margins.bottom}px ${layout.margins.left}px; 
      color: ${colors.text}; 
      background: ${colors.background};
      font-size: ${fontSize.body}px;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid ${colors.primary}; 
      padding-bottom: 20px; 
      margin-bottom: ${spacing.sectionGap}px; 
    }
    .title { 
      font-size: ${fontSize.title}px; 
      font-weight: bold; 
      color: ${colors.text}; 
      margin-bottom: 10px; 
    }
    .subtitle { 
      font-size: ${fontSize.heading}px; 
      color: ${colors.secondary}; 
    }
    .section { 
      margin-bottom: ${spacing.sectionGap}px; 
    }
    .section-title { 
      font-size: ${fontSize.heading}px; 
      font-weight: bold; 
      color: ${colors.text}; 
      border-bottom: 1px solid #e5e7eb; 
      padding-bottom: 5px; 
      margin-bottom: ${spacing.paragraphGap}px; 
    }
    .patient-info { 
      background: #f9fafb; 
      padding: 15px; 
      border-radius: 8px; 
      margin-bottom: 20px; 
    }
    .exam-item { 
      background: #f3f4f6; 
      padding: 10px; 
      margin-bottom: 10px; 
      border-radius: 5px; 
    }
    .image-grid { 
      display: grid; 
      grid-template-columns: repeat(${getGridColumns(layout.imagesPerPage)}, 1fr); 
      gap: 15px; 
      margin: 20px 0; 
    }
    .image-item { 
      text-align: center; 
      border: 1px solid #e5e7eb; 
      padding: 10px; 
      border-radius: 5px; 
    }
    .metadata { 
      font-size: ${fontSize.caption}px; 
      color: ${colors.secondary}; 
      text-align: center; 
      margin-top: 30px; 
      border-top: 1px solid #e5e7eb; 
      padding-top: 15px; 
    }
    .template-info {
      font-size: ${fontSize.caption}px;
      color: ${colors.secondary};
      font-style: italic;
    }
  </style>
</head>
<body>
  ${layout.includeHeader ? `<div class="header">` : '<div>'}
    <div class="title">RAPPORT D'EXAMEN OPHTALMOLOGIQUE</div>
    <div class="subtitle">${report.title || 'Rapport sans titre'}</div>
  </div>

  ${templateSections.patientInfo?.enabled !== false ? `
  <div class="section">
    <div class="section-title">INFORMATIONS PATIENT</div>
    <div class="patient-info">
      <strong>Nom :</strong> ${patient.nom || 'Non renseigné'} ${patient.prenom || ''}<br>
      <strong>Date de naissance :</strong> ${patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}<br>
      <strong>Âge :</strong> ${patient.dateNaissance ? calculateAge(patient.dateNaissance) : 'Non calculable'}<br>
      <strong>Date du rapport :</strong> ${new Date().toLocaleDateString('fr-FR')}
      ${template.name ? `<br><span class="template-info">Template utilisé: ${template.name}</span>` : ''}
    </div>
  </div>
  ` : ''}

  ${templateSections.introduction?.enabled !== false && content.introduction ? `
  <div class="section">
    <div class="section-title">INTRODUCTION</div>
    <p>${content.introduction}</p>
  </div>
  ` : ''}

  ${templateSections.examInfo?.enabled !== false ? `
  <div class="section">
    <div class="section-title">EXAMENS RÉALISÉS (${examens.length})</div>
    ${examens.map((exam: any) => `
    <div class="exam-item">
      <strong>${exam.type || 'Type non précisé'}</strong> - ${exam.oeil || 'Œil non précisé'}<br>
      <em>Date :</em> ${exam.date ? new Date(exam.date).toLocaleDateString('fr-FR') : 'Non renseignée'}<br>
      <em>Indication :</em> ${exam.indication || 'Non précisée'}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${templateSections.findings?.enabled !== false && content.findings ? `
  <div class="section">
    <div class="section-title">OBSERVATIONS CLINIQUES</div>
    <p>${content.findings}</p>
  </div>
  ` : ''}

  ${templateSections.images?.enabled !== false ? `
  <div class="section">
    <div class="section-title">IMAGES INCLUSES (${images.length})</div>
    ${images.length > 0 ? `
    <div class="image-grid">
      ${images.map((img: any) => `
      <div class="image-item">
        ${img.base64 ? `
          <img src="${img.base64}" style="width: 100%; height: 200px; object-fit: contain; margin-bottom: 8px; border: 1px solid #e5e7eb; border-radius: 5px;" />
        ` : `
          <div style="height: 200px; background: #f3f4f6; border: 1px dashed #d1d5db; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <span style="color: #6b7280; font-size: 12px;">Image : ${img.imageType || 'Type inconnu'}</span>
          </div>
        `}
        <div style="font-size: 11px; color: #374151; text-align: center;">${img.originalName || 'Sans nom'}</div>
      </div>
      `).join('')}
    </div>
    ` : '<p><em>Aucune image incluse dans ce rapport.</em></p>'}
  </div>
  ` : ''}

  ${templateSections.conclusion?.enabled !== false && content.conclusion ? `
  <div class="section">
    <div class="section-title">CONCLUSION</div>
    <p>${content.conclusion}</p>
  </div>
  ` : ''}

  ${templateSections.recommendations?.enabled !== false && content.recommendations ? `
  <div class="section">
    <div class="section-title">RECOMMANDATIONS</div>
    <p>${content.recommendations}</p>
  </div>
  ` : ''}

  ${layout.includeFooter ? `
  <div class="metadata">
    Rapport généré automatiquement par Angioimage<br>
    Format : ${layout.format} • ${layout.orientation}<br>
    Configuration : ${layout.imagesPerPage} photo${layout.imagesPerPage > 1 ? 's' : ''} par page ${template.name ? `• Template: ${template.name}` : ''}<br>
    Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
  </div>
  ` : ''}
</body>
</html>`

  return htmlContent.trim()
}