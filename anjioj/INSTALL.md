# 🏥 Guide d'installation Angioimage

Ce guide vous accompagne dans l'installation et la configuration initiale d'Angioimage.

## 📋 Prérequis

### Obligatoires
- **Node.js** version 18.0 ou supérieure
- **npm** (inclus avec Node.js)
- **MongoDB** (base de données accessible)

### Système
- **Linux/macOS**: Utiliser `install.sh`
- **Windows**: Utiliser `install.bat`

## 🚀 Installation rapide

### 1. Préparer la configuration

Éditez le fichier `install.conf` avec vos paramètres :

```ini
# Base de données MongoDB
MONGO_URI=mongodb://localhost:27017/angiographiedb

# Configuration de l'application
APP_PORT=3000
APP_URL=http://localhost:3000

# Configuration du cabinet
CABINET_NAME=Mon Cabinet d'Ophtalmologie
DOCTOR_NAME=Dr. Jean Dupont
CABINET_ADDRESS=123 Rue de la Santé, 75000 Paris
CABINET_PHONE=+33 1 23 45 67 89
CABINET_EMAIL=contact@moncabinet.fr

# Compte administrateur
ADMIN_EMAIL=admin@moncabinet.fr
ADMIN_PASSWORD=motdepasse-securise
```

### 2. Lancer l'installation

#### Linux/macOS
```bash
chmod +x install.sh
./install.sh
```

#### Windows
```cmd
install.bat
```

### 3. Suivre le menu interactif

Choisissez l'option **0** pour une installation complète automatique.

## 📊 Options du menu

| Option | Description |
|--------|-------------|
| **0** | Installation complète (recommandée) |
| **1** | Vérifier les prérequis uniquement |
| **2** | Installer les dépendances npm |
| **3** | Configurer l'environnement (.env.local) |
| **4** | Tester la connexion MongoDB |
| **5** | Construire l'application |
| **6** | Initialiser la base de données (seeding) |
| **7** | Configurer les paramètres de l'application |
| **8** | Démarrer l'application |
| **9** | Quitter |

## ⚙️ Configuration détaillée

### Fichier install.conf

Le fichier `install.conf` contient tous les paramètres de configuration :

#### Base de données
```ini
MONGO_URI=mongodb://username:password@host:port/database
```

#### Application
```ini
APP_PORT=3000
APP_URL=http://localhost:3000
NODE_ENV=production
```

#### Sécurité
```ini
NEXTAUTH_SECRET=votre-cle-secrete-32-caracteres-minimum
JWT_SECRET=votre-cle-jwt-secrete
```

#### Cabinet médical
```ini
CABINET_NAME=Nom de votre cabinet
DOCTOR_NAME=Dr. Prénom Nom
CABINET_ADDRESS=Adresse complète
CABINET_PHONE=Numéro de téléphone
CABINET_EMAIL=contact@cabinet.fr
```

#### Compte administrateur
```ini
SEED_ADMIN_USER=true
ADMIN_EMAIL=admin@cabinet.fr
ADMIN_PASSWORD=motdepasse-securise
ADMIN_NAME=Prénom
ADMIN_SURNAME=Nom
```

#### Données d'exemple
```ini
SEED_SAMPLE_DATA=true  # false pour désactiver
```

## 🔧 Installation manuelle

Si vous préférez une installation étape par étape :

### 1. Vérifier les prérequis
```bash
node --version  # Doit être >= 18.0
npm --version
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
Créer le fichier `.env.local` :
```env
MONGO_URI=mongodb://localhost:27017/angiographiedb
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-cle-secrete
JWT_SECRET=votre-cle-jwt
NODE_ENV=production
```

### 4. Construire l'application
```bash
npm run build
```

### 5. Initialiser la base de données
```bash
npm run seed:install
```

### 6. Démarrer l'application
```bash
npm start
```

## 📂 Structure des dossiers créés

L'installation crée automatiquement :

```
storage/
├── uploads/
│   ├── images/      # Images originales
│   └── thumbnails/  # Miniatures générées
├── reports/         # Rapports PDF/HTML générés
└── temp/           # Fichiers temporaires
```

## 🎯 Première connexion

Après l'installation :

1. **Accédez à l'application** : `http://localhost:3000`
2. **Connectez-vous** avec le compte admin créé :
   - Email : `ADMIN_EMAIL` (de install.conf)
   - Mot de passe : `ADMIN_PASSWORD` (de install.conf)
3. **Changez immédiatement le mot de passe** dans Paramètres > Profil

## 🛠️ Configuration post-installation

### Paramètres de l'application
Accédez à **Paramètres > Application** pour configurer :
- Informations du cabinet
- Pied de page des rapports
- Paramètres par défaut

### Gestion des utilisateurs
Accédez à **Administration > Utilisateurs** pour :
- Créer des comptes médecins
- Configurer les permissions
- Gérer les rôles

## 🔍 Dépannage

### Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB est démarré
sudo systemctl status mongod    # Linux
brew services list | grep mongo # macOS
```

### Erreur de permissions (Linux/macOS)
```bash
# Donner les permissions au script
chmod +x install.sh

# Vérifier les permissions des dossiers
ls -la storage/
```

### Erreur de construction
```bash
# Nettoyer et reconstruire
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Port déjà utilisé
Modifiez `APP_PORT` dans `install.conf` et relancez la configuration.

## 📞 Support

En cas de problème :

1. Vérifiez les logs de l'application
2. Consultez la documentation technique
3. Vérifiez que tous les prérequis sont installés
4. Testez la connexion MongoDB séparément

## 🔄 Mise à jour

Pour mettre à jour une installation existante :

1. Sauvegardez votre base de données
2. Sauvegardez le dossier `storage/`
3. Mettez à jour le code source
4. Exécutez `npm install` et `npm run build`
5. Redémarrez l'application

## 🏷️ Variables d'environnement

Le script utilise les variables suivantes (depuis install.conf) :

| Variable | Description | Défaut |
|----------|-------------|---------|
| `MONGO_URI` | URI de connexion MongoDB | `mongodb://localhost:27017/angiographiedb` |
| `APP_PORT` | Port de l'application | `3000` |
| `APP_URL` | URL de l'application | `http://localhost:3000` |
| `CABINET_NAME` | Nom du cabinet | `Cabinet d'Ophtalmologie` |
| `DOCTOR_NAME` | Nom du médecin | `Dr. Nom Prénom` |
| `SEED_SAMPLE_DATA` | Créer des données d'exemple | `true` |
| `SEED_ADMIN_USER` | Créer un compte admin | `true` |

---

🎉 **Votre installation d'Angioimage est maintenant prête !**