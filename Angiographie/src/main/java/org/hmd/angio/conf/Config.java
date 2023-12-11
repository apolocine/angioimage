package org.hmd.angio.conf;


import java.io.*;
import java.util.Properties;

public class Config {
	
	 private static final String CONFIG_FILE = "config.properties";
	 private static Properties properties;

	 
	 
	 static {
	        properties = new Properties();
	        
	             
	        try (
	        		//InputStream input = AppConfig.class.getClassLoader().getResourceAsStream(CONFIG_FILE)
	        		InputStream input = new FileInputStream(CONFIG_FILE)
	        		
	        		) {
	            properties.load(input);
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
	    }
	 
	 
	 
//    public Config(String configFileName) {
//        if (properties == null) {
//			properties = new Properties();
//		}
//		loadProperties(configFileName);
//    }
//    public Config() {
//        if (properties == null) {
//			properties = new Properties();
//		}
//		loadProperties(CONFIG_FILE);
//    }
//    private void loadProperties(String configFileName) {
//    	
//    	
//        try (
//        		//InputStream input = AppConfig.class.getClassLoader().getResourceAsStream(CONFIG_FILE)
//        		InputStream input = new FileInputStream(configFileName)) {
//            properties.load(input);
//        } catch (FileNotFoundException e) {
//            // Si le fichier n'existe pas, ajoutez des propriétés génériques
//            addDefaultProperties();
//        } catch (IOException e) {
//            e.printStackTrace();
//            // Gérer les erreurs de lecture du fichier de configuration
//        }
//    }

    private void addDefaultProperties() {
        // Ajoutez des propriétés génériques
        properties.setProperty("directory", "C:\\Users\\DELL\\Documents\\0APng");
        properties.setProperty("username", "utilisateur");
        properties.setProperty("password", "motdepasse");

        // Sauvegardez les propriétés dans le fichier
        saveProperties();
    }

    public static void saveProperties() {
        try (OutputStream output = new FileOutputStream(CONFIG_FILE)) {
            properties.store(output, null);
        } catch (IOException ex) {
            ex.printStackTrace();
            // Gérer les erreurs de sauvegarde du fichier de configuration
        }
    }

    // Méthodes pour obtenir et définir des propriétés
    public static String getProperty(String key) {
        return properties.getProperty(key);
    }

    public static void setProperty(String key, String value) {
        properties.setProperty(key, value);
        saveProperties();
    }

    
    // Ajoutez la méthode pour obtenir l'objet Properties
    public static Properties getProperties() {
        return properties;
    }

    public static String getDatabaseURL() {
        return properties.getProperty("db.url");
    }

    public static String getDatabaseUser() {
        return properties.getProperty("db.user");
    }

    public static String getDatabasePassword() {
        return properties.getProperty("db.password");
    }
    
    
    // Ajoutez d'autres méthodes selon les besoins, par exemple pour parcourir les propriétés existantes
}