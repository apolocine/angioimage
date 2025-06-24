import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Patient from '@/lib/db/models/Patient'
import Exam from '@/lib/db/models/Exam'
import Image from '@/lib/db/models/Image'
import Report from '@/lib/db/models/Report'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    // Calculer les dates pour "aujourd'hui"
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Calculer les dates pour "cette semaine" (pour les changements)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - 7)

    // Exécuter toutes les requêtes en parallèle
    const [
      totalPatients,
      patientsLastWeek,
      examsToday,
      examsLastWeek,
      totalImages,
      imagesLastWeek,
      totalReports,
      reportsLastWeek,
      recentExams
    ] = await Promise.all([
      // Total patients
      Patient.countDocuments(),
      
      // Patients créés la semaine dernière (pour calculer le changement)
      Patient.countDocuments({ 
        createdAt: { 
          $gte: startOfWeek, 
          $lt: startOfDay 
        } 
      }),
      
      // Examens d'aujourd'hui
      Exam.countDocuments({ 
        date: { 
          $gte: startOfDay, 
          $lt: endOfDay 
        } 
      }),
      
      // Examens de la semaine dernière
      Exam.countDocuments({ 
        date: { 
          $gte: startOfWeek, 
          $lt: startOfDay 
        } 
      }),
      
      // Total images traitées (status ready)
      Image.countDocuments({ 
        status: 'ready' 
      }),
      
      // Images traitées la semaine dernière
      Image.countDocuments({ 
        status: 'ready',
        updatedAt: { 
          $gte: startOfWeek, 
          $lt: startOfDay 
        } 
      }),
      
      // Total rapports générés
      Report.countDocuments({ 
        status: 'final' 
      }),
      
      // Rapports générés la semaine dernière
      Report.countDocuments({ 
        status: 'final',
        'metadata.generatedAt': { 
          $gte: startOfWeek, 
          $lt: startOfDay 
        } 
      }),
      
      // Examens récents (les 5 derniers)
      Exam.find()
        .populate('patientId', 'nom prenom')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ])

    // Calculer les pourcentages de changement
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%'
      const change = ((current - previous) / previous) * 100
      return change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`
    }

    // Préparer les statistiques avec changements
    const stats = [
      {
        name: 'Total Patients',
        value: totalPatients.toString(),
        change: calculateChange(totalPatients, totalPatients - patientsLastWeek),
        changeType: patientsLastWeek >= 0 ? 'positive' : 'negative'
      },
      {
        name: 'Examens du jour',
        value: examsToday.toString(),
        change: examsLastWeek > 0 ? `vs ${examsLastWeek} sem. passée` : 'Nouveau',
        changeType: examsToday >= examsLastWeek ? 'positive' : 'negative'
      },
      {
        name: 'Images traitées',
        value: totalImages.toString(),
        change: calculateChange(totalImages, totalImages - imagesLastWeek),
        changeType: imagesLastWeek >= 0 ? 'positive' : 'negative'
      },
      {
        name: 'Rapports générés',
        value: totalReports.toString(),
        change: calculateChange(totalReports, totalReports - reportsLastWeek),
        changeType: reportsLastWeek >= 0 ? 'positive' : 'negative'
      }
    ]

    // Formater les examens récents
    const formattedRecentExams = recentExams.map((exam: any) => {
      const now = new Date()
      const examDate = new Date(exam.date || exam.createdAt)
      const diffMs = now.getTime() - examDate.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      let timeAgo = ''
      if (diffDays > 0) {
        timeAgo = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
      } else if (diffHours > 0) {
        timeAgo = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
      } else {
        timeAgo = 'À l\'instant'
      }
      
      // Déterminer le statut
      let status = 'Planifié'
      let statusColor = 'gray'
      if (exam.status === 'completed') {
        status = 'Terminé'
        statusColor = 'green'
      } else if (exam.status === 'in_progress') {
        status = 'En cours'
        statusColor = 'yellow'
      }
      
      return {
        id: exam._id,
        patientName: exam.patientId ? `${exam.patientId.nom} ${exam.patientId.prenom}` : 'Patient inconnu',
        type: exam.type || 'Examen',
        oeil: exam.oeil || '',
        timeAgo,
        status,
        statusColor
      }
    })

    return NextResponse.json({ 
      stats,
      recentExams: formattedRecentExams,
      metadata: {
        lastUpdated: new Date().toISOString(),
        period: {
          today: startOfDay.toISOString(),
          weekAgo: startOfWeek.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error)
    return NextResponse.json({ 
      message: 'Erreur lors du calcul des statistiques' 
    }, { status: 500 })
  }
}