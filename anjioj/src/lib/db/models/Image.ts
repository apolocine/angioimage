import { Schema, model, models, Model, Types } from 'mongoose'

export interface IImage {
  _id?: string
  examenId: Types.ObjectId | string
  filename: string
  originalName?: string
  url: string
  thumbnailUrl?: string
  mimeType: string
  size: number
  dimensions?: {
    width: number
    height: number
  }
  imageType?: 'fond_oeil_normal' | 'fond_oeil_rouge' | 'fond_oeil_vert' | 'fond_oeil_bleu' | 'angiographie_fluoresceine' | 'angiographie_icg' | 'oct' | 'retinographie' | 'autofluorescence' | 'infrarouge' | 'autre'
  metadata?: {
    camera?: string
    lens?: string
    iso?: number
    exposure?: string
    focal?: string
    flash?: boolean
    filter?: string
    illumination?: string
    mydriasis?: boolean
    gps?: {
      latitude: number
      longitude: number
    }
    medical?: {
      modality?: string
      bodyPart?: string
      viewPosition?: string
      acquisitionTime?: Date
    }
  }
  processing?: {
    isProcessed: boolean
    originalUrl?: string
    edits?: Array<{
      type: 'crop' | 'resize' | 'filter' | 'annotation'
      parameters: any
      appliedAt: Date
      appliedBy: string
    }>
    annotations?: Array<{
      type: 'arrow' | 'circle' | 'text' | 'measurement'
      coordinates: {
        x: number
        y: number
        x2?: number
        y2?: number
      }
      text?: string
      color?: string
      createdBy: string
      createdAt: Date
    }>
  }
  angiography?: {
    phase?: 'precoce' | 'intermediaire' | 'tardive'
    timeFromInjection?: number
    fluoresceinVisible?: boolean
    quality?: 'excellente' | 'bonne' | 'moyenne' | 'mauvaise'
  }
  status: 'uploaded' | 'processing' | 'ready' | 'error'
  uploadedBy: Types.ObjectId | string
  createdAt?: Date
  updatedAt?: Date
}

const ImageSchema = new Schema<IImage>({
  examenId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Exam', 
    required: true,
    index: true
  },
  filename: { 
    type: String, 
    required: true 
  },
  originalName: String,
  url: { 
    type: String, 
    required: true 
  },
  thumbnailUrl: String,
  mimeType: { 
    type: String, 
    required: true 
  },
  size: { 
    type: Number, 
    required: true 
  },
  imageType: {
    type: String,
    enum: ['fond_oeil_normal', 'fond_oeil_rouge', 'fond_oeil_vert', 'fond_oeil_bleu', 'angiographie_fluoresceine', 'angiographie_icg', 'oct', 'retinographie', 'autofluorescence', 'infrarouge', 'autre'],
    default: 'fond_oeil_normal'
  },
  dimensions: {
    width: Number,
    height: Number
  },
  metadata: {
    camera: String,
    lens: String,
    iso: Number,
    exposure: String,
    focal: String,
    flash: Boolean,
    filter: String,
    illumination: String,
    mydriasis: Boolean,
    gps: {
      latitude: Number,
      longitude: Number
    },
    medical: {
      modality: String,
      bodyPart: String,
      viewPosition: String,
      acquisitionTime: Date
    }
  },
  processing: {
    isProcessed: { 
      type: Boolean, 
      default: false 
    },
    originalUrl: String,
    edits: [{
      type: { 
        type: String, 
        enum: ['crop', 'resize', 'filter', 'annotation'] 
      },
      parameters: Schema.Types.Mixed,
      appliedAt: Date,
      appliedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
      }
    }],
    annotations: [{
      type: { 
        type: String, 
        enum: ['arrow', 'circle', 'text', 'measurement'] 
      },
      coordinates: {
        x: Number,
        y: Number,
        x2: Number,
        y2: Number
      },
      text: String,
      color: String,
      createdBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }]
  },
  angiography: {
    phase: { 
      type: String, 
      enum: ['precoce', 'intermediaire', 'tardive'] 
    },
    timeFromInjection: Number,
    fluoresceinVisible: Boolean,
    quality: { 
      type: String, 
      enum: ['excellente', 'bonne', 'moyenne', 'mauvaise'] 
    }
  },
  status: { 
    type: String, 
    enum: ['uploaded', 'processing', 'ready', 'error'], 
    default: 'uploaded' 
  },
  uploadedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

ImageSchema.index({ examenId: 1, 'angiography.phase': 1 })
ImageSchema.index({ status: 1 })
ImageSchema.index({ createdAt: -1 })

const Image: Model<IImage> = models.Image || model<IImage>('Image', ImageSchema)

export default Image