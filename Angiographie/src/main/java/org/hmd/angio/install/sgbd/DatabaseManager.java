package org.hmd.angio.install.sgbd;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.hmd.angio.conf.Config;
 

public class DatabaseManager {
    public static Connection getConnection() throws Exception {
    	
        String url = Config.getDatabaseURL();
        String user = Config.getDatabaseUser();
        String password =Config.getDatabasePassword();
       
        return DriverManager.getConnection(url, user, password);
    }

	public static Connection getConnection(String sgbdurl, String databaseUser, String databasePassword) throws Exception {
	    return DriverManager.getConnection(sgbdurl, databaseUser, databasePassword);
	}
    
    
    
    
}
