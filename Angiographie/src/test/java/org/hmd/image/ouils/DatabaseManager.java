package org.hmd.image.ouils;
import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseManager {
    public static Connection getConnection() throws Exception {
        String url = AppConfig.getDatabaseURL();
        String user = AppConfig.getDatabaseUser();
        String password = AppConfig.getDatabasePassword();

        return DriverManager.getConnection(url, user, password);
    }
}
