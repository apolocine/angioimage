import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Report from '@/lib/db/models/Report'
import fs from 'fs'
import path from 'path'

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
    if (!report) {
      return NextResponse.json({ message: 'Rapport non trouvé' }, { status: 404 })
    }

    if (!report.metadata.filePath || !fs.existsSync(report.metadata.filePath)) {
      return NextResponse.json({ message: 'Fichier PDF non trouvé' }, { status: 404 })
    }

    // Lire le fichier
    const fileBuffer = fs.readFileSync(report.metadata.filePath)
    const filename = path.basename(report.metadata.filePath)

    // Déterminer le type MIME - pour l'instant on traite tout comme HTML
    const content = fileBuffer.toString('utf-8')
    const mimeType = 'text/html'

    // Retourner le fichier HTML
    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename.replace('.pdf', '.html'))}"`,
      },
    })
  } catch (error) {
    console.error('Erreur téléchargement PDF:', error)
    return NextResponse.json({ message: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}