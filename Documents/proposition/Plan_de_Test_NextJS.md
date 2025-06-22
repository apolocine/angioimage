# Plan de Test - Angioimage Web (Next.js + MongoDB)

## 1. INTRODUCTION

### 1.1 Objectif du Plan de Test
Ce document définit la stratégie de test complète pour l'application web Angioimage développée avec Next.js et MongoDB. Il couvre tous les aspects : fonctionnels, non-fonctionnels, performance, sécurité et compatibilité multi-navigateurs.

### 1.2 Portée des Tests
- **Tests unitaires** : Composants React, hooks, services
- **Tests d'intégration** : API Routes, base de données
- **Tests E2E** : Workflows complets utilisateur
- **Tests de performance** : Temps de chargement, responsivité
- **Tests de sécurité** : Authentification, autorisation
- **Tests cross-browser** : Compatibilité navigateurs
- **Tests d'accessibilité** : Conformité WCAG 2.1
- **Tests mobile** : Responsive design et PWA

### 1.3 Environnements de Test
- **Développement** : Local avec MongoDB + Redis
- **Staging** : Déploiement Vercel avec MongoDB Atlas
- **Production** : Environment miroir pour tests
- **CI/CD** : GitHub Actions avec tests automatisés

## 2. STRATÉGIE DE TEST WEB

### 2.1 Pyramid de Tests
```
           ┌─────────────────┐
           │   Tests E2E     │  (10% - Cypress/Playwright)
           │    (Cypress)    │
           ├─────────────────┤
           │ Tests Integration│  (20% - Testing Library)
           │  (API + DB)     │
           ├─────────────────┤
           │  Tests Unitaires│  (70% - Jest + React Testing)
           │ (Components)    │
           └─────────────────┘
```

### 2.2 Technologies de Test
| Type | Framework | Usage |
|------|-----------|-------|
| **Unitaires** | Jest + React Testing Library | Composants, hooks, utilitaires |
| **Intégration** | Jest + Supertest | API Routes, services |
| **E2E** | Cypress | Workflows utilisateur complets |
| **Performance** | Lighthouse CI | Core Web Vitals |
| **Accessibilité** | axe-core | WCAG compliance |
| **Visual** | Percy/Chromatic | Tests visuels |

### 2.3 Critères d'Acceptation
- **Tests unitaires** : Coverage > 80%
- **Tests E2E** : 100% des user journeys critiques
- **Performance** : Lighthouse score > 90
- **Accessibilité** : Score axe-core 100%
- **Cross-browser** : Chrome, Firefox, Safari, Edge
- **Mobile** : iOS Safari, Android Chrome

## 3. TESTS UNITAIRES

### 3.1 Configuration Jest
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 3.2 Tests de Composants React
```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 3.3 Tests de Hooks Personnalisés
```typescript
// src/lib/hooks/usePatients.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePatients } from './usePatients'
import * as PatientService from '@/lib/services/PatientService'

// Mock du service
jest.mock('@/lib/services/PatientService')
const mockPatientService = PatientService as jest.Mocked<typeof PatientService>

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('usePatients hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches patients successfully', async () => {
    const mockPatients = [
      { _id: '1', nom: 'Doe', prenom: 'John', dateNaissance: new Date() }
    ]
    
    mockPatientService.getPatients.mockResolvedValue({
      patients: mockPatients,
      pagination: { page: 1, limit: 10, total: 1, pages: 1 }
    })

    const { result } = renderHook(() => usePatients(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data.patients).toEqual(mockPatients)
  })

  it('handles error states correctly', async () => {
    mockPatientService.getPatients.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => usePatients(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
```

### 3.4 Tests de Services
```typescript
// src/lib/services/PatientService.test.ts
import { PatientService } from './PatientService'
import { PatientRepository } from '@/lib/db/repositories/PatientRepository'
import { StorageService } from './StorageService'

jest.mock('@/lib/db/repositories/PatientRepository')
jest.mock('./StorageService')

const mockPatientRepository = PatientRepository as jest.Mocked<typeof PatientRepository>
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>

describe('PatientService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createPatient', () => {
    it('creates a new patient successfully', async () => {
      const patientData = {
        nom: 'Doe',
        prenom: 'John',
        dateNaissance: new Date('1990-01-01'),
        email: 'john.doe@example.com'
      }

      mockPatientRepository.findOne.mockResolvedValue(null)
      mockStorageService.createPatientDirectory.mockResolvedValue('/path/to/dir')
      mockPatientRepository.create.mockResolvedValue({
        _id: '1',
        ...patientData,
        metadata: { directory: '/path/to/dir' }
      })

      const result = await PatientService.createPatient(patientData)

      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
        nom: patientData.nom,
        prenom: patientData.prenom,
        dateNaissance: patientData.dateNaissance
      })
      expect(mockStorageService.createPatientDirectory).toHaveBeenCalledWith(patientData)
      expect(result._id).toBe('1')
    })

    it('throws error when patient already exists', async () => {
      const patientData = {
        nom: 'Doe',
        prenom: 'John',
        dateNaissance: new Date('1990-01-01')
      }

      mockPatientRepository.findOne.mockResolvedValue({ _id: 'existing' })

      await expect(PatientService.createPatient(patientData))
        .rejects
        .toThrow('Un patient avec ces informations existe déjà')
    })
  })
})
```

## 4. TESTS D'INTÉGRATION

### 4.1 Tests API Routes
```typescript
// src/app/api/patients/route.test.ts
import { createMocks } from 'node-mocks-http'
import { GET, POST } from './route'
import { auth } from '@/lib/auth/config'
import { PatientService } from '@/lib/services/PatientService'

jest.mock('@/lib/auth/config')
jest.mock('@/lib/services/PatientService')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockPatientService = PatientService as jest.Mocked<typeof PatientService>

describe('/api/patients', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/patients', () => {
    it('returns patients for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'doctor' }
      }
      
      const mockPatientsData = {
        patients: [
          { _id: '1', nom: 'Doe', prenom: 'John' }
        ],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 }
      }

      mockAuth.mockResolvedValue(mockSession)
      mockPatientService.getPatients.mockResolvedValue(mockPatientsData)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/patients?page=1&limit=10'
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.patients).toEqual(mockPatientsData.patients)
    })

    it('returns 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/patients'
      })

      const response = await GET(req as any)
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/patients', () => {
    it('creates patient for authorized user', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'doctor' }
      }

      const patientData = {
        nom: 'Doe',
        prenom: 'John',
        dateNaissance: '1990-01-01'
      }

      const createdPatient = { _id: '1', ...patientData }

      mockAuth.mockResolvedValue(mockSession)
      mockPatientService.createPatient.mockResolvedValue(createdPatient)

      const { req } = createMocks({
        method: 'POST',
        body: patientData
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data._id).toBe('1')
    })

    it('returns 403 for assistant role', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'assistant' }
      }

      mockAuth.mockResolvedValue(mockSession)

      const { req } = createMocks({
        method: 'POST',
        body: { nom: 'Doe', prenom: 'John' }
      })

      const response = await POST(req as any)
      expect(response.status).toBe(403)
    })
  })
})
```

### 4.2 Tests Base de Données
```typescript
// src/lib/db/repositories/PatientRepository.test.ts
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { PatientRepository } from './PatientRepository'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
})

beforeEach(async () => {
  await PatientRepository.deleteMany({})
})

describe('PatientRepository', () => {
  it('creates a patient successfully', async () => {
    const patientData = {
      nom: 'Doe',
      prenom: 'John',
      dateNaissance: new Date('1990-01-01'),
      email: 'john.doe@example.com'
    }

    const patient = await PatientRepository.create(patientData)

    expect(patient._id).toBeDefined()
    expect(patient.nom).toBe('Doe')
    expect(patient.prenom).toBe('John')
    expect(patient.createdAt).toBeDefined()
  })

  it('finds patients by text search', async () => {
    await PatientRepository.create([
      { nom: 'Doe', prenom: 'John', dateNaissance: new Date() },
      { nom: 'Smith', prenom: 'Jane', dateNaissance: new Date() },
      { nom: 'Brown', prenom: 'Bob', dateNaissance: new Date() }
    ])

    const results = await PatientRepository.find({
      $text: { $search: 'John' }
    })

    expect(results).toHaveLength(1)
    expect(results[0].prenom).toBe('John')
  })

  it('handles validation errors', async () => {
    const invalidData = {
      nom: '', // Required field empty
      prenom: 'John'
    }

    await expect(PatientRepository.create(invalidData))
      .rejects
      .toThrow(/validation failed/)
  })
})
```

## 5. TESTS END-TO-END (E2E)

### 5.1 Configuration Cypress
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      TEST_USER_EMAIL: 'test@example.com',
      TEST_USER_PASSWORD: 'password123'
    }
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})
```

### 5.2 Tests de Workflow Complet
```typescript
// cypress/e2e/patient-management.cy.ts
describe('Patient Management Workflow', () => {
  beforeEach(() => {
    // Login avant chaque test
    cy.login()
    cy.visit('/dashboard/patients')
  })

  it('should create a new patient', () => {
    cy.get('[data-testid="new-patient-btn"]').click()
    
    // Remplir le formulaire
    cy.get('[data-testid="nom-input"]').type('Doe')
    cy.get('[data-testid="prenom-input"]').type('John')
    cy.get('[data-testid="date-naissance-input"]').type('1990-01-01')
    cy.get('[data-testid="email-input"]').type('john.doe@example.com')
    
    // Soumettre
    cy.get('[data-testid="submit-btn"]').click()
    
    // Vérifier la création
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Patient créé avec succès')
    
    // Vérifier la redirection
    cy.url().should('include', '/patients/')
    cy.get('[data-testid="patient-name"]').should('contain', 'John Doe')
  })

  it('should search for patients', () => {
    // Créer un patient de test
    cy.createTestPatient({ nom: 'Smith', prenom: 'Jane' })
    
    cy.visit('/dashboard/patients')
    
    // Utiliser la recherche
    cy.get('[data-testid="search-input"]').type('Jane')
    cy.get('[data-testid="search-btn"]').click()
    
    // Vérifier les résultats
    cy.get('[data-testid="patient-list"]')
      .should('contain', 'Jane Smith')
      .and('not.contain', 'John Doe')
  })

  it('should edit patient information', () => {
    // Créer et sélectionner un patient
    cy.createTestPatient({ nom: 'Brown', prenom: 'Bob' })
    cy.visit('/dashboard/patients')
    
    cy.get('[data-testid="patient-card"]').first().click()
    cy.get('[data-testid="edit-patient-btn"]').click()
    
    // Modifier les informations
    cy.get('[data-testid="email-input"]')
      .clear()
      .type('bob.brown@example.com')
    
    cy.get('[data-testid="submit-btn"]').click()
    
    // Vérifier la mise à jour
    cy.get('[data-testid="patient-email"]')
      .should('contain', 'bob.brown@example.com')
  })
})
```

### 5.3 Tests d'Images et Angiographie
```typescript
// cypress/e2e/angiography-workflow.cy.ts
describe('Angiography Workflow', () => {
  beforeEach(() => {
    cy.login()
    cy.createTestPatient({ nom: 'Test', prenom: 'Angio' })
  })

  it('should upload and process angiography images', () => {
    cy.visit('/dashboard/patients')
    cy.get('[data-testid="patient-card"]').first().click()
    
    // Créer un nouvel examen
    cy.get('[data-testid="new-exam-btn"]').click()
    cy.get('[data-testid="exam-type-select"]').select('angiographie')
    cy.get('[data-testid="create-exam-btn"]').click()
    
    // Upload d'images
    cy.get('[data-testid="upload-area"]').selectFile([
      'cypress/fixtures/angio-image-1.jpg',
      'cypress/fixtures/angio-image-2.jpg'
    ], { action: 'drag-drop' })
    
    // Vérifier l'upload
    cy.get('[data-testid="upload-progress"]').should('be.visible')
    cy.get('[data-testid="image-thumbnail"]').should('have.length', 2)
    
    // Traitement fluorescéine
    cy.get('[data-testid="fluorescein-mode-btn"]').click()
    cy.get('[data-testid="injection-time-input"]').type('14:30')
    cy.get('[data-testid="start-capture-btn"]').click()
    
    // Vérifier la timeline
    cy.get('[data-testid="angio-timeline"]').should('be.visible')
    cy.get('[data-testid="phase-early"]').should('exist')
  })

  it('should edit images with RVB controls', () => {
    // Préparer un examen avec images
    cy.setupExamWithImages()
    
    // Ouvrir l'éditeur
    cy.get('[data-testid="image-thumbnail"]').first().click()
    cy.get('[data-testid="edit-image-btn"]').click()
    
    // Ajuster les couleurs
    cy.get('[data-testid="red-slider"]')
      .invoke('val', 180)
      .trigger('input')
    
    cy.get('[data-testid="green-slider"]')
      .invoke('val', 220)
      .trigger('input')
    
    // Vérifier l'aperçu temps réel
    cy.get('[data-testid="image-preview"]')
      .should('have.attr', 'style')
      .and('include', 'filter')
    
    // Sauvegarder
    cy.get('[data-testid="save-edits-btn"]').click()
    cy.get('[data-testid="success-message"]')
      .should('contain', 'Modifications sauvegardées')
  })
})
```

### 5.4 Tests de Génération PDF
```typescript
// cypress/e2e/report-generation.cy.ts
describe('Report Generation', () => {
  beforeEach(() => {
    cy.login()
    cy.setupExamWithImages()
  })

  it('should generate PDF report', () => {
    cy.visit('/dashboard/reports/generator')
    
    // Sélectionner le patient
    cy.get('[data-testid="patient-select"]').select('Test Patient')
    cy.get('[data-testid="exam-select"]').select('Angiographie - 2024-01-15')
    
    // Configuration du rapport
    cy.get('[data-testid="format-select"]').select('A4')
    cy.get('[data-testid="orientation-select"]').select('landscape')
    cy.get('[data-testid="photos-per-line"]').clear().type('3')
    
    // Sélectionner les images
    cy.get('[data-testid="image-checkbox"]').first().check()
    cy.get('[data-testid="image-checkbox"]').eq(1).check()
    
    // Générer le PDF
    cy.get('[data-testid="generate-pdf-btn"]').click()
    
    // Vérifier la génération
    cy.get('[data-testid="pdf-progress"]').should('be.visible')
    cy.get('[data-testid="pdf-preview"]', { timeout: 10000 })
      .should('be.visible')
    
    // Tester le téléchargement
    cy.get('[data-testid="download-pdf-btn"]').click()
    cy.readFile('cypress/downloads/rapport-angio.pdf').should('exist')
  })

  it('should customize report template', () => {
    cy.visit('/dashboard/reports/generator')
    
    // Ouvrir les options avancées
    cy.get('[data-testid="advanced-options-btn"]').click()
    
    // Personnaliser l'en-tête
    cy.get('[data-testid="header-text"]')
      .clear()
      .type('Rapport Angiographique Personnalisé')
    
    // Ajouter des annotations
    cy.get('[data-testid="add-annotation-btn"]').click()
    cy.get('[data-testid="annotation-text"]')
      .type('Rétinopathie diabétique sévère')
    
    // Prévisualisation
    cy.get('[data-testid="preview-btn"]').click()
    cy.get('[data-testid="pdf-preview"]')
      .should('contain', 'Rapport Angiographique Personnalisé')
  })
})
```

## 6. TESTS DE PERFORMANCE

### 6.1 Configuration Lighthouse CI
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/login',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/dashboard/patients',
        'http://localhost:3000/dashboard/images'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: process.env.LHCI_SERVER_URL,
      token: process.env.LHCI_TOKEN,
    },
  },
}
```

### 6.2 Tests de Charge avec Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Steady load"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  payload:
    path: './test-users.csv'
    fields:
      - 'email'
      - 'password'

scenarios:
  - name: "Login and browse patients"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/patients"
          headers:
            Authorization: "Bearer {{ token }}"
      - get:
          url: "/api/patients/{{ $randomString() }}"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "Image upload and processing"
    weight: 20
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/images/upload"
          headers:
            Authorization: "Bearer {{ token }}"
          formData:
            file: "@./test-image.jpg"

  - name: "PDF generation"
    weight: 10
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/reports/generate"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            patientId: "{{ $randomString() }}"
            examId: "{{ $randomString() }}"
            template: "standard"
```

### 6.3 Tests de Performance React
```typescript
// src/components/performance/ImageGallery.test.tsx
import { render, screen } from '@testing-library/react'
import { ImageGallery } from './ImageGallery'

// Mock de données pour tester la performance
const generateMockImages = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `image-${i}`,
    url: `https://example.com/image-${i}.jpg`,
    thumbnailUrl: `https://example.com/thumb-${i}.jpg`,
    metadata: { width: 1920, height: 1080 }
  }))
}

describe('ImageGallery Performance', () => {
  it('renders large image list efficiently', () => {
    const start = performance.now()
    
    render(<ImageGallery images={generateMockImages(1000)} />)
    
    const end = performance.now()
    const renderTime = end - start
    
    // Vérifie que le rendu prend moins de 100ms
    expect(renderTime).toBeLessThan(100)
    
    // Vérifie la virtualisation (seulement les éléments visibles)
    const visibleImages = screen.getAllByTestId(/image-item/)
    expect(visibleImages.length).toBeLessThan(50) // Seulement les éléments visibles
  })

  it('handles scroll performance', async () => {
    const { container } = render(
      <ImageGallery images={generateMockImages(10000)} />
    )
    
    const scrollContainer = container.querySelector('[data-testid="scroll-container"]')
    
    // Simuler un scroll rapide
    const scrollPromises = Array.from({ length: 10 }, (_, i) => {
      return new Promise(resolve => {
        setTimeout(() => {
          scrollContainer!.scrollTop = i * 100
          resolve(void 0)
        }, i * 10)
      })
    })
    
    const start = performance.now()
    await Promise.all(scrollPromises)
    const end = performance.now()
    
    // Vérifie que le scroll reste fluide
    expect(end - start).toBeLessThan(200)
  })
})
```

## 7. TESTS DE SÉCURITÉ

### 7.1 Tests d'Authentification
```typescript
// cypress/e2e/security/authentication.cy.ts
describe('Authentication Security', () => {
  it('should prevent access without authentication', () => {
    cy.visit('/dashboard/patients')
    cy.url().should('include', '/login')
  })

  it('should handle session expiration', () => {
    cy.login()
    
    // Simuler l'expiration de session
    cy.window().then((win) => {
      win.localStorage.removeItem('next-auth.session-token')
    })
    
    cy.visit('/dashboard/patients')
    cy.get('[data-testid="session-expired-message"]')
      .should('be.visible')
  })

  it('should prevent CSRF attacks', () => {
    cy.request({
      method: 'POST',
      url: '/api/patients',
      body: { nom: 'Hacker', prenom: 'Evil' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })

  it('should rate limit login attempts', () => {
    // Tentatives multiples avec mauvais credentials
    for (let i = 0; i < 6; i++) {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      })
    }
    
    // La 6ème tentative devrait être bloquée
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(429) // Too Many Requests
    })
  })
})
```

### 7.2 Tests de Validation d'Entrée
```typescript
// src/lib/utils/validation.test.ts
import { validatePatientData, validateImageUpload } from './validation'

describe('Input Validation', () => {
  describe('validatePatientData', () => {
    it('should accept valid patient data', () => {
      const validData = {
        nom: 'Doe',
        prenom: 'John',
        dateNaissance: '1990-01-01',
        email: 'john.doe@example.com'
      }
      
      expect(() => validatePatientData(validData)).not.toThrow()
    })

    it('should reject XSS attempts', () => {
      const maliciousData = {
        nom: '<script>alert("xss")</script>',
        prenom: 'John',
        dateNaissance: '1990-01-01'
      }
      
      expect(() => validatePatientData(maliciousData))
        .toThrow('Invalid characters detected')
    })

    it('should reject SQL injection attempts', () => {
      const sqlInjection = {
        nom: "'; DROP TABLE patients; --",
        prenom: 'John',
        dateNaissance: '1990-01-01'
      }
      
      expect(() => validatePatientData(sqlInjection))
        .toThrow('Invalid characters detected')
    })
  })

  describe('validateImageUpload', () => {
    it('should accept valid image files', () => {
      const validFile = {
        name: 'image.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      }
      
      expect(() => validateImageUpload(validFile)).not.toThrow()
    })

    it('should reject oversized files', () => {
      const oversizedFile = {
        name: 'large.jpg',
        type: 'image/jpeg',
        size: 50 * 1024 * 1024 // 50MB
      }
      
      expect(() => validateImageUpload(oversizedFile))
        .toThrow('File size exceeds limit')
    })

    it('should reject dangerous file types', () => {
      const dangerousFile = {
        name: 'script.exe',
        type: 'application/x-executable',
        size: 1024
      }
      
      expect(() => validateImageUpload(dangerousFile))
        .toThrow('Invalid file type')
    })
  })
})
```

## 8. TESTS D'ACCESSIBILITÉ

### 8.1 Tests axe-core
```typescript
// src/components/accessibility.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { PatientForm } from '@/components/forms/PatientForm'
import { ImageGallery } from '@/components/medical/ImageGallery'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('PatientForm should not have accessibility violations', async () => {
    const { container } = render(<PatientForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('ImageGallery should not have accessibility violations', async () => {
    const mockImages = [
      { _id: '1', url: '/image1.jpg', alt: 'Angiographie OD' },
      { _id: '2', url: '/image2.jpg', alt: 'Angiographie OS' }
    ]
    
    const { container } = render(<ImageGallery images={mockImages} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper keyboard navigation', () => {
    render(<PatientForm />)
    
    // Test tab navigation
    cy.get('body').tab()
    cy.focused().should('have.attr', 'data-testid', 'nom-input')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'data-testid', 'prenom-input')
    
    // Test escape key for modals
    cy.get('[data-testid="open-modal-btn"]').click()
    cy.get('body').type('{esc}')
    cy.get('[data-testid="modal"]').should('not.exist')
  })
})
```

### 8.2 Tests de Contraste et Lisibilité
```typescript
// cypress/e2e/accessibility/contrast.cy.ts
describe('Color Contrast and Readability', () => {
  it('should meet WCAG AA contrast standards', () => {
    cy.visit('/dashboard')
    
    // Vérifier le contraste des éléments principaux
    cy.get('[data-testid="main-heading"]')
      .should('have.css', 'color')
      .and('satisfy', (color) => {
        // Calculer le ratio de contraste (implementation simplifiée)
        return calculateContrastRatio(color, 'rgb(255, 255, 255)') >= 4.5
      })
    
    // Vérifier la taille des textes
    cy.get('body').should('have.css', 'font-size')
      .and('satisfy', (fontSize) => {
        return parseInt(fontSize) >= 16 // Minimum 16px
      })
  })

  it('should be readable in dark mode', () => {
    cy.visit('/dashboard')
    cy.get('[data-testid="theme-toggle"]').click()
    
    // Vérifier que le texte reste lisible
    cy.get('[data-testid="patient-list"]')
      .should('be.visible')
      .and('have.css', 'color')
      .and('not.eq', 'rgb(0, 0, 0)') // Pas de texte noir sur fond sombre
  })
})
```

## 9. TESTS CROSS-BROWSER

### 9.1 Configuration BrowserStack
```javascript
// browserstack.config.js
const commonCapabilities = {
  'bstack:options': {
    projectName: 'Angioimage Web',
    buildName: 'Cross Browser Tests',
    sessionName: 'BrowserStack Test'
  }
}

export const browsers = [
  {
    browserName: 'Chrome',
    browserVersion: 'latest',
    os: 'Windows',
    osVersion: '11',
    ...commonCapabilities
  },
  {
    browserName: 'Firefox',
    browserVersion: 'latest',
    os: 'Windows',
    osVersion: '11',
    ...commonCapabilities
  },
  {
    browserName: 'Safari',
    browserVersion: 'latest',
    os: 'OS X',
    osVersion: 'Monterey',
    ...commonCapabilities
  },
  {
    browserName: 'Edge',
    browserVersion: 'latest',
    os: 'Windows',
    osVersion: '11',
    ...commonCapabilities
  }
]
```

### 9.2 Tests Responsives
```typescript
// cypress/e2e/responsive/mobile.cy.ts
const devices = [
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 }
]

devices.forEach(device => {
  describe(`Responsive Tests - ${device.name}`, () => {
    beforeEach(() => {
      cy.viewport(device.width, device.height)
      cy.login()
    })

    it('should display mobile menu correctly', () => {
      cy.visit('/dashboard')
      
      if (device.width < 768) {
        // Mobile: menu hamburger
        cy.get('[data-testid="mobile-menu-btn"]').should('be.visible')
        cy.get('[data-testid="sidebar"]').should('not.be.visible')
        
        cy.get('[data-testid="mobile-menu-btn"]').click()
        cy.get('[data-testid="mobile-menu"]').should('be.visible')
      } else {
        // Desktop/Tablet: sidebar visible
        cy.get('[data-testid="sidebar"]').should('be.visible')
        cy.get('[data-testid="mobile-menu-btn"]').should('not.exist')
      }
    })

    it('should handle image gallery responsively', () => {
      cy.visit('/dashboard/images')
      
      // Vérifier la grille responsive
      cy.get('[data-testid="image-grid"]').then($grid => {
        const gridCols = window.getComputedStyle($grid[0])
          .getPropertyValue('grid-template-columns')
          .split(' ').length
        
        if (device.width < 640) {
          expect(gridCols).to.eq(2) // Mobile: 2 colonnes
        } else if (device.width < 1024) {
          expect(gridCols).to.eq(3) // Tablet: 3 colonnes
        } else {
          expect(gridCols).to.eq(4) // Desktop: 4 colonnes
        }
      })
    })
  })
})
```

## 10. AUTOMATISATION CI/CD

### 10.1 GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          MONGODB_URI: mongodb://localhost:27017/angioimage-test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: npm start &
        env:
          NODE_ENV: test
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          install: false
          wait-on: 'http://localhost:3000'
          browser: chrome
          record: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build and start app
        run: |
          npm run build
          npm start &
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run Lighthouse CI
        run: npx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### 10.2 Tests de Régression Visuelle
```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Storybook
        run: npm run build-storybook
      
      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
```

## 11. MÉTRIQUES ET REPORTING

### 11.1 Dashboard de Métriques
```typescript
// tests/reports/metrics-dashboard.ts
interface TestMetrics {
  coverage: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
  performance: {
    lighthouse: {
      performance: number
      accessibility: number
      bestPractices: number
      seo: number
    }
    loadTimes: {
      fcp: number // First Contentful Paint
      lcp: number // Largest Contentful Paint
      cls: number // Cumulative Layout Shift
    }
  }
  e2e: {
    totalTests: number
    passed: number
    failed: number
    duration: number
  }
}

export function generateTestReport(metrics: TestMetrics) {
  const report = `
# Test Report - ${new Date().toISOString()}

## Test Coverage
- Lines: ${metrics.coverage.lines}%
- Functions: ${metrics.coverage.functions}%
- Branches: ${metrics.coverage.branches}%
- Statements: ${metrics.coverage.statements}%

## Performance Metrics
- Lighthouse Performance: ${metrics.performance.lighthouse.performance}
- First Contentful Paint: ${metrics.performance.loadTimes.fcp}ms
- Largest Contentful Paint: ${metrics.performance.loadTimes.lcp}ms

## E2E Test Results
- Total Tests: ${metrics.e2e.totalTests}
- Passed: ${metrics.e2e.passed}
- Failed: ${metrics.e2e.failed}
- Success Rate: ${((metrics.e2e.passed / metrics.e2e.totalTests) * 100).toFixed(1)}%
`

  return report
}
```

### 11.2 Critères de Validation
```typescript
// tests/validation/criteria.ts
export const QUALITY_GATES = {
  coverage: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80
  },
  performance: {
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90
    },
    webVitals: {
      fcp: 2000,   // ms
      lcp: 4000,   // ms
      cls: 0.1,    // score
      fid: 100     // ms
    }
  },
  e2e: {
    successRate: 95, // %
    maxDuration: 600 // seconds
  }
}

export function validateQualityGates(metrics: TestMetrics): boolean {
  const checks = [
    metrics.coverage.lines >= QUALITY_GATES.coverage.lines,
    metrics.coverage.functions >= QUALITY_GATES.coverage.functions,
    metrics.performance.lighthouse.performance >= QUALITY_GATES.performance.lighthouse.performance,
    metrics.performance.lighthouse.accessibility >= QUALITY_GATES.performance.lighthouse.accessibility,
    (metrics.e2e.passed / metrics.e2e.totalTests * 100) >= QUALITY_GATES.e2e.successRate
  ]
  
  return checks.every(check => check === true)
}
```

Ce plan de test complet garantit la qualité, la performance et la fiabilité de l'application web Angioimage Next.js, couvrant tous les aspects critiques pour une application médicale moderne.