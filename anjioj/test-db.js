const { MongoClient } = require('mongodb');

async function testDB() {
  try {
    // Utiliser l'URL de connexion avec authentification
    const client = new MongoClient('mongodb://devuser:devpass26@localhost:27017/angiographiedb?authSource=angiographiedb');
    await client.connect();
    
    console.log('✅ Connexion MongoDB établie');
    
    const db = client.db('angiographiedb');
    
    // Compter les documents
    const examCount = await db.collection('exams').countDocuments();
    const imageCount = await db.collection('images').countDocuments();
    
    console.log(`📋 Examens: ${examCount}`);
    console.log(`🖼️ Images: ${imageCount}`);
    
    // Échantillon d'examens
    const exams = await db.collection('exams').find({}).limit(3).toArray();
    console.log('\n📋 Exemples d\'examens:');
    exams.forEach(exam => {
      console.log(`  - ${exam._id}: ${exam.type} (${exam.oeil})`);
    });
    
    // Échantillon d'images
    const images = await db.collection('images').find({}).limit(3).toArray();
    console.log('\n🖼️ Exemples d\'images:');
    images.forEach(image => {
      console.log(`  - ${image._id}: ${image.originalName} (examen: ${image.examenId})`);
    });
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testDB();