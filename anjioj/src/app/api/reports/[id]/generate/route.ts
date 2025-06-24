import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Report from '@/lib/db/models/Report'
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
        }
      ])
    
    if (!report) {
      return NextResponse.json({ message: 'Rapport non trouvé' }, { status: 404 })
    }

    // Récupérer les images du rapport
    const images = await Image.find({
      _id: { $in: report.imageIds }
    }).lean()

    // TODO: Implémenter la génération PDF
    // Ceci est un exemple simplifié - dans la réalité il faudrait:
    // 1. Générer le HTML du rapport avec les données
    // 2. Convertir en PDF avec puppeteer ou similaire
    // 3. Sauvegarder le fichier
    // 4. Mettre à jour le rapport avec les métadonnées

    // Simulation de génération PDF
    const pdfContent = await generatePdfContent(report, images)
    
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

async function generatePdfContent(report: any, images: any[]) {
  // Sécurité pour les données nulles/undefined
  const patient = report.patientId || {}
  const examens = report.examIds || []
  const content = report.content || {}
  const layout = report.layout || {}

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

  // Génération du contenu HTML pour un meilleur rendu
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rapport d'Examen Ophtalmologique</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .subtitle { font-size: 18px; color: #6b7280; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
    .patient-info { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .exam-item { background: #f3f4f6; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
    .image-grid { display: grid; grid-template-columns: repeat(${layout.imagesPerRow || 2}, 1fr); gap: 15px; margin: 20px 0; }
    .image-item { text-align: center; border: 1px solid #e5e7eb; padding: 10px; border-radius: 5px; }
    .metadata { font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">RAPPORT D'EXAMEN OPHTALMOLOGIQUE</div>
    <div class="subtitle">${report.title || 'Rapport sans titre'}</div>
  </div>

  <div class="section">
    <div class="section-title">INFORMATIONS PATIENT</div>
    <div class="patient-info">
      <strong>Nom :</strong> ${patient.nom || 'Non renseigné'} ${patient.prenom || ''}<br>
      <strong>Date de naissance :</strong> ${patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}<br>
      <strong>Âge :</strong> ${patient.dateNaissance ? calculateAge(patient.dateNaissance) : 'Non calculable'}<br>
      <strong>Date du rapport :</strong> ${new Date().toLocaleDateString('fr-FR')}
    </div>
  </div>

  ${content.introduction ? `
  <div class="section">
    <div class="section-title">INTRODUCTION</div>
    <p>${content.introduction}</p>
  </div>
  ` : ''}

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

  ${content.findings ? `
  <div class="section">
    <div class="section-title">OBSERVATIONS CLINIQUES</div>
    <p>${content.findings}</p>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">IMAGES INCLUSES (${images.length})</div>
    ${images.length > 0 ? `
    <div class="image-grid">
      ${images.map((img: any) => `
      <div class="image-item">
        <div style="height: 150px; background: #f3f4f6; border: 1px dashed #d1d5db; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
          <span style="color: #6b7280; font-size: 12px;">Image : ${img.imageType || 'Type inconnu'}</span>
        </div>
        <div style="font-size: 11px; color: #374151;">${img.originalName || 'Sans nom'}</div>
      </div>
      `).join('')}
    </div>
    ` : '<p><em>Aucune image incluse dans ce rapport.</em></p>'}
  </div>

  ${content.conclusion ? `
  <div class="section">
    <div class="section-title">CONCLUSION</div>
    <p>${content.conclusion}</p>
  </div>
  ` : ''}

  ${content.recommendations ? `
  <div class="section">
    <div class="section-title">RECOMMANDATIONS</div>
    <p>${content.recommendations}</p>
  </div>
  ` : ''}

  <div class="metadata">
    Rapport généré automatiquement par Angioimage<br>
    Format : ${report.format || 'A4'} • ${report.orientation || 'Portrait'}<br>
    Configuration : ${layout.imagesPerRow || 2} images par ligne<br>
    Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
  </div>
</body>
</html>`

  return htmlContent.trim()
}