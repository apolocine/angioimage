import { Schema, model, models, Model, Types } from 'mongoose'

export interface IPatient {
  _id?: string
  nom: string
  prenom: string
  dateNaissance: Date
  sexe: 'M' | 'F'
  email?: string
  telephone?: string
  adresse?: {
    rue?: string
    ville?: string
    codePostal?: string
    pays?: string
  }
  dossierMedical?: {
    numeroSecu?: string
    medecin?: string
    antecedents?: string[]
    allergies?: string[]
    traitements?: string[]
  }
  metadata?: {
    source?: string
    importedAt?: Date
    tags?: string[]
  }
  createdBy?: Types.ObjectId | string
  createdAt?: Date
  updatedAt?: Date
}

const PatientSchema = new Schema<IPatient>({
  nom: { 
    type: String, 
    required: true, 
    trim: true,
    index: 'text' 
  },
  prenom: { 
    type: String, 
    required: true,
    trim: true, 
    index: 'text' 
  },
  dateNaissance: { 
    type: Date, 
    required: true 
  },
  sexe: { 
    type: String, 
    enum: ['M', 'F'],
    required: true
  },
  email: { 
    type: String,
    lowercase: true,
    trim: true
  },
  telephone: { 
    type: String,
    trim: true
  },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: { 
      type: String, 
      default: 'France' 
    }
  },
  dossierMedical: {
    numeroSecu: String,
    medecin: String,
    antecedents: [String],
    allergies: [String],
    traitements: [String]
  },
  metadata: {
    source: String,
    importedAt: Date,
    tags: [String]
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

PatientSchema.virtual('age').get(function() {
  if (!this.dateNaissance) return null
  const today = new Date()
  const birthDate = new Date(this.dateNaissance)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
})

PatientSchema.index({ nom: 'text', prenom: 'text' })
PatientSchema.index({ dateNaissance: 1 })
PatientSchema.index({ createdAt: -1 })

const Patient: Model<IPatient> = models.Patient || model<IPatient>('Patient', PatientSchema)

export default Patient