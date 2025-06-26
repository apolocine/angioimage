import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { description } = body

    // Exécuter le script de backup
    const scriptPath = path.join(process.cwd(), 'scripts', 'backup-db.js')
    
    try {
      const { stdout, stderr } = await execAsync(`node ${scriptPath}`)
      
      if (stderr && !stderr.includes('DeprecationWarning')) {
        console.error('Erreur backup:', stderr)
        return NextResponse.json({ 
          message: 'Erreur lors du backup', 
          error: stderr 
        }, { status: 500 })
      }

      // Extraire le nom du backup depuis la sortie
      const backupPathMatch = stdout.match(/Emplacement: (.+)/)
      let backupName = 'backup-' + new Date().toISOString().replace(/[:.]/g, '-')
      
      if (backupPathMatch) {
        backupName = path.basename(backupPathMatch[1])
      }

      // Ajouter la description au metadata si fournie
      if (description) {
        const backupPath = path.join(process.cwd(), 'database', 'backup', backupName)
        const metadataPath = path.join(backupPath, 'metadata.json')
        
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
          metadata.description = description
          fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
        }
      }

      return NextResponse.json({
        message: 'Backup créé avec succès',
        backup: {
          name: backupName,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error: any) {
      console.error('Erreur exec backup:', error)
      return NextResponse.json({ 
        message: 'Erreur lors du backup', 
        error: error.message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erreur création backup:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}