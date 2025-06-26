#!/usr/bin/env node

/**
 * Script de restauration MongoDB pour Angioimage
 * Restaure les données depuis un backup ou des fichiers de seed
 */

const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/angiographiedb';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const SEED_DIR = path.join(__dirname, '..', 'seeds', 'data');

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
 * Restaure une collection depuis un fichier JSON
 */
async function restoreCollection(db, filePath, options = {}) {
  try {
    const { force = false, skipExisting = false } = options;
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    const backupData = JSON.parse(fileContent);
    
    const collectionName = backupData.collection;
    const documents = backupData.data || backupData;
    
    if (!Array.isArray(documents)) {
      throw new Error('Format de données invalide');
    }

    const collection = db.collection(collectionName);
    
    // Vérifier si la collection existe et contient des données
    const existingCount = await collection.countDocuments();
    
    if (existingCount > 0 && !force && !skipExisting) {
      throw new Error(`Collection '${collectionName}' contient déjà ${existingCount} documents. Utilisez --force pour écraser ou --skip-existing pour ignorer.`);
    }
    
    if (existingCount > 0 && skipExisting) {
      logWarning(`Collection '${collectionName}' ignorée (${existingCount} documents existants)`);
      return { collection: collectionName, count: 0, skipped: true };
    }

    // Supprimer les données existantes si force est activé
    if (existingCount > 0 && force) {
      await collection.deleteMany({});
      logWarning(`${existingCount} documents supprimés de '${collectionName}'`);
    }

    // Insérer les nouvelles données
    if (documents.length > 0) {
      await collection.insertMany(documents, { ordered: false });
      logSuccess(`${collectionName}: ${documents.length} documents restaurés`);
    } else {
      logWarning(`${collectionName}: aucun document à restaurer`);
    }
    
    return { 
      collection: collectionName, 
      count: documents.length, 
      success: true,
      replaced: existingCount > 0 && force
    };
    
  } catch (error) {
    logError(`Erreur restauration ${path.basename(filePath)}: ${error.message}`);
    return { 
      collection: path.basename(filePath), 
      count: 0, 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Restaure depuis un dossier de backup complet
 */
async function restoreFromBackup(backupPath, options = {}) {
  let client;
  
  try {
    logInfo(`Restauration depuis: ${backupPath}`);
    
    // Vérifier que le dossier de backup existe
    const backupStat = await fs.stat(backupPath);
    if (!backupStat.isDirectory()) {
      throw new Error('Le chemin spécifié n\'est pas un dossier');
    }

    // Lire les métadonnées du backup
    const metadataPath = path.join(backupPath, 'backup-metadata.json');
    let metadata = null;
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataContent);
      logInfo(`Backup du ${new Date(metadata.timestamp).toLocaleString()}`);
      logInfo(`${metadata.totalDocuments} documents dans ${metadata.totalCollections} collections`);
    } catch (error) {
      logWarning('Métadonnées du backup non trouvées, tentative de restauration manuelle');
    }

    // Connexion à MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();
    logSuccess('Connecté à MongoDB');

    // Lister les fichiers JSON dans le dossier de backup
    const files = await fs.readdir(backupPath);
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      file !== 'backup-metadata.json'
    );

    if (jsonFiles.length === 0) {
      throw new Error('Aucun fichier de données trouvé dans le backup');
    }

    logInfo(`${jsonFiles.length} collection(s) à restaurer`);

    const results = [];
    let totalRestored = 0;

    // Restaurer chaque collection
    for (const filename of jsonFiles) {
      const filePath = path.join(backupPath, filename);
      const result = await restoreCollection(db, filePath, options);
      results.push(result);
      
      if (result.success && !result.skipped) {
        totalRestored += result.count;
      }
    }

    logSuccess(`Restauration terminée: ${totalRestored} documents restaurés`);
    
    return {
      success: true,
      totalRestored,
      results
    };

  } catch (error) {
    logError(`Erreur restauration: ${error.message}`);
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
 * Restaure les données de seed essentielles
 */
async function restoreFromSeed(options = {}) {
  let client;
  
  try {
    logInfo('Restauration des données de seed...');
    
    // Vérifier que le dossier de seed existe
    try {
      await fs.stat(SEED_DIR);
    } catch (error) {
      throw new Error(`Dossier de seed non trouvé: ${SEED_DIR}`);
    }

    // Connexion à MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();
    logSuccess('Connecté à MongoDB');

    // Lister les fichiers de seed
    const files = await fs.readdir(SEED_DIR);
    const seedFiles = files.filter(file => file.endsWith('.seed.json'));

    if (seedFiles.length === 0) {
      logWarning('Aucun fichier de seed trouvé');
      return { success: true, totalRestored: 0, results: [] };
    }

    logInfo(`${seedFiles.length} fichier(s) de seed à restaurer`);

    const results = [];
    let totalRestored = 0;

    // Restaurer chaque fichier de seed
    for (const filename of seedFiles) {
      const filePath = path.join(SEED_DIR, filename);
      const result = await restoreCollection(db, filePath, options);
      results.push(result);
      
      if (result.success && !result.skipped) {
        totalRestored += result.count;
      }
    }

    logSuccess(`Seed restauré: ${totalRestored} documents`);
    
    return {
      success: true,
      totalRestored,
      results
    };

  } catch (error) {
    logError(`Erreur restauration seed: ${error.message}`);
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
 * Liste les backups disponibles
 */
async function listAvailableBackups() {
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
          // Backup sans métadonnées
          backups.push({
            name: dir,
            path: dirPath,
            date: stat.mtime,
            totalDocuments: '?',
            collections: '?'
          });
        }
      }
    }
    
    backups.sort((a, b) => b.date - a.date);
    
    if (backups.length === 0) {
      logInfo('Aucun backup disponible');
    } else {
      logInfo(`${backups.length} backup(s) disponible(s):`);
      backups.forEach((backup, index) => {
        console.log(`  ${index + 1}. ${backup.name}`);
        console.log(`     Date: ${backup.date.toLocaleString()}`);
        console.log(`     Documents: ${backup.totalDocuments}, Collections: ${backup.collections}`);
        console.log(`     Chemin: ${backup.path}`);
      });
    }
    
    return backups;
  } catch (error) {
    logError(`Erreur liste backups: ${error.message}`);
    return [];
  }
}

/**
 * Vide complètement la base de données
 */
async function clearDatabase() {
  let client;
  
  try {
    logWarning('ATTENTION: Cette opération va supprimer TOUTES les données!');
    
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();
    
    // Lister toutes les collections
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      logInfo('Base de données déjà vide');
      return;
    }
    
    logInfo(`Suppression de ${collections.length} collection(s)...`);
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      if (!collectionName.startsWith('system.')) {
        const count = await db.collection(collectionName).countDocuments();
        await db.collection(collectionName).deleteMany({});
        logInfo(`${collectionName}: ${count} documents supprimés`);
      }
    }
    
    logSuccess('Base de données vidée');
    
  } catch (error) {
    logError(`Erreur vidage base: ${error.message}`);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * Fonction principale CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const backupPath = args[1];
  
  // Options
  const force = args.includes('--force');
  const skipExisting = args.includes('--skip-existing');
  const options = { force, skipExisting };

  console.log();
  log('🔄 ANGIOIMAGE - Restauration MongoDB', 'blue');
  log('====================================', 'blue');
  console.log();

  switch (command) {
    case 'backup':
      if (!backupPath) {
        logError('Chemin du backup requis');
        console.log('Utilisation: node restore-mongodb.js backup <chemin-backup> [--force] [--skip-existing]');
        process.exit(1);
      }
      await restoreFromBackup(backupPath, options);
      break;
      
    case 'seed':
      await restoreFromSeed(options);
      break;
      
    case 'list':
      await listAvailableBackups();
      break;
      
    case 'clear':
      if (!force) {
        logError('Utilisez --force pour confirmer la suppression de toutes les données');
        process.exit(1);
      }
      await clearDatabase();
      break;
      
    default:
      logInfo('Utilisation:');
      console.log('  node restore-mongodb.js backup <chemin>  - Restaurer depuis un backup');
      console.log('  node restore-mongodb.js seed             - Restaurer les données de seed');
      console.log('  node restore-mongodb.js list             - Lister les backups disponibles');
      console.log('  node restore-mongodb.js clear --force    - Vider la base de données');
      console.log();
      console.log('Options:');
      console.log('  --force          - Écraser les données existantes');
      console.log('  --skip-existing  - Ignorer les collections existantes');
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
  restoreFromBackup,
  restoreFromSeed,
  restoreCollection,
  listAvailableBackups,
  clearDatabase
};