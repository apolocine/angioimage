package org.hmd.angio;

import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.Connection;
import java.sql.SQLException;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTabbedPane;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;

import org.hmd.angio.conf.Config;
import org.hmd.angio.conf.ConfigPanel;
import org.hmd.angio.conf.UserDAO;
import org.hmd.angio.install.sgbd.DatabaseInitializer;
import org.hmd.angio.install.sgbd.DatabaseManager;
import org.hmd.image.ouils.DirectoryManager;

public class ApplicationGUI extends JFrame {

	/**
	 * 
	 */
	private static int LOGIN_TAB = 0;
	private static int DB_INSTALL_TAB = 1;
	private static int CONFIG_PROPERTIES_TAB = 2;
	
	private static final long serialVersionUID = 1L;
	private JTextField dbUrlField, usernameField, passwordField;
	private JPasswordField loginPassword;
	private JTextField loginUsername;
	private JTabbedPane tabbedPane;
	private boolean applicationLoginSuccessful = false; // Remplacez par votre logique de connexion

	public ApplicationGUI() {
		initializeUI();
	}

	private void initializeUI() {
		setTitle("Application");

		// Onglet 1
		JPanel tab1 = createTab1();

		// Onglet 2
		JPanel tab2 = createTab2();

		// Onglet 3
		JPanel tab3 = createTab3();

		// Ajout des onglets
		tabbedPane = new JTabbedPane();
		tabbedPane.addTab("Connexion", tab1);
		tabbedPane.addTab("Configuration", tab2);
		tabbedPane.addTab("Update Configuration", tab3);

		

		add(tabbedPane);

		setSize(400, 300);
		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		setLocationRelativeTo(null);
		
		
		if ( isConnectedToDB()) {

			
			if (isUserTableExiste()) {
				tabbedPane.setSelectedIndex(LOGIN_TAB);
				
			}else  {
				
				installOrUpdate();
				
			}
			
		} else {
			tabbedPane.setSelectedIndex(DB_INSTALL_TAB);
		}
		
		
		setVisible(true);
	}

	
	
	boolean isConnectedToDB() {

		try (
				Connection connection = DatabaseManager.getConnection(Config.getSGBDURL(), Config.getDatabaseUser(), Config.getDatabasePassword())
				//Connection connection = DatabaseManager.getConnection()
		// DriverManager.getConnection(JDBC_URL, USER, PASSWORD)

		) {

			applicationLoginSuccessful = connection != null ? true : false;

		} catch (SQLException e1) {
			e1.printStackTrace();
		} catch (Exception e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		}

		return applicationLoginSuccessful;

	}

	boolean isUserTableExiste() { 
		String dbangiographie = Config.getDatabaseName();
		String tb_utilisateur =  Config.getDatabaseUserTablename(); 
		return DatabaseInitializer.isTableExiste(dbangiographie,tb_utilisateur);
	}
	
	
	
	private JPanel createTab1() {
		JPanel panel = new JPanel();
		panel.setLayout(new GridLayout(3, 2));

		panel.add(new JLabel("Nom d'utilisateur:"));
		loginUsername = new JTextField(Config.getProperty("username"));
		panel.add(loginUsername);

		panel.add(new JLabel("Mot de passe:"));
		loginPassword = new JPasswordField(Config.getProperty("password"));
		panel.add(loginPassword);
		
				
		JLabel messageLabel = 	new JLabel("");
		panel.add(messageLabel);
		
		JButton loginButton = new JButton("Se connecter");
		loginButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				// Mettez ici le code pour vérifier la connexion à l'application
				// à partir des valeurs saisies dans loginUsername et loginPassword
//                boolean applicationLoginSuccessful = false; // Remplacez par votre logique de connexion

				// Mettez ici le code pour vérifier la connexion à la base de données
				// à partir des valeurs saisies dans dbUrlField, usernameField et passwordField
				// Remplacez par votre logique de connexion
				boolean dbConnectionSuccessful = UserDAO.verifyPassword(loginUsername.getText(),
						new String(loginPassword.getPassword()));

				if (dbConnectionSuccessful) {
					// Si la connexion réussit, vous pouvez démarrer l'application ici
					startApplication();
			} else {
					tabbedPane.setSelectedIndex(0); // Si la connexion échoue, basculez vers l'onglet de connexion
					messageLabel.setText("wrong username or password");
				
					JOptionPane.showMessageDialog(null, "wrong username or password", "Erreur",
							JOptionPane.ERROR_MESSAGE);
					
					}

			}

		});
		
		panel.add(loginButton);

		return panel;
	}

	private JPanel createTab2() {

		JPanel panel = new JPanel();
		panel.setLayout(new GridLayout(5, 2));

		panel.add(new JLabel("Lien vers la base de données:"));
		dbUrlField = new JTextField(Config.getDatabaseURL());
		panel.add(dbUrlField);

		panel.add(new JLabel("Nom d'utilisateur:"));
		usernameField = new JTextField(Config.getDatabaseUser());
		panel.add(usernameField);

		panel.add(new JLabel("Mot de passe utilisateur:"));
		passwordField = new JPasswordField(Config.getDatabasePassword());
		panel.add(passwordField);
		JLabel messageLabel = 	new JLabel("");
		panel.add(messageLabel);
		JButton connectButton = new JButton("Connecter");

		connectButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				
				String dbangiographie = Config.getDatabaseName();
				String tb_utilisateur =  Config.getDatabaseUserTablename();
				
				
				try (
						//Connection connection = DatabaseManager.getConnection()
				// DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
						Connection connection = DatabaseManager.getConnection(Config.getSGBDURL(), Config.getDatabaseUser(), Config.getDatabasePassword());
				) {

					applicationLoginSuccessful = connection != null ? true : false;
//connexion à la base de donnée existe 
					if (applicationLoginSuccessful) {
						
						//si la table utilisateur exite autoriser la connexion	
						//si non installer les Tables  
						if(DatabaseInitializer.isTableExiste(dbangiographie,tb_utilisateur)) {
							tabbedPane.setSelectedIndex(LOGIN_TAB);
						}else {
							 tabbedPane.setSelectedIndex(DB_INSTALL_TAB);
							installOrUpdate(); 
							
						}
						 
					} else {
						tabbedPane.setSelectedIndex(CONFIG_PROPERTIES_TAB);
						
						JOptionPane.showMessageDialog(ApplicationGUI.this,
								"Échec de la connexion à l'application. Veuillez vérifier vos informations de connexion.",
								"Erreur de connexion", JOptionPane.ERROR_MESSAGE); 
					}

				} catch (SQLException e1) {
					e1.printStackTrace();
				} catch (Exception e2) {
					// TODO Auto-generated catch block
					e2.printStackTrace();
				}

			}
		});
		
		 
		panel.add(connectButton);

		return panel;
	}

	
	/**
	 * 
	 */
	protected void installOrUpdate() {
		 int result = JOptionPane.showConfirmDialog(
                 null,
                 "Do you want to Install Database & init data ?",
                 "Install Database",
                 JOptionPane.YES_NO_CANCEL_OPTION);

         if (result == JOptionPane.YES_OPTION) {
         	
          
					try {
						DatabaseInitializer.initialize();
					} catch (Exception e2) {
						 e2.printStackTrace();
					}
					 finally {
						 tabbedPane.setSelectedIndex(LOGIN_TAB);
					}
					 
             
         } else if (result == JOptionPane.NO_OPTION) {


         	 tabbedPane.setSelectedIndex(CONFIG_PROPERTIES_TAB);
             
         }
	}

	ConfigPanel configPanel = new ConfigPanel();

	private JPanel createTab3() {

		JPanel panel = new JPanel();

		panel.add(configPanel);

		return panel;
	}

	private void startApplication() {

		SwingUtilities.invokeLater(() -> {
			try {
				UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
			} catch (Exception e) {
				e.printStackTrace();
			}
//			new PhotoOrganizerApp();
			new PhotoOrganizerTreeApp();
		});

		setVisible(false);

//        // Mettez ici le code pour démarrer votre application après la connexion réussie
//        JOptionPane.showMessageDialog(this, "Application démarrée avec succès!", "Succès",
//                JOptionPane.INFORMATION_MESSAGE);
//        // Ajoutez ici le code pour le démarrage effectif de votre application
	}

	public static void main(String[] args) {
		SwingUtilities.invokeLater(() -> new ApplicationGUI());
	}
}
