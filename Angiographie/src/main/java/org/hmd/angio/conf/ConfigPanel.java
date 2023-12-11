package org.hmd.angio.conf;

import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JButton;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;

public class ConfigPanel extends JPanel{


	private DefaultTableModel tableModel;
    private boolean controleurDeModifications = false;
    
    
    
    public ConfigPanel( ) {
    	 
        initComponents();
    }
    
    
    

    private void initComponents() {
      

        // Obtenez les propriétés de la configuration
        tableModel = new DefaultTableModel();
        tableModel.addColumn("Property Key");
        tableModel.addColumn("Property Value");

        for (String key : Config.getProperties().stringPropertyNames()) {
            tableModel.addRow(new Object[]{key, Config.getProperty(key)});
        }

        JTable propertiesTable = new JTable(tableModel);
        

        JButton saveButton = new JButton("Save Changes");
        saveButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
            	 savePropertiesTable(); 
            	 controleurDeModifications = false;
            }

		
        });

        JButton addButton = new JButton("Add Property");
        addButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Ajoutez une nouvelle ligne à la table
                tableModel.addRow(new Object[]{"", ""});
                controleurDeModifications = true;
            }
        });

        JButton deleteButton = new JButton("Delete Property");
        deleteButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
            			//delette from shown table
                deletePropertieFromTable(propertiesTable);
               
                controleurDeModifications = true;
               
                
            }

			private void deletePropertieFromTable(JTable propertiesTable) {
				// Supprimez la ligne sélectionnée de la table
                int selectedRow = propertiesTable.getSelectedRow();
                if (selectedRow != -1) {
                    tableModel.removeRow(selectedRow);
                }
                       
                
            	// Enregistrez les modifications dans l'objet Config
                for (int row = 0; row < tableModel.getRowCount(); row++) {
                    String key = tableModel.getValueAt(row, 0).toString();
                    String value = tableModel.getValueAt(row, 1).toString();
                    // Mise à jour de la propriété dans l'objet Config
                    Config.setProperty(key, value);
                }
                
                
			}
            
            
            
        });
   JButton reloadButton = new JButton("Reload Properties");
        reloadButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Rechargez les propriétés depuis le fichier de configuration
                reloadProperties();
               controleurDeModifications = false;
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
        
       // add(saveButton, BorderLayout.SOUTH);

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttonPanel.add(reloadButton); // Ajout du nouveau bouton
        buttonPanel.add(addButton);
        buttonPanel.add(saveButton);
        buttonPanel.add(deleteButton);
      //  buttonPanel.add(closeButton); 
        JPanel sliderNbuttonPanel = new JPanel(new GridLayout(2, 1)); 
       sliderNbuttonPanel. add(propertiesTable, BorderLayout.NORTH);
         sliderNbuttonPanel.add(buttonPanel, BorderLayout.SOUTH);
        
       
        add(sliderNbuttonPanel); 
       
                
    
    }
    
    
    
    

	private void savePropertiesTable() {
		// Enregistrez les modifications dans l'objet Config
        for (int row = 0; row < tableModel.getRowCount(); row++) {
            String key = tableModel.getValueAt(row, 0).toString();
            String value = tableModel.getValueAt(row, 1).toString();
            // Mise à jour de la propriété dans l'objet Config
            Config.setProperty(key, value);
        }
        
        Config.saveProperties();
        
        // Affichez un message de confirmation
        JOptionPane.showMessageDialog(this, "Changes saved successfully.", "Success", JOptionPane.INFORMATION_MESSAGE);
        
        controleurDeModifications = false;
	}
    
    private void reloadProperties() {
        // Rechargez les propriétés depuis le fichier de configuration
     //   config.loadProperties( config.);

        // Mettez à jour le modèle de tableau avec les nouvelles propriétés
        tableModel.setRowCount(0); // Effacez toutes les lignes existantes
        for (String key : Config.getProperties().stringPropertyNames()) {
            tableModel.addRow(new Object[]{key, Config.getProperty(key)});
        }

        JOptionPane.showMessageDialog(this, "Properties reloaded successfully.", "Success", JOptionPane.INFORMATION_MESSAGE);
        controleurDeModifications = false;
    }
    
    private void customClose() {
       
        

        if ( controleurDeModifications ) {
            int result = JOptionPane.showConfirmDialog(
                    null,
                    "Do you want to save changes before closing?",
                    "Save Changes",
                    JOptionPane.YES_NO_CANCEL_OPTION);

            if (result == JOptionPane.YES_OPTION) {  
            	System.out.println("Saving changes.by.");  
            	try {
					savePropertiesTable();
				} 
            	
            	finally {
					// No unsaved changes, simply close the frame
//	                dispose();   // Personnalisez le comportement de fermeture ici
                    setVisible(false); 
				}
				
            }
            
            else if (result == JOptionPane.NO_OPTION) {
//                dispose(); // Close the frame without saving 
            	// Personnalisez le comportement de fermeture ici
                setVisible(false); 
            }
            
            // If the user clicks "Cancel," do nothing and keep the frame open
        } else {
//        	 dispose();
            // Personnalisez le comportement de fermeture ici
            setVisible(false); // Rendre la fenêtre invisible 
        }
        
         
    }
    
	
}