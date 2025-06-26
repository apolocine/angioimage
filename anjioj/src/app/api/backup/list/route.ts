import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const backupDir = path.join(process.cwd(), 'database', 'backup')
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Lister tous les dossiers de backup
    const entries = fs.readdirSync(backupDir, { withFileTypes: true })
    const backups = []

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== '.gitkeep') {
        const backupPath = path.join(backupDir, entry.name)
        const metadataPath = path.join(backupPath, 'metadata.json')
        
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
            
            // Calculer la taille totale du backup
            let totalSize = 0
            let documentCount = 0
            const collections = []
            
            const files = fs.readdirSync(backupPath)
            for (const file of files) {
              if (file.endsWith('.json') && file !== 'metadata.json') {
                const filePath = path.join(backupPath, file)
                const stats = fs.statSync(filePath)
                totalSize += stats.size
                
                const collectionName = path.basename(file, '.json')
                collections.push(collectionName)
                
                // Compter les documents
                try {
                  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
                  documentCount += Array.isArray(data) ? data.length : 0
                } catch (e) {}
              }
            }
            
            backups.push({
              name: entry.name,
              timestamp: metadata.timestamp || new Date(entry.name).toISOString(),
              size: totalSize,
              collections: collections,
              documentCount: documentCount,
              isLatest: entry.name === 'latest'
            })
          } catch (error) {
            console.error(`Erreur lecture metadata pour ${entry.name}:`, error)
          }
        }
      }
    }

    // Trier par date décroissante
    backups.sort((a, b) => {
      if (a.isLatest) return -1
      if (b.isLatest) return 1
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    return NextResponse.json({ backups })
  } catch (error) {
    console.error('Erreur liste backups:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}