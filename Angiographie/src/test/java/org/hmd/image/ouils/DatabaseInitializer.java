package org.hmd.image.ouils;
import java.sql.Connection;
import java.sql.Statement;

public class DatabaseInitializer {
    public static void initialize() {
        try (Connection connection = DatabaseManager.getConnection();
             Statement statement = connection.createStatement()) {

            // Exécutez ici la requête SQL pour créer la base de données et les tables
             statement.executeUpdate("CREATE DATABASE IF NOT EXISTS dbangiographie;");
             statement.executeUpdate("USE dbangiographie;");
             
             statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_config` (\r\n"
             		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,\r\n"
             		+ "  `key` varchar(255) NOT NULL,\r\n"
             		+ "  `value` varchar(255) NOT NULL,\r\n"
             		+ "  PRIMARY KEY (`id`)\r\n"
             		+ ") ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");
             
             
             statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_patients` (\r\n"
             		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,\r\n"
             		+ "  `nom` varchar(255) NOT NULL,\r\n"
             		+ "  `prenom` int(11) NOT NULL,\r\n"
             		+ "  `naissance` date NOT NULL,\r\n"
             		+ "  PRIMARY KEY (`id`)\r\n"
             		+ ") ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");
             
             statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_utilisateur` (\r\n"
             		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,\r\n"
             		+ "  `nom` varchar(250) NOT NULL,\r\n"
             		+ "  `prenom` varchar(250) NOT NULL,\r\n"
             		+ "  `naissance` date NOT NULL,\r\n"
             		+ "  `fonction` varchar(250) NOT NULL,\r\n"
             		+ "   `description` varchar(250) NOT NULL,\r\n"
             		+ "  PRIMARY KEY (`id`)\r\n"
             		+ ") ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
