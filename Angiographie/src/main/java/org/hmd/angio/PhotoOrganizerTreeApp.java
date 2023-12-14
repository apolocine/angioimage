package org.hmd.angio;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;
import javax.swing.BorderFactory;
import javax.swing.DefaultListCellRenderer;
import javax.swing.DefaultListModel;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPopupMenu;
import javax.swing.JScrollPane;
import javax.swing.JSlider;
import javax.swing.JSpinner;
import javax.swing.JSplitPane;
import javax.swing.JTextArea;
import javax.swing.JTree;
import javax.swing.SpinnerNumberModel;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.event.TreeSelectionEvent;
import javax.swing.event.TreeSelectionListener;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.hmd.angio.conf.ConfigEditorUI;
import org.hmd.angio.dto.Person;
import org.hmd.angio.dto.PersonDAO;
import org.hmd.angio.enuma.PDRectangleEnum;
import org.hmd.angio.exception.PhotoLoadException;
import org.hmd.angio.ihm.HistogramEQBtn;
import org.hmd.angio.ihm.PersonInfoEntryTreeUI;
import org.hmd.angio.ihm.PersonInfoEntryUI;
import org.hmd.angio.ihm.tree.PhotoDirectoryUtils;
import org.hmd.angio.pdf.PDFGenerationGUI;
import org.hmd.angio.pdf.PDFCreator;
import org.hmd.image.ouils.DirectoryManager;
import org.hmd.image.ouils.ThumbnailRenderer;

import net.coobird.thumbnailator.Thumbnails;

public class PhotoOrganizerTreeApp {

	private PersonDAO personDAO; // Ajouter l'instance de PersonDAO

	// Modifiez le type de peopleList
	private DefaultListModel<Person> peopleListModel;
	private JList<Person> peopleJList;

	private File selectedDirectory;
	private JFrame frame;
	private JList<File> photoList;
	private DefaultListModel<File> listModel;

	private JPanel pdfPanel;
	JPanel previewPDFPanel  ;
	private JScrollPane pdfScrollPane;
	boolean isPDFGenerated = false;

	private float zoomFactor = 1.0f;
    private int currentPage = 0;
 

	/**
	 * PDF generator IHM
	 */
	JComboBox<String> orientationComboBox = new JComboBox<>(new String[] { "Portrait", "Paysage" });
	JComboBox<Integer> photosPerLineComboBox = new JComboBox<>(new Integer[] { 1, 2, 3, 4, 5, 6, 8, 9, 10 });
	JComboBox<Integer> widthByPhotosSizeComboBox = new JComboBox<>(new Integer[] { 150, 200, 300, 400, 500 });
	JComboBox<PDRectangleEnum> rectangleComboBox = new JComboBox<>(PDRectangleEnum.values());
	

	
	JSlider xMarginSlider = new JSlider(JSlider.HORIZONTAL, 0, 100, 50);
	JSlider yMarginSlider = new JSlider(JSlider.HORIZONTAL, 0, 100, 50);
	JSlider sideMarginSlider = new JSlider(0, 100, 10);
	JSpinner pageCountSpinner = new JSpinner(new SpinnerNumberModel(1, 1, 10, 1)); // Nouveau ajout

	JButton generatePDFButton = new JButton("Générer PDF");
	JButton showPDFButton = new JButton("Show PDF");
	JButton printePDFButton = new JButton("Print PDF");



	private PDFGenerationGUI pdfGenerationGUI = new PDFGenerationGUI();

	public static void main(String[] args) {
		SwingUtilities.invokeLater(() -> {
			try {
				UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
			} catch (Exception e) {
				e.printStackTrace();
			}
			new PhotoOrganizerTreeApp();
		});
	}

	public PhotoOrganizerTreeApp() {
		initPeopleListe();
		initialize();
		
		
		// Ajoutez le JScrollPane de l'arborescence à votre interface utilisateur
// 				frame.add(initializeJTree(), BorderLayout.WEST);
// 				frame.add(initializePeopleTree(), BorderLayout.WEST);

		   

	}

	private void initPeopleListe() {
		// Initialisez l'instance de PersonDAO
		personDAO = new PersonDAO();

		List<Person> people = personDAO.findAll();
		peopleListModel = new DefaultListModel<>();

		for (Person person : people) {
			peopleListModel.addElement(person);
		}

		peopleJList = new JList<>(peopleListModel);

		peopleJList.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent e) {

				if (e.getClickCount() == 2) {
					// Double-clic détecté
					displayPhotosForPerson();

				}

				if (e.getClickCount() == 1) {
					Person selectedPerson = peopleJList.getSelectedValue();

					if (!photoList.isSelectionEmpty()) {
					}

					String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);
					File pdfFilePerson = new File(pdfFilePath);

					if (pdfFilePerson.exists()) {
						isPDFGenerated = true;
						showPDFButton.setEnabled(true);
						printePDFButton.setEnabled(true);
						//premier viewer 
						displayPDF(pdfFilePath, pdfPanel);
						// Add zoom functionality
						pdfPanel.addMouseWheelListener(new ZoomHandler(pdfFilePath, pdfPanel));
						pdfPanel.addMouseListener(new ContextMenuMouseListener(pdfFilePath, pdfPanel));
						
						
						//premier viewer
						displayPDF(pdfFilePath, previewPDFPanel);
						// Add zoom functionality
						previewPDFPanel.addMouseWheelListener(new ZoomHandler(pdfFilePath, previewPDFPanel));
						previewPDFPanel.addMouseListener(new ContextMenuMouseListener(pdfFilePath, previewPDFPanel));
					}

				}

			}

		});

		// Utilisez un cell renderer pour personnaliser l'affichage de la cellule
		peopleJList.setCellRenderer(new DefaultListCellRenderer() {
			@Override
			public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected,
					boolean cellHasFocus) {
				// Utilisez le rendu par défaut pour obtenir le texte par défaut
				JLabel label = (JLabel) super.getListCellRendererComponent(list, value, index, isSelected,
						cellHasFocus);
				// Obtenez la personne correspondante
				Person person = (Person) value;
				// Personnalisez le texte pour afficher le nom et le prénom
				label.setText(person.getNom() + " " + person.getPrenom());
				return label;
			}
		});

		peopleJList.addMouseListener(new MouseAdapter() {
			@Override
			public void mousePressed(MouseEvent e) {
				showPopup(e);
			}

			@Override
			public void mouseReleased(MouseEvent e) {
				showPopup(e);
			}

			private void showPopup(MouseEvent e) {
				if (e.isPopupTrigger()) {
					// Affichez le menu contextuel ici
					createPeoplePopupMenu().show(e.getComponent(), e.getX(), e.getY());
				}
			}
		});

	}

	// Méthode pour mettre à jour la liste des personnes
	private void updatePeopleList() {

		List<Person> people = personDAO.findAll();
		// Effacez toutes les personnes existantes dans le modèle
		peopleListModel.removeAllElements();

		for (Person person : people) {
			peopleListModel.addElement(person);
		}

	}

	private void displayPhotosForPerson() {

		Person selectedPerson = peopleJList.getSelectedValue();

		if (selectedPerson != null) {

			// Ajoutez votre logique pour afficher les photos de la personne sélectionnée
			// JOptionPane.showMessageDialog(frame, "Afficher les photos de peretoire : " +
			// selectedPerson.getNom());

			String directory = DirectoryManager.getPersonWorkspaceDirectory(selectedPerson);
			File workingDirectory = new File(directory);
			chooseDirectory(workingDirectory);

		} else {
			JOptionPane.showMessageDialog(frame, "Personne non trouvée.", "Erreur", JOptionPane.ERROR_MESSAGE);
		}

	}

	private JPopupMenu createPeoplePopupMenu() {
		JPopupMenu popupMenu = new JPopupMenu();

		// Ajoutez les éléments du menu
		JMenuItem reloadPersonPhotosItem = new JMenuItem("Reload Photos");
		JMenuItem removePersonItem = new JMenuItem("Remove Person");
		JMenuItem browseDirecty = new JMenuItem("Browse Directy");
		// Ajoutez des actions aux éléments du menu
		reloadPersonPhotosItem.addActionListener(e -> reloadPhotosAction());
		removePersonItem.addActionListener(e -> removePersonAction());
		browseDirecty.addActionListener(e -> browseDirectyAction());

		int selectedPersonIndex = peopleJList.getSelectedIndex();
		if (selectedPersonIndex != -1) {
			// Ajoutez les éléments au menu contextuel
			popupMenu.add(reloadPersonPhotosItem);
			popupMenu.add(removePersonItem);
			popupMenu.add(browseDirecty);
		}
		// Ajoutez les éléments au menu contextuel
//		popupMenu.add(reloadPersonPhotosItem);
//		popupMenu.add(removePersonItem);
//		popupMenu.add(browseDirecty);

		return popupMenu;
	}

	/**
	 * 
	 */
	private void browseDirectyAction() {
		int selectedPersonIndex = peopleJList.getSelectedIndex();
		if (selectedPersonIndex != -1) {
			Person selectedPerson = peopleListModel.getElementAt(selectedPersonIndex);
			String directory = DirectoryManager.getPersonWorkspaceDirectory(selectedPerson);
			DirectoryManager.browseDirectory(directory);
		}
	}

	/**
	 * 
	 */
	private void reloadPhotosAction() {

		int selectedPersonIndex = peopleJList.getSelectedIndex();
		if (selectedPersonIndex != -1) {
			Person selectedPerson = peopleListModel.getElementAt(selectedPersonIndex);
			File directory = new File(DirectoryManager.getPersonWorkspaceDirectory(selectedPerson));
			try {
				loadPhotos(directory);
			}
//			catch (PhotoLoadException e) { 
//				JOptionPane.showMessageDialog(frame,
//						"le répertoire est vide ou inaccessible de \n" + selectedPerson.getNom() + "_"
//								+ selectedPerson.getPrenom(),
//						"Echèque recharge des Photos   ", JOptionPane.INFORMATION_MESSAGE); 
//			}   
			catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	/**
	 * 
	 */
	private void removePersonAction() {
		int selectedPersonIndex = peopleJList.getSelectedIndex();
		if (selectedPersonIndex != -1) {
			Person selectedPerson = peopleListModel.getElementAt(selectedPersonIndex);

			int confirmation = JOptionPane.showConfirmDialog(frame,
					"Êtes-vous sûr de vouloir supprimer la personne : " + selectedPerson.getNom() + "_"
							+ selectedPerson.getPrenom() + "?",
					"Confirmation de suppression", JOptionPane.YES_NO_OPTION);

			if (confirmation == JOptionPane.YES_OPTION) {

				// Supprimez la personne de la liste et de la base de données
				removePerson(selectedPerson);
			}
		}
	}

	private void removePerson(Person person) {
		// Supprimez la personne de la base de données
		personDAO.deletePerson(person);

		// Supprimez la personne de la liste
		peopleListModel.removeElement(person);

		// Supprimez le répertoire de la personne avec confirmation
		int confirmation = JOptionPane.showConfirmDialog(frame,
				"Voulez-vous supprimer le répertoire de la personne avec toutes les photos?",
				"Confirmation de suppression du répertoire", JOptionPane.YES_NO_OPTION);

		if (confirmation == JOptionPane.YES_OPTION) {
			deletePhotosAndDirectory(person);
		}
	}

	/**
	 * 
	 * @param person
	 */
	private void deletePhotosAndDirectory(Person person) {
		// Obtenez le répertoire de la personne
		File personDirectory = new File(DirectoryManager.getPersonWorkspaceDirectory(person));

		// Vérifiez si le répertoire existe
		if (personDirectory.exists()) {
			// Supprimez toutes les photos du répertoire
			File[] photoFiles = personDirectory.listFiles();
			if (photoFiles != null) {
				for (File photoFile : photoFiles) {
					photoFile.delete();
				}
				photoList.removeAll();
				listModel.clear();

			}

			// Supprimez le répertoire lui-même
			if (personDirectory.delete()) {
				JOptionPane.showMessageDialog(frame,
						"Répertoire de la personne et toutes les photos supprimés avec succès.", "Suppression réussie",
						JOptionPane.INFORMATION_MESSAGE);
			} else {
				JOptionPane.showMessageDialog(frame, "Erreur lors de la suppression du répertoire et des photos.",
						"Erreur", JOptionPane.ERROR_MESSAGE);
			}
		} else {
			JOptionPane.showMessageDialog(frame, "Le répertoire de la personne n'existe pas.", "Avertissement",
					JOptionPane.WARNING_MESSAGE);
		}

	}

	private void initialize() {

		// Au démarrage, chargez la configuration depuis le fichier
		// lecture directed des informationsà partir du ficher nous avons pas besoins de
		// l'interface utilisateur

		// Utilisez la configuration chargée, par exemple :
		String directory = DirectoryManager.getWorkspaceDirectory();

		if (directory != null && new File(directory).isDirectory()) {
			selectedDirectory = new File(directory);
		}

		frame = new JFrame("Photo Organizer");
		frame.setSize(800, 600);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

		// Ajoutez la liste des personnes au-dessus de la liste de photos
		JPanel peoplePanel = new JPanel(new BorderLayout());
		peoplePanel.add(new JLabel("Liste des Personnes"), BorderLayout.NORTH);
		peoplePanel.add(new JScrollPane(peopleJList), BorderLayout.CENTER);

//		// Ajoutez la liste de photos
//		JPanel photosPanel = new JPanel(new BorderLayout());
//		photosPanel.add(new JLabel("Liste de Photos"), BorderLayout.NORTH);
//		// Ajoutez votre liste de photos (par exemple, photoList) ici
//		// ...

//		// Ajoutez un bouton pour afficher les photos de la personne sélectionnée
//		JButton showPhotosButton = new JButton("Afficher les Photos");
//		showPhotosButton.addActionListener(new ActionListener() {
//			@Override
//			public void actionPerformed(ActionEvent e) {
//				displayPhotosForPerson();
//
//			}
//		});
//		peoplePanel.add(showPhotosButton, BorderLayout.SOUTH);

		listModel = new DefaultListModel<>();
		photoList = new JList<>(listModel);

		// "ListSelectionModel.MULTIPLE_INTERVAL_SELECTION"
		photoList.setSelectionMode(2);

		photoList.setCellRenderer(new ThumbnailRenderer());

		photoList.addMouseListener(new MouseAdapter() {
			@Override
			public void mousePressed(MouseEvent e) {
				showPopup(e);
			}

			@Override
			public void mouseReleased(MouseEvent e) {
				showPopup(e);
			}

			private void showPopup(MouseEvent e) {
				if (e.isPopupTrigger()) {
					// Affichez le menu contextuel ici
					createPhotoListPopupMenu().show(e.getComponent(), e.getX(), e.getY());
				}
			}
		});

		photoList.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent e) {

				if (e.getClickCount() == 2) {
					// Double-clic détecté
					File selectedFile = photoList.getSelectedValue();
					if (selectedFile != null) {
						try {

							displayImage(selectedFile);

						} finally {
							File selectedDirectory = new File(selectedFile.getParent());

							try {
								loadPhotos(selectedDirectory);
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
						}

//						String originalFilePath = selectedFile.getAbsolutePath();
//						String originalFileDir = originalFilePath.substring(0, 
//								originalFilePath.lastIndexOf(File.separato(File.separator));
//						 

					}
				}

			}

		});

		JPanel directoryImagePanel = new JPanel(new BorderLayout());
		directoryImagePanel.add(new JLabel("Liste des Images / personne "), BorderLayout.NORTH);
		directoryImagePanel.add(new JScrollPane(photoList), BorderLayout.CENTER);

		initializeMenu();

		JScrollPane photoScrollPane = new JScrollPane(directoryImagePanel);

		// splite vertivcale liste des patients
		// liste des photois du patient selectioné
//		JSplitPane splitPeoplePhotoPane = new JSplitPane(JSplitPane.VERTICAL_SPLIT, peoplePanel, photoScrollPane);
 
		JPanel splitPeoplePhotoPane = new  JPanel( );
		splitPeoplePhotoPane.add(peoplePanel);
		splitPeoplePhotoPane.add(photoScrollPane);
		splitPeoplePhotoPane.add(initializePeopleTree());
		
		
		JSplitPane splitViewPdf = getsplitPanel();

		JSplitPane dashBoardSplitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, splitPeoplePhotoPane, splitViewPdf);

		frame.add(dashBoardSplitPane, BorderLayout.CENTER);

		frame.setVisible(true);
	}

	/**
	 * MENU CONTEXTUEL
	 * 
	 * @return
	 */
	private JPopupMenu createPhotoListPopupMenu() {
		JPopupMenu popupMenu = new JPopupMenu();

		// Ajoutez les éléments du menu
		JMenuItem modifierHistogrameItem = new JMenuItem("Modifier l'Histograme ");
		JMenuItem modifierRVBItem = new JMenuItem("Modifier couleurs RVB ");
		JMenuItem printPDFPersonItem = new JMenuItem("Print PDF");

		// Ajoutez les éléments du menu
		JMenuItem reloadPersonPhotosItem = new JMenuItem("Reload Photos");
		JMenuItem removePersonItem = new JMenuItem("Remove Item");

		// Ajoutez des actions aux éléments du menu
		reloadPersonPhotosItem.addActionListener(e -> reloadPhotosAction());
		removePersonItem.addActionListener(e -> deletePersonAction());

		// Ajoutez des actions aux éléments du menu
		modifierHistogrameItem.addActionListener(e -> {

			File selectedFile = photoList.getSelectedValue();

			if (selectedFile != null || !photoList.isSelectionEmpty()) {
				try {

					displayImage(selectedFile);

				} finally {
					File selectedDirectory = new File(selectedFile.getParent());

					try {
						loadPhotos(selectedDirectory);
					} catch (IOException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
				}

//					String originalFilePath = selectedFile.getAbsolutePath();
//					String originalFileDir = originalFilePath.substring(0, 
//							originalFilePath.lastIndexOf(File.separato(File.separator));
//					  
			} else {

				// Image non encore modifiée
				JOptionPane.showMessageDialog(null, "Vous devez choisir au moins une photo à modifier",
						"pas de Modification", JOptionPane.INFORMATION_MESSAGE);
			}

		});

		// Ajoutez des actions aux éléments du menu
		modifierRVBItem.addActionListener(e -> {

			File selectedFile = photoList.getSelectedValue();

			if (selectedFile != null || !photoList.isSelectionEmpty()) {
				try {

					try {
						displayImageEQ(selectedFile);
					} catch (IOException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}

					// displayImage(selectedFile);

				} finally {
					File selectedDirectory = new File(selectedFile.getParent());

					try {
						loadPhotos(selectedDirectory);
					} catch (IOException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
				}

//					String originalFilePath = selectedFile.getAbsolutePath();
//					String originalFileDir = originalFilePath.substring(0, 
//							originalFilePath.lastIndexOf(File.separato(File.separator));
//					  
			} else {

				// Image non encore modifiée
				JOptionPane.showMessageDialog(null, "Vous devez choisir au moins une photo à modifier",
						"pas de Modification", JOptionPane.INFORMATION_MESSAGE);
			}

		});

		printPDFPersonItem.addActionListener(e -> printPDF());

		// Ajoutez les éléments au menu contextuel
		popupMenu.add(modifierHistogrameItem);
		popupMenu.add(modifierRVBItem);
		popupMenu.add(reloadPersonPhotosItem);
		popupMenu.add(removePersonItem);

		popupMenu.add(printPDFPersonItem);

		return popupMenu;
	}

	private void deletePersonAction() {

//		JOptionPane.showMessageDialog(null, "Not yet implemented .", "Delete selected Photos",
//				JOptionPane.INFORMATION_MESSAGE);
//		
		List<File> files = photoList.getSelectedValuesList();
		File selectedDirectory = null;

		for (File file : files) {
			selectedDirectory = file.getParentFile();
			file.delete();
		}

		try {
			loadPhotos(selectedDirectory);
		}

		catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

//		int selectedPersonIndex = peopleJList.getSelectedIndex();
//		if (selectedPersonIndex != -1) {
//			Person selectedPerson = peopleListModel.getElementAt(selectedPersonIndex);
//
//			int confirmation = JOptionPane.showConfirmDialog(frame,
//					"Êtes-vous sûr de vouloir supprimer la personne : " + selectedPerson.getNom() + "_"
//							+ selectedPerson.getPrenom() + "?",
//					"Confirmation de suppression", JOptionPane.YES_NO_OPTION);
//
//			if (confirmation == JOptionPane.YES_OPTION) {
//
//				// Supprimez la personne de la liste et de la base de données
//				removePerson(selectedPerson);
//			}
//		}
	}

	private void openConfigEditorUI() {
		// Ouvrez l'IHM de modification de la configuration en passant l'instance de
		// Config
		SwingUtilities.invokeLater(() -> {
			new ConfigEditorUI().setVisible(true);
		});
	}

	boolean controleurDeModifications = false;
	BufferedImage modifiedImage = null;

	/**
	 * Afficher la photo pour la moifier
	 * 
	 * @param file
	 * @throws IOException
	 */
	private void displayImageEQ(File file) throws IOException {
		BufferedImage originalImage = ImageIO.read(file);
		// Redimensionnez l'image à une largeur maximale de 500 pixels
		BufferedImage resizedImage = Thumbnails.of(originalImage).width(500).keepAspectRatio(true).asBufferedImage();
		SwingUtilities.invokeLater(() -> new org.hmd.angio.ihm.HistogramEQRVB(file, resizedImage));

	}

	// Ajoutez une méthode pour afficher l'image complète
	private void displayImage(File file) {

		try {
			BufferedImage originalImage = ImageIO.read(file);

			// Redimensionnez l'image à une largeur maximale de 500 pixels
			BufferedImage resizedImage = Thumbnails.of(originalImage).width(500).keepAspectRatio(true)
					.asBufferedImage();

			// Affichez l'image redimensionnée dans un JLabel
			JFrame imageFrame = new JFrame("Image Viewer");
			imageFrame.setSize(600, 600);
			JLabel imageLabel = new JLabel(new ImageIcon(resizedImage));
			imageFrame.add(imageLabel);

			imageFrame.addWindowListener(new WindowAdapter() {
				@Override
				public void windowClosing(WindowEvent e) {

					if (controleurDeModifications) {
						int result = JOptionPane.showConfirmDialog(null, "Do you want to save changes before closing?",
								"Save Changes", JOptionPane.YES_NO_CANCEL_OPTION);

						if (result == JOptionPane.YES_OPTION) {

							System.out.println("Saving changes.by . local DirectoryManager.saveModifiedCopy.");
							DirectoryManager.saveModifiedCopy(file, modifiedImage /* resizedImage */ );

							File selectedDirectory = file.getParentFile();
							try {
								loadPhotos(selectedDirectory);
							}

							catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}

//							
//	                        // Save changes (replace this with your save logic)
//	                        System.out.println("Saving changes.by . local saveModifiedCopy.");
//	                        saveModifiedCopy(originalFile, equalized);
//	                        
							imageFrame.dispose(); // Close the frame after saving

						} else if (result == JOptionPane.NO_OPTION) {
							imageFrame.dispose(); // Close the frame without saving
						}
						// If the user clicks "Cancel," do nothing and keep the frame open
					} else {
						// No unsaved changes, simply close the frame
						imageFrame.dispose();
					}
				}
			});

			imageFrame.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);

			// Ajoutez des boutons pour les opérations spécifiques
			JPanel buttonPanel = new JPanel();

			JButton modifyHistogramMinusButton = new JButton("Modifier Histogramme -");
			JButton resetButton = new JButton("Reset");
			JButton saveCopyButton = new JButton("Sauvegarder Copie");

			modifyHistogramMinusButton.addActionListener(new ActionListener() {
				@Override
				public void actionPerformed(ActionEvent e) {

//                 		modifiedImage = Thumbnails.of(resizedImage)
//                 				.width(500)
//                 				.keepAspectRatio(true)
//                 				.asBufferedImage();

					modifiedImage = modifyHistogram(resizedImage);
					imageLabel.setIcon(new ImageIcon(modifiedImage));

					controleurDeModifications = true;

				}
			});

			resetButton.addActionListener(new ActionListener() {
				@Override
				public void actionPerformed(ActionEvent e) {
					// Ajoutez ici le code pour réinitialiser l'image
					imageLabel.setIcon(new ImageIcon(resizedImage));
				}
			});

			saveCopyButton.addActionListener(new ActionListener() {
				@Override
				public void actionPerformed(ActionEvent e) {

					// Ajoutez ici le code pour sauvegarder une copie modifiée dans le même
					// répertoire

					if (controleurDeModifications) {

						DirectoryManager.saveModifiedCopy(file, modifiedImage /* resizedImage */ );

						File selectedDirectory = file.getParentFile();
						try {
							loadPhotos(selectedDirectory);
						}

						catch (IOException e1) {
							// TODO Auto-generated catch block
							e1.printStackTrace();
						}

//						catch (PhotoLoadException e1) {
//							// TODO Auto-generated catch block
//							e1.printStackTrace();
//						}						

						controleurDeModifications = false;

					} else {

						// Image non encore modifiée
						JOptionPane.showMessageDialog(null, "Image non modifiée.", "pas de sauvegarde",
								JOptionPane.INFORMATION_MESSAGE);

					}

				}
			});

			// Ajoutez les boutons au panneau
			buttonPanel.add(modifyHistogramMinusButton);
			buttonPanel.add(resetButton);
			buttonPanel.add(saveCopyButton);

			// Ajoutez le panneau de boutons au bas de l'imageFrame
			imageFrame.add(buttonPanel, BorderLayout.SOUTH);

			imageFrame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
			imageFrame.setVisible(true);
		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	private BufferedImage modifyHistogram(BufferedImage originalImage) {
		// Utilisez JAI pour égaliser l'histogramme (exemple simple d'ajustement de
		// contraste)
//        RenderedOp equalizedImage = EqualizeDescriptor.create(PlanarImage.wrapRenderedImage(originalImage), null);
//        return equalizedImage.getAsBufferedImage();

		BufferedImage result = HistogramEQBtn.computeHistogramEQ(originalImage);

		return result;
	}

	/**
	 * 
	 */
	private void initializeMenu() {

		// Création du menu
		JMenuBar menuBar = new JMenuBar();

		// Créez le menu "Personnes"
		JMenu personnesMenu = new JMenu("Personnes");

		// Ajoutez l'élément de menu "Rechercher Personne"
		JMenuItem rechercherPersonneItem = new JMenuItem("Rechercher Personne");
		rechercherPersonneItem.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				updatePeopleList();

				// Ajoutez votre logique de recherche de personne ici
				JOptionPane.showMessageDialog(frame, "Fonctionnalité de recherche de personne à implémenter.");
			}
		});
		personnesMenu.add(rechercherPersonneItem);

		// Ajoutez l'élément de menu "Ajouter Personne"
		JMenuItem ajouterPersonneItem = new JMenuItem("Ajouter Personne");

		PersonInfoEntryTreeUI personInfoEntryUI = new PersonInfoEntryTreeUI(this);

		ajouterPersonneItem.addActionListener(new ActionListener() {

			@Override
			public void actionPerformed(ActionEvent e) {

				// Appel de la classe PersonInfoEntryUI
				SwingUtilities.invokeLater(() -> personInfoEntryUI.setVisible(true));

			}
		});

		personnesMenu.add(ajouterPersonneItem);

		JMenu fileMenu = new JMenu("File");

		// Élément de menu "Choose Directory"
		JMenuItem openConfigButton = new JMenuItem("Modifier Configuration");
		openConfigButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				// Ouvrez l'IHM de modification de la configuration
				openConfigEditorUI();
			}
		});

		// Élément de menu "Choose Directory"
		JMenuItem chooseDirectoryItem = new JMenuItem("Choose Directory");
		chooseDirectoryItem.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				String directory = DirectoryManager.getWorkspaceDirectory();
				File workingDirectory = new File(directory);
				chooseDirectory(workingDirectory);

			}
		});

		// Élément de menu "Create PDF"
		JMenuItem createPdfItem = new JMenuItem("Create PDF");
		createPdfItem.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				try {
					createPDF();

				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}

			}
		});

		// Élément de menu "Print PDF"
		JMenuItem printPdfItem = new JMenuItem("Print PDF");
		printPdfItem.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				printPDF();
			}
		});

		// Élément de menu "Exit"
		JMenuItem exitItem = new JMenuItem("Exit");
		exitItem.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				System.exit(0);
			}
		});

		// Ajout des éléments au menu "File"
		fileMenu.add(openConfigButton);
		fileMenu.addSeparator();
		fileMenu.add(chooseDirectoryItem);
		fileMenu.addSeparator();
		fileMenu.add(createPdfItem);
		fileMenu.addSeparator();
		fileMenu.add(printPdfItem);
		fileMenu.addSeparator();
		fileMenu.add(exitItem);

		// Ajout du menu "File" à la barre de menu
		menuBar.add(fileMenu);

		// Ajoutez le menu "Personnes" à la barre de menu
		menuBar.add(personnesMenu);

		frame.setJMenuBar(menuBar);

	}

	private void chooseDirectory() throws PhotoLoadException, IOException {
		JFileChooser fileChooser = new JFileChooser();
		fileChooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);

		int result = fileChooser.showOpenDialog(frame);

		if (result == JFileChooser.APPROVE_OPTION) {
			selectedDirectory = fileChooser.getSelectedFile();

			loadPhotos(selectedDirectory);

		}
	}

	/**
	 * la fonction vas etre utiliser lors du chargement d repertoire de la personne
	 * pour les test par un bouton de load
	 * 
	 * @param workingDirectory
	 */
	private void chooseDirectory(File workingDirectory) {

		try {
			loadPhotos(workingDirectory);
		}

		catch (/** PhotoLoadException | */
		IOException e) {
//				le chargement par la section directe du repertoire 
			try {
				String message = "Erreur lors du chargement des photos : le répertoire est vide ou inaccessible.";
				// Ajoutez votre logique pour afficher les photos de la personne sélectionnée
				JOptionPane.showMessageDialog(frame, message);
				chooseDirectory();
			} catch (PhotoLoadException | IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}
	}

	public void addPerson(Person person) {
		// Ajoutez la personne à la base de données
		personDAO.saveOrUpdatePerson(person);

		// Ajoutez la personne à la liste
		peopleListModel.addElement(person);

		// Mettez à jour peopleList pour refléter les changements
		peopleJList.updateUI();

		// Affichez le répertoire de photos de la personne dans photoList
		loadPhotosForPerson(person);
	}

	private void loadPhotosForPerson(Person person) {

		// Obtenez le répertoire de la personne
		File personDirectory = new File(DirectoryManager.getPersonWorkspaceDirectory(person));

		// Vérifiez si le répertoire existe
		if (personDirectory.exists() && personDirectory.isDirectory()) {
			// Chargez les photos du répertoire dans photoList
			listModel.clear();

			File[] files = personDirectory.listFiles();
			if (files != null) {
				for (File file : files) {
					if (isImageFile(file)) {
						listModel.addElement(file);
					}
				}
			}
		} else {
			JOptionPane.showMessageDialog(frame, "Le répertoire de photos de la personne n'existe pas.",
					"Avertissement", JOptionPane.WARNING_MESSAGE);
		}
	}

	public JSplitPane getsplitPanel() {

		// initializeComponents();

		xMarginSlider.setMajorTickSpacing(10);
		xMarginSlider.setMinorTickSpacing(1);
		xMarginSlider.setPaintTicks(true);
		xMarginSlider.setPaintLabels(true);

		yMarginSlider.setMajorTickSpacing(10);
		yMarginSlider.setMinorTickSpacing(1);
		yMarginSlider.setPaintTicks(true);
		yMarginSlider.setPaintLabels(true);

///**		pdfPanel = new JPanel();

		JPanel optionsPanel = new JPanel(new GridLayout(8, 2)); // Ajout d'une rangée pour le nombre de pages
		optionsPanel.add(new JLabel("Orientation de la page:"));
		optionsPanel.add(orientationComboBox);
		optionsPanel.add(new JLabel("Taille des photos:"));
		optionsPanel.add(widthByPhotosSizeComboBox);
		optionsPanel.add(new JLabel("Nombre de photos par ligne:"));
		optionsPanel.add(photosPerLineComboBox);
		optionsPanel.add(new JLabel("Format de page :"));
		optionsPanel.add(rectangleComboBox); // Nouveau ajout
		optionsPanel.add(new JLabel("Marge supérieure:"));
		optionsPanel.add(yMarginSlider);
		optionsPanel.add(new JLabel("Marge latérale:"));
		optionsPanel.add(xMarginSlider);

		rectangleComboBox.setSelectedItem(PDRectangleEnum.A5);
 		pageCountSpinner.setValue(5);
		orientationComboBox.setSelectedIndex(1);
		
		photosPerLineComboBox.setSelectedIndex(2);
		widthByPhotosSizeComboBox.setSelectedIndex(0);
		
 		xMarginSlider.setValue(10);
 		yMarginSlider.setValue(10);
 		sideMarginSlider.setValue(5);
		
		
		
		
//		optionsPanel.add(new JLabel("Nombre de pages:")); // Nouveau ajout
//		optionsPanel.add(pageCountSpinner); // Nouveau ajout

//			optionsPanel.add(new JLabel(""));
//			optionsPanel.add(generatePDFButton);
//			optionsPanel.add(new JLabel(""));
//			optionsPanel.add(printePDFButton);

		JPanel panelOptionsView = new JPanel();

		panelOptionsView.add(generatePDFButton);
		panelOptionsView.add(showPDFButton);
		panelOptionsView.add(printePDFButton);

		

		previewPDFPanel = new JPanel();
		previewPDFPanel.setLayout(new GridLayout(0, 1));
		JScrollPane previewScrollPane = new JScrollPane(previewPDFPanel);
		previewScrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
		previewScrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);

		JSplitPane splitTextArea = new JSplitPane(JSplitPane.VERTICAL_SPLIT, panelOptionsView, previewScrollPane);
		

		JSplitPane splitViewOptions = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, optionsPanel, splitTextArea);
 

		if (pdfPanel == null) {
			pdfPanel = new JPanel();
		}
		pdfPanel.setBorder(BorderFactory.createLineBorder(Color.BLACK));
		pdfPanel.setPreferredSize(new Dimension(400, 400));
		pdfPanel.setLayout(new BorderLayout());
		pdfPanel.setLayout(new GridLayout(0, 1));

		 

		JScrollPane pdfScrollPane = new JScrollPane(pdfPanel);
		pdfScrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
		pdfScrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);

		// pdfScrollPane.setAutoscrolls(true);

		JSplitPane splitViewPdf = new JSplitPane(JSplitPane.VERTICAL_SPLIT, splitViewOptions, pdfScrollPane);

//			add(optionsPanel, BorderLayout.NORTH);
//			add(pdfScrollPane, BorderLayout.CENTER);

		generatePDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				Person selectedPerson = peopleJList.getSelectedValue();
				if (selectedPerson != null) {
					boolean pdfGenerated = generatePDF(selectedPerson);
					try {
						if (pdfGenerated) {
							isPDFGenerated = true;
							showPDFButton.setEnabled(true);
							printePDFButton.setEnabled(true);
						}

					} finally {
						if (pdfGenerated) {
							String  generatedPDFFile = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);

							
							//premier viewer 
							displayPDF(generatedPDFFile, pdfPanel);
							// Add zoom functionality
							pdfPanel.addMouseWheelListener(new ZoomHandler(generatedPDFFile, pdfPanel));
							pdfPanel.addMouseListener(new ContextMenuMouseListener(generatedPDFFile, pdfPanel));
							
							
							//premier viewer
							displayPDF(generatedPDFFile, previewPDFPanel);
							// Add zoom functionality
							previewPDFPanel.addMouseWheelListener(new ZoomHandler(generatedPDFFile, previewPDFPanel));
							previewPDFPanel.addMouseListener(new ContextMenuMouseListener(generatedPDFFile, previewPDFPanel));
						}

					}
				} else {

				}

			}
		});

		showPDFButton.setEnabled(false);
		printePDFButton.setEnabled(false);
		showPDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				if (isPDFGenerated) {
					Person selectedPerson = peopleJList.getSelectedValue();
					String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);
					PDFCreator.openBrowseFile(pdfFilePath);
				}

			}
		});

		printePDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				Person selectedPerson = peopleJList.getSelectedValue();

				try {
					generatePDF(selectedPerson);

				} finally {
					String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);
					File pdfFilePerson = new File(pdfFilePath);

					PDFCreator.printPDF(pdfFilePerson);
				}

			}
		});

		return splitViewPdf;
	}

	/***
	 * 
	 * @param selectedPerson
	 * @return
	 */
	private boolean generatePDF(Person selectedPerson) {

		if (selectedPerson == null) {

			// Image non encore modifiée
			JOptionPane.showMessageDialog(null,
					"Vous devez choisir une personne en suite selectionner les photos à mofifier\n"
							+ " (au moins une photo à modifier)",
					"pas de Modification", JOptionPane.INFORMATION_MESSAGE);
			return false;
		} else {

			if (!photoList.isSelectionEmpty()) {

				String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);
				File pdfFilePerson = new File(pdfFilePath);
				// Ajoutez trois photos à partir de la liste listPhots
				List<File> listPhotos = photoList.getSelectedValuesList();

				try {
					if (pdfFilePerson.exists()) {
						pdfFilePerson.delete();
					}
				} finally {

					try {
						if (pdfFilePerson.createNewFile()) {

							PDFCreator.createPdf(

									orientationComboBox.getSelectedItem().equals("Portrait"),

									(int) widthByPhotosSizeComboBox.getSelectedItem(),
									(int) widthByPhotosSizeComboBox.getSelectedItem(),

									(int) photosPerLineComboBox.getSelectedItem(),
									(int) photosPerLineComboBox.getSelectedItem(),

									xMarginSlider.getValue(), yMarginSlider.getValue(),
									(PDRectangleEnum) rectangleComboBox.getSelectedItem(), listPhotos,
									pdfFilePerson.getAbsolutePath(), selectedPerson);

						}
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}

				}

//		if (pdfFilePerson != null
//				&& (!pdfFilePerson.getName().toLowerCase().endsWith(".pdf") && pdfFilePerson.exists())) {
//
//			pdfFilePerson.delete();
//		}else {
//			return;
//		}
// 
//		try {
//			if (pdfFilePerson.createNewFile()) {
//
//				PhotoPDFCreator.createPdf(
//
//						orientationComboBox.getSelectedItem().equals("Portrait"),
//
//						(int) widthByPhotosSizeComboBox.getSelectedItem(),
//						(int) widthByPhotosSizeComboBox.getSelectedItem(),
//
//						(int) photosPerLineComboBox.getSelectedItem(), 
//						(int) photosPerLineComboBox.getSelectedItem(),
//
//						topMarginSlider.getValue(), 
//						(PDRectangleEnum) rectangleComboBox.getSelectedItem(), 
//						listPhotos,
//						pdfFilePerson.getAbsolutePath());
//
//			}
//		} catch (IOException e) {
//
//			e.printStackTrace();
//		}

				/**
				 * @todo displayPDF
				 */
//				displayPDF(pdfFilePath, pdfPanel);//
//				pdfPanel.addMouseWheelListener(new ZoomHandler(pdfFilePath, pdfPanel));
//				pdfPanel.addMouseListener(new ContextMenuMouseListener(pdfFilePath, pdfPanel));
				
				
				return true;
			} else {
				// Image non encore modifiée
				JOptionPane.showMessageDialog(null, "Vous devez choisir au moins une photo à modifier",
						"pas de Modification", JOptionPane.INFORMATION_MESSAGE);
				return false;
			}

		}

	}

 
	public void displayPDF(String filePath, JPanel pdfPanel) {

		
		if(filePath != null) {
		File pdfToDisplay = new File(filePath);

		if (pdfToDisplay.exists()) {
			pdfPanel.removeAll();

			try (PDDocument document = PDDocument.load(pdfToDisplay)) {
				PDFRenderer pdfRenderer = new PDFRenderer(document);

				for (int pageIndex = 0; pageIndex < document.getNumberOfPages(); pageIndex++) {
					BufferedImage image = pdfRenderer.renderImageWithDPI(pageIndex, 100);

					// Calculate scaled dimensions based on zoom factor
					int scaledWidth = (int) (image.getWidth() * zoomFactor);
					int scaledHeight = (int) (image.getHeight() * zoomFactor);

					Image scaledImage = image.getScaledInstance(scaledWidth, scaledHeight, Image.SCALE_SMOOTH);
					JLabel label = new JLabel(new ImageIcon(scaledImage));
					pdfPanel.add(label);
				}

			} catch (IOException e) {
				e.printStackTrace();
			}

			pdfPanel.revalidate();
			pdfPanel.repaint();
		}
			
		}
		
		
		
	}

	private class ZoomHandler  implements MouseWheelListener  {
		private JPanel panel;
		private String _pdfFile;

		public ZoomHandler(String pdfFile, JPanel panel) {
			this.panel = panel;
			this._pdfFile = pdfFile;

		}
 
		
		
		@Override
		public void mouseWheelMoved(MouseWheelEvent e) {
			if (e.getWheelRotation() < 0) {
				// Zoom in
				zoomFactor *= 1.1;
			} else {
				// Zoom out
				zoomFactor /= 1.1;
			}
//		       displayPDF("C:\\Users\\DELL\\Documents\\0APng\\19_madani_khallil\\19_madani.pdf",panel);
			   displayPDF(_pdfFile,panel);
		}
 
	}

	
	
	private class ContextMenuMouseListener extends MouseAdapter {
		private JPanel panel;
		private String _pdfFile;

		public ContextMenuMouseListener(String pdfFile, JPanel panel) {
			this.panel = panel;
			this._pdfFile = pdfFile;

		}
		
        @Override
        public void mousePressed(MouseEvent e) {
            showPopupMenu(e);
        }

        @Override
        public void mouseReleased(MouseEvent e) {
            showPopupMenu(e);
        }

        private void showPopupMenu(MouseEvent e) {
            if (e.isPopupTrigger()) {
                JPopupMenu popupMenu = createPopupMenu();
                popupMenu.show(e.getComponent(), e.getX(), e.getY());
            }
        }

        private JPopupMenu createPopupMenu() {
            JPopupMenu popupMenu = new JPopupMenu();

            JMenuItem zoomInItem = new JMenuItem("Zoom In");
            JMenuItem zoomOutItem = new JMenuItem("Zoom Out");
            JMenuItem nextPageItem = new JMenuItem("Next Page");
            JMenuItem prevPageItem = new JMenuItem("Previous Page");

            JMenuItem openItem = new JMenuItem("Open File");
            JMenuItem printItem = new JMenuItem("Print Page");
            

            zoomInItem.addActionListener(e -> {
                zoomFactor *= 1.1;
                displayPDF(_pdfFile,panel);
            });

            zoomOutItem.addActionListener(e -> {
                zoomFactor /= 1.1;
                displayPDF(_pdfFile,panel);
            });

            nextPageItem.addActionListener(e -> {
                if (currentPage < pdfPanel.getComponentCount() - 1) {
                    currentPage++;
                    pdfPanel.scrollRectToVisible(pdfPanel.getComponent(currentPage).getBounds());
                }
            });

            prevPageItem.addActionListener(e -> {
                if (currentPage > 0) {
                    currentPage--;
                    pdfPanel.scrollRectToVisible(pdfPanel.getComponent(currentPage).getBounds());
                }
            });

            printItem.addActionListener(e -> {
              
            	File pdfFilePerson = new File(_pdfFile); 
    			PDFCreator.printPDF(pdfFilePerson);
                
            });
            
            openItem.addActionListener(e -> {
                 
      			DirectoryManager.browseDirectory(_pdfFile);
                  
              });
            
            popupMenu.add(zoomInItem);
            popupMenu.add(zoomOutItem);
            popupMenu.addSeparator();
            popupMenu.add(nextPageItem);
            popupMenu.add(prevPageItem);
            popupMenu.addSeparator();
            popupMenu.add(openItem);
            popupMenu.add(printItem);

            return popupMenu;
        }
    }
	
	
	///////////////////////////// -----------------------------------------------------------/*//////////////
	private JTree tree;
	private DefaultTreeModel treeModel;
	private JTree peopleTree;

	private JScrollPane initializePeopleTree() {
		// Initialisation de la frame et d'autres composants

		// Créez la racine du tree
		DefaultMutableTreeNode root = new DefaultMutableTreeNode("Root");

		// Créez le modèle de l'arbre avec la racine
		treeModel = new DefaultTreeModel(root);

		// Créez le JTree avec le modèle
		peopleTree = new JTree(treeModel);

		// Ajoutez le JTree à un JScrollPane et à la frame
		JScrollPane treeScrollPane = new JScrollPane(peopleTree);
//		frame.add(treeScrollPane, BorderLayout.WEST);

		
//	    String dDate="Sat Apr 11 12:16:44 IST 2015"; 
//	    SimpleDateFormat df = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
//	    Date cDate = df.parse(dDate); 
		
		
		Person perso = new Person("John", "Doe", new Date());
		// Exemple pour ajouter une personne et une photo
		addPersonForTree(perso);
		// addPhoto(perso, DirectoryManager.getPersonWorkspaceDirectory(perso));

		
		 List<Person> people = personDAO.findAll();	
	        
	        for (Person person : people) {
				
	       	 PhotoDirectoryUtils.createPhotoTree(root, person) ; 
			}
	      
		// Rafraîchissez le modèle du JTree
		treeModel.reload();
//	        // Affichez la frame
//	        frame.setVisible(true);
		
		
		
		JTree tree=   new JTree(new DefaultTreeModel(root));
		
		 treeScrollPane = new JScrollPane(tree);
		return treeScrollPane;
	}

	private void addPersonForTree(Person perso) {
		DefaultMutableTreeNode personNode = new DefaultMutableTreeNode(perso.getNom() + " " + perso.getPrenom());

		treeModel.insertNodeInto(personNode, (DefaultMutableTreeNode) treeModel.getRoot(),
				treeModel.getChildCount(treeModel.getRoot()));
		// Ajoutez les détails de la personne, par exemple, date de naissance, à
		// personNode

	}

	private void addPhoto(Person perso, String photoDate, String photoPath) {
		DefaultMutableTreeNode root = (DefaultMutableTreeNode) treeModel.getRoot();

		// Recherchez le nœud de la personne correspondante
		DefaultMutableTreeNode personNode = findNode(root, perso.getNom() + " " + perso.getPrenom());

		if (personNode != null) {
			DefaultMutableTreeNode photoNode = new DefaultMutableTreeNode("Photo: " + photoDate);
			treeModel.insertNodeInto(photoNode, personNode, treeModel.getChildCount(personNode));
			// Ajoutez les détails de la photo, par exemple, chemin de la photo, à photoNode

		}
	}

	private DefaultMutableTreeNode findNode(DefaultMutableTreeNode root, String nodeName) {
		for (int i = 0; i < root.getChildCount(); i++) {
			DefaultMutableTreeNode child = (DefaultMutableTreeNode) root.getChildAt(i);
			if (nodeName.equals(child.getUserObject().toString())) {
				return child;
			}
		}
		return null;
	}

	// ... Autres parties de votre code ...

	private JScrollPane  initializeJTree() {
		// ... Autres parties de votre code ...

		
		
		personDAO = new PersonDAO();
		List<Person> people = personDAO.findAll();		
		DefaultMutableTreeNode toDay = new DefaultMutableTreeNode("Today");
        DefaultMutableTreeNode root = new DefaultMutableTreeNode("Workspace");
	        
        // Ajoutez la liste de photos (arborescence) à votre interface utilisateur
		tree = new JTree(new DefaultTreeModel(toDay));
		
        for (Person person : people) {
			
        	 PhotoDirectoryUtils.createPhotoTree(toDay, person) ; 
		}
		// Ajoutez la liste de photos (arborescence) à votre interface utilisateur
		
		
		 
       
		
		
		tree.setRootVisible(false); // Masquer la racine de l'arborescence
		tree.addTreeSelectionListener(new TreeSelectionListener() {
			@Override
			public void valueChanged(TreeSelectionEvent e) {
				DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) tree.getLastSelectedPathComponent();

				if (selectedNode != null && selectedNode.getUserObject() instanceof File) {
					File selectedFile = (File) selectedNode.getUserObject();
					// Ajoutez votre logique pour afficher les photos du répertoire sélectionné
					loadPhotosJTree(selectedFile);
				}

			}
		});

		JScrollPane treeScrollPane = new JScrollPane(tree);
		treeScrollPane.setPreferredSize(new Dimension(200, 400));

		
		
		return treeScrollPane;
		
		// ... Autres parties de votre code ...
	}

	private void loadPhotosJTree(File directory) {
		listModel.clear();

		File[] files = directory.listFiles();
		if (files != null) {
			for (File file : files) {
				if (isImageFile(file)) {
					listModel.addElement(file);
				}
			}
		}

//	        loadPhotos( directory);

	}

	private void updateTree(File directory) {
		DefaultMutableTreeNode rootNode = createTreeNode(directory);
		DefaultTreeModel treeModel = new DefaultTreeModel(rootNode);
		tree.setModel(treeModel);
	}

	private DefaultMutableTreeNode createTreeNode(File directory) {
		DefaultMutableTreeNode rootNode = new DefaultMutableTreeNode(directory.getName());
		File[] files = directory.listFiles();
		if (files != null) {
			for (File file : files) {
				if (file.isDirectory()) {
					rootNode.add(createTreeNode(file));
				}
			}
		}
		return rootNode;
	}

	/**
	 * 
	 * @param directory
	 * @throws PhotoLoadException
	 * @throws IOException
	 */
	private void loadPhotos(File directory) throws IOException {

		if (directory != null) {
			listModel.clear();
			File[] files = directory.listFiles();
			if (files != null) {
				for (File file : files) {
					if (isImageFile(file)) {
						listModel.addElement(file);
						// Mettez à jour peopleList pour refléter les changements
						photoList.updateUI();
					}
				}
			}

//		else {
//			String message = "Erreur lors du chargement des photos : le répertoire est vide ou inaccessible.";
//
//			throw new PhotoLoadException(message);
//		}
		}

	}

	private boolean isImageFile(File file) {
		String extension = file.getName().toLowerCase();
		return extension.endsWith(".jpg") || extension.endsWith(".jpeg") || extension.endsWith(".png");
	}

	/**
	 * 
	 * @param photoFiles
	 * @return
	 */
	public List<List<File>> organizeSortPhotos(List<File> photoFiles) {
		// Implement your organization logic here
		// This is a simple example that divides the photos into groups of 4

		// Sort photos by dateTaken
		Collections.sort(photoFiles, Comparator.comparing(File::lastModified));

		return photoFiles.stream().collect(Collectors.groupingBy(it -> it, Collectors.toList())).values().stream()
				.collect(Collectors.toList());
	}

	public void createPDF() throws IOException {

		Person selectedPerson = peopleJList.getSelectedValue();
		if (selectedPerson != null) {

//File selectedFile = photoList.getSelectedValue(); 

			if (/* selectedFile != null && */ !photoList.isSelectionEmpty()) {

				String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);
				File pdfFilePerson = new File(pdfFilePath);

				if (!pdfFilePerson.getName().toLowerCase().endsWith(".pdf")) {
					pdfFilePerson = new File(pdfFilePerson.getAbsolutePath() + ".pdf");
				}

				// Ajoutez trois photos à partir de la liste listPhots
				List<File> listPhotos = photoList.getSelectedValuesList();

 
				pdfGenerationGUI.updateData(pdfFilePerson.getAbsolutePath(), listPhotos);

				// Refresh the PDF display panel 
			} else {
				// Image non encore modifiée
				JOptionPane.showMessageDialog(null, "Vous devez choisir au moins une photo à modifier",
						"pas de Modification", JOptionPane.INFORMATION_MESSAGE);

			}

		} else {

			// Image non encore modifiée
			JOptionPane.showMessageDialog(null,
					"Vous devez choisir une personne en suite selectionner les photos à mofifier\n"
							+ " (au moins une photo à modifier)",
					"pas de Modification", JOptionPane.INFORMATION_MESSAGE);

		}

	}

	/**
	 * 
	 */
	public void printPDF() {

		Person selectedPerson = peopleJList.getSelectedValue();

		if (selectedPerson == null) {

			// Image non encore modifiée
			JOptionPane.showMessageDialog(null,
					"Vous devez choisir une personne ensuite selectionner les photos à mofifier\n"
							+ " (au moins une photo à modifier)",
					"pas de Modification", JOptionPane.INFORMATION_MESSAGE);
			return;
		}

		File selectedFile = photoList.getSelectedValue();

		if (selectedFile != null || !photoList.isSelectionEmpty()) {

			String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);
			File pdfFilePerson = new File(pdfFilePath);

			PDFCreator.printPDF(pdfFilePerson);

		} else {
			// Image non encore modifiée
			JOptionPane.showMessageDialog(null, "Vous devez choisir au moins une photo à modifier",
					"pas de Modification", JOptionPane.INFORMATION_MESSAGE);

		}

	}

	 
}
