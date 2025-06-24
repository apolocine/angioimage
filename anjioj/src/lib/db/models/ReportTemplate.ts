import mongoose, { Schema, Document } from 'mongoose'

export interface IReportTemplate extends Document {
  _id: string
  name: string
  description?: string
  category: 'general' | 'angiography' | 'oct' | 'retinography' | 'custom'
  isDefault: boolean
  isActive: boolean
  layout: {
    format: 'A4' | 'A5' | 'Letter'
    orientation: 'portrait' | 'landscape'
    imagesPerRow: number
    margins: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  sections: {
    header: {
      enabled: boolean
      content: string
      height: number
    }
    footer: {
      enabled: boolean
      content: string
      height: number
    }
    patientInfo: {
      enabled: boolean
      position: 'top' | 'sidebar'
      fields: string[]
    }
    examInfo: {
      enabled: boolean
      includeDetails: boolean
    }
    introduction: {
      enabled: boolean
      defaultContent?: string
    }
    images: {
      enabled: boolean
      showMetadata: boolean
      groupByExam: boolean
    }
    findings: {
      enabled: boolean
      defaultContent?: string
    }
    conclusion: {
      enabled: boolean
      defaultContent?: string
    }
    recommendations: {
      enabled: boolean
      defaultContent?: string
    }
  }
  styling: {
    fontFamily: string
    fontSize: {
      title: number
      heading: number
      body: number
      caption: number
    }
    colors: {
      primary: string
      secondary: string
      text: string
      background: string
    }
    spacing: {
      sectionGap: number
      paragraphGap: number
    }
  }
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ReportTemplateSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'angiography', 'oct', 'retinography', 'custom'],
    default: 'general'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  layout: {
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
    imagesPerRow: {
      type: Number,
      default: 2,
      min: 1,
      max: 6
    },
    margins: {
      top: { type: Number, default: 25 },
      right: { type: Number, default: 25 },
      bottom: { type: Number, default: 25 },
      left: { type: Number, default: 25 }
    }
  },
  sections: {
    header: {
      enabled: { type: Boolean, default: true },
      content: { type: String, default: 'Rapport d\'Examen Ophtalmologique' },
      height: { type: Number, default: 60 }
    },
    footer: {
      enabled: { type: Boolean, default: true },
      content: { type: String, default: 'Page {{pageNumber}} sur {{totalPages}}' },
      height: { type: Number, default: 30 }
    },
    patientInfo: {
      enabled: { type: Boolean, default: true },
      position: { type: String, enum: ['top', 'sidebar'], default: 'top' },
      fields: {
        type: [String],
        default: ['nom', 'prenom', 'dateNaissance', 'age']
      }
    },
    examInfo: {
      enabled: { type: Boolean, default: true },
      includeDetails: { type: Boolean, default: true }
    },
    introduction: {
      enabled: { type: Boolean, default: true },
      defaultContent: String
    },
    images: {
      enabled: { type: Boolean, default: true },
      showMetadata: { type: Boolean, default: true },
      groupByExam: { type: Boolean, default: true }
    },
    findings: {
      enabled: { type: Boolean, default: true },
      defaultContent: String
    },
    conclusion: {
      enabled: { type: Boolean, default: true },
      defaultContent: String
    },
    recommendations: {
      enabled: { type: Boolean, default: false },
      defaultContent: String
    }
  },
  styling: {
    fontFamily: {
      type: String,
      default: 'Arial, sans-serif'
    },
    fontSize: {
      title: { type: Number, default: 18 },
      heading: { type: Number, default: 14 },
      body: { type: Number, default: 11 },
      caption: { type: Number, default: 9 }
    },
    colors: {
      primary: { type: String, default: '#2563eb' },
      secondary: { type: String, default: '#64748b' },
      text: { type: String, default: '#1f2937' },
      background: { type: String, default: '#ffffff' }
    },
    spacing: {
      sectionGap: { type: Number, default: 15 },
      paragraphGap: { type: Number, default: 8 }
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Index pour recherche
ReportTemplateSchema.index({ category: 1, isActive: 1 })
ReportTemplateSchema.index({ isDefault: 1 })

// Populate automatique
ReportTemplateSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'nom email'
  })
  next()
})

export default mongoose.models.ReportTemplate || mongoose.model<IReportTemplate>('ReportTemplate', ReportTemplateSchema)