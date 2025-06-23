import { Schema, model, models, Model } from 'mongoose'

export interface IRole {
  _id?: string
  name: string
  displayName: string
  permissions: string[]
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

const RoleSchema = new Schema<IRole>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['admin', 'doctor', 'assistant'],
    index: true
  },
  displayName: { 
    type: String, 
    required: true 
  },
  permissions: [{
    type: String,
    enum: [
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
    ]
  }],
  description: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

const Role: Model<IRole> = models.Role || model<IRole>('Role', RoleSchema)

export default Role