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
    const { backupName } = body

    if (!backupName) {
      return NextResponse.json({ 
        message: 'Nom du backup requis' 
      }, { status: 400 })
    }

    // Vérifier que le backup existe
    const backupPath = path.join(process.cwd(), 'database', 'backup', backupName)
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ 
        message: 'Backup introuvable' 
      }, { status: 404 })
    }

    // Exécuter le script de restauration avec --force
    const scriptPath = path.join(process.cwd(), 'scripts', 'restore-db.js')
    
    try {
      const { stdout, stderr } = await execAsync(
        `node ${scriptPath} --force ${backupPath}`
      )
      
      if (stderr && !stderr.includes('DeprecationWarning')) {
        console.error('Erreur restauration:', stderr)
        return NextResponse.json({ 
          message: 'Erreur lors de la restauration', 
          error: stderr 
        }, { status: 500 })
      }

      // Log pour debug
      console.log('Restauration output:', stdout)

      return NextResponse.json({
        message: 'Base de données restaurée avec succès',
        details: stdout
      })
    } catch (error: any) {
      console.error('Erreur exec restore:', error)
      return NextResponse.json({ 
        message: 'Erreur lors de la restauration', 
        error: error.message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erreur restauration:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}