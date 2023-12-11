package org.hmd.angio.install.sgbd;
import java.sql.Connection;
import java.sql.DriverManager;

import org.hmd.angio.conf.Config;
 

public class DatabaseManager {
    public static Connection getConnection() throws Exception {
    	
        String url = Config.getDatabaseURL();
        String user = Config.getDatabaseUser();
        String password =Config.getDatabasePassword();

        return DriverManager.getConnection(url, user, password);
    }
}
