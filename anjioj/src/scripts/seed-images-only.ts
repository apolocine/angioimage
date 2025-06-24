import { seedImages } from '../seeds/images.seed'

async function main() {
  try {
    console.log('🖼️ Seeding des images uniquement...')
    await seedImages()
    console.log('✅ Seeding des images terminé')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

main()