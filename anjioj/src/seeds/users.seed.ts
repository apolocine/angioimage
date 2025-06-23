import { hashPassword } from '@/lib/utils/crypto'

export async function getUsersSeed() {
  const hashedPassword = await hashPassword('password123')
  
  return [
    {
      email: 'admin@anjioj.com',
      password: hashedPassword,
      name: 'Administrateur Système',
      role: 'admin',
      settings: {
        theme: 'light',
        language: 'fr',
        notifications: true
      },
      isActive: true
    },
    {
      email: 'doctor@anjioj.com',
      password: hashedPassword,
      name: 'Dr. Martin Dupont',
      role: 'doctor',
      settings: {
        theme: 'light',
        language: 'fr',
        notifications: true
      },
      isActive: true
    },
    {
      email: 'assistant@anjioj.com',
      password: hashedPassword,
      name: 'Marie Leclerc',
      role: 'assistant',
      settings: {
        theme: 'light',
        language: 'fr',
        notifications: true
      },
      isActive: true
    }
  ]
}