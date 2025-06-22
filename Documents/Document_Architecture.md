# Document d'Architecture - Logiciel de Gestion d'Angiographie Topcon TRC-50DX

## 1. VUE D'ENSEMBLE DE L'ARCHITECTURE

### 1.1 Architecture Générale
Le logiciel suit une architecture en couches (layered architecture) avec séparation claire des responsabilités :

```
┌─────────────────────────────────────┐
│         COUCHE PRÉSENTATION         │
│     (Swing GUI, IHM Utilisateur)    │
├─────────────────────────────────────┤
│         COUCHE MÉTIER               │
│   (Services, Traitement d'images)   │
├─────────────────────────────────────┤
│         COUCHE DONNÉES              │
│      (DAO, Persistance, SGBD)       │
├─────────────────────────────────────┤
│         COUCHE INFRASTRUCTURE       │
│  (Configuration, Sécurité, Utils)   │
└─────────────────────────────────────┘
```

### 1.2 Patterns Architecturaux
- **MVC (Model-View-Controller)** : Séparation logique/présentation
- **DAO (Data Access Object)** : Abstraction de l'accès aux données
- **Singleton** : Gestion de la configuration globale
- **Observer** : Mise à jour des interfaces utilisateur
- **Factory** : Création des objets PDF et images

## 2. ARCHITECTURE DÉTAILLÉE

### 2.1 Couche Présentation (IHM)
```
org.hmd.angio/
├── ApplicationGUI.java              # Fenêtre d'authentification principale
├── PhotoOrganizerApp.java           # Application principale
├── PhotoOrganizerTreeApp.java       # Version avec arborescence
└── ihm/
    ├── HistogramEQRVB.java         # Éditeur de couleurs RVB
    ├── PersonInfoEntryUI.java      # Saisie informations patient
    └── tree/
        ├── CustomJTree.java        # Arborescence personnalisée
        ├── ExamTreeNode.java       # Nœuds d'examens
        ├── PersonTreeNode.java     # Nœuds de patients
        └── PhotoTreeNode.java      # Nœuds de photos
```

**Responsabilités :**
- Gestion des événements utilisateur
- Affichage des données et des images
- Navigation dans l'arborescence patients/examens
- Interfaces de configuration et paramétrage

### 2.2 Couche Métier (Services)
```
org.hmd.angio/
├── PhotoOrganizer.java             # Interface principale de services
├── pdf/
│   ├── PDFCreator.java            # Génération de rapports PDF
│   └── PDFGenerationGUI.java      # Configuration PDF
├── search/
│   └── SearchPersonUI.java        # Services de recherche
└── org.hmd.image.ouils/
    ├── ThumbnailRenderer.java      # Génération de miniatures
    ├── DirectoryManager.java       # Gestion des répertoires
    └── DatePicker.java            # Utilitaires de dates
```

**Responsabilités :**
- Logique métier de l'application
- Traitement et manipulation d'images
- Génération de documents PDF
- Organisation et recherche des données

### 2.3 Couche Données (Persistance)
```
org.hmd.angio/
├── dto/
│   ├── Person.java                 # Entité Patient
│   └── PersonDAO.java             # Accès données Patient
├── conf/
│   ├── Config.java                # Configuration globale
│   ├── ConfigDAO.java             # Accès données config
│   ├── User.java                  # Entité Utilisateur
│   └── UserDAO.java               # Accès données utilisateur
└── install/sgbd/
    ├── DatabaseManager.java       # Gestionnaire de connexions
    └── DatabaseInitializer.java   # Initialisation de la BD
```

**Responsabilités :**
- Persistance des données patients et utilisateurs
- Gestion des connexions base de données
- Configuration et paramètres de l'application
- Initialisation et maintenance de la BD

### 2.4 Couche Infrastructure
```
org.hmd.angio/
├── security/
│   ├── Encryption.java            # Chiffrement des données
│   └── ConfigFileEncryption.java  # Chiffrement configuration
├── exception/
│   └── PhotoLoadException.java    # Exceptions métier
└── enuma/
    └── PDRectangleEnum.java       # Énumérations formats PDF
```

**Responsabilités :**
- Sécurité et chiffrement
- Gestion des exceptions
- Utilitaires transversaux
- Configuration système

## 3. DIAGRAMME DES COMPOSANTS

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Swing GUI     │    │  Configuration  │    │   PDF Reports   │
│                 │    │    Manager      │    │    Generator    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ - PhotoOrganizer│◄───┤ - Config.java   │    │ - PDFCreator    │
│   App           │    │ - Properties    │    │ - PDFBox API    │
│ - Tree Views    │    │ - Encryption    │    │ - Page Layout   │
│ - Image Viewer  │    └─────────────────┘    └─────────────────┘
└─────────────────┘                                     ▲
         │                                              │
         ▼                                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Image Processing│    │   Data Access   │    │   File System   │
│                 │    │     Layer       │    │    Manager      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ - Histogram EQ  │    │ - PersonDAO     │    │ - Directory     │
│ - RGB Adjustment│◄───┤ - UserDAO       │◄───┤   Structure     │
│ - Thumbnailator │    │ - ConfigDAO     │    │ - File Storage  │
│ - Image Filters │    │ - Database      │    │ - Backup        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │    Database     │
                       │   (MySQL/H2)    │
                       ├─────────────────┤
                       │ - Users Table   │
                       │ - Persons Table │
                       │ - Config Table  │
                       └─────────────────┘
```

## 4. FLUX DE DONNÉES

### 4.1 Workflow d'Authentification
```
User Login → ApplicationGUI → UserDAO → Database
     ↓
Configuration Check → ConfigDAO → Encrypted Files
     ↓
Main Application Launch → PhotoOrganizerApp
```

### 4.2 Workflow de Gestion Patient
```
New Patient → PersonInfoEntryUI → Validation → PersonDAO → Database
     ↓
Directory Creation → DirectoryManager → File System
     ↓
Photo Import → Image Processing → Thumbnail Generation
```

### 4.3 Workflow de Traitement d'Images
```
Image Selection → Image Viewer → HistogramEQRVB
     ↓
RGB Adjustment → Real-time Preview → User Validation
     ↓
Save Modified → DirectoryManager → File System
```

### 4.4 Workflow de Génération PDF
```
Photo Selection → PDF Configuration → PDFCreator
     ↓
Layout Calculation → PDFBox Processing → PDF Generation
     ↓
Preview/Print → File Output → Archive
```

## 5. BASES DE DONNÉES

### 5.1 Schéma de Données
```sql
-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des patients
CREATE TABLE persons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table de configuration
CREATE TABLE config (
    property_key VARCHAR(100) PRIMARY KEY,
    property_value TEXT,
    description VARCHAR(255),
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5.2 Stratégie de Stockage des Images
```
workspace/
├── patients/
│   ├── {id}_{nom}_{prenom}/
│   │   ├── {date_examen}/
│   │   │   ├── original_images/
│   │   │   ├── modified_images/
│   │   │   └── thumbnails/
│   │   └── reports/
│   │       └── {date}_report.pdf
│   └── ...
└── backup/
    └── {date}_backup/
```

## 6. SÉCURITÉ ET CONFIGURATION

### 6.1 Chiffrement des Configurations
- **Algorithme** : AES-256
- **Fichiers chiffrés** : config.properties
- **Clés** : Gestion sécurisée des clés de chiffrement
- **Accès** : Déchiffrement à l'exécution uniquement

### 6.2 Authentification
- **Hachage** : Mots de passe sécurisés (bcrypt recommandé)
- **Sessions** : Gestion des sessions utilisateur
- **Timeouts** : Déconnexion automatique

### 6.3 Configuration Système
```properties
# Configuration Base de Données
database.url=jdbc:mysql://localhost:3306/angiographie
database.user=dbuser
database.password=encrypted_password

# Configuration Workspace
workspace.directory=C:/AngiographieData
backup.enabled=true
backup.interval=daily

# Configuration PDF
pdf.default.format=A4
pdf.default.orientation=landscape
pdf.default.quality=high
```

## 7. PERFORMANCES ET OPTIMISATIONS

### 7.1 Gestion Mémoire
- **Lazy Loading** : Chargement des images à la demande
- **Cache** : Mise en cache des miniatures
- **Garbage Collection** : Libération mémoire des BufferedImage

### 7.2 Optimisations Images
- **Thumbnailator** : Génération optimisée de miniatures
- **Compression** : Qualité adaptative selon l'usage
- **Formats** : Support multi-formats avec conversion

### 7.3 Base de Données
- **Connection Pooling** : Réutilisation des connexions
- **Prepared Statements** : Prévention SQL Injection
- **Indexation** : Index sur les champs de recherche

## 8. DÉPLOIEMENT ET MAINTENANCE

### 8.1 Packaging Maven
```xml
<packaging>jar</packaging>
<mainClass>org.hmd.angio.PhotoOrganizerApp</mainClass>
```

### 8.2 Dépendances Critiques
- **Java 17** : Runtime minimum requis
- **MySQL Connector** : Version 5.1.49
- **PDFBox** : Version 2.0.30
- **Thumbnailator** : Version 0.4.20

### 8.3 Installation et Configuration
1. **Base de données** : Création schéma initial
2. **Répertoires** : Structure de fichiers workspace
3. **Configuration** : Paramètres initiaux chiffrés
4. **Tests** : Validation fonctionnelle post-installation

## 9. ÉVOLUTIVITÉ TECHNIQUE

### 9.1 Extensions Futures
- **Microservices** : Décomposition en services distribués
- **REST API** : Exposition des fonctionnalités via API
- **Docker** : Containerisation pour déploiement
- **Cloud** : Migration vers infrastructure cloud

### 9.2 Migration et Compatibilité
- **Versions Java** : Compatibilité ascendante Java 11+
- **Formats** : Support DICOM pour intégration hospitalière
- **Standards** : Conformité HL7 FHIR pour interopérabilité

Cette architecture garantit la maintenabilité, l'évolutivité et la performance du logiciel tout en respectant les bonnes pratiques de développement Java et les exigences de sécurité médicale.