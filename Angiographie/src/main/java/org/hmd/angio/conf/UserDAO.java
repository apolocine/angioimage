package org.hmd.angio.conf;


import static org.hmd.angio.security.Encryption.createSecretKey;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;

import javax.crypto.spec.SecretKeySpec;

import org.hmd.angio.install.sgbd.DatabaseManager;
import org.hmd.angio.security.Encryption;





public class UserDAO {
	    
	private static String tableName="tb_utilisateur";
	
 
	public static boolean verifyPassword(String username,String password) { 
			User user = getUser(  username,  password);
			// String cryptedPasword  =  encrypt(password  );
		
			if(user!=null) {
				 return user.getPassword().equals(password);
			}else
				return false ;
			  
			
			 
	}
    public static User getUser(String username,String password) {
    
    	
    	  if (password == null) {
    	      throw new IllegalArgumentException("No such parameter present in config file");
    	    }

    	    
    	    
    	    
    	User user = null;
        try (Connection connection = 
        		DatabaseManager.getConnection()
        		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		) {
            String selectSQL = "SELECT * FROM "+tableName+" WHERE `username` = ? AND password=?";
        	System.out.println("selectSQL = \n"+selectSQL); 
 
            try (PreparedStatement preparedStatement = connection.prepareStatement(selectSQL)) {
            	 
                preparedStatement.setString(1, username);  
                preparedStatement.setString(2, password);
                
                System.out.println("selectSQL = \n"+preparedStatement.toString());
                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    if (resultSet.next()) {
                    	  user = new User();
                    	  user.setId(resultSet.getInt("id"));
                    	  user.setFirstName(resultSet.getString("nom"));
                    	  user.setLastName((resultSet.getString("prenom")));  
                    	  user.setUsername(resultSet.getString("username"));  
                    	  user.setPassword(resultSet.getString("password"));  
                    	  user.setFonction(resultSet.getString("fonction"));  
                    	  user.setDescription(resultSet.getString("description"));  
                    } 
                    return user;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
        return user;
    }
	private static String encrypt(String password ) throws   GeneralSecurityException, UnsupportedEncodingException {
		   byte[] salt = new String("12345678").getBytes();
   	    int iterationCount = 40000;
   	    int keyLength = 128;
   	    SecretKeySpec key = null;
   	    try {
				  key = createSecretKey(password.toCharArray(), salt, iterationCount, keyLength);
			} catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
   	     
		return Encryption.encrypt(password ,key ); 
	}
    
    
    
    
    
    

    // Ajoutez d'autres méthodes selon les besoins, par exemple pour parcourir les propriétés existantes
}