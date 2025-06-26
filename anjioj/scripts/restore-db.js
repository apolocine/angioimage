#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const BACKUP_DIR = path.join(__dirname, '..', 'database', 'backup');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/angioimage';

async function restoreDatabase(backupPath = null) {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔗 Connexion à MongoDB...');
    await client.connect();
    
    const dbName = new URL(MONGO_URI).pathname.substring(1);
    const db = client.db(dbName);
    
    // Déterminer le dossier de backup à utiliser
    if (!backupPath) {
      backupPath = path.join(BACKUP_DIR, 'latest');
      if (!fs.existsSync(backupPath)) {
        // Chercher le backup le plus récent
        const backups = fs.readdirSync(BACKUP_DIR)
          .filter(f => f.startsWith('backup-'))
          .sort()
          .reverse();
        
        if (backups.length === 0) {
          console.error('❌ Aucun backup trouvé');
          process.exit(1);
        }
        
        backupPath = path.join(BACKUP_DIR, backups[0]);
      }
    }
    
    console.log(`📦 Restauration depuis: ${backupPath}`);
    
    // Lire les métadonnées
    const metadataPath = path.join(backupPath, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log(`📅 Date du backup: ${metadata.timestamp}`);
      console.log(`🗄️  Base de données: ${metadata.database}`);
    }
    
    // Demander confirmation
    if (process.argv[2] !== '--force') {
      console.log('\n⚠️  ATTENTION: Cette opération va remplacer toutes les données existantes!');
      console.log('Utilisez --force pour ignorer cette confirmation\n');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Continuer? (oui/non): ', resolve);
      });
      readline.close();
      
      if (answer.toLowerCase() !== 'oui' && answer.toLowerCase() !== 'o') {
        console.log('❌ Restauration annulée');
        process.exit(0);
      }
    }
    
    // Restaurer chaque collection
    const files = fs.readdirSync(backupPath)
      .filter(f => f.endsWith('.json') && f !== 'metadata.json');
    
    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      console.log(`\n📋 Restauration de la collection: ${collectionName}`);
      
      try {
        const collection = db.collection(collectionName);
        
        // Supprimer les données existantes
        const deleteResult = await collection.deleteMany({});
        console.log(`  🗑️  ${deleteResult.deletedCount} documents supprimés`);
        
        // Charger les nouvelles données
        const filePath = path.join(backupPath, file);
        const documents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (documents.length > 0) {
          // Convertir les ObjectId si nécessaire
          const processedDocs = documents.map(doc => {
            // Convertir _id en ObjectId si c'est une string
            if (doc._id && typeof doc._id === 'object' && doc._id.$oid) {
              const { ObjectId } = require('mongodb');
              doc._id = new ObjectId(doc._id.$oid);
            }
            return doc;
          });
          
          const insertResult = await collection.insertMany(processedDocs);
          console.log(`  ✅ ${insertResult.insertedCount} documents restaurés`);
        } else {
          console.log(`  ⚠️  Aucun document à restaurer`);
        }
      } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
      }
    }
    
    console.log('\n✅ Restauration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Exécuter la restauration
if (require.main === module) {
  const backupPath = process.argv[3] || null;
  restoreDatabase(backupPath)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { restoreDatabase };