# Angioimage
Gestion, archivage, Traitement des photos d'angiographie 
# Guide de démarrage de l'application

## 1. Vérification de la base de données

- Si la base de données n'est pas en cours d'exécution, une erreur de connexion sera signalée.
- Avant de démarrer l'application, assurez-vous que la base de données est correctement lancée.

## 2. Configuration des paramètres

- Toutes les informations de connexion (noms des tables, utilisateurs administrateurs et applicatifs, etc.) sont stockées dans le fichier : `settings/config/config.properties`.
- Vous pouvez modifier ce fichier directement ou utiliser l'onglet **"Update Configuration"** dans l'application, qui permet d’ajouter, modifier ou supprimer des variables et leurs valeurs.

## 3. Création de la base de données (si nécessaire)

- Si le SGBD est opérationnel mais que la base de données n'existe pas, l'application proposera de la créer.
- Lors de ce processus d’installation, les tables seront générées et remplies automatiquement.
- L'application demandera votre confirmation avant d'exécuter l’installation.
- En cas d'échec, vérifiez les paramètres de connexion (nom d’hôte ou port) et relancez l’installation.

## 4. Interface utilisateur

- Une fois la base de données créée ou la connexion établie, vous serez redirigé vers l'onglet **"Connexion"**.
- Après vous être connecté, l’interface utilisateur principale de l'application s’ouvrira automatiquement.

> **Note :** Assurez-vous que la base de données est configurée correctement pour éviter les erreurs au démarrage.
