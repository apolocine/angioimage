# Document de Conception - Logiciel de Gestion d'Angiographie Topcon TRC-50DX

## 1. INTRODUCTION

### 1.1 Objectif du Logiciel
Ce logiciel est conçu pour remplacer le logiciel de gestion original perdu de l'angiographe Topcon TRC-50DX. Il permet la gestion complète des dossiers patients, le traitement avancé des images angiographiques et la génération de rapports PDF.

### 1.2 Fonctionnalités Principales
- Gestion des dossiers patients avec authentification
- Organisation et stockage des photos d'angiographie
- Traitement d'images avec modification des couleurs RVB
- Support de l'angiographie à la fluorescéine avec séquences temporelles
- Génération de rapports PDF personnalisables
- Impression et archivage des examens

## 2. ANALYSE FONCTIONNELLE

### 2.1 Gestion des Patients
- **Ajout de nouveaux patients** : Interface de saisie avec nom, prénom, date de naissance
- **Recherche de patients** : Système de recherche par nom/prénom
- **Modification/Suppression** : Gestion complète des données patients
- **Authentification** : Système de connexion sécurisé avec base de données

### 2.2 Gestion des Images
- **Import d'images** : Support formats JPG, JPEG, PNG, BMP, GIF
- **Organisation temporelle** : Classement par patient et par date d'examen
- **Visualisation** : Affichage en miniatures et pleine résolution
- **Support multi-éclairage** : Photos avec lumière bleue, verte, et fluorescéine

### 2.3 Traitement d'Images
- **Égalisation d'histogramme** : Amélioration automatique du contraste
- **Modification RVB** : Contrôle individuel des canaux Rouge, Vert, Bleu
- **Sauvegarde des modifications** : Création de copies modifiées
- **Interface temps réel** : Prévisualisation instantanée des modifications

### 2.4 Angiographie à la Fluorescéine
- **Séquences temporelles** : Capture d'images à intervalles définis
- **Chronométrage** : Gestion du timing d'injection et de capture
- **Archivage séquentiel** : Organisation par phases (précoce, intermédiaire, tardive)

### 2.5 Génération de Rapports
- **PDF personnalisables** : Choix orientation, format de page, nombre de photos par ligne
- **Marges ajustables** : Contrôle précis de la mise en page
- **Informations patient** : Intégration automatique des données
- **Impression directe** : Support d'impression et visualisation

## 3. INTERFACE UTILISATEUR

### 3.1 Fenêtre Principale
- **Arborescence patients** : Liste des patients avec photos associées
- **Zone de prévisualisation** : Affichage des images sélectionnées
- **Panneau de configuration** : Options PDF et traitement d'images
- **Barre d'outils** : Accès rapide aux fonctions principales

### 3.2 Fenêtre d'Authentification
- **Onglets multiples** : Connexion, Configuration, Gestion MySQL
- **Vérification base de données** : Test de connexion automatique
- **Installation/Mise à jour** : Assistant de configuration initiale

### 3.3 Éditeurs d'Images
- **Visualiseur principal** : Affichage haute résolution avec zoom
- **Éditeur RVB** : Sliders pour ajustement des couleurs
- **Sauvegarde interactive** : Confirmation des modifications

## 4. ARCHITECTURE TECHNIQUE

### 4.1 Technologies Utilisées
- **Langage** : Java 17 avec Swing
- **Build** : Maven 3.x
- **Base de données** : MySQL/H2 (mode test)
- **PDF** : Apache PDFBox 2.0.30
- **Images** : Thumbnailator 0.4.20

### 4.2 Structure des Packages
```
org.hmd.angio/
├── conf/          # Configuration et propriétés
├── dto/           # Objets de données (Person)
├── ihm/           # Interfaces utilisateur
├── pdf/           # Génération PDF
├── search/        # Fonctions de recherche
├── security/      # Chiffrement et sécurité
└── install/       # Installation et SGBD
```

### 4.3 Gestion des Données
- **Persistance** : DAO pattern pour l'accès aux données
- **Configuration** : Fichiers properties chiffrés
- **Stockage images** : Arborescence hiérarchique par patient
- **Base de données** : Tables utilisateurs et patients

## 5. COMPATIBILITÉ ANGIOGRAPHE

### 5.1 Topcon TRC-50DX
- **Interface physique** : Compatible avec les sorties de l'angiographe
- **Formats supportés** : Tous les formats d'image standards
- **Synchronisation** : Import direct depuis l'appareil

### 5.2 Types d'Examens
- **Angiographie classique** : Photographies du fond d'œil
- **Angiographie fluorescéinique** : Séquences temporelles après injection
- **Éclairages spéciaux** : Lumière bleue et verte pour contraste

### 5.3 Workflow Clinique
1. **Préparation patient** : Saisie des informations
2. **Injection fluorescéine** : Démarrage du chronométrage
3. **Acquisition** : Capture séquentielle d'images
4. **Traitement** : Amélioration et analyse des images
5. **Rapport** : Génération PDF avec interprétation

## 6. SÉCURITÉ ET CONFIDENTIALITÉ

### 6.1 Protection des Données
- **Chiffrement** : Algorithmes sécurisés pour les configurations
- **Authentification** : Système de login obligatoire
- **Accès contrôlé** : Différents niveaux d'autorisation

### 6.2 Sauvegarde
- **Archivage automatique** : Copies de sécurité périodiques
- **Intégrité** : Vérification des données patients
- **Réglementation** : Conformité aux normes médicales

## 7. ÉVOLUTIVITÉ

### 7.1 Extensions Futures
- **DICOM** : Support du standard médical
- **Réseaux** : Partage multi-postes
- **IA** : Analyse automatique des angiographies
- **Mobile** : Interface tablette pour consultations

### 7.2 Maintenance
- **Mises à jour** : Système de mise à jour automatique
- **Support** : Documentation et assistance technique
- **Migration** : Outils de conversion de données

## 8. CONCLUSION

Ce logiciel reconstitue et améliore les fonctionnalités du logiciel original Topcon TRC-50DX, en offrant une solution moderne et complète pour la gestion d'angiographies ophtalmologiques. Il répond aux besoins cliniques tout en respectant les standards de sécurité et de qualité médicale.