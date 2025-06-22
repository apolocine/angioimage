# Document d'Architecture - Angioimage Web (Next.js + MongoDB)

## 1. VUE D'ENSEMBLE ARCHITECTURE

### 1.1 Architecture Monolithique Moderne
```
┌─────────────────────────────────────────────────────────┐
│                   NAVIGATEUR CLIENT                     │
│              (React + TypeScript + PWA)                 │
├─────────────────────────────────────────────────────────┤
│                   NEXT.JS MONOLITHE                     │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   APP ROUTER    │  │   API ROUTES    │              │
│  │  (src/app/*)    │  │  (src/app/api)  │              │
│  └─────────────────┘  └─────────────────┘              │
├─────────────────────────────────────────────────────────┤
│              COUCHE SERVICES & UTILS                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │   DB    │ │  Auth   │ │ Images  │ │ Reports │      │
│  │ Service │ │ Service │ │ Service │ │ Service │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────────────────┤
│                   MONGODB ATLAS                        │
│     (Patients + Examens + Images + Users)              │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Patterns Architecturaux
- **Monolithe Modulaire** : Séparation logique en modules
- **API-First** : API Routes Next.js pour toutes les données
- **Component-Driven** : Composants React réutilisables
- **Service Layer** : Logique métier centralisée
- **Repository Pattern** : Abstraction de la base de données

## 2. ARCHITECTURE DÉTAILLÉE

### 2.1 Structure App Router (src/app/)
```typescript
src/app/
├── layout.tsx                  # Layout racine
├── page.tsx                    # Page d'accueil
├── globals.css                 # Styles globaux
├── (auth)/                     # Groupe d'authentification
│   ├── layout.tsx              # Layout auth
│   ├── login/
│   │   ├── page.tsx           # Page de connexion
│   │   └── components/        # Composants login
│   └── register/
│       └── page.tsx           # Page d'inscription
├── (dashboard)/               # Groupe application principale
│   ├── layout.tsx             # Layout dashboard avec sidebar
│   ├── dashboard/
│   │   ├── page.tsx          # Tableau de bord
│   │   └── components/       # Widgets dashboard
│   ├── patients/
│   │   ├── page.tsx          # Liste patients
│   │   ├── [id]/
│   │   │   ├── page.tsx      # Détail patient
│   │   │   ├── edit/
│   │   │   │   └── page.tsx  # Édition patient
│   │   │   └── examens/
│   │   │       ├── page.tsx  # Liste examens
│   │   │       └── [examId]/
│   │   │           └── page.tsx # Détail examen
│   │   ├── new/
│   │   │   └── page.tsx      # Nouveau patient
│   │   └── components/       # Composants patients
│   ├── images/
│   │   ├── page.tsx          # Galerie images
│   │   ├── [id]/
│   │   │   └── page.tsx      # Viewer image
│   │   ├── editor/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Éditeur image
│   │   └── components/       # Composants images
│   ├── angiography/
│   │   ├── page.tsx          # Planning angiographie
│   │   ├── capture/
│   │   │   └── [examId]/
│   │   │       └── page.tsx  # Interface capture
│   │   ├── analysis/
│   │   │   └── [examId]/
│   │   │       └── page.tsx  # Analyse séquences
│   │   └── components/       # Composants angiographie
│   ├── reports/
│   │   ├── page.tsx          # Liste rapports
│   │   ├── generator/
│   │   │   └── page.tsx      # Générateur rapport
│   │   ├── [id]/
│   │   │   └── page.tsx      # Viewer rapport
│   │   └── components/       # Composants rapports
│   └── settings/
│       ├── page.tsx          # Paramètres généraux
│       ├── profile/
│       │   └── page.tsx      # Profil utilisateur
│       └── system/
│           └── page.tsx      # Configuration système
└── api/                       # API Routes
    ├── auth/
    │   ├── login/route.ts     # POST /api/auth/login
    │   ├── logout/route.ts    # POST /api/auth/logout
    │   └── me/route.ts        # GET /api/auth/me
    ├── patients/
    │   ├── route.ts           # GET/POST /api/patients
    │   ├── [id]/
    │   │   ├── route.ts       # GET/PUT/DELETE /api/patients/[id]
    │   │   └── examens/
    │   │       └── route.ts   # GET/POST /api/patients/[id]/examens
    │   └── search/
    │       └── route.ts       # POST /api/patients/search
    ├── images/
    │   ├── route.ts           # GET/POST /api/images
    │   ├── [id]/
    │   │   ├── route.ts       # GET/PUT/DELETE /api/images/[id]
    │   │   ├── edit/
    │   │   │   └── route.ts   # POST /api/images/[id]/edit
    │   │   └── download/
    │   │       └── route.ts   # GET /api/images/[id]/download
    │   └── upload/
    │       └── route.ts       # POST /api/images/upload
    ├── angiography/
    │   ├── capture/
    │   │   └── route.ts       # POST /api/angiography/capture
    │   ├── analysis/
    │   │   └── route.ts       # POST /api/angiography/analysis
    │   └── fluorescein/
    │       └── route.ts       # POST /api/angiography/fluorescein
    └── reports/
        ├── route.ts           # GET/POST /api/reports
        ├── [id]/
        │   └── route.ts       # GET/PUT/DELETE /api/reports/[id]
        ├── generate/
        │   └── route.ts       # POST /api/reports/generate
        └── pdf/
            └── route.ts       # POST /api/reports/pdf
```

### 2.2 Couche Services (src/lib/)
```typescript
src/lib/
├── db/
│   ├── mongodb.ts             # Connexion MongoDB
│   ├── models/                # Modèles de données
│   │   ├── User.ts
│   │   ├── Patient.ts
│   │   ├── Exam.ts
│   │   └── Image.ts
│   └── repositories/          # Couche d'accès données
│       ├── UserRepository.ts
│       ├── PatientRepository.ts
│       ├── ExamRepository.ts
│       └── ImageRepository.ts
├── auth/
│   ├── config.ts              # Configuration NextAuth.js
│   ├── providers.ts           # Providers d'authentification
│   ├── middleware.ts          # Middleware d'auth
│   └── utils.ts               # Utilitaires auth
├── services/
│   ├── PatientService.ts      # Logique métier patients
│   ├── ImageService.ts        # Logique métier images
│   ├── AngiographyService.ts  # Logique métier angiographie
│   ├── ReportService.ts       # Logique métier rapports
│   └── StorageService.ts      # Gestion stockage fichiers
├── image/
│   ├── processor.ts           # Traitement d'images
│   ├── filters.ts             # Filtres et effets
│   ├── metadata.ts            # Extraction métadonnées
│   └── thumbnail.ts           # Génération thumbnails
├── pdf/
│   ├── generator.ts           # Génération PDF
│   ├── templates.ts           # Templates de rapports
│   └── components.ts          # Composants PDF
├── utils/
│   ├── validation.ts          # Schémas de validation
│   ├── constants.ts           # Constantes
│   ├── errors.ts              # Gestion d'erreurs
│   ├── helpers.ts             # Fonctions utilitaires
│   └── logger.ts              # Système de logs
└── types/
    ├── api.ts                 # Types API
    ├── database.ts            # Types base de données
    ├── auth.ts                # Types authentification
    └── global.d.ts            # Types globaux
```

### 2.3 Composants Réutilisables (src/components/)
```typescript
src/components/
├── ui/                        # Composants UI de base
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Card.tsx
│   ├── Dropdown.tsx
│   ├── Spinner.tsx
│   └── Toast.tsx
├── forms/                     # Composants de formulaires
│   ├── PatientForm.tsx
│   ├── ExamForm.tsx
│   ├── SearchForm.tsx
│   └── SettingsForm.tsx
├── layout/                    # Composants de layout
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Navigation.tsx
│   └── Footer.tsx
├── medical/                   # Composants spécifiques médical
│   ├── ImageViewer.tsx
│   ├── ImageEditor.tsx
│   ├── AngiographyViewer.tsx
│   ├── TimelineViewer.tsx
│   ├── PatientCard.tsx
│   └── ExamCard.tsx
├── charts/                    # Composants graphiques
│   ├── ProgressChart.tsx
│   ├── StatisticsChart.tsx
│   └── AnalyticsChart.tsx
└── providers/                 # Providers React Context
    ├── AuthProvider.tsx
    ├── ThemeProvider.tsx
    ├── NotificationProvider.tsx
    └── ModalProvider.tsx
```

## 3. MODÈLES DE DONNÉES MONGODB

### 3.1 Schémas Mongoose
```typescript
// src/lib/db/models/User.ts
import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'doctor', 'assistant'], 
    default: 'doctor' 
  },
  settings: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'fr' },
    notifications: { type: Boolean, default: true }
  },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

// src/lib/db/models/Patient.ts
const PatientSchema = new Schema({
  nom: { type: String, required: true, index: 'text' },
  prenom: { type: String, required: true, index: 'text' },
  dateNaissance: { type: Date, required: true },
  sexe: { type: String, enum: ['M', 'F'] },
  email: { type: String },
  telephone: { type: String },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: { type: String, default: 'France' }
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

// src/lib/db/models/Exam.ts
const ExamSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  type: { 
    type: String, 
    enum: ['angiographie', 'retinographie', 'oct'], 
    required: true 
  },
  date: { type: Date, required: true, default: Date.now },
  oeil: { type: String, enum: ['OD', 'OS', 'OU'] },
  indication: { type: String },
  diagnostic: { type: String },
  conclusion: { type: String },
  angiographie: {
    fluoresceine: {
      injected: { type: Boolean, default: false },
      injectionTime: Date,
      phases: [{
        name: { type: String, enum: ['precoce', 'intermediaire', 'tardive'] },
        startTime: Number,
        endTime: Number,
        imageIds: [{ type: Schema.Types.ObjectId, ref: 'Image' }]
      }]
    },
    protocole: String,
    complications: [String]
  },
  status: { 
    type: String, 
    enum: ['planifie', 'en_cours', 'termine', 'annule'], 
    default: 'planifie' 
  },
  praticien: { type: Schema.Types.ObjectId, ref: 'User' },
  rapport: {
    generated: { type: Boolean, default: false },
    pdfUrl: String,
    template: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

// src/lib/db/models/Image.ts
const ImageSchema = new Schema({
  examenId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  filename: { type: String, required: true },
  originalName: { type: String },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
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
    isProcessed: { type: Boolean, default: false },
    originalUrl: String,
    edits: [{
      type: { type: String, enum: ['crop', 'resize', 'filter', 'annotation'] },
      parameters: Schema.Types.Mixed,
      appliedAt: Date,
      appliedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    annotations: [{
      type: { type: String, enum: ['arrow', 'circle', 'text', 'measurement'] },
      coordinates: {
        x: Number,
        y: Number,
        x2: Number,
        y2: Number
      },
      text: String,
      color: String,
      createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  angiography: {
    phase: { type: String, enum: ['precoce', 'intermediaire', 'tardive'] },
    timeFromInjection: Number,
    fluoresceinVisible: Boolean,
    quality: { type: String, enum: ['excellente', 'bonne', 'moyenne', 'mauvaise'] }
  },
  status: { 
    type: String, 
    enum: ['uploaded', 'processing', 'ready', 'error'], 
    default: 'uploaded' 
  },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})
```

### 3.2 Index et Performance
```javascript
// Index de performance MongoDB
// Recherche patients
db.patients.createIndex({ 
  "nom": "text", 
  "prenom": "text" 
}, { 
  name: "patient_search_index" 
})

// Examens par patient et date
db.exams.createIndex({ 
  "patientId": 1, 
  "date": -1 
}, { 
  name: "exam_patient_date_index" 
})

// Images par examen et phase
db.images.createIndex({ 
  "examenId": 1, 
  "angiography.phase": 1,
  "angiography.timeFromInjection": 1
}, { 
  name: "image_angio_index" 
})

// Recherche full-text
db.patients.createIndex({
  "$**": "text"
}, {
  name: "patient_fulltext_index",
  default_language: "french"
})
```

## 4. API ROUTES ET ENDPOINTS

### 4.1 Architecture API
```typescript
// src/app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PatientService } from '@/lib/services/PatientService'
import { auth } from '@/lib/auth/config'
import { validateRequest } from '@/lib/utils/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const patients = await PatientService.getPatients({
      page,
      limit,
      search,
      userId: session.user.id
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Erreur API patients:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['admin', 'doctor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' }, 
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = validateRequest(body, 'createPatient')

    const patient = await PatientService.createPatient({
      ...validatedData,
      createdBy: session.user.id
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      )
    }
    
    console.error('Erreur création patient:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    )
  }
}
```

### 4.2 Service Layer
```typescript
// src/lib/services/PatientService.ts
import { PatientRepository } from '@/lib/db/repositories/PatientRepository'
import { ExamRepository } from '@/lib/db/repositories/ExamRepository'
import { StorageService } from './StorageService'
import type { Patient, CreatePatientDto } from '@/lib/types/database'

export class PatientService {
  static async getPatients(options: {
    page: number
    limit: number
    search?: string
    userId: string
  }) {
    const { page, limit, search } = options
    const offset = (page - 1) * limit

    const query = search ? {
      $text: { $search: search }
    } : {}

    const [patients, total] = await Promise.all([
      PatientRepository.find(query)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('lastExam'),
      PatientRepository.countDocuments(query)
    ])

    return {
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async createPatient(data: CreatePatientDto) {
    // Validation des données
    const existingPatient = await PatientRepository.findOne({
      nom: data.nom,
      prenom: data.prenom,
      dateNaissance: data.dateNaissance
    })

    if (existingPatient) {
      throw new Error('Un patient avec ces informations existe déjà')
    }

    // Création du répertoire patient
    const patientDir = await StorageService.createPatientDirectory(data)

    // Création en base
    const patient = await PatientRepository.create({
      ...data,
      metadata: {
        ...data.metadata,
        directory: patientDir
      }
    })

    return patient
  }

  static async getPatientById(id: string) {
    const patient = await PatientRepository.findById(id)
      .populate({
        path: 'examens',
        populate: {
          path: 'images',
          select: 'url thumbnailUrl type angiography.phase'
        }
      })

    if (!patient) {
      throw new Error('Patient non trouvé')
    }

    return patient
  }

  static async updatePatient(id: string, data: Partial<Patient>) {
    const patient = await PatientRepository.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!patient) {
      throw new Error('Patient non trouvé')
    }

    return patient
  }

  static async deletePatient(id: string) {
    // Vérifier les examens associés
    const examCount = await ExamRepository.countDocuments({ patientId: id })
    
    if (examCount > 0) {
      throw new Error('Impossible de supprimer un patient avec des examens')
    }

    // Supprimer le répertoire patient
    await StorageService.deletePatientDirectory(id)

    // Supprimer en base
    const patient = await PatientRepository.findByIdAndDelete(id)
    
    if (!patient) {
      throw new Error('Patient non trouvé')
    }

    return { success: true }
  }
}
```

## 5. AUTHENTIFICATION ET SÉCURITÉ

### 5.1 Configuration NextAuth.js
```typescript
// src/lib/auth/config.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRepository } from '@/lib/db/repositories/UserRepository'
import { comparePassword } from '@/lib/utils/crypto'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await UserRepository.findOne({ 
          email: credentials.email 
        })

        if (!user || !user.isActive) {
          return null
        }

        const isValidPassword = await comparePassword(
          credentials.password,
          user.password
        )

        if (!isValidPassword) {
          return null
        }

        // Mise à jour dernière connexion
        await UserRepository.findByIdAndUpdate(user._id, {
          lastLogin: new Date()
        })

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 heures
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  }
})
```

### 5.2 Middleware de Protection
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Routes publiques
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Routes API
  if (pathname.startsWith('/api/')) {
    // Protection API
    if (!pathname.startsWith('/api/auth/') && !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Redirection si non connecté
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirection si connecté vers page auth
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
```

## 6. GESTION D'ÉTAT ET HOOKS

### 6.1 Store Zustand Global
```typescript
// src/lib/store/useAppStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, Patient, Exam } from '@/lib/types/database'

interface AppState {
  // Utilisateur
  user: User | null
  setUser: (user: User | null) => void
  
  // Patients
  patients: Patient[]
  currentPatient: Patient | null
  setPatients: (patients: Patient[]) => void
  setCurrentPatient: (patient: Patient | null) => void
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  removePatient: (id: string) => void
  
  // Examens
  currentExam: Exam | null
  setCurrentExam: (exam: Exam | null) => void
  
  // UI
  ui: {
    sidebarOpen: boolean
    theme: 'light' | 'dark'
    loading: boolean
    notifications: Notification[]
  }
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // State initial
        user: null,
        patients: [],
        currentPatient: null,
        currentExam: null,
        ui: {
          sidebarOpen: true,
          theme: 'light',
          loading: false,
          notifications: []
        },

        // Actions utilisateur
        setUser: (user) => set({ user }),
        
        // Actions patients
        setPatients: (patients) => set({ patients }),
        setCurrentPatient: (patient) => set({ currentPatient: patient }),
        addPatient: (patient) => set((state) => ({
          patients: [patient, ...state.patients]
        })),
        updatePatient: (id, updates) => set((state) => ({
          patients: state.patients.map(p => 
            p._id === id ? { ...p, ...updates } : p
          ),
          currentPatient: state.currentPatient?._id === id 
            ? { ...state.currentPatient, ...updates }
            : state.currentPatient
        })),
        removePatient: (id) => set((state) => ({
          patients: state.patients.filter(p => p._id !== id),
          currentPatient: state.currentPatient?._id === id 
            ? null 
            : state.currentPatient
        })),
        
        // Actions examens
        setCurrentExam: (exam) => set({ currentExam: exam }),
        
        // Actions UI
        toggleSidebar: () => set((state) => ({
          ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
        })),
        setTheme: (theme) => set((state) => ({
          ui: { ...state.ui, theme }
        })),
        setLoading: (loading) => set((state) => ({
          ui: { ...state.ui, loading }
        })),
        addNotification: (notification) => set((state) => ({
          ui: {
            ...state.ui,
            notifications: [
              ...state.ui.notifications,
              { ...notification, id: Date.now().toString() }
            ]
          }
        })),
        removeNotification: (id) => set((state) => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter(n => n.id !== id)
          }
        }))
      }),
      {
        name: 'angioimage-store',
        partialize: (state) => ({
          ui: { theme: state.ui.theme }
        })
      }
    )
  )
)
```

### 6.2 Hooks Métier
```typescript
// src/lib/hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PatientService } from '@/lib/services/PatientService'
import { useAppStore } from '@/lib/store/useAppStore'

export function usePatients(options = {}) {
  const { addNotification } = useAppStore()
  
  return useQuery({
    queryKey: ['patients', options],
    queryFn: () => PatientService.getPatients(options),
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les patients'
      })
    }
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  const { addNotification, addPatient } = useAppStore()
  
  return useMutation({
    mutationFn: PatientService.createPatient,
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      addPatient(patient)
      addNotification({
        type: 'success',
        title: 'Succès',
        message: 'Patient créé avec succès'
      })
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: error.message || 'Erreur lors de la création'
      })
    }
  })
}
```

## 7. DÉPLOIEMENT ET INFRASTRUCTURE

### 7.1 Configuration Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 7.2 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  angioimage-web:
    build: .
    container_name: angioimage-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/angioimage
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  mongodb:
    image: mongo:7
    container_name: angioimage-mongo
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=angioimage
    volumes:
      - mongo_data:/data/db
      - ./scripts/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: angioimage-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: angioimage-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - angioimage-web
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

### 7.3 Configuration Vercel
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## 8. MONITORING ET OBSERVABILITÉ

### 8.1 Configuration Sentry
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: false,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^\//]
    })
  ]
})

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: false,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
})
```

### 8.2 Métriques et Analytics
```typescript
// src/lib/analytics/metrics.ts
import { Analytics } from '@vercel/analytics/react'

export class MetricsService {
  static trackEvent(event: string, properties: any) {
    if (typeof window !== 'undefined') {
      // Track custom events
      window.gtag?.('event', event, properties)
    }
  }

  static trackPageView(url: string) {
    if (typeof window !== 'undefined') {
      window.gtag?.('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_path: url
      })
    }
  }

  static trackError(error: Error) {
    console.error('Application Error:', error)
    
    if (typeof window !== 'undefined') {
      Sentry.captureException(error)
    }
  }
}
```

Cette architecture Next.js/MongoDB fournit une base solide et moderne pour l'application Angioimage, avec toutes les fonctionnalités nécessaires pour remplacer l'application Java existante tout en apportant les avantages d'une solution web moderne.