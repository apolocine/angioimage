package org.hmd.angio.ihm;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;




import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.util.Properties;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class ConfigEditorUI extends JFrame {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String CONFIG_FILE = "config.properties";
	private static Config config;
	
	
    private DefaultTableModel tableModel;

    public ConfigEditorUI( ) {
    	
        config = new Config(CONFIG_FILE);
        initComponents();
    }

    private void initComponents() {
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setTitle("Configuration Editor");
        setSize(600, 400);
        setLayout(new BorderLayout());

        // Obtenez les propriétés de la configuration
        tableModel = new DefaultTableModel();
        tableModel.addColumn("Property Key");
        tableModel.addColumn("Property Value");

        for (String key : config.getProperties().stringPropertyNames()) {
            tableModel.addRow(new Object[]{key, config.getProperty(key)});
        }

        JTable propertiesTable = new JTable(tableModel);
        JScrollPane scrollPane = new JScrollPane(propertiesTable);
        add(scrollPane, BorderLayout.CENTER);

        JButton saveButton = new JButton("Save Changes");
        saveButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                savePropertiesTable();
            }

		
        });

        JButton addButton = new JButton("Add Property");
        addButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Ajoutez une nouvelle ligne à la table
                tableModel.addRow(new Object[]{"", ""});
            }
        });

        JButton deleteButton = new JButton("Delete Property");
        deleteButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
            			//delette from shown table
                deletePropertieFromTable(propertiesTable);
			
					//save shown properties in proprties file 
             //   savePropertiesTable();
			
               
                
            }

			private void deletePropertieFromTable(JTable propertiesTable) {
				// Supprimez la ligne sélectionnée de la table
                int selectedRow = propertiesTable.getSelectedRow();
                if (selectedRow != -1) {
                    tableModel.removeRow(selectedRow);
                }
			}
            
            
            
        });
   JButton reloadButton = new JButton("Reload Properties");
        reloadButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Rechargez les propriétés depuis le fichier de configuration
                reloadProperties();
            }
        });
        
        JButton closeButton = new JButton("Fermer");
        closeButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Personnalisez le comportement de fermeture ici
                customClose();
            }
        });
        
        add(saveButton, BorderLayout.SOUTH);

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttonPanel.add(reloadButton); // Ajout du nouveau bouton
        buttonPanel.add(addButton);
        buttonPanel.add(deleteButton);
         buttonPanel.add(closeButton);
         
         add(buttonPanel, BorderLayout.NORTH);
       
                
        setLocationRelativeTo(null); // Centrez la fenêtre
    }

	private void savePropertiesTable() {
		// Enregistrez les modifications dans l'objet Config
        for (int row = 0; row < tableModel.getRowCount(); row++) {
            String key = tableModel.getValueAt(row, 0).toString();
            String value = tableModel.getValueAt(row, 1).toString();
            // Mise à jour de la propriété dans l'objet Config
            config.setProperty(key, value);
        }
        // Affichez un message de confirmation
        JOptionPane.showMessageDialog(ConfigEditorUI.this, "Changes saved successfully.", "Success", JOptionPane.INFORMATION_MESSAGE);
	}
    
    private void reloadProperties() {
        // Rechargez les propriétés depuis le fichier de configuration
     //   config.loadProperties( config.);

        // Mettez à jour le modèle de tableau avec les nouvelles propriétés
        tableModel.setRowCount(0); // Effacez toutes les lignes existantes
        for (String key : config.getProperties().stringPropertyNames()) {
            tableModel.addRow(new Object[]{key, config.getProperty(key)});
        }

        JOptionPane.showMessageDialog(this, "Properties reloaded successfully.", "Success", JOptionPane.INFORMATION_MESSAGE);
    }
    
    private void customClose() {
        // Personnalisez le comportement de fermeture ici
        setVisible(false); // Rendre la fenêtre invisible
    }
    
    
    public static void main(String[] args) { 

        SwingUtilities.invokeLater(() -> {
        
            ConfigEditorUI configEditorUI = new ConfigEditorUI();

            // Définissez le comportement de fermeture sur DISPOSE_ON_CLOSE
            configEditorUI.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);

            configEditorUI.setVisible(true);
        });
    }
}
