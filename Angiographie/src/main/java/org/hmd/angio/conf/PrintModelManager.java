package org.hmd.angio.conf;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.swing.JOptionPane;

public class PrintModelManager {
    private final Properties printModels = new Properties();
    private final File configFile;

    public PrintModelManager(String filePath) {
        this.configFile = new File(filePath);
        loadModels();
    }

    // Chargement initial des modèles à partir du fichier
    private void loadModels() {
        if (configFile.exists()) {
            try (FileReader reader = new FileReader(configFile)) {
                printModels.load(reader);
            } catch (IOException e) {
                e.printStackTrace();
                JOptionPane.showMessageDialog(null,
                        "Erreur lors du chargement du fichier de modèles.",
                        "Erreur", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    // Enregistrement d'un nouveau modèle
    public boolean saveNewModel(String modelName, Map<String, String> modelData) {
        if (modelName == null || modelName.trim().isEmpty()) {
            JOptionPane.showMessageDialog(null,
                    "Nom du modèle invalide.",
                    "Erreur", JOptionPane.ERROR_MESSAGE);
            return false;
        }

        for (Map.Entry<String, String> entry : modelData.entrySet()) {
            printModels.setProperty(modelName + "." + entry.getKey(), entry.getValue());
        }

        return saveToFile();
    }
 
    // Mise à jour d'un modèle existant
    public boolean updateModel(String modelName, Map<String, String> updatedData) {
        deleteModel(modelName);  // Supprime les anciennes entrées avant mise à jour
        return saveNewModel(modelName, updatedData);
    }

    // Suppression d'un modèle existant
    public boolean deleteModel(String modelName) {
        List<String> keysToRemove = new ArrayList<>();

        for (String key : printModels.stringPropertyNames()) {
            if (key.startsWith(modelName + ".")) {
                keysToRemove.add(key);
            }
        }

        if (keysToRemove.isEmpty()) {
            JOptionPane.showMessageDialog(null,
                    "Le modèle '" + modelName + "' n'existe pas.",
                    "Information", JOptionPane.INFORMATION_MESSAGE);
            return false;
        }

        for (String key : keysToRemove) {
            printModels.remove(key);
        }

        return saveToFile();
    }

    // Récupérer les modèles pour remplissage de la JComboBox
    public List<String> getModelNames() {
        Set<String> modelNames = new HashSet<>();

        for (String key : printModels.stringPropertyNames()) {
            String modelName = key.split("\\.")[0];
            modelNames.add(modelName);
        }
        return new ArrayList<>(modelNames);
    }

    // Charger les paramètres d'un modèle spécifique
    public Map<String, String> getModelData(String modelName) {
        Map<String, String> modelData = new HashMap<>();

        for (String key : printModels.stringPropertyNames()) {
            if (key.startsWith(modelName + ".")) {
                String propertyKey = key.substring(modelName.length() + 1);
                modelData.put(propertyKey, printModels.getProperty(key));
            }
        }
        return modelData;
    }

    // Sauvegarde dans le fichier INI
    private boolean saveToFile() {
        try (FileWriter writer = new FileWriter(configFile)) {
            printModels.store(writer, "Modèles d'impression");
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(null,
                    "Erreur lors de l'enregistrement du fichier.",
                    "Erreur", JOptionPane.ERROR_MESSAGE);
            return false;
        }
    }
    
    
 // Importer des modèles depuis un fichier externe
    public boolean importModels(File importFile) {
        Properties importedModels = new Properties();
        try (FileReader reader = new FileReader(importFile)) {
            importedModels.load(reader);

            // Ajouter les modèles importés aux modèles existants
            for (String key : importedModels.stringPropertyNames()) {
                printModels.setProperty(key, importedModels.getProperty(key));
            }
            return saveToFile(); 
        } catch (IOException e) {
            JOptionPane.showMessageDialog(null,
                    "Erreur lors de l'importation : " + e.getMessage(),
                    "Erreur",
                    JOptionPane.ERROR_MESSAGE);
            return false;
        }
    }

    // Exporter les modèles actuels vers un fichier externe
    public boolean exportModels(File exportFile) {
        try (FileWriter writer = new FileWriter(exportFile)) {
            printModels.store(writer, "Export des modèles d'impression");
            return true;
        } catch (IOException e) {
            JOptionPane.showMessageDialog(null,
                    "Erreur lors de l'exportation : " + e.getMessage(),
                    "Erreur",
                    JOptionPane.ERROR_MESSAGE);
            return false;
        }
    }

    // Récupérer les propriétés
    public Properties getProperties() {
        return printModels;
    }

    
    
}
