import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Patient from '@/lib/db/models/Patient'
import Exam from '@/lib/db/models/Exam'
import Image from '@/lib/db/models/Image'
import Report from '@/lib/db/models/Report'
import User from '@/lib/db/models/User'
import AppSettings from '@/lib/db/models/AppSettings'
import ReportTemplate from '@/lib/db/models/ReportTemplate'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    // Compter les documents dans chaque collection
    const [
      patientsCount,
      examsCount,
      imagesCount,
      reportsCount,
      usersCount,
      appSettingsCount,
      templatesCount
    ] = await Promise.all([
      Patient.countDocuments(),
      Exam.countDocuments(),
      Image.countDocuments(),
      Report.countDocuments(),
      User.countDocuments(),
      AppSettings.countDocuments(),
      ReportTemplate.countDocuments()
    ])

    // Calculer la taille totale des backups
    const backupDir = path.join(process.cwd(), 'database', 'backup')
    let totalSize = 0
    let totalBackups = 0
    let lastBackup = null

    if (fs.existsSync(backupDir)) {
      const entries = fs.readdirSync(backupDir, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== '.gitkeep') {
          totalBackups++
          
          const backupPath = path.join(backupDir, entry.name)
          const files = fs.readdirSync(backupPath)
          
          for (const file of files) {
            const filePath = path.join(backupPath, file)
            const stats = fs.statSync(filePath)
            totalSize += stats.size
          }
          
          // Trouver le dernier backup
          if (entry.name !== 'latest') {
            const timestamp = entry.name
            if (!lastBackup || timestamp > lastBackup) {
              lastBackup = timestamp
            }
          }
        }
      }
    }

    // Convertir le timestamp en date ISO si possible
    if (lastBackup) {
      try {
        lastBackup = new Date(lastBackup).toISOString()
      } catch (e) {}
    }

    return NextResponse.json({
      totalBackups,
      totalSize,
      lastBackup,
      collections: [
        { name: 'patients', count: patientsCount },
        { name: 'examens', count: examsCount },
        { name: 'images', count: imagesCount },
        { name: 'rapports', count: reportsCount },
        { name: 'utilisateurs', count: usersCount },
        { name: 'paramètres', count: appSettingsCount },
        { name: 'templates', count: templatesCount }
      ]
    })
  } catch (error) {
    console.error('Erreur stats backup:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}