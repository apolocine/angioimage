import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { SettingsService } from '@/lib/services/SettingsService'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier les permissions (seuls admin et doctor)
    const userRole = session.user?.role
    if (!['admin', 'doctor'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const key = searchParams.get('key')

    if (key) {
      // Récupérer un paramètre spécifique
      const value = await SettingsService.getSetting(key)
      return NextResponse.json({ key, value })
    } else if (category) {
      // Récupérer tous les paramètres d'une catégorie
      const settings = await SettingsService.getSettingsByCategory(category)
      return NextResponse.json({ data: settings })
    } else {
      // Récupérer les paramètres essentiels
      const reportFooter = await SettingsService.getReportFooter()
      const cabinetName = await SettingsService.getSetting('general.cabinetName') || 'Cabinet d\'Ophtalmologie'
      const doctorName = await SettingsService.getSetting('general.doctorName') || 'Dr. Nom Prénom'
      
      return NextResponse.json({
        data: {
          'reports.footer': reportFooter,
          'general.cabinetName': cabinetName,
          'general.doctorName': doctorName
        }
      })
    }
  } catch (error) {
    console.error('Erreur récupération paramètres:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier les permissions (seuls admin et doctor)
    const userRole = session.user?.role
    if (!['admin', 'doctor'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { key, value, category, description } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Clé et valeur requises' }, { status: 400 })
    }

    const setting = await SettingsService.setSetting(key, value, {
      category: category || 'general',
      description,
      updatedBy: session.user.id
    })

    return NextResponse.json({ 
      message: 'Paramètre mis à jour avec succès',
      data: setting 
    })
  } catch (error) {
    console.error('Erreur mise à jour paramètre:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Initialiser les paramètres par défaut
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seuls les admins peuvent initialiser
    const userRole = session.user?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await SettingsService.initializeDefaultSettings()

    return NextResponse.json({ 
      message: 'Paramètres par défaut initialisés avec succès' 
    })
  } catch (error) {
    console.error('Erreur initialisation paramètres:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}