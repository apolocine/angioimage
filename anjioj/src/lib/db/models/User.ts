import { Schema, model, models, Model } from 'mongoose'

export interface IUser {
  _id?: string
  email: string
  password: string
  name: string
  role: string
  roleRef?: string
  settings: {
    theme: 'light' | 'dark'
    language: string
    notifications: boolean
  }
  lastLogin?: Date
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  role: { 
    type: String, 
    enum: ['admin', 'doctor', 'assistant'], 
    default: 'doctor',
    required: true
  },
  roleRef: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  settings: {
    theme: { 
      type: String, 
      enum: ['light', 'dark'], 
      default: 'light' 
    },
    language: { 
      type: String, 
      default: 'fr' 
    },
    notifications: { 
      type: Boolean, 
      default: true 
    }
  },
  lastLogin: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password
      return ret
    }
  }
})

UserSchema.index({ role: 1 })

const User: Model<IUser> = models.User || model<IUser>('User', UserSchema)

export default User