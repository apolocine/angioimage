// Script d'initialisation MongoDB pour le développement
db = db.getSiblingDB('angiographiedb');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'devuser',
  pwd: 'devpass26',
  roles: [
    {
      role: 'readWrite',
      db: 'angiographiedb'
    }
  ]
});

print('Base de données angiographiedb initialisée avec l\'utilisateur devuser');