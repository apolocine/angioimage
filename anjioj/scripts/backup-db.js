#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const BACKUP_DIR = path.join(__dirname, '..', 'database', 'backup');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/angioimage';

// Collections à sauvegarder
const COLLECTIONS_TO_BACKUP = [
  'users',
  'patients', 
  'exams',
  'images',
  'reports',
  'reporttemplates',
  'appsettings'
];

async function backupDatabase() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔗 Connexion à MongoDB...');
    await client.connect();
    
    const dbName = new URL(MONGO_URI).pathname.substring(1);
    const db = client.db(dbName);
    
    console.log(`📦 Backup de la base de données: ${dbName}`);
    
    // Créer le dossier de backup s'il n'existe pas
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // Créer un dossier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupPath);
    
    // Sauvegarder chaque collection
    for (const collectionName of COLLECTIONS_TO_BACKUP) {
      try {
        console.log(`  📋 Backup de la collection: ${collectionName}`);
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        if (documents.length > 0) {
          const filePath = path.join(backupPath, `${collectionName}.json`);
          fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
          console.log(`    ✅ ${documents.length} documents sauvegardés`);
        } else {
          console.log(`    ⚠️  Collection vide`);
        }
      } catch (error) {
        console.log(`    ❌ Erreur: ${error.message}`);
      }
    }
    
    // Créer un fichier metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      database: dbName,
      mongoUri: MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Masquer les credentials
      collections: COLLECTIONS_TO_BACKUP,
      version: require('../package.json').version
    };
    
    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`\n✅ Backup terminé avec succès!`);
    console.log(`📁 Emplacement: ${backupPath}`);
    
    // Créer aussi un backup "latest" pour faciliter la restauration
    const latestPath = path.join(BACKUP_DIR, 'latest');
    if (fs.existsSync(latestPath)) {
      fs.rmSync(latestPath, { recursive: true });
    }
    fs.cpSync(backupPath, latestPath, { recursive: true });
    console.log(`📁 Backup latest mis à jour`);
    
  } catch (error) {
    console.error('❌ Erreur lors du backup:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Exécuter le backup
if (require.main === module) {
  backupDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { backupDatabase };