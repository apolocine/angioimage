/**
 * Script de seeding pour l'installation initiale
 * Inclut la configuration des paramètres de l'application
 */

import dbConnect from '@/lib/db/mongodb'
import { Role, User, Patient, Exam, AppSettings } from '@/lib/db/models'
import { SettingsService } from '@/lib/services/SettingsService'
import { rolesSeed } from '../seeds/roles.seed'
import { getUsersSeed } from '../seeds/users.seed'
import { patientsSeed } from '../seeds/patients.seed'
import { examensSeed } from '../seeds/examens.seed'
import { seedReports } from '../seeds/reports.seed'
import ReportTemplate from '@/lib/db/models/ReportTemplate'
import bcrypt from 'bcryptjs'

interface InstallConfig {
  // Configuration admin
  ADMIN_EMAIL?: string
  ADMIN_PASSWORD?: string
  ADMIN_NAME?: string
  ADMIN_SURNAME?: string
  SEED_ADMIN_USER?: string
  
  // Configuration cabinet
  CABINET_NAME?: string
  DOCTOR_NAME?: string
  CABINET_ADDRESS?: string
  CABINET_PHONE?: string
  CABINET_EMAIL?: string
  
  // Configuration des rapports
  DEFAULT_REPORT_FORMAT?: string
  DEFAULT_REPORT_ORIENTATION?: string
  
  // Options de seeding
  SEED_SAMPLE_DATA?: string
}

// Charger la configuration depuis les variables d'environnement ou fichier
function loadInstallConfig(): InstallConfig {
  return {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@angioimage.local',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
    ADMIN_NAME: process.env.ADMIN_NAME || 'Administrateur',
    ADMIN_SURNAME: process.env.ADMIN_SURNAME || 'Système',
    SEED_ADMIN_USER: process.env.SEED_ADMIN_USER || 'true',
    
    CABINET_NAME: process.env.CABINET_NAME || 'Cabinet d\'Ophtalmologie',
    DOCTOR_NAME: process.env.DOCTOR_NAME || 'Dr. Nom Prénom',
    CABINET_ADDRESS: process.env.CABINET_ADDRESS || '',
    CABINET_PHONE: process.env.CABINET_PHONE || '',
    CABINET_EMAIL: process.env.CABINET_EMAIL || '',
    
    DEFAULT_REPORT_FORMAT: process.env.DEFAULT_REPORT_FORMAT || 'A4',
    DEFAULT_REPORT_ORIENTATION: process.env.DEFAULT_REPORT_ORIENTATION || 'portrait',
    
    SEED_SAMPLE_DATA: process.env.SEED_SAMPLE_DATA || 'true'
  }
}

async function createAdminUser(config: InstallConfig, roles: any[]) {
  if (config.SEED_ADMIN_USER !== 'true') {
    console.log('⏭️  Création du compte admin désactivée')
    return null
  }

  const adminRole = roles.find(role => role.name === 'admin')
  if (!adminRole) {
    throw new Error('Rôle admin non trouvé')
  }

  // Vérifier si l'admin existe déjà
  const existingAdmin = await User.findOne({ email: config.ADMIN_EMAIL })
  if (existingAdmin) {
    console.log(`⚠️  Utilisateur admin existe déjà: ${config.ADMIN_EMAIL}`)
    return existingAdmin
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD!, 12)

  const adminUser = await User.create({
    email: config.ADMIN_EMAIL,
    password: hashedPassword,
    name: config.ADMIN_NAME,
    surname: config.ADMIN_SURNAME,
    role: 'admin',
    roleRef: adminRole._id,
    isActive: true,
    emailVerified: new Date(),
    metadata: {
      source: 'install-script',
      createdBy: 'system'
    }
  })

  console.log(`✅ Compte administrateur créé: ${config.ADMIN_EMAIL}`)
  console.log(`🔑 Mot de passe: ${config.ADMIN_PASSWORD}`)
  console.log(`⚠️  CHANGEZ LE MOT DE PASSE LORS DE LA PREMIÈRE CONNEXION!`)
  
  return adminUser
}

async function initializeAppSettings(config: InstallConfig) {
  console.log('⚙️  Initialisation des paramètres de l\'application...')

  // Initialiser les paramètres par défaut
  await SettingsService.initializeDefaultSettings()
  
  // Récupérer le template par défaut depuis la base de données
  const defaultTemplate = await ReportTemplate.findOne({ 
    isDefault: true,
    category: 'general' 
  }).lean()
  
  const settingsToSet = [
    // Informations du cabinet
    {
      key: 'general.cabinetName',
      value: config.CABINET_NAME!,
      category: 'general',
      description: 'Nom du cabinet médical'
    },
    {
      key: 'general.doctorName', 
      value: config.DOCTOR_NAME!,
      category: 'general',
      description: 'Nom du médecin principal'
    },
    
    // Pied de page personnalisé pour les rapports avec informations du cabinet
    {
      key: 'reports.footer',
      value: `${config.CABINET_NAME}
${config.DOCTOR_NAME}
${config.CABINET_ADDRESS ? config.CABINET_ADDRESS + '\n' : ''}${config.CABINET_PHONE ? 'Tél: ' + config.CABINET_PHONE + '\n' : ''}${config.CABINET_EMAIL ? 'Email: ' + config.CABINET_EMAIL + '\n' : ''}
Rapport généré le {date} à {time}`,
      category: 'reports',
      description: 'Texte du pied de page des rapports générés'
    },
    
    // Configuration par défaut des rapports basée sur le template
    {
      key: 'reports.defaultFormat',
      value: defaultTemplate?.layout?.format || config.DEFAULT_REPORT_FORMAT!,
      category: 'reports',
      description: 'Format par défaut des rapports'
    },
    {
      key: 'reports.defaultOrientation',
      value: defaultTemplate?.layout?.orientation || config.DEFAULT_REPORT_ORIENTATION!,
      category: 'reports',
      description: 'Orientation par défaut des rapports'
    },
    
    // Template par défaut pour les nouveaux rapports
    {
      key: 'reports.defaultTemplateId',
      value: defaultTemplate?._id?.toString() || '',
      category: 'reports',
      description: 'Template par défaut pour les nouveaux rapports'
    },
    
    // Configuration des images par ligne basée sur le template
    {
      key: 'reports.defaultImagesPerRow',
      value: defaultTemplate?.layout?.imagesPerRow || 2,
      category: 'reports',
      description: 'Nombre d\'images par ligne par défaut'
    },
    
    // Paramètres d'apparence de l'application
    {
      key: 'app.theme',
      value: 'auto',
      category: 'app',
      description: 'Thème de l\'interface (light, dark, auto)'
    },
    
    // Paramètres régionaux
    {
      key: 'app.dateFormat',
      value: 'DD/MM/YYYY',
      category: 'app',
      description: 'Format d\'affichage des dates'
    },
    {
      key: 'app.unitSystem',
      value: 'metric',
      category: 'app',
      description: 'Système d\'unités (metric, imperial)'
    },
    
    // Paramètres des images
    {
      key: 'app.imageQuality',
      value: 'high',
      category: 'app',
      description: 'Qualité d\'image par défaut (low, medium, high, original)'
    },
    
    // Paramètres de sauvegarde automatique
    {
      key: 'app.autoSave.enabled',
      value: true,
      category: 'app',
      description: 'Activer la sauvegarde automatique'
    },
    {
      key: 'app.autoSave.interval',
      value: 5,
      category: 'app',
      description: 'Intervalle de sauvegarde automatique en minutes'
    },
    
    // Paramètres supplémentaires des rapports
    {
      key: 'reports.includeLogo',
      value: true,
      category: 'reports',
      description: 'Inclure le logo dans les rapports'
    }
  ]

  // Filtrer les paramètres vides et les appliquer
  for (const setting of settingsToSet) {
    if (setting.value !== null && setting.value !== undefined && 
        (typeof setting.value !== 'string' || setting.value.trim())) {
      await SettingsService.setSetting(setting.key, setting.value, {
        category: setting.category,
        description: setting.description,
        updatedBy: 'install-script'
      })
    }
  }

  // Paramètres additionnels si fournis
  if (config.CABINET_ADDRESS) {
    await SettingsService.setSetting('general.cabinetAddress', config.CABINET_ADDRESS, {
      category: 'general',
      description: 'Adresse du cabinet médical',
      updatedBy: 'install-script'
    })
  }

  if (config.CABINET_PHONE) {
    await SettingsService.setSetting('general.cabinetPhone', config.CABINET_PHONE, {
      category: 'general', 
      description: 'Téléphone du cabinet médical',
      updatedBy: 'install-script'
    })
  }

  if (config.CABINET_EMAIL) {
    await SettingsService.setSetting('general.cabinetEmail', config.CABINET_EMAIL, {
      category: 'general',
      description: 'Email du cabinet médical',
      updatedBy: 'install-script'
    })
  }

  console.log('✅ Paramètres de l\'application initialisés')
  
  if (defaultTemplate) {
    console.log(`📄 Template par défaut configuré: ${defaultTemplate.name} (${defaultTemplate.category})`)
  }
}

async function seedSampleData() {
  console.log('📊 Seeding des données d\'exemple...')

  // Seed roles
  const roles = await Role.insertMany(rolesSeed)
  console.log(`✅ ${roles.length} rôles créés`)

  // Get role IDs
  const roleMap = roles.reduce((acc, role) => {
    acc[role.name] = role._id
    return acc
  }, {} as Record<string, any>)

  // Seed users with role references (users d'exemple)
  const usersSeedData = await getUsersSeed()
  const usersWithRoles = usersSeedData.map(user => ({
    ...user,
    roleRef: roleMap[user.role]
  }))
  
  const users = await User.insertMany(usersWithRoles)
  console.log(`✅ ${users.length} utilisateurs d'exemple créés`)

  // Get admin user for patient creation
  const adminUser = users.find(u => u.role === 'admin') || users[0]

  // Seed patients
  const patientsWithCreator = patientsSeed.map(patient => ({
    ...patient,
    createdBy: adminUser?._id
  }))
  
  const patients = await Patient.insertMany(patientsWithCreator)
  console.log(`✅ ${patients.length} patients d'exemple créés`)

  // Seed examens
  const examensWithData = examensSeed.map((examen, index) => ({
    ...examen,
    patientId: patients[index % patients.length]._id,
    praticien: users.find(u => u.role === 'doctor')?._id || adminUser._id,
    createdBy: adminUser?._id
  }))
  
  const examens = await Exam.insertMany(examensWithData)
  console.log(`✅ ${examens.length} examens d'exemple créés`)

  // Seed reports templates
  await seedReports()
  console.log('📄 Templates de rapports créés')
  
  return { roles, users, patients, examens }
}

async function installSeed() {
  try {
    console.log('🚀 Démarrage du seeding d\'installation...')
    
    await dbConnect()
    console.log('✅ Connexion à MongoDB établie')

    // Charger la configuration
    const config = loadInstallConfig()
    console.log('📋 Configuration chargée')

    // Clear existing data (optionnel en installation)
    const shouldClearData = process.argv.includes('--clear-data')
    if (shouldClearData) {
      console.log('🧹 Nettoyage de la base de données...')
      await Promise.all([
        Role.deleteMany({}),
        User.deleteMany({}),
        Patient.deleteMany({}),
        Exam.deleteMany({}),
        AppSettings.deleteMany({})
      ])
      console.log('✅ Base de données nettoyée')
    }

    let adminUser = null
    let sampleData = null

    // Créer ou récupérer les rôles
    let roles = await Role.find().lean()
    if (roles.length === 0) {
      roles = await Role.insertMany(rolesSeed)
      console.log(`✅ ${roles.length} rôles créés`)
    } else {
      console.log(`✅ ${roles.length} rôles existants trouvés`)
    }

    // Créer le compte administrateur
    adminUser = await createAdminUser(config, roles)

    // Créer les templates de rapports (toujours nécessaire)
    const existingTemplates = await ReportTemplate.countDocuments()
    if (existingTemplates === 0) {
      await seedReports()
      console.log('📄 Templates de rapports créés')
    } else {
      console.log('📄 Templates de rapports existants trouvés')
    }

    // Initialiser les paramètres de l'application (après création des templates)
    await initializeAppSettings(config)

    // Seeding des données d'exemple (optionnel)
    if (config.SEED_SAMPLE_DATA === 'true') {
      const existingUsers = await User.countDocuments()
      if (existingUsers <= 1) { // Seulement l'admin
        sampleData = await seedSampleData()
      } else {
        console.log('⏭️  Données d\'exemple ignorées (utilisateurs existants)')
      }
    } else {
      console.log('⏭️  Seeding des données d\'exemple désactivé')
    }

    console.log('')
    console.log('🎉 Installation et seeding terminés avec succès!')
    console.log('')
    
    if (adminUser) {
      console.log('👤 Compte administrateur:')
      console.log(`   Email: ${config.ADMIN_EMAIL}`)
      console.log(`   Mot de passe: ${config.ADMIN_PASSWORD}`)
      console.log('')
    }
    
    console.log('🏥 Configuration du cabinet:')
    console.log(`   Nom: ${config.CABINET_NAME}`)
    console.log(`   Médecin: ${config.DOCTOR_NAME}`)
    console.log('')
    
    console.log('📊 Statistiques:')
    console.log(`   Rôles: ${roles.length}`)
    const totalUsers = await User.countDocuments()
    const totalPatients = await Patient.countDocuments()
    const totalExams = await Exam.countDocuments()
    const totalTemplates = await ReportTemplate.countDocuments()
    const totalSettings = await AppSettings.countDocuments()
    console.log(`   Utilisateurs: ${totalUsers}`)
    console.log(`   Patients: ${totalPatients}`)
    console.log(`   Examens: ${totalExams}`)
    console.log(`   Templates de rapport: ${totalTemplates}`)
    console.log(`   Paramètres d'application: ${totalSettings}`)
    
    // Afficher les templates disponibles
    const templates = await ReportTemplate.find().select('name category isDefault').lean()
    if (templates.length > 0) {
      console.log('')
      console.log('📋 Templates disponibles:')
      templates.forEach(template => {
        const defaultFlag = template.isDefault ? ' (défaut)' : ''
        console.log(`   📄 ${template.name} - ${template.category}${defaultFlag}`)
      })
    }
    
    // Afficher les paramètres d'application configurés
    const appSettings = await AppSettings.find().select('key category description').lean()
    if (appSettings.length > 0) {
      console.log('')
      console.log('⚙️  Paramètres d\'application configurés:')
      console.log('   📱 Interface:')
      const appCategorySettings = appSettings.filter(s => s.category === 'app')
      appCategorySettings.forEach(setting => {
        console.log(`     • ${setting.description}`)
      })
      console.log('   🏥 Cabinet:')
      const generalCategorySettings = appSettings.filter(s => s.category === 'general')
      generalCategorySettings.forEach(setting => {
        console.log(`     • ${setting.description}`)
      })
      console.log('   📄 Rapports:')
      const reportsCategorySettings = appSettings.filter(s => s.category === 'reports')
      reportsCategorySettings.forEach(setting => {
        console.log(`     • ${setting.description}`)
      })
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur lors du seeding d\'installation:', error)
    process.exit(1)
  }
}

// Run seeding if called directly
if (require.main === module) {
  installSeed()
}

export default installSeed