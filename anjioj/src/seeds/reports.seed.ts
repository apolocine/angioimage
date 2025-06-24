import mongoose from 'mongoose'
import dbConnect from '@/lib/db/mongodb'
import ReportTemplate from '@/lib/db/models/ReportTemplate'
import User from '@/lib/db/models/User'

const defaultTemplates = [
  {
    name: 'Rapport Général',
    description: 'Template standard pour tous types d\'examens ophtalmologiques',
    category: 'general',
    isDefault: true,
    layout: {
      format: 'A4',
      orientation: 'portrait',
      imagesPerRow: 2,
      margins: { top: 25, right: 25, bottom: 25, left: 25 }
    },
    sections: {
      header: {
        enabled: true,
        content: 'Rapport d\'Examen Ophtalmologique',
        height: 60
      },
      footer: {
        enabled: true,
        content: 'Page {{pageNumber}} sur {{totalPages}} - Généré par Angioimage',
        height: 30
      },
      patientInfo: {
        enabled: true,
        position: 'top',
        fields: ['nom', 'prenom', 'dateNaissance', 'age']
      },
      examInfo: {
        enabled: true,
        includeDetails: true
      },
      introduction: {
        enabled: true,
        defaultContent: 'Ce rapport présente les résultats de l\'examen ophtalmologique réalisé.'
      },
      images: {
        enabled: true,
        showMetadata: true,
        groupByExam: true
      },
      findings: {
        enabled: true,
        defaultContent: 'Les observations cliniques seront détaillées dans cette section.'
      },
      conclusion: {
        enabled: true,
        defaultContent: 'Conclusion de l\'examen et diagnostic.'
      },
      recommendations: {
        enabled: true,
        defaultContent: 'Recommandations et suivi à prévoir.'
      }
    },
    styling: {
      fontFamily: 'Arial, sans-serif',
      fontSize: { title: 18, heading: 14, body: 11, caption: 9 },
      colors: { 
        primary: '#2563eb', 
        secondary: '#64748b', 
        text: '#1f2937', 
        background: '#ffffff' 
      },
      spacing: { sectionGap: 15, paragraphGap: 8 }
    }
  },
  {
    name: 'Rapport Angiographie',
    description: 'Template spécialisé pour les examens d\'angiographie fluorescéinique',
    category: 'angiography',
    isDefault: true,
    layout: {
      format: 'A4',
      orientation: 'landscape',
      imagesPerRow: 3,
      margins: { top: 20, right: 20, bottom: 20, left: 20 }
    },
    sections: {
      header: {
        enabled: true,
        content: 'Rapport d\'Angiographie Fluorescéinique',
        height: 50
      },
      footer: {
        enabled: true,
        content: 'Page {{pageNumber}} sur {{totalPages}} - Angiographie Fluorescéinique',
        height: 25
      },
      patientInfo: {
        enabled: true,
        position: 'sidebar',
        fields: ['nom', 'prenom', 'dateNaissance']
      },
      examInfo: {
        enabled: true,
        includeDetails: true
      },
      introduction: {
        enabled: true,
        defaultContent: 'Angiographie fluorescéinique réalisée selon protocole standard.'
      },
      images: {
        enabled: true,
        showMetadata: true,
        groupByExam: false
      },
      findings: {
        enabled: true,
        defaultContent: 'Analyse des phases angiographiques : précoce, intermédiaire et tardive.'
      },
      conclusion: {
        enabled: true,
        defaultContent: 'Interprétation angiographique et diagnostic.'
      },
      recommendations: {
        enabled: false
      }
    },
    styling: {
      fontFamily: 'Arial, sans-serif',
      fontSize: { title: 16, heading: 12, body: 10, caption: 8 },
      colors: { 
        primary: '#059669', 
        secondary: '#6b7280', 
        text: '#111827', 
        background: '#ffffff' 
      },
      spacing: { sectionGap: 12, paragraphGap: 6 }
    }
  },
  {
    name: 'Rapport OCT',
    description: 'Template pour les examens de tomographie par cohérence optique',
    category: 'oct',
    isDefault: true,
    layout: {
      format: 'A4',
      orientation: 'portrait',
      imagesPerRow: 1,
      margins: { top: 30, right: 30, bottom: 30, left: 30 }
    },
    sections: {
      header: {
        enabled: true,
        content: 'Rapport OCT (Tomographie par Cohérence Optique)',
        height: 70
      },
      footer: {
        enabled: true,
        content: 'Page {{pageNumber}} sur {{totalPages}} - Examen OCT',
        height: 30
      },
      patientInfo: {
        enabled: true,
        position: 'top',
        fields: ['nom', 'prenom', 'dateNaissance', 'age']
      },
      examInfo: {
        enabled: true,
        includeDetails: true
      },
      introduction: {
        enabled: true,
        defaultContent: 'Examen OCT réalisé pour l\'analyse des structures rétiniennes.'
      },
      images: {
        enabled: true,
        showMetadata: true,
        groupByExam: true
      },
      findings: {
        enabled: true,
        defaultContent: 'Analyse des couches rétiniennes et mesures biométriques.'
      },
      conclusion: {
        enabled: true,
        defaultContent: 'Interprétation des données OCT et diagnostic.'
      },
      recommendations: {
        enabled: true,
        defaultContent: 'Suivi recommandé en fonction des résultats OCT.'
      }
    },
    styling: {
      fontFamily: 'Arial, sans-serif',
      fontSize: { title: 18, heading: 14, body: 11, caption: 9 },
      colors: { 
        primary: '#7c3aed', 
        secondary: '#64748b', 
        text: '#1f2937', 
        background: '#ffffff' 
      },
      spacing: { sectionGap: 18, paragraphGap: 10 }
    }
  },
  {
    name: 'Rapport Rétinographie',
    description: 'Template pour les examens de photographie du fond d\'œil',
    category: 'retinography',
    isDefault: true,
    layout: {
      format: 'A4',
      orientation: 'portrait',
      imagesPerRow: 2,
      margins: { top: 25, right: 25, bottom: 25, left: 25 }
    },
    sections: {
      header: {
        enabled: true,
        content: 'Rapport de Rétinographie',
        height: 55
      },
      footer: {
        enabled: true,
        content: 'Page {{pageNumber}} sur {{totalPages}} - Photographie du fond d\'œil',
        height: 30
      },
      patientInfo: {
        enabled: true,
        position: 'top',
        fields: ['nom', 'prenom', 'dateNaissance']
      },
      examInfo: {
        enabled: true,
        includeDetails: true
      },
      introduction: {
        enabled: true,
        defaultContent: 'Photographies du fond d\'œil réalisées en lumière blanche et colorée.'
      },
      images: {
        enabled: true,
        showMetadata: true,
        groupByExam: true
      },
      findings: {
        enabled: true,
        defaultContent: 'Analyse des structures rétiniennes visibles sur les clichés.'
      },
      conclusion: {
        enabled: true,
        defaultContent: 'Interprétation des images rétiniennes et diagnostic.'
      },
      recommendations: {
        enabled: true,
        defaultContent: 'Surveillance et suivi recommandés.'
      }
    },
    styling: {
      fontFamily: 'Arial, sans-serif',
      fontSize: { title: 17, heading: 13, body: 11, caption: 9 },
      colors: { 
        primary: '#dc2626', 
        secondary: '#6b7280', 
        text: '#111827', 
        background: '#ffffff' 
      },
      spacing: { sectionGap: 14, paragraphGap: 8 }
    }
  }
]

export async function seedReports() {
  try {
    await dbConnect()

    // Trouver un utilisateur admin pour assigner comme créateur
    const adminUser = await User.findOne({ role: 'admin' })
    if (!adminUser) {
      console.log('⚠️ Aucun utilisateur admin trouvé pour les templates de rapports')
      return
    }

    // Supprimer les templates existants
    await ReportTemplate.deleteMany({})
    console.log('🗑️ Templates de rapports existants supprimés')

    // Créer les nouveaux templates
    const templatesWithCreator = defaultTemplates.map(template => ({
      ...template,
      createdBy: adminUser._id
    }))

    const createdTemplates = await ReportTemplate.insertMany(templatesWithCreator)
    console.log(`✅ ${createdTemplates.length} templates de rapports créés`)

    // Afficher les templates créés
    createdTemplates.forEach(template => {
      console.log(`   📄 ${template.name} (${template.category})`)
    })

  } catch (error) {
    console.error('❌ Erreur lors du seeding des templates de rapports:', error)
    throw error
  }
}

// Exécution directe du script
if (require.main === module) {
  seedReports()
    .then(() => {
      console.log('✅ Seeding des templates de rapports terminé')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erreur:', error)
      process.exit(1)
    })
}