import dbConnect from '@/lib/db/mongodb'
import { Role, User, Patient, Exam } from '@/lib/db/models'
import { rolesSeed } from './roles.seed'
import { getUsersSeed } from './users.seed'
import { patientsSeed } from './patients.seed'
import { examensSeed } from './examens.seed'

async function seed() {
  try {
    console.log('🌱 Démarrage du seeding...')
    
    await dbConnect()
    console.log('✅ Connexion à MongoDB établie')

    // Clear existing data
    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      Patient.deleteMany({}),
      Exam.deleteMany({})
    ])
    console.log('🧹 Base de données nettoyée')

    // Seed roles
    const roles = await Role.insertMany(rolesSeed)
    console.log(`✅ ${roles.length} rôles créés`)

    // Get role IDs
    const roleMap = roles.reduce((acc, role) => {
      acc[role.name] = role._id
      return acc
    }, {} as Record<string, any>)

    // Seed users with role references
    const usersSeedData = await getUsersSeed()
    const usersWithRoles = usersSeedData.map(user => ({
      ...user,
      roleRef: roleMap[user.role]
    }))
    
    const users = await User.insertMany(usersWithRoles)
    console.log(`✅ ${users.length} utilisateurs créés`)

    // Get admin user for patient creation
    const adminUser = users.find(u => u.role === 'admin')

    // Seed patients
    const patientsWithCreator = patientsSeed.map(patient => ({
      ...patient,
      createdBy: adminUser?._id
    }))
    
    const patients = await Patient.insertMany(patientsWithCreator)
    console.log(`✅ ${patients.length} patients créés`)

    // Seed examens
    const examensWithData = examensSeed.map((examen, index) => ({
      ...examen,
      patientId: patients[index % patients.length]._id,
      praticien: users.find(u => u.role === 'doctor')?._id,
      createdBy: adminUser?._id
    }))
    
    const examens = await Exam.insertMany(examensWithData)
    console.log(`✅ ${examens.length} examens créés`)

    console.log('🎉 Seeding terminé avec succès!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error)
    process.exit(1)
  }
}

// Run seeding if called directly
if (require.main === module) {
  seed()
}

export default seed