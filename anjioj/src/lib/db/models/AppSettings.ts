import { Schema, model, models } from 'mongoose'

export interface IAppSettings {
  _id?: string
  category: 'general' | 'reports' | 'notifications' | 'system'
  key: string
  value: any
  description?: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  isSystem: boolean
  updatedBy?: string
  createdAt?: Date
  updatedAt?: Date
}

const AppSettingsSchema = new Schema<IAppSettings>({
  category: {
    type: String,
    required: true,
    enum: ['general', 'reports', 'notifications', 'system']
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: ['string', 'number', 'boolean', 'object', 'array']
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
})

// Index pour optimiser les recherches
AppSettingsSchema.index({ category: 1, key: 1 })
AppSettingsSchema.index({ key: 1 }, { unique: true })

const AppSettings = models.AppSettings || model<IAppSettings>('AppSettings', AppSettingsSchema)

export default AppSettings