import { IRole } from '@/lib/db/models/Role'

export const rolesSeed: IRole[] = [
  {
    name: 'admin',
    displayName: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: [
      'patients.create',
      'patients.read',
      'patients.update',
      'patients.delete',
      'images.create',
      'images.read',
      'images.update',
      'images.delete',
      'reports.create',
      'reports.read',
      'reports.update',
      'reports.delete',
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'roles.manage',
      'settings.manage'
    ],
    isActive: true
  },
  {
    name: 'doctor',
    displayName: 'Médecin',
    description: 'Accès complet aux patients et examens',
    permissions: [
      'patients.create',
      'patients.read',
      'patients.update',
      'images.create',
      'images.read',
      'images.update',
      'reports.create',
      'reports.read',
      'reports.update',
      'users.read'
    ],
    isActive: true
  },
  {
    name: 'assistant',
    displayName: 'Assistant',
    description: 'Accès en lecture et création de base',
    permissions: [
      'patients.read',
      'patients.create',
      'images.read',
      'images.create',
      'reports.read'
    ],
    isActive: true
  }
]