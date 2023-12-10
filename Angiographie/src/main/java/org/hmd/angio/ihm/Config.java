package org.hmd.angio.ihm;


import java.io.*;
import java.util.Properties;

public class Config {
    private Properties properties; 
    public Config(String configFileName) {
        this.properties = new Properties();
        loadProperties(configFileName);
    }

    private void loadProperties(String configFileName) {
        try (InputStream input = new FileInputStream(configFileName)) {
            properties.load(input);
        } catch (FileNotFoundException e) {
            // Si le fichier n'existe pas, ajoutez des propriétés génériques
            addDefaultProperties();
        } catch (IOException e) {
            e.printStackTrace();
            // Gérer les erreurs de lecture du fichier de configuration
        }
    }

    private void addDefaultProperties() {
        // Ajoutez des propriétés génériques
        properties.setProperty("directory", "C:\\Users\\DELL\\Documents\\0APng");
        properties.setProperty("username", "utilisateur");
        properties.setProperty("password", "motdepasse");

        // Sauvegardez les propriétés dans le fichier
        saveProperties();
    }

    private void saveProperties() {
        try (OutputStream output = new FileOutputStream("config.properties")) {
            properties.store(output, null);
        } catch (IOException ex) {
            ex.printStackTrace();
            // Gérer les erreurs de sauvegarde du fichier de configuration
        }
    }

    // Méthodes pour obtenir et définir des propriétés
    public String getProperty(String key) {
        return properties.getProperty(key);
    }

    public void setProperty(String key, String value) {
        properties.setProperty(key, value);
        saveProperties();
    }

    // Ajoutez la méthode pour obtenir l'objet Properties
    public Properties getProperties() {
        return properties;
    }

	
    
    
    // Ajoutez d'autres méthodes selon les besoins, par exemple pour parcourir les propriétés existantes
}