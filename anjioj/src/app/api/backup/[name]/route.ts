import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const { name } = await params
    
    // Empêcher la suppression du backup "latest"
    if (name === 'latest') {
      return NextResponse.json({ 
        message: 'Impossible de supprimer le dernier backup' 
      }, { status: 400 })
    }

    const backupPath = path.join(process.cwd(), 'database', 'backup', name)
    
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ 
        message: 'Backup introuvable' 
      }, { status: 404 })
    }

    // Supprimer le dossier et son contenu
    fs.rmSync(backupPath, { recursive: true, force: true })

    return NextResponse.json({
      message: 'Backup supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur suppression backup:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}