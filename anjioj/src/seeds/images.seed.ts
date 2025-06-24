import mongoose from 'mongoose'
import dbConnect from '@/lib/db/mongodb'
import Image from '@/lib/db/models/Image'
import Exam from '@/lib/db/models/Exam'

const sampleImages = [
  {
    filename: 'fond_oeil_normal_001.jpg',
    originalName: 'Fond œil normal OD.jpg',
    url: '/api/images/sample/fond_oeil_normal_001.jpg',
    thumbnailUrl: '/api/images/sample/thumb_fond_oeil_normal_001.jpg',
    mimeType: 'image/jpeg',
    size: 2048576, // 2MB
    dimensions: { width: 2048, height: 1536 },
    imageType: 'fond_oeil_normal',
    metadata: {
      camera: 'Canon CF-60UD',
      lens: '60° FOV',
      flash: true,
      filter: 'None',
      illumination: 'LED',
      mydriasis: false
    }
  },
  {
    filename: 'fond_oeil_rouge_001.jpg',
    originalName: 'Fond œil rouge OD.jpg',
    url: '/api/images/sample/fond_oeil_rouge_001.jpg',
    thumbnailUrl: '/api/images/sample/thumb_fond_oeil_rouge_001.jpg',
    mimeType: 'image/jpeg',
    size: 1890432, // 1.8MB
    dimensions: { width: 2048, height: 1536 },
    imageType: 'fond_oeil_rouge',
    metadata: {
      camera: 'Canon CF-60UD',
      lens: '60° FOV',
      flash: true,
      filter: 'Red',
      illumination: 'LED Red',
      mydriasis: false
    }
  },
  {
    filename: 'angiographie_precoce_001.jpg',
    originalName: 'Angiographie précoce OD.jpg',
    url: '/api/images/sample/angiographie_precoce_001.jpg',
    thumbnailUrl: '/api/images/sample/thumb_angiographie_precoce_001.jpg',
    mimeType: 'image/jpeg',
    size: 1654321, // 1.6MB
    dimensions: { width: 1920, height: 1440 },
    imageType: 'angiographie_fluoresceine',
    metadata: {
      camera: 'Heidelberg Spectralis',
      lens: '30° FOV',
      flash: false,
      filter: 'Fluorescein',
      illumination: 'Blue',
      mydriasis: true
    },
    angiography: {
      phase: 'precoce',
      timeFromInjection: 15,
      fluoresceinVisible: true,
      quality: 'excellente'
    }
  },
  {
    filename: 'oct_maculaire_001.jpg',
    originalName: 'OCT maculaire OD.jpg',
    url: '/api/images/sample/oct_maculaire_001.jpg',
    thumbnailUrl: '/api/images/sample/thumb_oct_maculaire_001.jpg',
    mimeType: 'image/jpeg',
    size: 1234567, // 1.2MB
    dimensions: { width: 1024, height: 768 },
    imageType: 'oct',
    metadata: {
      camera: 'Zeiss Cirrus HD-OCT',
      protocol: 'Macular Cube 512x128',
      scanLength: '6mm',
      scanDepth: '3.5mm',
      resolution: '5μm'
    }
  },
  {
    filename: 'retinographie_panorama_001.jpg',
    originalName: 'Rétinographie panorama OD.jpg',
    url: '/api/images/sample/retinographie_panorama_001.jpg',
    thumbnailUrl: '/api/images/sample/thumb_retinographie_panorama_001.jpg',
    mimeType: 'image/jpeg',
    size: 3145728, // 3MB
    dimensions: { width: 3008, height: 2000 },
    imageType: 'retinographie',
    metadata: {
      camera: 'Optos Daytona',
      lens: '200° FOV',
      flash: false,
      filter: 'None',
      illumination: 'White LED',
      mydriasis: false
    }
  }
]

export async function seedImages() {
  try {
    await dbConnect()

    // Récupérer un utilisateur pour uploadedBy
    const User = (await import('@/lib/db/models/User')).default
    const adminUser = await User.findOne({ role: 'admin' })
    if (!adminUser) {
      console.log('⚠️ Aucun utilisateur admin trouvé pour les images')
      return
    }

    // Supprimer les images existantes
    await Image.deleteMany({})
    console.log('🗑️ Images existantes supprimées')

    // Récupérer tous les examens
    const exams = await Exam.find({}).lean()
    if (exams.length === 0) {
      console.log('⚠️ Aucun examen trouvé - veuillez d\'abord créer des examens')
      return
    }

    console.log(`📋 ${exams.length} examens trouvés`)

    // Créer des images pour chaque examen
    const imagesToCreate = []

    for (const exam of exams) {
      // Ajouter 2-4 images par examen
      const imageCount = Math.floor(Math.random() * 3) + 2 // 2 à 4 images
      
      for (let i = 0; i < imageCount; i++) {
        const sampleImage = sampleImages[i % sampleImages.length]
        
        const imageData = {
          ...sampleImage,
          examenId: exam._id,
          filename: `${exam._id}_${sampleImage.filename}`,
          originalName: `${sampleImage.originalName.replace('OD', exam.oeil)}`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Derniers 30 jours
          status: 'ready',
          uploadedBy: adminUser._id
        }
        
        imagesToCreate.push(imageData)
      }
    }

    // Insérer toutes les images
    const createdImages = await Image.insertMany(imagesToCreate)
    console.log(`✅ ${createdImages.length} images créées`)

    // Statistiques par type
    const imagesByType = createdImages.reduce((acc, img) => {
      acc[img.imageType] = (acc[img.imageType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('📊 Répartition par type:')
    Object.entries(imagesByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`)
    })

    // Images par examen
    const imagesByExam = createdImages.reduce((acc, img) => {
      const examId = img.examenId.toString()
      acc[examId] = (acc[examId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log(`📸 Images réparties sur ${Object.keys(imagesByExam).length} examens`)

  } catch (error) {
    console.error('❌ Erreur lors du seeding des images:', error)
    throw error
  }
}

// Exécution directe du script
if (require.main === module) {
  seedImages()
    .then(() => {
      console.log('✅ Seeding des images terminé')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erreur:', error)
      process.exit(1)
    })
}