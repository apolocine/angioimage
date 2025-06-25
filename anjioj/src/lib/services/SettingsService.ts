import dbConnect from '@/lib/db/mongodb'
import AppSettings, { IAppSettings } from '@/lib/db/models/AppSettings'

export class SettingsService {
  static async getSetting(key: string): Promise<any> {
    await dbConnect()
    const setting = await AppSettings.findOne({ key }).lean()
    return setting?.value || null
  }

  static async getSettingsByCategory(category: string): Promise<IAppSettings[]> {
    await dbConnect()
    return await AppSettings.find({ category }).lean()
  }

  static async setSetting(
    key: string, 
    value: any, 
    options: {
      category?: string
      description?: string
      type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
      updatedBy?: string
    } = {}
  ): Promise<IAppSettings> {
    await dbConnect()
    
    const settingData = {
      key,
      value,
      category: options.category || 'general',
      type: options.type || typeof value,
      description: options.description,
      updatedBy: options.updatedBy
    }

    const setting = await AppSettings.findOneAndUpdate(
      { key },
      settingData,
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    ).lean()

    return setting
  }

  static async deleteSetting(key: string): Promise<boolean> {
    await dbConnect()
    const result = await AppSettings.findOneAndDelete({ key })
    return !!result
  }

  // Paramètres par défaut pour les rapports
  static async getReportFooter(): Promise<string> {
    const footer = await this.getSetting('reports.footer')
    return footer || `Rapport généré automatiquement par Angioimage
Cabinet médical - Spécialiste en ophtalmologie
Généré le {date} à {time}`
  }

  static async setReportFooter(footer: string, updatedBy?: string): Promise<void> {
    await this.setSetting('reports.footer', footer, {
      category: 'reports',
      description: 'Texte du pied de page des rapports générés',
      type: 'string',
      updatedBy
    })
  }

  static async initializeDefaultSettings(): Promise<void> {
    const defaults = [
      {
        key: 'reports.footer',
        value: `Rapport généré automatiquement par Angioimage
Cabinet médical - Spécialiste en ophtalmologie
Généré le {date} à {time}`,
        category: 'reports',
        type: 'string',
        description: 'Texte du pied de page des rapports générés'
      },
      {
        key: 'reports.includeLogo',
        value: true,
        category: 'reports',
        type: 'boolean',
        description: 'Inclure le logo dans les rapports'
      },
      {
        key: 'general.cabinetName',
        value: 'Cabinet d\'Ophtalmologie',
        category: 'general',
        type: 'string',
        description: 'Nom du cabinet médical'
      },
      {
        key: 'general.doctorName',
        value: 'Dr. Nom Prénom',
        category: 'general',
        type: 'string',
        description: 'Nom du médecin principal'
      }
    ]

    await dbConnect()

    for (const setting of defaults) {
      const exists = await AppSettings.findOne({ key: setting.key })
      if (!exists) {
        await AppSettings.create({
          ...setting,
          isSystem: true
        })
      }
    }
  }
}