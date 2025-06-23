import { Schema, model, models, Model } from 'mongoose'

export interface IExam {
  _id?: string
  patientId: string
  type: 'angiographie' | 'retinographie' | 'oct'
  date: Date
  oeil: 'OD' | 'OS' | 'OU'
  indication?: string
  diagnostic?: string
  conclusion?: string
  angiographie?: {
    fluoresceine?: {
      injected: boolean
      injectionTime?: Date
      phases?: Array<{
        name: 'precoce' | 'intermediaire' | 'tardive'
        startTime: number
        endTime: number
        imageIds: string[]
      }>
    }
    protocole?: string
    complications?: string[]
  }
  status: 'planifie' | 'en_cours' | 'termine' | 'annule'
  praticien?: string
  rapport?: {
    generated: boolean
    pdfUrl?: string
    template?: string
  }
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

const ExamSchema = new Schema<IExam>({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true,
    index: true
  },
  type: { 
    type: String, 
    enum: ['angiographie', 'retinographie', 'oct'], 
    required: true 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now,
    index: true
  },
  oeil: { 
    type: String, 
    enum: ['OD', 'OS', 'OU'],
    required: true
  },
  indication: String,
  diagnostic: String,
  conclusion: String,
  angiographie: {
    fluoresceine: {
      injected: { 
        type: Boolean, 
        default: false 
      },
      injectionTime: Date,
      phases: [{
        name: { 
          type: String, 
          enum: ['precoce', 'intermediaire', 'tardive'] 
        },
        startTime: Number,
        endTime: Number,
        imageIds: [{ 
          type: Schema.Types.ObjectId, 
          ref: 'Image' 
        }]
      }]
    },
    protocole: String,
    complications: [String]
  },
  status: { 
    type: String, 
    enum: ['planifie', 'en_cours', 'termine', 'annule'], 
    default: 'planifie',
    index: true
  },
  praticien: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rapport: {
    generated: { 
      type: Boolean, 
      default: false 
    },
    pdfUrl: String,
    template: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

// Index composés pour les requêtes fréquentes
ExamSchema.index({ patientId: 1, date: -1 })
ExamSchema.index({ patientId: 1, status: 1 })
ExamSchema.index({ type: 1, status: 1 })
ExamSchema.index({ createdAt: -1 })

// Virtual pour compter les images
ExamSchema.virtual('imageCount', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'examenId',
  count: true
})

const Exam: Model<IExam> = models.Exam || model<IExam>('Exam', ExamSchema)

export default Exam