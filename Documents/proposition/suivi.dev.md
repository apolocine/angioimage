# 📋 Suivi de Développement et Tests - Angioimage Web

## 📊 Légende
- ✅ **DEV** : Développement terminé
- ✅ **TEST** : Tests validés
- ⏳ **En cours**
- ❌ **Non commencé**

---

## 🔐 AUTHENTIFICATION

### `/login` - Page de Connexion
**Description** : Page d'authentification utilisateur

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Formulaire de connexion** | Form avec email/password | ✅ | ❌ |
| - Champ email | Input type="email" avec validation | ✅ | ❌ |
| - Champ password | Input type="password" avec toggle visibility | ✅ | ❌ |
| - Bouton "Se connecter" | Submit button avec loading state | ✅ | ❌ |
| - Checkbox "Se souvenir" | Remember me functionality | ✅ | ❌ |
| **Messages d'erreur** | Affichage erreurs validation/auth | ✅ | ❌ |
| **Lien mot de passe oublié** | Redirection vers reset password | ❌ | ❌ |
| **Logo/Branding** | Logo Angioimage + tagline | ✅ | ❌ |
| **Mode sombre/clair** | Toggle theme button | ❌ | ❌ |
| **Responsive design** | Mobile/tablet/desktop layouts | ❌ | ❌ |

### `/register` - Page d'Inscription
**Description** : Création de nouveaux comptes utilisateur

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Formulaire d'inscription** | Form création utilisateur | ✅ | ❌ |
| - Champ nom complet | Input text avec validation | ✅ | ❌ |
| - Champ email | Input email avec vérification unicité | ✅ | ❌ |
| - Champ password | Input password avec force indicator | ✅ | ❌ |
| - Confirmation password | Input avec validation match | ❌ | ❌ |
| - Sélection rôle | Select (admin/doctor/assistant) | ✅ | ❌ |
| **Conditions d'utilisation** | Checkbox + lien vers CGU | ✅ | ❌ |
| **Bouton inscription** | Submit avec validation complète | ✅ | ❌ |
| **Lien retour connexion** | Redirection vers /login | ✅ | ❌ |

---

## 🏠 DASHBOARD

### `/dashboard` - Tableau de Bord Principal
**Description** : Vue d'ensemble de l'activité

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header navigation** | Barre navigation principale | ✅ | ❌ |
| - Logo Angioimage | Logo cliquable vers dashboard | ✅ | ❌ |
| - Menu utilisateur | Dropdown (profil/déconnexion) | ✅ | ❌ |
| - Notifications | Bell icon avec badge count | ❌ | ❌ |
| - Recherche globale | Search bar avec autocomplete | ❌ | ❌ |
| **Sidebar navigation** | Menu latéral avec liens | ✅ | ❌ |
| - Lien Patients | Navigation vers /dashboard/patients | ✅ | ❌ |
| - Lien Images | Navigation vers /dashboard/images | ✅ | ❌ |
| - Lien Angiographie | Navigation vers /dashboard/angiography | ✅ | ❌ |
| - Lien Rapports | Navigation vers /dashboard/reports | ✅ | ❌ |
| - Lien Paramètres | Navigation vers /dashboard/settings | ✅ | ❌ |
| **Widgets statistiques** | Cards avec métriques | ✅ | ❌ |
| - Total patients | Nombre total avec évolution | ✅ | ❌ |
| - Examens du jour | Nombre d'examens programmés | ✅ | ❌ |
| - Images traitées | Nombre d'images de la semaine | ✅ | ❌ |
| - Rapports générés | Nombre de rapports du mois | ✅ | ❌ |
| **Graphique activité** | Chart.js ligne temps réel | ❌ | ❌ |
| **Liste examens récents** | Table avec derniers examens | ✅ | ❌ |
| **Alertes/Notifications** | Panel notifications importantes | ❌ | ❌ |
| **Actions rapides** | Boutons actions fréquentes | ✅ | ❌ |
| - Nouveau patient | Bouton vers /dashboard/patients/new | ✅ | ❌ |
| - Nouvel examen | Bouton modal création examen | ✅ | ❌ |
| - Import images | Bouton upload rapide | ✅ | ❌ |

---

## 👥 GESTION PATIENTS

### `/dashboard/patients` - Liste des Patients
**Description** : Vue d'ensemble de tous les patients

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header page** | Titre + bouton nouveau patient | ✅ | ❌ |
| - Titre "Patients" | H1 avec compteur total | ✅ | ❌ |
| - Bouton "Nouveau patient" | Navigation vers /dashboard/patients/new | ✅ | ❌ |
| **Barre de recherche** | Search input avec filtres | ✅ | ❌ |
| - Champ recherche | Input text avec debounce | ✅ | ❌ |
| - Filtre par âge | Select range d'âge | ❌ | ❌ |
| - Filtre par genre | Select M/F/Tous | ❌ | ❌ |
| - Bouton recherche | Submit search avec loading | ✅ | ❌ |
| - Bouton reset | Clear all filters | ❌ | ❌ |
| **Table patients** | Table responsive avec données | ✅ | ❌ |
| - Colonne photo | Avatar/initiales patient | ❌ | ❌ |
| - Colonne nom/prénom | Nom complet cliquable | ✅ | ❌ |
| - Colonne âge | Âge calculé automatiquement | ✅ | ❌ |
| - Colonne dernière visite | Date dernier examen | ❌ | ❌ |
| - Colonne nb examens | Count total examens | ❌ | ❌ |
| - Colonne actions | Dropdown (voir/éditer/supprimer) | ❌ | ❌ |
| **Pagination** | Navigation pages avec info | ❌ | ❌ |
| - Boutons prev/next | Navigation avec disabled states | ❌ | ❌ |
| - Info page courante | "Page X sur Y" | ❌ | ❌ |
| - Sélecteur par page | Select (10/25/50/100) | ❌ | ❌ |
| **Export données** | Bouton export CSV/PDF | ❌ | ❌ |

### `/dashboard/patients/new` - Nouveau Patient
**Description** : Formulaire de création d'un nouveau patient

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header page** | Titre + breadcrumb navigation | ❌ | ❌ |
| **Formulaire patient** | Form multi-étapes | ❌ | ❌ |
| - **Étape 1: Informations personnelles** |  | ❌ | ❌ |
| -- Champ nom | Input text obligatoire | ❌ | ❌ |
| -- Champ prénom | Input text obligatoire | ❌ | ❌ |
| -- Date de naissance | Date picker obligatoire | ❌ | ❌ |
| -- Genre | Radio buttons M/F | ❌ | ❌ |
| -- Numéro sécurité sociale | Input avec format mask | ❌ | ❌ |
| - **Étape 2: Contact** |  | ❌ | ❌ |
| -- Email | Input email avec validation | ❌ | ❌ |
| -- Téléphone | Input tel avec format | ❌ | ❌ |
| -- Adresse rue | Input text | ❌ | ❌ |
| -- Code postal | Input avec validation | ❌ | ❌ |
| -- Ville | Input text avec autocomplete | ❌ | ❌ |
| -- Pays | Select avec défaut France | ❌ | ❌ |
| - **Étape 3: Informations médicales** |  | ❌ | ❌ |
| -- Médecin traitant | Input text | ❌ | ❌ |
| -- Antécédents | Textarea | ❌ | ❌ |
| -- Allergies | Tags input | ❌ | ❌ |
| -- Traitements actuels | Tags input | ❌ | ❌ |
| **Navigation étapes** | Stepper avec validation | ❌ | ❌ |
| **Boutons actions** | Annuler/Précédent/Suivant/Créer | ❌ | ❌ |
| **Validation temps réel** | Messages erreur par champ | ❌ | ❌ |
| **Sauvegarde brouillon** | Auto-save en localStorage | ❌ | ❌ |

### `/dashboard/patients/[id]` - Détail Patient
**Description** : Vue détaillée d'un patient avec ses examens

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header patient** | Infos principales + actions | ❌ | ❌ |
| - Photo patient | Avatar avec upload | ❌ | ❌ |
| - Nom/Prénom | H1 avec âge | ❌ | ❌ |
| - Informations clés | Badges (âge, genre, etc.) | ❌ | ❌ |
| - Bouton éditer | Navigation vers .../edit | ❌ | ❌ |
| - Bouton supprimer | Modal confirmation | ❌ | ❌ |
| **Onglets navigation** | Tabs pour organiser contenu | ❌ | ❌ |
| - Onglet Informations | Détails patient | ❌ | ❌ |
| - Onglet Examens | Liste examens | ❌ | ❌ |
| - Onglet Images | Galerie images | ❌ | ❌ |
| - Onglet Historique | Timeline activité | ❌ | ❌ |
| **Panel informations** | Cards infos détaillées | ❌ | ❌ |
| - Contact | Email, tél, adresse | ❌ | ❌ |
| - Médical | Antécédents, allergies | ❌ | ❌ |
| - Statistiques | Nb examens, dernière visite | ❌ | ❌ |
| **Liste examens** | Table avec examens patient | ❌ | ❌ |
| - Colonne date | Date examen cliquable | ❌ | ❌ |
| - Colonne type | Badge type examen | ❌ | ❌ |
| - Colonne statut | Badge statut coloré | ❌ | ❌ |
| - Colonne actions | Liens voir/rapport | ❌ | ❌ |
| **Bouton nouvel examen** | Modal création examen | ❌ | ❌ |

### `/dashboard/patients/[id]/edit` - Édition Patient
**Description** : Formulaire de modification d'un patient existant

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Formulaire pré-rempli** | Même structure que création | ❌ | ❌ |
| **Détection changements** | Dirty state pour sauvegarder | ❌ | ❌ |
| **Bouton sauvegarder** | Update avec feedback | ❌ | ❌ |
| **Bouton annuler** | Confirmation si changements | ❌ | ❌ |

### `/dashboard/patients/[id]/examens` - Examens Patient
**Description** : Liste détaillée des examens d'un patient

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Filtre examens** | Filtres par date/type | ❌ | ❌ |
| **Vue timeline** | Chronologie examens | ❌ | ❌ |
| **Vue grille** | Cards examens | ❌ | ❌ |
| **Vue table** | Table détaillée | ❌ | ❌ |

### `/dashboard/patients/[id]/examens/[examId]` - Détail Examen
**Description** : Vue complète d'un examen spécifique

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header examen** | Date, type, statut | ❌ | ❌ |
| **Informations examen** | Détails protocole | ❌ | ❌ |
| **Galerie images** | Images de l'examen | ❌ | ❌ |
| **Annotations** | Notes praticien | ❌ | ❌ |
| **Rapport** | Lien vers rapport généré | ❌ | ❌ |

---

## 🖼️ GESTION IMAGES

### `/dashboard/images` - Galerie Images
**Description** : Vue d'ensemble de toutes les images

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header galerie** | Titre + upload button | ❌ | ❌ |
| **Filtres images** | Filtres par patient/date/type | ❌ | ❌ |
| - Filtre patient | Select avec recherche | ❌ | ❌ |
| - Filtre date | Date range picker | ❌ | ❌ |
| - Filtre type | Select modalité | ❌ | ❌ |
| - Filtre traitement | Checkbox (originale/modifiée) | ❌ | ❌ |
| **Vue grille** | Grid responsive images | ❌ | ❌ |
| - Thumbnail image | Image avec overlay info | ❌ | ❌ |
| - Info patient | Nom patient overlay | ❌ | ❌ |
| - Date capture | Date/heure overlay | ❌ | ❌ |
| - Actions rapides | Boutons voir/éditer/supprimer | ❌ | ❌ |
| **Sélection multiple** | Checkbox pour actions batch | ❌ | ❌ |
| **Actions groupées** | Supprimer/Exporter sélection | ❌ | ❌ |
| **Upload zone** | Drag & drop area | ❌ | ❌ |
| **Pagination** | Navigation avec lazy loading | ❌ | ❌ |

### `/dashboard/images/upload` - Upload Images
**Description** : Interface d'upload d'images

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Zone upload** | Drag & drop avec preview | ❌ | ❌ |
| **Sélection patient** | Select patient obligatoire | ❌ | ❌ |
| **Sélection examen** | Select/créer examen | ❌ | ❌ |
| **Métadonnées** | Form infos additionnelles | ❌ | ❌ |
| **Progress upload** | Barre progression par fichier | ❌ | ❌ |
| **Preview images** | Thumbnails avec infos | ❌ | ❌ |
| **Validation** | Vérification format/taille | ❌ | ❌ |

### `/dashboard/images/[id]` - Viewer Image
**Description** : Visualiseur d'image avec outils

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Viewer principal** | Canvas avec zoom/pan | ❌ | ❌ |
| **Toolbar** | Outils manipulation | ❌ | ❌ |
| - Zoom in/out | Boutons +/- | ❌ | ❌ |
| - Fit to screen | Bouton ajuster écran | ❌ | ❌ |
| - Rotation | Boutons rotation 90° | ❌ | ❌ |
| - Plein écran | Toggle fullscreen | ❌ | ❌ |
| **Panel informations** | Métadonnées image | ❌ | ❌ |
| **Historique** | Versions précédentes | ❌ | ❌ |
| **Annotations** | Outils annotation | ❌ | ❌ |
| **Navigation** | Prev/next dans série | ❌ | ❌ |

### `/dashboard/images/[id]/editor` - Éditeur Image
**Description** : Éditeur d'image intégré

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Canvas édition** | Zone édition interactive | ❌ | ❌ |
| **Panel outils** | Sidebar avec outils | ❌ | ❌ |
| - **Ajustements basiques** |  | ❌ | ❌ |
| -- Slider luminosité | Range input -100/+100 | ❌ | ❌ |
| -- Slider contraste | Range input -100/+100 | ❌ | ❌ |
| -- Slider saturation | Range input -100/+100 | ❌ | ❌ |
| - **Couleurs RVB** |  | ❌ | ❌ |
| -- Slider rouge | Range input 0-255 | ❌ | ❌ |
| -- Slider vert | Range input 0-255 | ❌ | ❌ |
| -- Slider bleu | Range input 0-255 | ❌ | ❌ |
| - **Filtres** |  | ❌ | ❌ |
| -- Égalisation histogramme | Checkbox auto | ❌ | ❌ |
| -- Netteté | Slider 0-200% | ❌ | ❌ |
| -- Flou gaussien | Slider 0-10px | ❌ | ❌ |
| - **Annotations** |  | ❌ | ❌ |
| -- Outil flèche | Bouton activation | ❌ | ❌ |
| -- Outil cercle | Bouton activation | ❌ | ❌ |
| -- Outil texte | Bouton activation | ❌ | ❌ |
| -- Outil mesure | Bouton activation | ❌ | ❌ |
| **Preview temps réel** | Aperçu modifications | ❌ | ❌ |
| **Historique undo/redo** | Boutons annuler/refaire | ❌ | ❌ |
| **Boutons actions** | Sauvegarder/Annuler/Reset | ❌ | ❌ |
| **Comparaison avant/après** | Slider avant/après | ❌ | ❌ |

---

## 💉 ANGIOGRAPHIE

### `/dashboard/angiography` - Planning Angiographie
**Description** : Vue d'ensemble des examens angiographiques

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Calendrier examens** | Calendar view avec events | ❌ | ❌ |
| **Liste examens jour** | Liste examens du jour | ❌ | ❌ |
| **Bouton nouvel examen** | Modal planification | ❌ | ❌ |
| **Filtres** | Par statut/praticien/type | ❌ | ❌ |

### `/dashboard/angiography/capture/[examId]` - Interface Capture
**Description** : Interface de capture temps réel pour angiographie

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header examen** | Infos patient + statut | ❌ | ❌ |
| **Zone preview** | Preview caméra/device | ❌ | ❌ |
| **Panel fluorescéine** | Contrôles injection | ❌ | ❌ |
| - Checkbox injection | "Fluorescéine injectée" | ❌ | ❌ |
| - Time picker | Heure injection | ❌ | ❌ |
| - Timer live | Décompte depuis injection | ❌ | ❌ |
| **Contrôles capture** | Boutons capture | ❌ | ❌ |
| - Bouton capture manuelle | Prendre photo | ❌ | ❌ |
| - Bouton capture auto | Séquence automatique | ❌ | ❌ |
| - Slider intervalle | Temps entre captures (sec) | ❌ | ❌ |
| **Timeline phases** | Visualisation phases | ❌ | ❌ |
| - Phase précoce | 0-30 secondes | ❌ | ❌ |
| - Phase intermédiaire | 30-120 secondes | ❌ | ❌ |
| - Phase tardive | 120-600 secondes | ❌ | ❌ |
| **Galerie temps réel** | Images capturées | ❌ | ❌ |
| **Panel paramètres** | Config caméra/qualité | ❌ | ❌ |
| **Boutons navigation** | Pause/Stop/Terminer | ❌ | ❌ |

### `/dashboard/angiography/analysis/[examId]` - Analyse Séquences
**Description** : Analyse des séquences angiographiques

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Viewer principal** | Player vidéo séquences | ❌ | ❌ |
| **Timeline interactive** | Scrubber avec phases | ❌ | ❌ |
| **Contrôles lecture** | Play/Pause/Speed/Loop | ❌ | ❌ |
| **Panel analyse** | Outils mesure/annotation | ❌ | ❌ |
| **Comparaison images** | Vue côte à côte | ❌ | ❌ |
| **Export séquence** | Génération vidéo | ❌ | ❌ |

---

## 📄 RAPPORTS

### `/dashboard/reports` - Liste Rapports
**Description** : Gestion des rapports générés

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header rapports** | Titre + nouveau rapport | ❌ | ❌ |
| **Filtres rapports** | Par patient/date/type | ❌ | ❌ |
| **Table rapports** | Liste avec actions | ❌ | ❌ |
| - Colonne patient | Nom patient | ❌ | ❌ |
| - Colonne date | Date génération | ❌ | ❌ |
| - Colonne type | Type rapport | ❌ | ❌ |
| - Colonne statut | Statut (brouillon/final) | ❌ | ❌ |
| - Colonne actions | Voir/Télécharger/Supprimer | ❌ | ❌ |
| **Bouton nouveau rapport** | Navigation vers générateur | ❌ | ❌ |

### `/dashboard/reports/generator` - Générateur Rapport
**Description** : Interface de création de rapports

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Étape 1: Sélection données** |  | ❌ | ❌ |
| - Select patient | Dropdown avec recherche | ❌ | ❌ |
| - Select examen | Dropdown examens patient | ❌ | ❌ |
| - Select images | Checkbox multiple | ❌ | ❌ |
| **Étape 2: Configuration** |  | ❌ | ❌ |
| - Select template | Templates pré-définis | ❌ | ❌ |
| - Select format | A4/A5/Letter | ❌ | ❌ |
| - Select orientation | Portrait/Paysage | ❌ | ❌ |
| - Input photos par ligne | Number input 1-6 | ❌ | ❌ |
| - Sliders marges | X/Y margins | ❌ | ❌ |
| **Étape 3: Contenu** |  | ❌ | ❌ |
| - Input titre rapport | Text input | ❌ | ❌ |
| - Textarea introduction | Rich text editor | ❌ | ❌ |
| - Textarea conclusion | Rich text editor | ❌ | ❌ |
| - Checkbox éléments | Header/footer/numérotation | ❌ | ❌ |
| **Preview temps réel** | Aperçu PDF | ❌ | ❌ |
| **Boutons actions** | Générer/Sauvegarder/Annuler | ❌ | ❌ |

### `/dashboard/reports/[id]` - Viewer Rapport
**Description** : Visualiseur de rapport PDF

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Viewer PDF** | PDF.js embed viewer | ❌ | ❌ |
| **Toolbar PDF** | Zoom/Navigation/Téléchargement | ❌ | ❌ |
| **Panel informations** | Métadonnées rapport | ❌ | ❌ |
| **Boutons actions** | Imprimer/Partager/Supprimer | ❌ | ❌ |

### `/dashboard/reports/templates` - Gestion Templates
**Description** : Gestion des modèles de rapport

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Liste templates** | Cards templates disponibles | ❌ | ❌ |
| **Bouton nouveau template** | Créateur template | ❌ | ❌ |
| **Preview template** | Aperçu template | ❌ | ❌ |
| **Éditeur template** | Visual template editor | ❌ | ❌ |

---

## ⚙️ PARAMÈTRES

### `/dashboard/settings` - Paramètres Généraux
**Description** : Configuration générale application

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Onglets paramètres** | Navigation settings | ❌ | ❌ |
| - Onglet Profil | Settings utilisateur | ❌ | ❌ |
| - Onglet Application | Config app | ❌ | ❌ |
| - Onglet Sécurité | Paramètres sécurité | ❌ | ❌ |
| - Onglet Sauvegarde | Backup/restore | ❌ | ❌ |

### `/dashboard/settings/profile` - Profil Utilisateur
**Description** : Gestion du profil utilisateur

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Photo profil** | Avatar avec upload | ❌ | ❌ |
| **Informations personnelles** | Form édition profil | ❌ | ❌ |
| - Input nom | Text input | ❌ | ❌ |
| - Input email | Email input | ❌ | ❌ |
| - Input téléphone | Tel input | ❌ | ❌ |
| **Préférences** | Config personnelles | ❌ | ❌ |
| - Select langue | FR/EN | ❌ | ❌ |
| - Select timezone | Timezone picker | ❌ | ❌ |
| - Toggle notifications | Email/Push | ❌ | ❌ |
| **Changement mot de passe** | Form sécurisé | ❌ | ❌ |
| - Input ancien password | Password input | ❌ | ❌ |
| - Input nouveau password | Password avec force | ❌ | ❌ |
| - Input confirmation | Validation match | ❌ | ❌ |

### `/dashboard/settings/application` - Configuration App
**Description** : Paramètres de l'application

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Thème** | Sélection dark/light/auto | ❌ | ❌ |
| **Format dates** | Select format d'affichage | ❌ | ❌ |
| **Unités mesure** | Métrique/Imperial | ❌ | ❌ |
| **Qualité images** | Select compression | ❌ | ❌ |
| **Auto-sauvegarde** | Toggle + intervalle | ❌ | ❌ |

### `/dashboard/settings/security` - Sécurité
**Description** : Paramètres de sécurité

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Sessions actives** | Liste sessions avec révocation | ❌ | ❌ |
| **Logs d'activité** | Table activité récente | ❌ | ❌ |
| **2FA** | Configuration authentification 2 facteurs | ❌ | ❌ |
| **API Keys** | Gestion clés API | ❌ | ❌ |

### `/dashboard/settings/backup` - Sauvegarde
**Description** : Gestion des sauvegardes

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Sauvegarde manuelle** | Bouton export données | ❌ | ❌ |
| **Planification** | Config backup automatique | ❌ | ❌ |
| **Historique sauvegardes** | Liste avec restore | ❌ | ❌ |
| **Import données** | Upload fichier backup | ❌ | ❌ |

---

## 🔧 ADMINISTRATION

### `/dashboard/admin` - Panel Admin
**Description** : Interface d'administration (role admin uniquement)

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Gestion utilisateurs** | CRUD utilisateurs | ❌ | ❌ |
| **Statistiques globales** | Métriques système | ❌ | ❌ |
| **Logs système** | Monitoring activité | ❌ | ❌ |
| **Configuration système** | Paramètres avancés | ❌ | ❌ |

### `/dashboard/admin/users` - Gestion Utilisateurs
**Description** : Administration des comptes utilisateur

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Table utilisateurs** | Liste avec actions admin | ❌ | ❌ |
| **Bouton nouvel utilisateur** | Création compte | ❌ | ❌ |
| **Actions utilisateur** | Activer/Désactiver/Supprimer | ❌ | ❌ |
| **Gestion rôles** | Attribution permissions | ❌ | ❌ |

---

## 📱 COMPOSANTS GLOBAUX

### Navigation & Layout
**Description** : Composants de navigation et mise en page

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Header responsive** | Barre navigation adaptative | ❌ | ❌ |
| **Sidebar collapse** | Menu latéral rétractable | ❌ | ❌ |
| **Breadcrumb** | Fil d'Ariane automatique | ❌ | ❌ |
| **Footer** | Pied de page avec infos | ❌ | ❌ |
| **Loading states** | Spinners et skeletons | ❌ | ❌ |
| **Error boundaries** | Gestion erreurs React | ❌ | ❌ |

### Modals & Dialogs
**Description** : Fenêtres modales et dialogues

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Modal confirmation** | Dialogue oui/non | ❌ | ❌ |
| **Modal formulaire** | Form dans modal | ❌ | ❌ |
| **Modal viewer** | Affichage image/PDF | ❌ | ❌ |
| **Toast notifications** | Messages temporaires | ❌ | ❌ |
| **Alert banners** | Alertes persistantes | ❌ | ❌ |

### Forms & Inputs
**Description** : Composants de formulaire

| Élément | Description | DEV | TEST |
|---------|-------------|-----|------|
| **Input text** | Champ texte avec validation | ❌ | ❌ |
| **Input email** | Validation email | ❌ | ❌ |
| **Input password** | Avec toggle visibilité | ❌ | ❌ |
| **Date picker** | Sélecteur date | ❌ | ❌ |
| **Select** | Dropdown avec recherche | ❌ | ❌ |
| **Checkbox** | Case à cocher | ❌ | ❌ |
| **Radio buttons** | Boutons radio | ❌ | ❌ |
| **File upload** | Upload avec drag & drop | ❌ | ❌ |
| **Rich text editor** | Éditeur WYSIWYG | ❌ | ❌ |

---

## 📊 ÉTAT D'AVANCEMENT GLOBAL

### Statistiques de Développement
- **Total éléments à développer** : 347
- **Éléments développés** : 0 ✅
- **Éléments testés** : 0 ✅
- **Progression DEV** : 0%
- **Progression TEST** : 0%

### Priorisation par Phase

#### Phase 1 : Core (Priorité Haute)
- [ ] Authentification (/login, /register)
- [ ] Dashboard principal
- [ ] Gestion patients (liste, détail, CRUD)
- [ ] Navigation et layout de base

#### Phase 2 : Fonctionnalités Images (Priorité Haute)
- [ ] Galerie images
- [ ] Upload images
- [ ] Viewer image basique
- [ ] Éditeur RVB

#### Phase 3 : Angiographie (Priorité Moyenne)
- [ ] Interface capture
- [ ] Timeline phases
- [ ] Analyse séquences

#### Phase 4 : Rapports (Priorité Moyenne)
- [ ] Générateur PDF
- [ ] Templates rapports
- [ ] Viewer PDF

#### Phase 5 : Administration (Priorité Basse)
- [ ] Paramètres utilisateur
- [ ] Panel admin
- [ ] Sauvegarde/restore

---

## 📝 Notes de Développement

### Conventions à respecter
- **Naming** : Pages en kebab-case, composants en PascalCase
- **Data-testid** : Obligatoire sur tous éléments interactifs
- **Responsive** : Mobile-first design
- **Accessibilité** : WCAG 2.1 AA compliance
- **Performance** : Lazy loading et optimisations
- **TypeScript** : Types stricts obligatoires

### Checklist par élément
- [ ] Développement fonctionnel
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests E2E
- [ ] Tests d'accessibilité
- [ ] Tests responsive
- [ ] Documentation
- [ ] Code review

---

## 🔒 EXIGENCES DE SÉCURITÉ ET GESTION DES DONNÉES

### ⚡ Règles Critiques
1. **Aucune donnée mock ou hardcodée** : Toutes les données doivent provenir de la base de données via seeding
2. **Mots de passe hashés** : Tous les mots de passe doivent être stockés sous forme hashée (bcrypt ou similaire)
3. **Configuration MongoDB** : 
   ```
   MONGO_URI='mongodb://devuser:devpass26@localhost:27017/angiographiedb?authSource=angiographiedb'
   ```
4. **Gestion des rôles** : Les rôles doivent être gérés comme des modules complets (modèle, contrôleur, routes) au même titre que :
   - Module Patient
   - Module User
   - Module Image
   - Module Report
   - Module Angiography
   - **Module Role** (avec CRUD complet)

### 📋 Checklist Sécurité
- [ ] **Authentification**
  - [ ] Hashage des mots de passe (bcrypt)
  - [ ] JWT tokens sécurisés
  - [ ] Refresh tokens
  - [ ] Sessions sécurisées
  
- [ ] **Base de données**
  - [ ] Configuration MongoDB sécurisée
  - [ ] Aucune donnée sensible en clair
  - [ ] Scripts de seeding pour toutes les données
  - [ ] Validation des inputs côté serveur

- [ ] **Gestion des rôles**
  - [ ] Modèle Role avec permissions
  - [ ] Middleware de vérification des rôles
  - [ ] CRUD complet pour la gestion des rôles
  - [ ] Attribution dynamique des permissions

### 🌱 Structure de Seeding
```javascript
// Structure attendue pour les seeders
/seeds
  ├── users.seed.js       // Utilisateurs avec mots de passe hashés
  ├── roles.seed.js       // Rôles et permissions
  ├── patients.seed.js    // Données patients
  ├── images.seed.js      // Métadonnées images
  ├── reports.seed.js     // Rapports
  └── index.js           // Script principal de seeding
```

### ⚠️ Points d'Attention
1. **Variables d'environnement** : Toutes les configurations sensibles doivent être dans `.env`
2. **Validation des données** : Validation côté serveur obligatoire (Joi, Yup, etc.)
3. **Sanitization** : Nettoyage des inputs utilisateur contre XSS/Injection
4. **CORS** : Configuration stricte des origines autorisées
5. **Rate limiting** : Protection contre les attaques brute force
6. **Logs de sécurité** : Traçabilité des actions sensibles

---

**Dernière mise à jour** : 2025-06-22  
**Prochaine révision** : 2025-06-29