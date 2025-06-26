# Système de Backup et Restauration MongoDB

Ce dossier contient le système de backup et de restauration de la base de données MongoDB pour Angioimage.

## Structure

```
database/
├── backup/           # Dossier des backups
│   └── latest/      # Dernier backup effectué
├── initial-data/    # Données initiales pour l'installation
│   ├── users.json
│   ├── settings.json
│   ├── reporttemplates.json
│   └── metadata.json
└── README.md
```

## Utilisation

### 1. Backup de la base de données

Pour créer un backup de la base de données actuelle :

```bash
npm run db:backup
```

Cela créera :
- Un dossier avec timestamp dans `database/backup/`
- Une copie dans `database/backup/latest/`

### 2. Restauration depuis un backup

Pour restaurer le dernier backup :

```bash
npm run db:restore
```

Pour restaurer un backup spécifique :

```bash
node scripts/restore-db.js database/backup/backup-2024-01-01T10-00-00-000Z
```

### 3. Installation des données initiales

Pour installer uniquement les données initiales (première installation) :

```bash
npm run db:restore:initial
```

## Scripts d'installation

Les scripts d'installation (`install.sh` et `install.bat`) utilisent automatiquement ce système :

1. **Première installation** : Utilise les données initiales
2. **Réinstallation** : Détecte et restaure le dernier backup si disponible

## Données initiales

Les données initiales incluent :

### users.json
- Compte administrateur par défaut
  - Email : `admin@angioimage.local`
  - Mot de passe : `admin123` (à changer après la première connexion)

### settings.json
- Paramètres par défaut de l'application
- Configuration du cabinet
- Paramètres des rapports

### reporttemplates.json
- Template standard pour les rapports
- Template compact

## Sécurité

⚠️ **IMPORTANT** : 
- Ne jamais commiter de backups contenant des données réelles
- Le dossier `backup/` est ignoré par Git
- Toujours anonymiser les données avant de les partager
- Changer le mot de passe administrateur après l'installation

## Commandes utiles

```bash
# Backup manuel
npm run db:backup

# Restaurer le dernier backup
npm run db:restore

# Restaurer les données initiales
npm run db:restore:initial

# Forcer la restauration (sans confirmation)
node scripts/restore-db.js --force
```