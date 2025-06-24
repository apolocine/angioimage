import mongoose, { Schema, Document } from 'mongoose'

export interface IReport extends Document {
  _id: string
  title: string
  patientId: mongoose.Types.ObjectId
  examIds: mongoose.Types.ObjectId[]
  imageIds: mongoose.Types.ObjectId[]
  templateId?: mongoose.Types.ObjectId
  status: 'draft' | 'final' | 'archived'
  format: 'A4' | 'A5' | 'Letter'
  orientation: 'portrait' | 'landscape'
  content: {
    introduction?: string
    conclusion?: string
    findings?: string
    recommendations?: string
  }
  layout: {
    imagesPerRow: number
    includeHeader: boolean
    includeFooter: boolean
    includePageNumbers: boolean
    margins: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  metadata: {
    generatedAt?: Date
    generatedBy: mongoose.Types.ObjectId
    fileSize?: number
    pageCount?: number
    filePath?: string
  }
  createdAt: Date
  updatedAt: Date
}

const ReportSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  examIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Exam'
  }],
  imageIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Image'
  }],
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'ReportTemplate'
  },
  status: {
    type: String,
    enum: ['draft', 'final', 'archived'],
    default: 'draft'
  },
  format: {
    type: String,
    enum: ['A4', 'A5', 'Letter'],
    default: 'A4'
  },
  orientation: {
    type: String,
    enum: ['portrait', 'landscape'],
    default: 'portrait'
  },
  content: {
    introduction: String,
    conclusion: String,
    findings: String,
    recommendations: String
  },
  layout: {
    imagesPerRow: {
      type: Number,
      default: 2,
      min: 1,
      max: 6
    },
    includeHeader: {
      type: Boolean,
      default: true
    },
    includeFooter: {
      type: Boolean,
      default: true
    },
    includePageNumbers: {
      type: Boolean,
      default: true
    },
    margins: {
      top: { type: Number, default: 20 },
      right: { type: Number, default: 20 },
      bottom: { type: Number, default: 20 },
      left: { type: Number, default: 20 }
    }
  },
  metadata: {
    generatedAt: Date,
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileSize: Number,
    pageCount: Number,
    filePath: String
  }
}, {
  timestamps: true
})

// Index pour recherche et tri
ReportSchema.index({ patientId: 1, createdAt: -1 })
ReportSchema.index({ status: 1, createdAt: -1 })
ReportSchema.index({ 'metadata.generatedBy': 1 })

// TODO: Fix populate hook TypeScript issues
// ReportSchema.pre(/^find/, function(next) {
//   this.populate('patientId', 'nom prenom dateNaissance')
//     .populate('examIds', 'type date oeil status')
//     .populate('templateId', 'name description')
//     .populate('metadata.generatedBy', 'name email')
//   next()
// })

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)