package org.bio.mesure;
  
import java.awt.Desktop;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.GridLayout;
import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.awt.image.BufferedImage;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.DefaultListModel;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.JTextPane;
import javax.swing.JToolBar;
import javax.swing.SwingUtilities;
import javax.swing.event.HyperlinkEvent;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
 

public class ApplicationMokhtar /* extends JFrame*/ {

	
	JFrame frame = new JFrame();
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private JComboBox<String> languageComboBox;
	private JTextField ageField, restingHeartRateField, playerNameField;
	private JTextArea resultArea;
	JLabel labelAge;
	JLabel labelRestingHeartRate;
	JLabel labelPlayerName;
	JLabel labelResults;

	JButton calculateButton;
	JButton clearButton;
	JButton printButton;
	private JButton newFileButton,saveDataButton, cancelButton, exitButton, pdfGenButton;
    private List<PlayerInfo> playerInfoList = new ArrayList<>();

    
	private JTextField maxHeartRateField, trainingHeartRateField, maxOxygenConsumptionField;
	private JTextField maxAirSpeedField, maxAirCapacityField;

	ResourceBundle bundle = ResourceBundle.getBundle("ApplicationMokhtar", Locale.getDefault());
	String PLAYER_INF_FILE  = "playerInfo.dat";
	
 
    private JList<PlayerInfo> playerList;
    private DefaultListModel<PlayerInfo> playerListModel;
	
	private ImageIcon createResizedIcon(String path, int width, int height) {
		
      // Load the image using the ClassLoader
      ClassLoader classLoader = getClass().getClassLoader();
      java.net.URL imageUrl = classLoader.getResource(path);

      // Load the original image  .getImage()
      ImageIcon icon = new ImageIcon(imageUrl);
		
		
       // ImageIcon icon = new ImageIcon(path);
        Image img = icon.getImage().getScaledInstance(width, height, Image.SCALE_SMOOTH);
        return new ImageIcon(img);
    }
	
	
//	private ImageIcon createResizedIcon(String imagePath, int width, int height) {
//        try {
//        	 
//            // Load the image using the ClassLoader
//            ClassLoader classLoader = getClass().getClassLoader();
//            java.net.URL imageUrl = classLoader.getResource(imagePath);
//
//            // Load the original image
//            Image originalImage = new ImageIcon(imageUrl).getImage();
//
//            // Resize the image
//            Image resizedImage = originalImage.getScaledInstance(width, height, Image.SCALE_SMOOTH);
//
//            // Create a buffered image with transparency
//            BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
//
//            // Draw the resized image on the buffered image
//            Graphics2D g2d = bufferedImage.createGraphics();
//            g2d.drawImage(resizedImage, 0, 0, null);
//            g2d.dispose();
//
//            // Return the resized ImageIcon
//            return new ImageIcon(bufferedImage);
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return null;
//        }
//    }

	
	
	
	public ApplicationMokhtar() {
		  
		
		frame.addWindowListener(new WindowAdapter() {
			 
		 
			 @Override
			public void windowOpened(WindowEvent e) {
		 
				super.windowOpened(e);
				// showAboutUsDialog( frame);
			}
			 @Override
			public void windowClosing(WindowEvent e) { 
				super.windowClosing(e);
				// showAboutUsDialog( frame);
			}
		 });
		 
		 
		 
		// تكوين الإطار
		frame.setTitle("APPLICATION MOKHTAR");
		frame.setSize(400, 600);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setLayout(new BoxLayout(frame.getContentPane(), BoxLayout.Y_AXIS));

		
		initializeMenu() ;
		 
		// Créez la barre d'outils
		JToolBar toolBar = new JToolBar();
		toolBar.setFloatable(true);
		  int iconSize = 25;
		  
		  
		// Ajoutez les boutons à la barre d'outils
			ImageIcon new_file = createResizedIcon("icons/new_file.png",   iconSize,   iconSize);
			 
			newFileButton = new JButton(new_file);
			newFileButton.setToolTipText("خانة لحفظ البيانات");
			newFileButton.addActionListener(new ActionListener() {
				@Override
				public void actionPerformed(ActionEvent e) {
					clearInputFields();
				}
			});
			toolBar.add(newFileButton);
			
			
			
			
		// Ajoutez les boutons à la barre d'outils
		ImageIcon saveIcon = createResizedIcon("icons/save_black.png",   iconSize,   iconSize);
		 
		saveDataButton = new JButton(saveIcon);
		saveDataButton.setToolTipText("خانة لحفظ البيانات");
		saveDataButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				saveData();
				reloadData();
			}
		});
		toolBar.add(saveDataButton);

		
		
		// Ajoutez les boutons à la barre d'outils
		ImageIcon pdfGenIcon = createResizedIcon("icons/pdf.png" ,   iconSize,   iconSize);
		 
		pdfGenButton = new JButton(pdfGenIcon);
		pdfGenButton.setToolTipText("خانة لحفظ البيانات");
		pdfGenButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				String ppdfFile  = 	PdfGenerator.generatePdf(playerInfoList);
				
				if(ppdfFile!=null && !ppdfFile.isEmpty()) {
					 
					 printResults(ppdfFile);
				}
				
			}
		});
		toolBar.add(pdfGenButton);
		
		
		
		
		
//		ImageIcon cancelIcon = new ImageIcon(getClass().getResource("/icons/cancel.png"));
		ImageIcon cancelIcon  = createResizedIcon("icons/cancel.png" ,   iconSize,   iconSize);
		
		cancelButton = new JButton(cancelIcon);
		cancelButton.setToolTipText("الغاء في حالة التغيير  Delete selection");
		cancelButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				
				
				int result = JOptionPane.showConfirmDialog(null, "Do you want to Delete  record ?",
						"Delete Changes", JOptionPane.YES_NO_OPTION);

				if (result == JOptionPane.YES_OPTION) {
					deleteSelectedPlayer(); 
				}
				
			}
		});
		toolBar.add(cancelButton);

		
		
		
	ImageIcon exitIcon  = createResizedIcon("icons/exit.png" ,   iconSize,   iconSize);
		
		exitButton = new JButton(exitIcon);
		exitButton.setToolTipText("اخرج بره");
		exitButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				exitChanges();
			}
		});
		toolBar.add(exitButton);

		 
		
		
	 
		
		
		
		// Ajoutez une liste déroulante pour choisir la langue
		languageComboBox = new JComboBox<>(new String[] { "ar_AR", "fr_FR" }); // Ajoutez d'autres langues au besoin

		Locale userLocale = new Locale("fr", "FR");

		// Load the appropriate resource bundle
		bundle = ResourceBundle.getBundle("ApplicationMokhtar", userLocale);

		languageComboBox.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				// Changez la locale lorsque l'utilisateur sélectionne une nouvelle langue
				String selectedLanguage = (String) languageComboBox.getSelectedItem();
				setLocaleForLanguage(selectedLanguage);
				updateUIForLocale();
			}
		});

		// Ajoutez la barre d'outils à l'interface utilisateur
		frame. add(toolBar);
		 	///add(toolBar,  BorderLayout.PAGE_START);
	 	playerNameField = new JTextField(20);
		playerNameField.setText("ZEROUKI");
	
	 	restingHeartRateField = new JTextField(10);
		restingHeartRateField.setText("75");
		
		NumericTextFieldExample.restrictToNumeric(restingHeartRateField);
		
		// إعداد الخانات العلوية
		ageField = new JTextField(10);
		ageField.setText("31");
		NumericTextFieldExample.restrictToNumeric(ageField);
		
		
		
		// Ajoutez les champs de saisie pour les résultats
		maxHeartRateField = new JTextField(10);
		trainingHeartRateField = new JTextField(10);
		maxOxygenConsumptionField = new JTextField(10);
		maxAirSpeedField = new JTextField(10);
		maxAirCapacityField = new JTextField(10);

		// JButton calculateButton = new JButton("حساب النتائج");
		calculateButton = new JButton(bundle.getString("button.calculate"));

		calculateButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				calculateResults();

			}
		});

		
		
		// إعداد الخانات الوسطى
		resultArea = new JTextArea(10, 30);
		resultArea.setEditable(false);

		// إعداد الخانات السفلية
		// JButton clearButton = new JButton("مسح البيانات");
		clearButton = new JButton(bundle.getString("button.clear"));
		clearButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				clearInputFields();
			}
		});

//        JButton printButton = new JButton("طباعة النتائج");
		printButton = new JButton(bundle.getString("button.print"));
		printButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
					String ppdfFile  = 	PdfGenerator.generatePdf(playerInfoList);
				
				if(ppdfFile!=null && !ppdfFile.isEmpty()) {
					 
					 printResults(ppdfFile);
				}
			}
		});
		// Ajoutez les boutons "خانة لحفظ البيانات" et "الغاء في حالة التغيير"
		saveDataButton = new JButton("Enregistrer");
		saveDataButton .setToolTipText("خانة لحفظ البيانات");
		saveDataButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				saveData();
				
				reloadData();
			}
		});

		cancelButton = new JButton("Annuler");
		cancelButton .setToolTipText("الغاء في حالة التغيير ");
		cancelButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				cancelChanges();
			}
		});

		// إضافة المكونات إلى الإطار
		// Ajoutez la liste déroulante à l'interface utilisateur
		frame.add(new JLabel("Language:"));
		// add(languageComboBox);

		labelAge = new JLabel(bundle.getString("label.age"));

		labelRestingHeartRate = new JLabel(bundle.getString("label.restingHeartRate"));
		labelPlayerName = new JLabel(bundle.getString("label.playerName"));
		labelResults = new JLabel(bundle.getString("label.results"));

		
		JPanel panelEdit = new JPanel(new GridLayout(8, 2));
		
			panelEdit. add(labelPlayerName);
		panelEdit. add(playerNameField);
		
		panelEdit. add(labelAge);
		panelEdit. add(ageField);
		panelEdit. add(labelRestingHeartRate);
		panelEdit. add(restingHeartRateField);
	

		// ... (le reste du code)

		
		// Ajoutez les champs de saisie à l'interface utilisateur
		panelEdit. add(new JLabel("Max Heart Rate:"));
		panelEdit. add(maxHeartRateField);
		panelEdit. add(new JLabel("Training Heart Rate:"));
		panelEdit. add(trainingHeartRateField);
		panelEdit. add(new JLabel("Max Oxygen Consumption:"));
		panelEdit. add(maxOxygenConsumptionField);
		panelEdit. add(new JLabel("Max Air Speed:"));
		panelEdit. add(maxAirSpeedField);
		panelEdit. add(new JLabel("Max Air Capacity:"));
		panelEdit. add(maxAirCapacityField);

		 
		frame.add(panelEdit);
		
		JPanel panelButon = new JPanel(new GridLayout(1, 14));
		frame.add(calculateButton);
//        add(new JLabel("النتائج:"));
		
		JPanel panelLabelResult = new JPanel(new GridLayout(1, 2));
				panelLabelResult.add(new JLabel("Liste des joueurs "));
				panelLabelResult.add(labelResults);
			
			
		JPanel panelListResult = new JPanel(new GridLayout(1, 2));
		// init la liste de player		
			panelListResult.add(initplayerListUI());
			panelListResult.add(resultArea);
			
			frame.add(panelLabelResult);
			frame.add(panelListResult);
				 
		panelButon.add(saveDataButton);
		panelButon.add(clearButton);
		panelButon.add(printButton);
		panelButon.add(cancelButton);
		frame.add(panelButon);

		// عرض الإطار
		frame.setVisible(true);
	}

	protected void exitChanges() {
		System.exit(frame.ABORT);
		
	}

 

	private void cancelChanges() {
		// Réinitialisez les champs de saisie et les résultats aux valeurs par défaut
		ageField.setText("");
		restingHeartRateField.setText("");
		playerNameField.setText("");
		maxHeartRateField.setText("");
		trainingHeartRateField.setText("");
		maxOxygenConsumptionField.setText("");
		maxAirSpeedField.setText("");
		maxAirCapacityField.setText("");

		// Ajoutez la logique supplémentaire si nécessaire
		JOptionPane.showMessageDialog(frame, "تم الغاء التغييرات.");
	}
	

    public JScrollPane  initplayerListUI() {
      
     // Créez la liste des joueurs et le modèle associé
        playerListModel = new DefaultListModel<>();
        playerList = new JList<>(playerListModel);

        
     // Définissez le rendu personnalisé
        playerList.setCellRenderer(new PlayerListCellRenderer());

        
        
        // Ajoutez le ListSelectionListener à la JList
        playerList.addListSelectionListener(new ListSelectionListener() {
            @Override
            public void valueChanged(ListSelectionEvent e) {
                if (!e.getValueIsAdjusting() && playerList.getSelectedIndex() != -1) {
                    // Mettez à jour les champs de saisie avec les informations du joueur sélectionné
                    updateFieldsFromSelectedPlayer();
                }
            }
        });

        // Ajoutez le MouseAdapter à la JList pour détecter le double-clic
        playerList.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getClickCount() == 2) {
                    // Double-clic détecté, mettez à jour les champs de saisie avec les informations du joueur sélectionné
                    updateFieldsFromSelectedPlayer();
                }
            }
        });
        
        
     reloadData();
        
        
        
        
        JScrollPane scrollPane = new JScrollPane(playerList);
        scrollPane.setPreferredSize(new Dimension(200, 200));
        frame.add(scrollPane);//, BorderLayout.CENTER);

        // ...

        try {
			readDataFromFile();
		} catch (ClassNotFoundException | IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        
        // Appeler au démarrage pour afficher les données existantes
		return scrollPane; 
        
    }

	private void reloadData() {
		// Mise à jour du modèle de liste avec les objets PlayerInfo
		    playerListModel.clear();
		    for (PlayerInfo playerInfo : playerInfoList) {
		        playerListModel.addElement(playerInfo);
		    }
	}
	

    protected  void updateFieldsFromSelectedPlayer() {
        // Obtenez le joueur sélectionné
        PlayerInfo selectedPlayer = playerList.getSelectedValue();

        // Mettez à jour les champs de saisie avec les informations du joueur sélectionné
        playerNameField.setText(selectedPlayer.getPlayerName());
        ageField.setText(String.valueOf(selectedPlayer.getAge()));
        restingHeartRateField.setText(String.valueOf(selectedPlayer.getRestingHeartRate()));
        maxHeartRateField.setText(String.valueOf(selectedPlayer.getMaxHeartRate()));
        trainingHeartRateField.setText(String.valueOf(selectedPlayer.getTrainingHeartRate()));
        maxOxygenConsumptionField.setText(String.valueOf(selectedPlayer.getMaxOxygenConsumption()));
        maxAirSpeedField.setText(String.valueOf(selectedPlayer.getMaxAirSpeed()));
        maxAirCapacityField.setText(String.valueOf(selectedPlayer.getMaxAirCapacity()));

        // Ajoutez d'autres mises à jour en fonction des nouveaux champs
    }

	private void readDataFromFile() throws FileNotFoundException, IOException, ClassNotFoundException {
		
		
		
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(PLAYER_INF_FILE))) {
            playerInfoList = (List<PlayerInfo>) ois.readObject(); 
            
            reloadData();
        }  
    }
	
	private void deleteSelectedPlayer() {
	    int selectedIndex = playerList.getSelectedIndex();
	    if (selectedIndex != -1) {
	        // Obtenez le joueur sélectionné
	        PlayerInfo selectedPlayer = playerList.getSelectedValue();

	        // Supprimez le joueur du modèle de liste et du fichier de sérialisation
	        playerListModel.remove(selectedIndex);
	        playerInfoList.remove(selectedPlayer);

	        // Mettez à jour le fichier de sérialisation
	        updateSerializationFile();

	        // Effacez les champs de saisie après la suppression
	        clearInputFields();
	    }
	}

	private void updateSerializationFile() {
	    try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(PLAYER_INF_FILE))) {
	        oos.writeObject(playerInfoList);
	        oos.flush();
	    } catch (IOException e) {
	        e.printStackTrace();
	        // Gérez l'exception appropriée selon vos besoins
	    }
	}

 
	
	
	
	/**
	 * 
	 */
	private void saveData() {
		
		
	if(ageField.getText() != null && ! ageField.getText().isEmpty()) {
		
		
	    try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(PLAYER_INF_FILE))) {
	        PlayerInfo playerInfo = new PlayerInfo();

 
	        // Initialisez les attributs de playerInfo avec les données actuelles de l'IHM
	        playerInfo.setAge(Integer.parseInt(ageField.getText()));
	        playerInfo.setPlayerName(playerNameField.getText());
	        playerInfo.setRestingHeartRate(Integer.parseInt(restingHeartRateField.getText()));
	        playerInfo.setMaxHeartRate(Integer.parseInt(maxHeartRateField.getText()));
	        playerInfo.setTrainingHeartRate(Integer.parseInt(trainingHeartRateField.getText()));
	        playerInfo.setMaxOxygenConsumption(Double.parseDouble(maxOxygenConsumptionField.getText()));
	        playerInfo.setMaxAirSpeed(Double.parseDouble(maxAirSpeedField.getText()));
	        playerInfo.setMaxAirCapacity(Double.parseDouble(maxAirCapacityField.getText()));

	        playerInfoList.add(playerInfo);
	        oos.writeObject(playerInfoList);
	        oos.flush();

	        // Informez l'utilisateur que les données ont été sauvegardées
	        JOptionPane.showMessageDialog(frame, "تم حفظ البيانات بنجاح.");
	    } catch (IOException | NumberFormatException e) {
	        e.printStackTrace();
	        // Gérez les exceptions appropriées selon vos besoins
	    }
	    
	}
	}

	 
//	private void calculateResults() {
//		// قم بتنفيذ الحسابات هنا باستخدام المعادلات المعطاة وعرضها في resultArea
//		// يمكنك الوصول إلى قيم الحقول باستخدام ageField.getText() وغيرها
//
//		float calculatedResult = 00;
//		// Affichez le résultat en utilisant les clés du fichier de propriétés
//		resultArea.setText(bundle.getString("label.results") + " " + calculatedResult);
//
//	}

	private void clearInputFields() {
		// مسح محتوى الحقول
		 
	    // Effacez les champs de saisie
	    playerNameField.setText("");
	    ageField.setText("");
	    restingHeartRateField.setText("");
	    maxHeartRateField.setText("");
	    trainingHeartRateField.setText("");
	    maxOxygenConsumptionField.setText("");
	    maxAirSpeedField.setText("");
	    maxAirCapacityField.setText("");
	    resultArea.setText("");
	    // Ajoutez d'autres champs au besoin
	    
	}

	private void printResults(String ppdfFile) {
		 //il doit etre déja généré
			// قم بتنسيق وطباعة النتائج في ورقة الطباعة
	// String ppdfFile  = 	PdfGenerator.generatePdf(playerInfoList);
	
	String waterMarkText = "CONFIDENCIEL";
	 
	String lastPpdfFile=	PdfWatermark.addWaterMarkImage(ppdfFile, true, waterMarkText,null);
	
	PdfGenerator.openPDF(lastPpdfFile );
//		String formattedResults = "formattedResults";
//		JOptionPane.showMessageDialog(this, bundle.getString("button.print") + " Les information seront enregistrées sous"
//				+ " forme de PDF l'ipression est ensuite pkus simple" + formattedResults);
 
	
	}

	private void calculateResults() {
		try {
			// Récupérer les valeurs saisies par l'utilisateur
			int age = Integer.parseInt(ageField.getText());
			int restingHeartRate = Integer.parseInt(restingHeartRateField.getText());

			// Appeler les différentes fonctions de calcul
			int maxHeartRate = calculateMaxHeartRate(age);
			int trainingHeartRate = calculateTrainingHeartRate(restingHeartRate, maxHeartRate);
			double maxOxygenConsumption = calculateMaxOxygenConsumption(restingHeartRate, maxHeartRate);
			double maxAirSpeed = calculateMaxAirSpeed(maxOxygenConsumption);
			double maxAirCapacity = calculateMaxAirCapacity(maxOxygenConsumption);

			try {
				// ... (le reste du code)

				// Mise à jour des champs de saisie des résultats
				maxHeartRateField.setText(String.valueOf(maxHeartRate));
				trainingHeartRateField.setText(String.valueOf(trainingHeartRate));
				maxOxygenConsumptionField.setText(String.valueOf(maxOxygenConsumption));
				maxAirSpeedField.setText(String.valueOf(maxAirSpeed));
				maxAirCapacityField.setText(String.valueOf(maxAirCapacity));

				// ... (le reste du code)
			} catch (NumberFormatException e) {
				resultArea.setText("Veuillez entrer des valeurs numériques valides.");
			}

			// Afficher les résultats dans resultArea
			resultArea.setText("Max Heart Rate: " + maxHeartRate + "\n" + "Training Heart Rate: " + trainingHeartRate
					+ "\n" + "Max Oxygen Consumption: " + maxOxygenConsumption + "\n" + "Max Air Speed: " + maxAirSpeed
					+ "\n" + "Max Air Capacity: " + maxAirCapacity);
		} catch (NumberFormatException e) {
			resultArea.setText("Veuillez entrer des valeurs numériques valides.");
		}
	}

	private int calculateMaxHeartRate(int age) {
		// Calcul de la fréquence cardiaque maximale en fonction de l'âge
		return 220 - age;
	}

	private int calculateTrainingHeartRate(int restingHeartRate, int maxHeartRate) {
		// Calcul de la fréquence cardiaque d'entraînement  restingHeartRate + 
		return ((maxHeartRate - restingHeartRate)) % restingHeartRate;
	}

	private double calculateMaxOxygenConsumption(int restingHeartRate, int maxHeartRate) {
		// Calcul de la consommation maximale d'oxygène
		return (restingHeartRate / maxHeartRate) * 15;
	}

	private double calculateMaxAirSpeed(double maxOxygenConsumption) {
		// Calcul de la vitesse maximale de l'air
		return maxOxygenConsumption / 3.5;
	}

	private double calculateMaxAirCapacity(double maxOxygenConsumption) {
		// Calcul de la capacité maximale de l'air
		return( maxOxygenConsumption- 0.435) / 0.01141 ;
	}

	// ... (le reste du code)

	private void updateUIForLocale() {
		// Mettez à jour l'interface utilisateur en fonction de la locale actuelle
		// ResourceBundle bundle = ResourceBundle.getBundle("ApplicationMokhtar");

		// Mettez à jour les étiquettes, les boutons, etc., en utilisant les clés du
		// fichier de propriétés
		// par exemple: labelAge.setText(bundle.getString("label.age"));
		// Mettez à jour les autres composants similaires

		// Mettez à jour le texte de la liste déroulante
//        languageComboBox.removeAllItems();
//        for (Locale availableLocale : Locale.getAvailableLocales()) {
//            languageComboBox.addItem(availableLocale.toString());
//        }

		labelAge.setText(bundle.getString("label.age"));
		labelRestingHeartRate.setText(bundle.getString("label.restingHeartRate"));
		labelPlayerName.setText(bundle.getString("label.playerName"));
		calculateButton.setText(bundle.getString("button.calculate"));
		labelResults.setText(bundle.getString("label.results"));
		clearButton.setText(bundle.getString("button.clear"));
		printButton.setText(bundle.getString("button.print"));
	}

	private void setLocaleForLanguage(String language) {
		// Changez la locale de l'application en fonction de la langue sélectionnée
		Locale selectedLocale = new Locale(language.split("_")[0], language.split("_")[1]);
		Locale.setDefault(selectedLocale);
	}

	
	
	
	
	
	/**
	 * 
	 */
	private void initializeMenu() {

		// Création du menu
		JMenuBar menuBar = new JMenuBar();
 
		JMenu fileMenu = new JMenu("File");

	 
		// Élément de menu "Exit"
		JMenuItem exitItem = new JMenuItem("Exit");
		exitItem.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				System.exit(0);
			}
		});

		// Ajout des éléments au menu "File"
		
//		fileMenu.add(personnesMenu); 
//		fileMenu.addSeparator(); 
		fileMenu.addSeparator();  
		fileMenu.add(exitItem);

		// Ajout du menu "File" à la barre de menu
		menuBar.add(fileMenu);

		// Ajoutez le menu "Personnes" à la barre de menu
		//menuBar.add(personnesMenu);
		
		  // Menu "Help"
        JMenu helpMenu = new JMenu("Help");
        JMenuItem helpItem = new JMenuItem("Help Contents");
        helpMenu.add(helpItem);

        // Menu "About"
        JMenu aboutMenu = new JMenu("About");
        JMenuItem aboutItem = new JMenuItem("About Us");

        aboutItem.addActionListener(e -> showAboutUsDialog(frame)); 
        aboutMenu.add(aboutItem);

        // Ajout des menus à la barre de menu
        menuBar.add(Box.createHorizontalGlue()); // Pour aligner les menus à droite
        menuBar.add(helpMenu);
        menuBar.add(aboutMenu); 
        frame. setJMenuBar(menuBar);
 
	}
	
	
	
	
	private static void showAboutUsDialog(JFrame parentFrame) {
        JTextPane textPane = new JTextPane();
        textPane.setContentType("text/html");
        textPane.setEditable(false);

        String aboutText = "<html><b>About Us</b><br>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br>" +
                "Welcome to our application!"
             + "\r\n"+ 
             "Contact us:  <a href=\"mailto:drmdh@msncom\">Dr Hamid MADANI drmdh@msncom</a><br>" +
             "Visit our website: <a href=\"http://amia.fr\">http://amia.fr</a><br>"
             + ""
             + "This application is programmed for Dr ???\r\n"
             + "to serve as a demonstration<br>"
             + "<br>"
             + "عنوان الاطروحة : \r\n"
             + "تصميم برنامج الى لتقنين الحمل التدريبي وفق معدل النبض القلب الاقصى و الراحة بدلالة معدل نبض القلب الراحة و السن لدى لاعبي كرة القدم صنف ما دون ( 14- 21)  سنة \r\n"
             + "المعادلات الام المستخدمة في الحسابات \r\n"
             + "معدل النبض في الراحة : يقدمه الباحث FCROPOS\r\n"
             + "معدل النبض الاقصى :  السنFCMAX=220 -  ( السن يقدمه الباحث ) \r\n"
             + "معدل النبض للتدريب :             ROPOS FC   + FCMAX-FCROPOS))%  FC DENTRAINEMENT  = \r\n"
             + "الحد الاقصى لاستهلاك الأوكسجين :             )         FCROPOS/  fcmax  ) 15   =MAX 2vo \r\n"
             + "السرعة القصوى الهوائية :  VMA= vo2MAX/3,5     \r\n"
             + "القدرة القصوى الهوائية :             /0,01141 PMA=(VO2MAX-O,435) \r\n"
             + ""
             + "</html>";

        textPane.setText(aboutText);
        textPane.addHyperlinkListener(e -> {
            if (e.getEventType() == HyperlinkEvent.EventType.ACTIVATED) {
                try {
                    Desktop.getDesktop().browse(new URI(e.getURL().toString()));
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        });

        JScrollPane scrollPane = new JScrollPane(textPane);
        scrollPane.setPreferredSize(new Dimension(400, 200));

        JOptionPane.showMessageDialog(parentFrame, scrollPane, "About Us", JOptionPane.INFORMATION_MESSAGE);
    }
	
	
	
	
	public static void main(String[] args) {
		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
				new ApplicationMokhtar();
			}
		});
	}
}
