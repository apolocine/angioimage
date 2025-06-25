@echo off
setlocal enabledelayedexpansion

REM Script d'installation Angioimage - Windows
REM Version 1.0

title Angioimage Installer

REM Variables globales
set "SCRIPT_DIR=%~dp0"
set "CONFIG_FILE=%SCRIPT_DIR%install.conf"
set "ENV_FILE=%SCRIPT_DIR%.env.local"

REM Couleurs pour Windows (avec echo)
REM Note: Windows CMD ne supporte pas les couleurs ANSI par défaut

goto :main

REM ========================================
REM Fonctions utilitaires
REM ========================================

:print_header
echo.
echo ==================================================
echo            🏥 ANGIOIMAGE INSTALLER
echo        Installation et Configuration Automatisée
echo ==================================================
echo.
goto :eof

:print_success
echo [✅] %~1
goto :eof

:print_error
echo [❌] %~1
goto :eof

:print_warning
echo [⚠️ ] %~1
goto :eof

:print_info
echo [ℹ️ ] %~1
goto :eof

REM ========================================
REM Vérification des prérequis
REM ========================================

:check_prerequisites
call :print_info "Vérification des prérequis..."

REM Vérifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Node.js n'est pas installé. Version requise: 18.0 ou supérieure"
    echo Installation: https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier la version de Node.js (simplifiée)
for /f "tokens=1 delims=." %%a in ('node --version') do (
    set "NODE_MAJOR=%%a"
    set "NODE_MAJOR=!NODE_MAJOR:v=!"
)

if !NODE_MAJOR! LSS 18 (
    call :print_error "Version de Node.js trop ancienne. Requise: v18.0+"
    node --version
    pause
    exit /b 1
)

for /f %%i in ('node --version') do set NODE_VERSION=%%i
call :print_success "Node.js !NODE_VERSION! trouvé"

REM Vérifier npm
npm --version >nul 2>&1
if errorlevel 1 (
    call :print_error "npm n'est pas installé"
    pause
    exit /b 1
)

for /f %%i in ('npm --version') do set NPM_VERSION=%%i
call :print_success "npm !NPM_VERSION! trouvé"

call :print_info "MongoDB sera vérifié lors de la configuration"
call :print_success "Prérequis validés"
goto :eof

REM ========================================
REM Chargement de la configuration
REM ========================================

:load_config
if not exist "%CONFIG_FILE%" (
    call :print_error "Fichier de configuration install.conf non trouvé"
    pause
    exit /b 1
)

REM Lire le fichier de configuration ligne par ligne
for /f "eol=# tokens=1,2 delims==" %%a in (%CONFIG_FILE%) do (
    if not "%%b"=="" (
        set "%%a=%%b"
    )
)

call :print_success "Configuration chargée depuis install.conf"
goto :eof

REM ========================================
REM Test de connexion MongoDB
REM ========================================

:test_mongodb
call :print_info "Test de connexion à MongoDB..."

REM Créer un script de test temporaire
echo const { MongoClient } = require('mongodb'); > %TEMP%\mongodb_test.js
echo. >> %TEMP%\mongodb_test.js
echo async function testConnection() { >> %TEMP%\mongodb_test.js
echo     try { >> %TEMP%\mongodb_test.js
echo         const client = new MongoClient('%MONGO_URI%'); >> %TEMP%\mongodb_test.js
echo         await client.connect(); >> %TEMP%\mongodb_test.js
echo         console.log('✅ Connexion MongoDB réussie'); >> %TEMP%\mongodb_test.js
echo         await client.close(); >> %TEMP%\mongodb_test.js
echo         process.exit(0); >> %TEMP%\mongodb_test.js
echo     } catch (error) { >> %TEMP%\mongodb_test.js
echo         console.error('❌ Erreur de connexion MongoDB:', error.message); >> %TEMP%\mongodb_test.js
echo         process.exit(1); >> %TEMP%\mongodb_test.js
echo     } >> %TEMP%\mongodb_test.js
echo } >> %TEMP%\mongodb_test.js
echo. >> %TEMP%\mongodb_test.js
echo testConnection(); >> %TEMP%\mongodb_test.js

node %TEMP%\mongodb_test.js
if errorlevel 1 (
    call :print_error "Impossible de se connecter à MongoDB"
    call :print_warning "Vérifiez votre URI MongoDB dans install.conf"
    del /q %TEMP%\mongodb_test.js >nul 2>&1
    goto :eof
)

call :print_success "Connexion MongoDB validée"
del /q %TEMP%\mongodb_test.js >nul 2>&1
goto :eof

REM ========================================
REM Installation des dépendances
REM ========================================

:install_dependencies
call :print_info "Installation des dépendances npm..."

npm install
if errorlevel 1 (
    call :print_error "Échec de l'installation des dépendances"
    pause
    exit /b 1
)

call :print_success "Dépendances installées avec succès"
goto :eof

REM ========================================
REM Création du fichier .env.local
REM ========================================

:create_env_file
call :print_info "Création du fichier .env.local..."

echo # Base de données > "%ENV_FILE%"
echo MONGO_URI=%MONGO_URI% >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # NextAuth >> "%ENV_FILE%"
echo NEXTAUTH_URL=%APP_URL% >> "%ENV_FILE%"
echo NEXTAUTH_SECRET=%NEXTAUTH_SECRET% >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # JWT >> "%ENV_FILE%"
echo JWT_SECRET=%JWT_SECRET% >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # Application >> "%ENV_FILE%"
echo NODE_ENV=%NODE_ENV% >> "%ENV_FILE%"
echo PORT=%APP_PORT% >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # Configuration du stockage >> "%ENV_FILE%"
echo UPLOAD_DIR=%UPLOAD_DIR% >> "%ENV_FILE%"
echo MAX_FILE_SIZE=%MAX_FILE_SIZE% >> "%ENV_FILE%"
echo REPORTS_DIR=%REPORTS_DIR% >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # Configuration par défaut des rapports >> "%ENV_FILE%"
echo DEFAULT_REPORT_FORMAT=%DEFAULT_REPORT_FORMAT% >> "%ENV_FILE%"
echo DEFAULT_REPORT_ORIENTATION=%DEFAULT_REPORT_ORIENTATION% >> "%ENV_FILE%"

call :print_success "Fichier .env.local créé"
goto :eof

REM ========================================
REM Création des dossiers nécessaires
REM ========================================

:create_directories
call :print_info "Création des dossiers de stockage..."

if not exist "storage" mkdir storage
if not exist "storage\uploads" mkdir storage\uploads
if not exist "storage\uploads\images" mkdir storage\uploads\images
if not exist "storage\uploads\thumbnails" mkdir storage\uploads\thumbnails
if not exist "storage\reports" mkdir storage\reports
if not exist "storage\temp" mkdir storage\temp

call :print_success "Dossiers de stockage créés"
goto :eof

REM ========================================
REM Build de l'application
REM ========================================

:build_application
call :print_info "Construction de l'application..."

npm run build
if errorlevel 1 (
    call :print_error "Échec de la construction de l'application"
    pause
    exit /b 1
)

call :print_success "Application construite avec succès"
goto :eof

REM ========================================
REM Seeding de la base de données
REM ========================================

:seed_database
call :print_info "Seeding de la base de données..."

if /i "%SEED_SAMPLE_DATA%"=="true" (
    npm run seed:install
    if errorlevel 1 (
        call :print_warning "Échec du seeding des données d'exemple"
    ) else (
        call :print_success "Base de données initialisée avec les données d'exemple"
    )
) else (
    call :print_info "Seeding des données d'exemple désactivé"
)
goto :eof

REM ========================================
REM Initialisation des paramètres
REM ========================================

:init_app_settings
call :print_info "Initialisation des paramètres de l'application..."

REM Créer un script temporaire pour initialiser les paramètres
echo require('dotenv').config({ path: '.env.local' }); > %TEMP%\init_settings.js
echo const { SettingsService } = require('./dist/lib/services/SettingsService.js'); >> %TEMP%\init_settings.js
echo. >> %TEMP%\init_settings.js
echo async function initSettings() { >> %TEMP%\init_settings.js
echo     try { >> %TEMP%\init_settings.js
echo         await SettingsService.initializeDefaultSettings(); >> %TEMP%\init_settings.js
echo. >> %TEMP%\init_settings.js
echo         if ('%CABINET_NAME%' !== 'Cabinet d\'Ophtalmologie') { >> %TEMP%\init_settings.js
echo             await SettingsService.setSetting('general.cabinetName', '%CABINET_NAME%', { >> %TEMP%\init_settings.js
echo                 category: 'general', >> %TEMP%\init_settings.js
echo                 description: 'Nom du cabinet médical' >> %TEMP%\init_settings.js
echo             }); >> %TEMP%\init_settings.js
echo         } >> %TEMP%\init_settings.js
echo. >> %TEMP%\init_settings.js
echo         if ('%DOCTOR_NAME%' !== 'Dr. Nom Prénom') { >> %TEMP%\init_settings.js
echo             await SettingsService.setSetting('general.doctorName', '%DOCTOR_NAME%', { >> %TEMP%\init_settings.js
echo                 category: 'general', >> %TEMP%\init_settings.js
echo                 description: 'Nom du médecin principal' >> %TEMP%\init_settings.js
echo             }); >> %TEMP%\init_settings.js
echo         } >> %TEMP%\init_settings.js
echo. >> %TEMP%\init_settings.js
echo         console.log('✅ Paramètres initialisés'); >> %TEMP%\init_settings.js
echo         process.exit(0); >> %TEMP%\init_settings.js
echo     } catch (error) { >> %TEMP%\init_settings.js
echo         console.error('❌ Erreur initialisation paramètres:', error); >> %TEMP%\init_settings.js
echo         process.exit(1); >> %TEMP%\init_settings.js
echo     } >> %TEMP%\init_settings.js
echo } >> %TEMP%\init_settings.js
echo. >> %TEMP%\init_settings.js
echo initSettings(); >> %TEMP%\init_settings.js

node %TEMP%\init_settings.js
if errorlevel 1 (
    call :print_warning "Échec de l'initialisation des paramètres"
) else (
    call :print_success "Paramètres de l'application initialisés"
)

del /q %TEMP%\init_settings.js >nul 2>&1
goto :eof

REM ========================================
REM Menu principal
REM ========================================

:show_menu
cls
call :print_header
echo Choisissez une option d'installation :
echo.
echo 0. Installation complète (recommandée)
echo 1. Vérifier les prérequis uniquement
echo 2. Installer les dépendances npm
echo 3. Configurer l'environnement (.env.local)
echo 4. Tester la connexion MongoDB
echo 5. Construire l'application
echo 6. Initialiser la base de données (seeding)
echo 7. Configurer les paramètres de l'application
echo 8. Démarrer l'application
echo 9. Quitter
echo.
set /p "choice=Votre choix (0-9): "
goto :eof

REM ========================================
REM Installation complète
REM ========================================

:full_install
cls
call :print_header
call :print_info "🚀 Début de l'installation complète..."

call :load_config
call :check_prerequisites
call :test_mongodb

call :install_dependencies
call :create_env_file
call :create_directories
call :build_application
call :seed_database
call :init_app_settings

call :print_success "🎉 Installation complète terminée avec succès!"
echo.
call :print_info "Pour démarrer l'application, utilisez: npm start"
call :print_info "L'application sera accessible sur: %APP_URL%"
echo.

if /i "%SEED_ADMIN_USER%"=="true" (
    call :print_info "Compte administrateur créé:"
    call :print_info "  Email: %ADMIN_EMAIL%"
    call :print_info "  Mot de passe: %ADMIN_PASSWORD%"
    call :print_warning "Changez le mot de passe lors de la première connexion!"
)

pause
goto :eof

REM ========================================
REM Démarrage de l'application
REM ========================================

:start_application
call :print_info "Démarrage de l'application..."

if not exist "%ENV_FILE%" (
    call :print_error "Fichier .env.local non trouvé. Exécutez d'abord la configuration."
    pause
    goto :eof
)

call :print_success "Démarrage en cours sur %APP_URL%"
npm start
goto :eof

REM ========================================
REM Fonction principale
REM ========================================

:main
REM Vérifier que le script est dans le bon répertoire
if not exist "package.json" (
    call :print_error "Ce script doit être exécuté depuis le répertoire racine du projet Angioimage"
    pause
    exit /b 1
)

:menu_loop
call :show_menu

if "%choice%"=="0" (
    call :full_install
    goto :end
) else if "%choice%"=="1" (
    cls
    call :print_header
    call :check_prerequisites
    echo.
    pause
    goto :menu_loop
) else if "%choice%"=="2" (
    cls
    call :print_header
    call :install_dependencies
    echo.
    pause
    goto :menu_loop
) else if "%choice%"=="3" (
    cls
    call :print_header
    call :load_config
    call :create_env_file
    echo.
    pause
    goto :menu_loop
) else if "%choice%"=="4" (
    cls
    call :print_header
    call :load_config
    call :test_mongodb
    echo.
    pause
    goto :menu_loop
) else if "%choice%"=="5" (
    cls
    call :print_header
    call :build_application
    echo.
    pause
    goto :menu_loop
) else if "%choice%"=="6" (
    cls
    call :print_header
    call :load_config
    call :seed_database
    echo.
    pause
    goto :menu_loop
) else if "%choice%"=="7" (
    cls
    call :print_header
    call :load_config
    call :init_app_settings
    echo.
    pause
    goto :menu_loop
) else if "%choice%"=="8" (
    cls
    call :print_header
    call :load_config
    call :start_application
    goto :end
) else if "%choice%"=="9" (
    call :print_info "Au revoir!"
    goto :end
) else (
    call :print_error "Option invalide. Veuillez choisir entre 0 et 9."
    timeout /t 2 /nobreak >nul
    goto :menu_loop
)

:end
pause
exit /b 0