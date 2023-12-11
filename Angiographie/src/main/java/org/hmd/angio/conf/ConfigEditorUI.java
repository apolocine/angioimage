package org.hmd.angio.conf;
import java.awt.BorderLayout;

import javax.swing.JFrame;
import javax.swing.SwingUtilities;



public class ConfigEditorUI extends JFrame {

 
    private static final long serialVersionUID = 1L;



	public ConfigEditorUI( ) {
   	 
        initComponents();
    }
    
    
    
    
    
    private void initComponents() {
    	
    	  setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
          setTitle("Configuration Editor");
          setSize(600, 400);
          setLayout(new BorderLayout());
          
          
    	  add(new ConfigPanel());
		
    	  
    	    setLocationRelativeTo(null); // Centrez la fenêtre
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
