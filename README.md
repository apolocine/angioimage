# Angioimage
Gestion, archivage, Traitement des photos d'angiographie 
<p>
    Au démarrage de l'application, si la base de données n'est pas en cours d'exécution, une erreur de connexion sera signalée. 
    Avant de démarrer l'application, vous devez vous assurer que la base de données est bien lancée. 
    Toutes les informations de connexion, les noms des tables, ainsi que les utilisateurs administrateurs et applicatifs, 
    sont stockés dans le fichier <code>settings/config/config.properties</code>. Ces paramètres peuvent être modifiés directement dans le fichier, 
    ou via l'onglet <strong>"Update Configuration"</strong>, qui permet d’ajouter, de modifier ou de supprimer des variables et leurs valeurs.
    Si le SGBD est opérationnel mais que la base de données n’existe pas, l'application la créera automatiquement 
    (tables comprises) après confirmation de votre part. Si l'installation échoue, vérifiez les paramètres de connexion 
    (hôte ou port) avant de réessayer. Une fois la base de données installée ou la connexion établie, vous serez redirigé 
    vers l'onglet <strong>"Connexion"</strong>. Après vous être connecté, l’interface utilisateur principale de l'application 
    s’ouvrira automatiquement.
</p>
 <style>
        
        h1 {
            color: #0056b3;
        }
        h2 {
            color: #333;
        }
        ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .note {
            background-color: #ffffcc;
            padding: 10px;
            border-left: 4px solid #ffcc00;
            margin: 20px 0;
        }
    </style>
 <h1>Guide de démarrage de l'application</h1>

    <h2>1. Vérification de la base de données</h2>
    <ul>
        <li>Si la base de données n'est pas en cours d'exécution, une erreur de connexion sera signalée.</li>
        <li>Avant de démarrer l'application, assurez-vous que la base de données est correctement lancée.</li>
    </ul>

    <h2>2. Configuration des paramètres</h2>
    <ul>
        <li>Toutes les informations de connexion (noms des tables, utilisateurs administrateurs et applicatifs, etc.) sont stockées dans le fichier : <code>settings/config/config.properties</code>.</li>
        <li>Vous pouvez modifier ce fichier directement ou utiliser l'onglet <strong>"Update Configuration"</strong> dans l'application, qui permet d’ajouter, modifier ou supprimer des variables et leurs valeurs.</li>
    </ul>

    <h2>3. Création de la base de données (si nécessaire)</h2>
    <ul>
        <li>Si le SGBD est opérationnel mais que la base de données n'existe pas, l'application proposera de la créer.</li>
        <li>Lors de ce processus d’installation, les tables seront générées et remplies automatiquement.</li>
        <li>L'application demandera votre confirmation avant d'exécuter l’installation.</li>
        <li>En cas d'échec, vérifiez les paramètres de connexion (nom d’hôte ou port) et relancez l’installation.</li>
    </ul>

    <h2>4. Interface utilisateur</h2>
    <ul>
        <li>Une fois la base de données créée ou la connexion établie, vous serez redirigé vers l'onglet <strong>"Connexion"</strong>.</li>
        <li>Après vous être connecté, l’interface utilisateur principale de l'application s’ouvrira automatiquement.</li>
    </ul>

    <div class="note">
        <strong>Note :</strong> Assurez-vous que la base de données est configurée correctement pour éviter les erreurs au démarrage.
    </div>
