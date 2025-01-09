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
