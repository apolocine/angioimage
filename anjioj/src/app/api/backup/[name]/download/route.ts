import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { Readable } from 'stream'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const { name } = await params
    const backupPath = path.join(process.cwd(), 'database', 'backup', name)
    
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ 
        message: 'Backup introuvable' 
      }, { status: 404 })
    }

    // Créer une archive zip du backup
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression maximale
    })

    const chunks: Uint8Array[] = []
    
    // Créer un stream pour collecter les données
    archive.on('data', (chunk) => chunks.push(chunk))
    
    // Attendre la fin de l'archive
    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      archive.on('error', reject)
    })

    // Ajouter le dossier de backup à l'archive
    archive.directory(backupPath, false)
    archive.finalize()

    const buffer = await archivePromise

    // Retourner le fichier zip
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${name}.zip"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Erreur téléchargement backup:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}