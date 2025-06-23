# AnjioJ - Application d'Angiographie Web

## 🚀 Phase 1 - Fonctionnalités Implémentées

### ✅ Authentification
- **Login** : `/login` - Connexion avec email/password
- **Register** : `/register` - Création de comptes utilisateur
- **Rôles** : Admin, Médecin, Assistant avec permissions

### ✅ Dashboard Principal
- **Interface** : `/dashboard` - Tableau de bord avec statistiques
- **Navigation** : Sidebar avec tous les modules
- **Header** : Informations utilisateur et notifications

### ✅ Gestion des Patients
- **Liste** : `/dashboard/patients` - Vue d'ensemble avec recherche
- **Création** : `/dashboard/patients/new` - Formulaire complet
- **CRUD** : API complète pour la gestion des patients

### ✅ Architecture
- **Base de données** : MongoDB avec modèles Mongoose
- **API** : Routes Next.js avec validation
- **Sécurité** : Mots de passe hashés, JWT, middleware d'auth
- **Types** : TypeScript strict avec validation Yup

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js 18+
- MongoDB en cours d'exécution
- npm ou yarn

### Installation
```bash
# Installation des dépendances
npm install

# Configuration de la base de données (seeding)
npm run seed

# Démarrage de l'application
npm run dev
```

### Comptes de test
Après le seeding, vous pouvez vous connecter avec :

- **Admin** : admin@anjioj.com / password123
- **Médecin** : doctor@anjioj.com / password123  
- **Assistant** : assistant@anjioj.com / password123

## 🗄️ Base de Données

### Configuration MongoDB
```
MONGO_URI=mongodb://devuser:devpass26@localhost:27017/angiographiedb?authSource=angiographiedb
```

### Modèles
- **Role** : Gestion des rôles et permissions
- **User** : Utilisateurs avec authentification
- **Patient** : Données patients complètes
- **Image** : Métadonnées et traitement d'images (à venir)

## 🔐 Sécurité

### Exigences Respectées
- ✅ Aucune donnée mock/hardcodée
- ✅ Mots de passe hashés avec bcrypt
- ✅ Configuration MongoDB sécurisée
- ✅ Module Role complet avec CRUD
- ✅ Validation côté serveur stricte
- ✅ Middleware d'authentification

## 📁 Structure du Projet

```
src/
├── app/                    # App Router Next.js
│   ├── (auth)/            # Pages d'authentification
│   ├── (dashboard)/       # Interface principale
│   └── api/               # Routes API
├── lib/
│   ├── db/                # Modèles et connexion MongoDB
│   ├── services/          # Logique métier
│   ├── utils/             # Utilitaires et validation
│   └── auth/              # Configuration NextAuth
├── components/            # Composants réutilisables
└── seeds/                 # Scripts de seeding
```

## 🎯 Prochaines Étapes (Phase 2)

- [ ] Gestion des images (upload, galerie, éditeur)
- [ ] Module d'angiographie avec capture temps réel
- [ ] Génération de rapports PDF
- [ ] Interface d'administration avancée

## 🧪 Développement

```bash
# Redémarrer la base de données (si nécessaire)
npm run seed

# Lancer les tests (à implémenter)
npm test

# Build de production
npm run build
```

---

**AnjioJ** - Application médicale moderne développée avec Next.js et MongoDB