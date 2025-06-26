#!/usr/bin/env node

/**
 * Script de backup MongoDB pour Angioimage
 * Exporte toutes les collections en JSON et créé un backup complet
 */

const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/angiographiedb';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const SEED_DIR = path.join(__dirname, '..', 'seeds', 'data');

// Collections à sauvegarder
const COLLECTIONS = [
  'roles',
  'users', 
  'patients',
  'exams',
  'images',
  'reports',
  'reporttemplates',
  'appsettings'
];

// Couleurs pour le terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Créé les dossiers nécessaires
 */
async function createDirectories() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    await fs.mkdir(SEED_DIR, { recursive: true });
    logSuccess('Dossiers de backup créés');
  } catch (error) {
    logError(`Erreur création dossiers: ${error.message}`);
    throw error;
  }
}

/**
 * Génère un nom de fichier avec timestamp
 */
function generateBackupFilename(collection, format = 'json') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${collection}_${timestamp}.${format}`;
}

/**
 * Sauvegarde une collection en JSON
 */
async function backupCollection(db, collectionName, outputDir, filename) {
  try {
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    
    if (documents.length === 0) {
      logWarning(`Collection '${collectionName}' est vide`);
      return { collection: collectionName, count: 0, success: true };
    }

    const filePath = path.join(outputDir, filename);
    
    // Créer un backup avec métadonnées
    const backupData = {
      collection: collectionName,
      timestamp: new Date().toISOString(),
      count: documents.length,
      data: documents
    };

    await fs.writeFile(filePath, JSON.stringify(backupData, null, 2), 'utf8');
    logSuccess(`${collectionName}: ${documents.length} documents sauvegardés`);
    
    return { collection: collectionName, count: documents.length, success: true, file: filePath };
  } catch (error) {
    logError(`Erreur backup ${collectionName}: ${error.message}`);
    return { collection: collectionName, count: 0, success: false, error: error.message };
  }
}

/**
 * Créé un backup complet de toutes les collections
 */
async function createFullBackup() {
  let client;
  
  try {
    logInfo('Connexion à MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const db = client.db();
    logSuccess('Connecté à MongoDB');

    // Créer un dossier avec timestamp pour ce backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupSessionDir = path.join(BACKUP_DIR, `backup_${timestamp}`);
    await fs.mkdir(backupSessionDir, { recursive: true });

    logInfo(`Début du backup dans: ${backupSessionDir}`);

    const results = [];
    let totalDocuments = 0;

    // Sauvegarder chaque collection
    for (const collectionName of COLLECTIONS) {
      const filename = `${collectionName}.json`;
      const result = await backupCollection(db, collectionName, backupSessionDir, filename);
      results.push(result);
      
      if (result.success) {
        totalDocuments += result.count;
      }
    }

    // Créer un fichier de métadonnées du backup
    const backupMetadata = {
      timestamp: new Date().toISOString(),
      totalCollections: COLLECTIONS.length,
      totalDocuments,
      results,
      mongoUri: MONGO_URI.replace(/\/\/.*@/, '//***:***@'), // Masquer les credentials
      version: require('../package.json').version
    };

    await fs.writeFile(
      path.join(backupSessionDir, 'backup-metadata.json'),
      JSON.stringify(backupMetadata, null, 2),
      'utf8'
    );

    logSuccess(`Backup complet terminé: ${totalDocuments} documents dans ${results.filter(r => r.success).length} collections`);
    
    return {
      success: true,
      backupDir: backupSessionDir,
      totalDocuments,
      results
    };

  } catch (error) {
    logError(`Erreur générale: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * Créé des données de seed pour l'installation
 */
async function createSeedData() {
  let client;
  
  try {
    logInfo('Création des données de seed...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const db = client.db();

    // Collections essentielles pour le seed
    const seedCollections = ['roles', 'appsettings'];
    
    for (const collectionName of seedCollections) {
      const filename = `${collectionName}.seed.json`;
      await backupCollection(db, collectionName, SEED_DIR, filename);
    }

    logSuccess('Données de seed créées');
    
  } catch (error) {
    logError(`Erreur création seed: ${error.message}`);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * Liste les backups disponibles
 */
async function listBackups() {
  try {
    const backupDirs = await fs.readdir(BACKUP_DIR);
    const backups = [];
    
    for (const dir of backupDirs) {
      const dirPath = path.join(BACKUP_DIR, dir);
      const stat = await fs.stat(dirPath);
      
      if (stat.isDirectory() && dir.startsWith('backup_')) {
        try {
          const metadataPath = path.join(dirPath, 'backup-metadata.json');
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          backups.push({
            name: dir,
            path: dirPath,
            date: new Date(metadata.timestamp),
            totalDocuments: metadata.totalDocuments,
            collections: metadata.totalCollections
          });
        } catch (error) {
          logWarning(`Métadonnées manquantes pour ${dir}`);
        }
      }
    }
    
    backups.sort((a, b) => b.date - a.date);
    
    if (backups.length === 0) {
      logInfo('Aucun backup trouvé');
    } else {
      logInfo(`${backups.length} backup(s) disponible(s):`);
      backups.forEach((backup, index) => {
        console.log(`  ${index + 1}. ${backup.name}`);
        console.log(`     Date: ${backup.date.toLocaleString()}`);
        console.log(`     Documents: ${backup.totalDocuments}, Collections: ${backup.collections}`);
      });
    }
    
    return backups;
  } catch (error) {
    logError(`Erreur liste backups: ${error.message}`);
    return [];
  }
}

/**
 * Fonction principale CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log();
  log('🗄️  ANGIOIMAGE - Backup MongoDB', 'blue');
  log('=====================================', 'blue');
  console.log();

  await createDirectories();

  switch (command) {
    case 'backup':
      await createFullBackup();
      break;
      
    case 'seed':
      await createSeedData();
      break;
      
    case 'list':
      await listBackups();
      break;
      
    case 'full':
      await createFullBackup();
      await createSeedData();
      break;
      
    default:
      logInfo('Utilisation:');
      console.log('  node backup-mongodb.js backup  - Créer un backup complet');
      console.log('  node backup-mongodb.js seed    - Créer les données de seed');
      console.log('  node backup-mongodb.js list    - Lister les backups');
      console.log('  node backup-mongodb.js full    - Backup + seed');
      break;
  }
  
  console.log();
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(error => {
    logError(`Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  createFullBackup,
  createSeedData,
  listBackups,
  backupCollection
};