import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Image from '@/lib/db/models/Image'
import Exam from '@/lib/db/models/Exam'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    // Statistiques générales
    const totalImages = await Image.countDocuments()
    const totalExams = await Exam.countDocuments()

    // Échantillon d'images
    const sampleImages = await Image.find().limit(5).lean()
    
    // Échantillon d'examens
    const sampleExams = await Exam.find().limit(5).lean()

    // Images par examen
    const imagesPerExam = await Image.aggregate([
      {
        $group: {
          _id: '$examenId',
          count: { $sum: 1 }
        }
      },
      { $limit: 10 }
    ])

    return NextResponse.json({
      stats: {
        totalImages,
        totalExams,
        imagesPerExam: imagesPerExam.length
      },
      samples: {
        images: sampleImages.map(img => ({
          _id: img._id,
          originalName: img.originalName,
          examenId: img.examenId,
          imageType: img.imageType
        })),
        exams: sampleExams.map(exam => ({
          _id: exam._id,
          type: exam.type,
          date: exam.date,
          patientId: exam.patientId
        }))
      },
      imagesPerExam: imagesPerExam.map(item => ({
        examId: item._id,
        imageCount: item.count
      }))
    })
  } catch (error) {
    console.error('Erreur debug images:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}