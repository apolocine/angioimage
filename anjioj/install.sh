#!/bin/bash

# Script d'installation Angioimage - Linux/macOS
# Version 1.0

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/install.conf"
ENV_FILE="$SCRIPT_DIR/.env.local"

# Fonctions utilitaires
print_header() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "           🏥 ANGIOIMAGE INSTALLER"
    echo "       Installation et Configuration Automatisée"
    echo "=================================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    print_info "Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé. Version requise: 18.0 ou supérieure"
        echo "Installation: https://nodejs.org/"
        exit 1
    fi
    
    # Vérifier la version de Node.js
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Version de Node.js trop ancienne. Version actuelle: $(node --version), requise: v18.0+"
        exit 1
    fi
    print_success "Node.js $(node --version) trouvé"
    
    # npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    print_success "npm $(npm --version) trouvé"
    
    # MongoDB (optionnel, juste vérification de connectivité)
    print_info "MongoDB sera vérifié lors de la configuration"
    
    print_success "Prérequis validés"
}

# Chargement de la configuration
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Fichier de configuration install.conf non trouvé"
        exit 1
    fi
    
    # Source le fichier de configuration
    set -a
    source "$CONFIG_FILE"
    set +a
    
    print_success "Configuration chargée depuis install.conf"
}

# Test de connexion MongoDB
test_mongodb() {
    print_info "Test de connexion à MongoDB..."
    
    # Créer un script de test temporaire
    cat > /tmp/mongodb_test.js << EOF
const { MongoClient } = require('mongodb');

async function testConnection() {
    try {
        const client = new MongoClient('$MONGO_URI');
        await client.connect();
        console.log('✅ Connexion MongoDB réussie');
        await client.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF
    
    if node /tmp/mongodb_test.js; then
        print_success "Connexion MongoDB validée"
        rm -f /tmp/mongodb_test.js
        return 0
    else
        print_error "Impossible de se connecter à MongoDB"
        print_warning "Vérifiez votre URI MongoDB dans install.conf"
        rm -f /tmp/mongodb_test.js
        return 1
    fi
}

# Installation des dépendances
install_dependencies() {
    print_info "Installation des dépendances npm..."
    
    if npm install; then
        print_success "Dépendances installées avec succès"
    else
        print_error "Échec de l'installation des dépendances"
        exit 1
    fi
}

# Création du fichier .env.local
create_env_file() {
    print_info "Création du fichier .env.local..."
    
    cat > "$ENV_FILE" << EOF
# Base de données
MONGO_URI=$MONGO_URI

# NextAuth
NEXTAUTH_URL=$APP_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# JWT
JWT_SECRET=$JWT_SECRET

# Application
NODE_ENV=$NODE_ENV
PORT=$APP_PORT

# Configuration du stockage
UPLOAD_DIR=$UPLOAD_DIR
MAX_FILE_SIZE=$MAX_FILE_SIZE
REPORTS_DIR=$REPORTS_DIR

# Configuration par défaut des rapports
DEFAULT_REPORT_FORMAT=$DEFAULT_REPORT_FORMAT
DEFAULT_REPORT_ORIENTATION=$DEFAULT_REPORT_ORIENTATION
EOF
    
    print_success "Fichier .env.local créé"
}

# Création des dossiers nécessaires
create_directories() {
    print_info "Création des dossiers de stockage..."
    
    mkdir -p storage/uploads/images
    mkdir -p storage/uploads/thumbnails
    mkdir -p storage/reports
    mkdir -p storage/temp
    
    # Permissions (Unix/Linux)
    chmod 755 storage
    chmod 755 storage/uploads
    chmod 755 storage/uploads/images
    chmod 755 storage/uploads/thumbnails
    chmod 755 storage/reports
    chmod 755 storage/temp
    
    print_success "Dossiers de stockage créés"
}

# Build de l'application
build_application() {
    print_info "Construction de l'application..."
    
    if npm run build; then
        print_success "Application construite avec succès"
    else
        print_error "Échec de la construction de l'application"
        exit 1
    fi
}

# Seeding de la base de données
seed_database() {
    print_info "Initialisation de la base de données..."
    
    # Vérifier si on doit utiliser les données initiales ou un backup existant
    if [ -d "database/backup/latest" ]; then
        print_info "Backup existant trouvé, restauration en cours..."
        if node scripts/restore-db.js --force; then
            print_success "Base de données restaurée depuis le backup"
        else
            print_warning "Échec de la restauration, utilisation des données initiales"
            restore_initial_data
        fi
    else
        print_info "Aucun backup trouvé, utilisation des données initiales"
        restore_initial_data
    fi
}

# Restaurer les données initiales
restore_initial_data() {
    print_info "Installation des données initiales..."
    
    # Créer un script temporaire pour restaurer les données initiales
    cat > /tmp/restore_initial.js << 'EOF'
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const INITIAL_DATA_DIR = path.join(__dirname, 'database', 'initial-data');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/angioimage';

async function restoreInitialData() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        const dbName = new URL(MONGO_URI).pathname.substring(1);
        const db = client.db(dbName);
        
        // Lire tous les fichiers JSON du dossier initial-data
        const files = fs.readdirSync(INITIAL_DATA_DIR)
            .filter(f => f.endsWith('.json') && f !== 'metadata.json');
        
        for (const file of files) {
            const collectionName = path.basename(file, '.json');
            console.log(`Installing ${collectionName}...`);
            
            try {
                const collection = db.collection(collectionName);
                const filePath = path.join(INITIAL_DATA_DIR, file);
                const documents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                if (documents.length > 0) {
                    // Convertir les ObjectId
                    const processedDocs = documents.map(doc => {
                        if (doc._id && typeof doc._id === 'object' && doc._id.$oid) {
                            const { ObjectId } = require('mongodb');
                            doc._id = new ObjectId(doc._id.$oid);
                        }
                        // Convertir les dates
                        Object.keys(doc).forEach(key => {
                            if (doc[key] && typeof doc[key] === 'object' && doc[key].$date) {
                                doc[key] = new Date(doc[key].$date);
                            }
                        });
                        return doc;
                    });
                    
                    // Vérifier si la collection est vide avant d'insérer
                    const count = await collection.countDocuments();
                    if (count === 0) {
                        await collection.insertMany(processedDocs);
                        console.log(`✅ ${processedDocs.length} documents inserted`);
                    } else {
                        console.log(`⚠️  Collection not empty, skipping`);
                    }
                }
            } catch (error) {
                console.error(`❌ Error: ${error.message}`);
            }
        }
        
        console.log('✅ Initial data installed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

restoreInitialData();
EOF
    
    if node /tmp/restore_initial.js; then
        print_success "Données initiales installées"
        rm -f /tmp/restore_initial.js
    else
        print_error "Échec de l'installation des données initiales"
        rm -f /tmp/restore_initial.js
        return 1
    fi
}

# Fonction de backup de la base de données
backup_database() {
    print_info "Backup de la base de données..."
    
    if node scripts/backup-db.js; then
        print_success "Backup réalisé avec succès"
    else
        print_error "Échec du backup"
        return 1
    fi
}

# Initialisation des paramètres de l'application
init_app_settings() {
    print_info "Initialisation des paramètres de l'application..."
    
    # Créer un script temporaire pour initialiser les paramètres
    cat > /tmp/init_settings.js << EOF
require('dotenv').config({ path: '.env.local' });
const { SettingsService } = require('./dist/lib/services/SettingsService.js');

async function initSettings() {
    try {
        await SettingsService.initializeDefaultSettings();
        
        // Configurer les paramètres du cabinet si fournis
        if ('$CABINET_NAME' !== 'Cabinet d\'Ophtalmologie') {
            await SettingsService.setSetting('general.cabinetName', '$CABINET_NAME', {
                category: 'general',
                description: 'Nom du cabinet médical'
            });
        }
        
        if ('$DOCTOR_NAME' !== 'Dr. Nom Prénom') {
            await SettingsService.setSetting('general.doctorName', '$DOCTOR_NAME', {
                category: 'general',
                description: 'Nom du médecin principal'
            });
        }
        
        console.log('✅ Paramètres initialisés');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur initialisation paramètres:', error);
        process.exit(1);
    }
}

initSettings();
EOF
    
    if node /tmp/init_settings.js; then
        print_success "Paramètres de l'application initialisés"
        rm -f /tmp/init_settings.js
    else
        print_warning "Échec de l'initialisation des paramètres"
        rm -f /tmp/init_settings.js
    fi
}

# Menu principal
show_menu() {
    clear
    print_header
    echo ""
    echo "Choisissez une option d'installation :"
    echo ""
    echo "0. Installation complète (recommandée)"
    echo "1. Vérifier les prérequis uniquement"
    echo "2. Installer les dépendances npm"
    echo "3. Configurer l'environnement (.env.local)"
    echo "4. Tester la connexion MongoDB"
    echo "5. Construire l'application"
    echo "6. Initialiser la base de données (seeding)"
    echo "7. Configurer les paramètres de l'application"
    echo "8. Backup de la base de données"
    echo "9. Restaurer la base de données"
    echo "10. Démarrer l'application"
    echo "11. Quitter"
    echo ""
    echo -n "Votre choix (0-11): "
}

# Installation complète
full_install() {
    print_header
    print_info "🚀 Début de l'installation complète..."
    
    load_config
    check_prerequisites
    
    if ! test_mongodb; then
        print_error "Installation interrompue: problème de connexion MongoDB"
        exit 1
    fi
    
    install_dependencies
    create_env_file
    create_directories
    build_application
    seed_database
    init_app_settings
    
    print_success "🎉 Installation complète terminée avec succès!"
    echo ""
    print_info "Pour démarrer l'application, utilisez: npm start"
    print_info "L'application sera accessible sur: $APP_URL"
    echo ""
    
    if [ "$SEED_ADMIN_USER" = "true" ]; then
        print_info "Compte administrateur créé:"
        print_info "  Email: $ADMIN_EMAIL"
        print_info "  Mot de passe: $ADMIN_PASSWORD"
        print_warning "Changez le mot de passe lors de la première connexion!"
    fi
}

# Démarrage de l'application
start_application() {
    print_info "Démarrage de l'application..."
    
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Fichier .env.local non trouvé. Exécutez d'abord la configuration."
        return 1
    fi
    
    print_success "Démarrage en cours sur $APP_URL"
    exec npm start
}

# Fonction principale
main() {
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            0)
                full_install
                break
                ;;
            1)
                clear
                print_header
                check_prerequisites
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            2)
                clear
                print_header
                install_dependencies
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            3)
                clear
                print_header
                load_config
                create_env_file
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            4)
                clear
                print_header
                load_config
                test_mongodb
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            5)
                clear
                print_header
                build_application
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            6)
                clear
                print_header
                load_config
                seed_database
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            7)
                clear
                print_header
                load_config
                init_app_settings
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            8)
                clear
                print_header
                load_config
                backup_database
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            9)
                clear
                print_header
                load_config
                print_warning "Cette opération va remplacer toutes les données existantes!"
                echo ""
                echo "Options disponibles:"
                echo "1. Restaurer depuis le dernier backup"
                echo "2. Restaurer depuis les données initiales"
                echo "3. Annuler"
                echo -n "Votre choix (1-3): "
                read restore_choice
                
                case $restore_choice in
                    1)
                        if [ -d "database/backup/latest" ]; then
                            node scripts/restore-db.js
                        else
                            print_error "Aucun backup trouvé"
                        fi
                        ;;
                    2)
                        restore_initial_data
                        ;;
                    3)
                        print_info "Restauration annulée"
                        ;;
                    *)
                        print_error "Option invalide"
                        ;;
                esac
                echo ""
                read -p "Appuyez sur Entrée pour continuer..."
                ;;
            10)
                clear
                print_header
                load_config
                start_application
                break
                ;;
            11)
                print_info "Au revoir!"
                exit 0
                ;;
            *)
                print_error "Option invalide. Veuillez choisir entre 0 et 11."
                sleep 2
                ;;
        esac
    done
}

# Vérification que le script est dans le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté depuis le répertoire racine du projet Angioimage"
    exit 1
fi

# Exécution du script principal
main "$@"