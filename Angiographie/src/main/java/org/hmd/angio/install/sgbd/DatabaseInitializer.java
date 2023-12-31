package org.hmd.angio.install.sgbd;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.hmd.angio.conf.Config;

public class DatabaseInitializer {
	
	private static String tableName=Config.getDatabaseUserTablename();
	
	
	
	
	public static boolean isDataBaseExiste(String dbSch) throws Exception {
		 
		ResultSet rs = null;
		Connection connection = DatabaseManager.getConnection(Config.getSGBDURL(), Config.getDatabaseUser(), Config.getDatabasePassword());
		
		if(connection != null){
			
			System.out.println("check if a database exists using java");

			rs = connection.getMetaData().getCatalogs();

			while(rs.next()){
				String catalogs = rs.getString(1);
				
				if(dbSch.equals(catalogs)){
					System.out.println("the database "+dbSch+" exists");
					return true;
					
				}
			}

		}
		else{
			System.out.println("unable to create database connection");
		}
		
		
		return false;
		
		
	}
	
	public static boolean isTableExiste(String dbSch, String table) {
		
		 
				try {
					if(! isDataBaseExiste(  dbSch)) {
						
						
						return false;
						
					}
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
					
					
			 
        try (
        		
        		Connection connection = DatabaseManager.getConnection()
        		// Connection connection = DatabaseManager.getConnection(Config.getSGBDURL(), Config.getDatabaseUser(), Config.getDatabasePassword())
    	//    	DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		
        		) {
        	
        	 
               String selectSQL = "SELECT COUNT(*) AS row_count FROM "+tableName+";";
         
 
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
    	 
    		Connection connection = DatabaseManager.getConnection(Config.getSGBDURL(), Config.getDatabaseUser(), Config.getDatabasePassword());
             Statement statement = connection.createStatement() ;

            // Exécutez ici la requête SQL pour créer la base de données et les tables
             
             
              statement.executeUpdate("CREATE DATABASE IF NOT EXISTS "+Config.getDatabaseName()+";");
              
             statement.executeUpdate("USE "+Config.getDatabaseName()+";");
             
             
             statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_config` ("
             		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,"
             		+ "  `key` varchar(255) NOT NULL,"
             		+ "  `value` varchar(255) NOT NULL,"
             		+ "  PRIMARY KEY (`id`)"
             		+ ") ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");
              statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_patients` ("
              		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,"
              		+ "  `nom` varchar(255) NOT NULL,"
              		+ "  `prenom` varchar(255) NOT NULL,"
              		+ "  `naissance` date NOT NULL,"
              		+ "  PRIMARY KEY (`id`)"
              		+ ") ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");
             
             statement.executeUpdate("CREATE TABLE IF NOT EXISTS `tb_utilisateur` ("
               		+ "  `id` int(11) NOT NULL AUTO_INCREMENT,"
              		+ "  `nom` varchar(250) NOT NULL,"
              		+ "  `prenom` varchar(250) NOT NULL,"
              		+ "  `naissance` date NOT NULL,"
              		+ "  `username` varchar(250) NOT NULL,"
              		+ "  `password` varchar(250) DEFAULT NULL,"
              		+ "  `fonction` varchar(250) DEFAULT NULL,"
              		+ "  `description` varchar(250) DEFAULT NULL,"
              		+ "  PRIMARY KEY (`id`),"
              		+ "  UNIQUE KEY `username` (`username`)"
              		+ ") ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");

             statement.executeUpdate("INSERT INTO `tb_utilisateur` (`id`, `nom`, `prenom`, `naissance`, `username`, `password`, `fonction`, `description`) VALUES"
             		+ "(1, 'MADANI', 'Hamid', '1972-10-03', 'drmdh@msn.com', 'azerty@26', 'Ophtalmologue', 'PoXviCZNZBHGyTsac6XdKQ==:lTbS2WuC5p/tMyEVhLPfNA==');");
             
             connection.getAutoCommit();
             
    }
    
    
	public static void main(String[] args) {
		String tb_utilisateur = "tb_utilisateur";
		String dbangiographie = "angiographie";

		System.out.println("La table " + dbangiographie + "" + tb_utilisateur + " existe = "
				+ DatabaseInitializer.isTableExiste(dbangiographie, tb_utilisateur));
	}
}
