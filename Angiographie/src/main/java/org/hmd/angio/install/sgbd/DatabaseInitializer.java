package org.hmd.angio.install.sgbd;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseInitializer {
	
	private static String tableName="tb_utilisateur";
	private static String dbangiographie = "angiographie";
	
	
	public static boolean isTableExiste(String dbSch, String table) {
		
	 
        try (Connection connection = 
        		DatabaseManager.getConnection()
        		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		) {
         String selectSQL ="SELECT COUNT(*)  AS row_count \r\n"
         		+ "FROM INFORMATION_SCHEMA.TABLES\r\n"
         		+ "WHERE TABLE_SCHEMA = '"+dbSch+"'\r\n"
         		+ "AND TABLE_NAME = '"+table+"'\r\n"
         		+ "LIMIT 0 , 30";
         
 
             System.out.println(selectSQL); 
             
        try (PreparedStatement preparedStatement = connection.prepareStatement(selectSQL)) {
        
        	   // Exécuter la requête
        	ResultSet  resultSet = preparedStatement.executeQuery();

            // Traiter le résultat
            if (resultSet.next()) {
                int rowCount = resultSet.getInt("row_count");
                System.out.println(rowCount);
                return rowCount>0; 
            } 
        	
            }catch (SQLException e) {
        e.printStackTrace();
    } 
   
    } catch (Exception e1) {
		// TODO Auto-generated catch block
		e1.printStackTrace();
	}
    return false;
}
	
	
	
    public static void initialize() throws Exception {
    	 
 Connection connection = DatabaseManager.getConnection();
             Statement statement = connection.createStatement() ;

            // Exécutez ici la requête SQL pour créer la base de données et les tables
             
//              statement.executeUpdate("CREATE DATABASE IF NOT EXISTS db_angioimage;");
//             statement.executeUpdate("USE db_angioimage;");
             
             
             statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_config` (\r\n"
             		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,\r\n"
             		+ "  `key` varchar(255) NOT NULL,\r\n"
             		+ "  `value` varchar(255) NOT NULL,\r\n"
             		+ "  PRIMARY KEY (`id`)\r\n"
             		+ ") ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");
              statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_patients` (\r\n"
              		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,\r\n"
              		+ "  `nom` varchar(255) NOT NULL,\r\n"
              		+ "  `prenom` varchar(255) NOT NULL,\r\n"
              		+ "  `naissance` date NOT NULL,\r\n"
              		+ "  PRIMARY KEY (`id`)\r\n"
              		+ ") ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");
             
             statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_utilisateur` (\r\n"
               		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,\r\n"
              		+ "  `nom` varchar(250) NOT NULL,\r\n"
              		+ "  `prenom` varchar(250) NOT NULL,\r\n"
              		+ "  `naissance` date NOT NULL,\r\n"
              		+ "  `username` varchar(250) NOT NULL,\r\n"
              		+ "  `password` varchar(250) DEFAULT NULL,\r\n"
              		+ "  `fonction` varchar(250) DEFAULT NULL,\r\n"
              		+ "  `description` varchar(250) DEFAULT NULL,\r\n"
              		+ "  PRIMARY KEY (`id`),\r\n"
              		+ "  UNIQUE KEY `username` (`username`)\r\n"
              		+ ") ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");

             statement.executeUpdate("INSERT INTO `tb_utilisateur` (`id`, `nom`, `prenom`, `naissance`, `username`, `password`, `fonction`, `description`) VALUES\r\n"
             		+ "(1, 'MADANI', 'Hamid', '1972-10-03', 'drmdh@msn.com', 'azerty@26', 'Ophtalmologue', 'PoXviCZNZBHGyTsac6XdKQ==:lTbS2WuC5p/tMyEVhLPfNA==');");
    }
    
    
	public static void main(String[] args) {
		String tb_utilisateur = "tb_utilisateur";
		String dbangiographie = "angiographie";

		System.out.println("La table " + dbangiographie + "" + tb_utilisateur + " existe = "
				+ DatabaseInitializer.isTableExiste(dbangiographie, tb_utilisateur));
	}
}
