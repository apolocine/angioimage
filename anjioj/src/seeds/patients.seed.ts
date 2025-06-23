export const patientsSeed = [
  {
    nom: 'Durand',
    prenom: 'Jean',
    dateNaissance: new Date('1965-03-15'),
    sexe: 'M',
    email: 'jean.durand@email.com',
    telephone: '0123456789',
    adresse: {
      rue: '12 rue de la Paix',
      ville: 'Paris',
      codePostal: '75001',
      pays: 'France'
    },
    dossierMedical: {
      numeroSecu: '1650375001234',
      medecin: 'Dr. Bernard',
      antecedents: ['Hypertension', 'Diabète type 2'],
      allergies: ['Pénicilline'],
      traitements: ['Metformine', 'Ramipril']
    }
  },
  {
    nom: 'Martin',
    prenom: 'Sophie',
    dateNaissance: new Date('1978-07-22'),
    sexe: 'F',
    email: 'sophie.martin@email.com',
    telephone: '0198765432',
    adresse: {
      rue: '45 avenue Victor Hugo',
      ville: 'Lyon',
      codePostal: '69002',
      pays: 'France'
    },
    dossierMedical: {
      numeroSecu: '2780769002345',
      medecin: 'Dr. Lefebvre',
      antecedents: ['Asthme'],
      allergies: [],
      traitements: ['Ventoline']
    }
  },
  {
    nom: 'Petit',
    prenom: 'Pierre',
    dateNaissance: new Date('1952-11-08'),
    sexe: 'M',
    email: 'pierre.petit@email.com',
    telephone: '0234567890',
    adresse: {
      rue: '8 place de la République',
      ville: 'Marseille',
      codePostal: '13001',
      pays: 'France'
    },
    dossierMedical: {
      numeroSecu: '1521113003456',
      medecin: 'Dr. Rousseau',
      antecedents: ['Glaucome', 'Hypertension'],
      allergies: ['Iode'],
      traitements: ['Timolol', 'Amlodipine']
    }
  }
]