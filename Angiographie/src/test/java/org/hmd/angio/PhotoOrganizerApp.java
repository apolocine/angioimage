package org.hmd.angio;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
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
import org.hmd.angio.dto.Person;
import org.hmd.angio.dto.PersonDAO;
import org.hmd.angio.enuma.PDRectangleEnum;
import org.hmd.angio.exception.PhotoLoadException;
import org.hmd.angio.ihm.ConfigEditorUI;
import org.hmd.angio.ihm.HistogramEQ;
import org.hmd.angio.ihm.PersonInfoEntryUI;
import org.hmd.angio.pdf.PDFGenerationGUI;
import org.hmd.angio.pdf.PhotoPDFCreator;
import org.hmd.image.ouils.DirectoryManager;
import org.hmd.image.ouils.ThumbnailRenderer;

import net.coobird.thumbnailator.Thumbnails;

public class PhotoOrganizerApp {

	private PersonDAO personDAO; // Ajouter l'instance de PersonDAO

	// Modifiez le type de peopleList
	private DefaultListModel<Person> peopleListModel;
	private JList<Person> peopleJList;

	private File selectedDirectory;
	private JFrame frame;
	private JList<File> photoList;
	private DefaultListModel<File> listModel;

	private JPanel pdfPanel;
	private JScrollPane pdfScrollPane;

	/**
	 * PDF generator IHM
	 */
	JComboBox<String> orientationComboBox = new JComboBox<>(new String[] { "Portrait", "Paysage" });
	JComboBox<Integer> photosPerLineComboBox = new JComboBox<>(new Integer[] { 1, 2, 3, 4, 5, 6, 8, 9, 10 });
	JComboBox<Integer> widthByPhotosSizeComboBox = new JComboBox<>(new Integer[] { 150, 200, 300, 400, 500 });

	JSlider xMarginSlider = new JSlider(JSlider.HORIZONTAL, 0, 100, 50);

	JSlider yMarginSlider = new JSlider(JSlider.HORIZONTAL, 0, 100, 50);

	JSlider sideMarginSlider = new JSlider(0, 100, 10);
	JSpinner pageCountSpinner = new JSpinner(new SpinnerNumberModel(1, 1, 10, 1)); // Nouveau ajout
	JButton generatePDFButton = new JButton("Générer PDF");
	JButton printePDFButton = new JButton("Print  PDF");

	JComboBox<PDRectangleEnum> rectangleComboBox = new JComboBox<>(PDRectangleEnum.values());

	private PDFGenerationGUI pdfGenerationGUI = new PDFGenerationGUI();

	public static void main(String[] args) {
		SwingUtilities.invokeLater(() -> {
			try {
				UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
			} catch (Exception e) {
				e.printStackTrace();
			}
			new PhotoOrganizerApp();
		});
	}

	public PhotoOrganizerApp() {
		initPeopleListe();
		initialize();

		// initializeJTree() ;
		// initializePeopleTree();

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

		// Ajoutez des actions aux éléments du menu
		reloadPersonPhotosItem.addActionListener(e -> reloadPhotosAction());
		removePersonItem.addActionListener(e -> removePersonAction());

		// Ajoutez les éléments au menu contextuel
		popupMenu.add(reloadPersonPhotosItem);
		popupMenu.add(removePersonItem);

		return popupMenu;
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
			} catch (PhotoLoadException e) {

				JOptionPane.showMessageDialog(frame,
						"le répertoire est vide ou inaccessible de \n" + selectedPerson.getNom() + "_"
								+ selectedPerson.getPrenom(),
						"Echèque recharge des Photos   ", JOptionPane.INFORMATION_MESSAGE);

			} catch (IOException e) {
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

		// Ajoutez un bouton pour afficher les photos de la personne sélectionnée
		JButton showPhotosButton = new JButton("Afficher les Photos");
		showPhotosButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				displayPhotosForPerson();

			}
		});
		peoplePanel.add(showPhotosButton, BorderLayout.SOUTH);

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
							displayImageEQ(selectedFile);
						} catch (IOException e1) {
							// TODO Auto-generated catch block
							e1.printStackTrace();
						}
						
//						String originalFilePath = selectedFile.getAbsolutePath();
//						String originalFileDir = originalFilePath.substring(0, 
//								originalFilePath.lastIndexOf(File.separato(File.separator));
//						 
								
								
						try {
							
							loadPhotos(selectedFile);
						} catch (PhotoLoadException e1) {
							// TODO Auto-generated catch block
							e1.printStackTrace();
						} catch (IOException e1) {
							// TODO Auto-generated catch block
							e1.printStackTrace();
						}
					}
				}

			}

		});

		JPanel directoryImagePanel = new JPanel(new BorderLayout());
		directoryImagePanel.add(new JLabel("Liste des Images / personne "), BorderLayout.NORTH);
		directoryImagePanel.add(new JScrollPane(photoList), BorderLayout.CENTER);

		initializeMenu();

		pdfPanel = new JPanel();
		pdfScrollPane = new JScrollPane(pdfPanel);

		JScrollPane photoScrollPane = new JScrollPane(directoryImagePanel);

		// splite vertivcale liste des patients
		// liste des photois du patient selectioné
		JSplitPane splitPeoplePhotoPane = new JSplitPane(JSplitPane.VERTICAL_SPLIT, peoplePanel, photoScrollPane);

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
		JMenuItem reloadPersonPhotosItem = new JMenuItem("Create PDF ");
		JMenuItem removePersonItem = new JMenuItem("Print PDF");

		// Ajoutez des actions aux éléments du menu
		reloadPersonPhotosItem.addActionListener(e -> {
			try {
				createPDF();
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		});
		removePersonItem.addActionListener(e -> printPDF());

		// Ajoutez les éléments au menu contextuel
		popupMenu.add(reloadPersonPhotosItem);
		popupMenu.add(removePersonItem);

		return popupMenu;
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
	 * @param file
	 * @throws IOException
	 */
	private void displayImageEQ(File file) throws IOException {
		BufferedImage originalImage = ImageIO.read(file);

		// Redimensionnez l'image à une largeur maximale de 500 pixels
		BufferedImage resizedImage = Thumbnails.of(originalImage).width(500).keepAspectRatio(true).asBufferedImage();

		SwingUtilities.invokeLater(() -> new org.hmd.image.ouils.HistogramEQRVB(file, resizedImage));
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

			// Ajoutez des boutons pour les opérations spécifiques
			JPanel buttonPanel = new JPanel();

			JButton modifyHistogramMinusButton = new JButton("Modifier Histogramme -");
			JButton resetButton = new JButton("Reset");
			JButton saveCopyButton = new JButton("Sauvegarder Copie");

			modifyHistogramMinusButton.addActionListener(new ActionListener() {
				@Override
				public void actionPerformed(ActionEvent e) {
					// Ajoutez ici le code pour modifier l'histogramme en moins
					// Ajoutez ici le code pour modifier l'histogramme
					// modifier avec histograme

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
						} catch (PhotoLoadException e1) {
							// TODO Auto-generated catch block
							e1.printStackTrace();
						} catch (IOException e1) {
							// TODO Auto-generated catch block
							e1.printStackTrace();
						}
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

		BufferedImage result = HistogramEQ.computeHistogramEQ(originalImage);

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

		PersonInfoEntryUI personInfoEntryUI = new PersonInfoEntryUI(this);

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
		} catch (PhotoLoadException | IOException e) {
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

		pdfPanel = new JPanel();

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

//		optionsPanel.add(new JLabel("Nombre de pages:")); // Nouveau ajout
//		optionsPanel.add(pageCountSpinner); // Nouveau ajout

//			optionsPanel.add(new JLabel(""));
//			optionsPanel.add(generatePDFButton);
//			optionsPanel.add(new JLabel(""));
//			optionsPanel.add(printePDFButton);

		JPanel panelOptionsView = new JPanel();

		panelOptionsView.add(generatePDFButton);
		panelOptionsView.add(printePDFButton);

		JTextArea previewTextArea = new JTextArea();

		JSplitPane splitTextArea = new JSplitPane(JSplitPane.VERTICAL_SPLIT, panelOptionsView, previewTextArea);

		JSplitPane splitViewOptions = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, optionsPanel, splitTextArea);

		// JSplitPane splitViewOptions = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT,
		// optionsPanel, splitTextArea);

		pdfPanel = new JPanel(); // Nouveau ajout
		pdfPanel.setBorder(BorderFactory.createLineBorder(Color.BLACK));
		pdfPanel.setPreferredSize(new Dimension(400, 400));
		pdfPanel.setLayout(new BorderLayout());

		pdfScrollPane = new JScrollPane(pdfPanel);
		pdfScrollPane.setAutoscrolls(true);

		JSplitPane splitViewPdf = new JSplitPane(JSplitPane.VERTICAL_SPLIT, splitViewOptions, pdfScrollPane);

//			add(optionsPanel, BorderLayout.NORTH);
//			add(pdfScrollPane, BorderLayout.CENTER);

		generatePDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				Person selectedPerson = peopleJList.getSelectedValue();
				if (selectedPerson != null) {

					try {
						generatePDF(selectedPerson);
					} finally {

						String pdfAbsoluteFileName = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);

						displayPDF(pdfAbsoluteFileName, pdfPanel);

					}
				} else {

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

					PhotoPDFCreator.printPDF(pdfFilePerson);
				}

			}
		});

		return splitViewPdf;
	}

	private void generatePDF(Person selectedPerson) {

		if (selectedPerson == null) {
			return;
		}

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

					PhotoPDFCreator.createPdf(

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

		displayPDF(pdfFilePath, pdfPanel);
	}

	/**
	 * 
	 * @param filePath
	 * @param pdfPanel_
	 */
	public void displayPDF(String filePath, JPanel pdfPanel_) {

		File pdfToDysplaynew = new File(filePath);

		if (pdfToDysplaynew.exists()) {

			pdfPanel_.removeAll();

			PDDocument document = null;
			try {
				document = PDDocument.load(pdfToDysplaynew);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			PDFRenderer pdfRenderer = new PDFRenderer(document);

			for (int pageIndex = 0; pageIndex < document.getNumberOfPages(); pageIndex++) {
				BufferedImage image = null;
				try {
					image = pdfRenderer.renderImageWithDPI(pageIndex, 100);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				JLabel label = new JLabel(new ImageIcon(image));
				pdfPanel_.add(label);
			}

			try {
				document.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			pdfPanel_.setLayout(new GridLayout(0, 1));
			pdfPanel_.revalidate();
			pdfPanel_.repaint();

			pdfPanel.revalidate();
			pdfPanel.repaint();
		}

	}

	///////////////////////////// -----------------------------------------------------------/*//////////////
	private JTree tree;
	private DefaultTreeModel treeModel;
	private JTree peopleTree;

	private void initializePeopleTree() {
		// Initialisation de la frame et d'autres composants

		// Créez la racine du tree
		DefaultMutableTreeNode root = new DefaultMutableTreeNode("Root");

		// Créez le modèle de l'arbre avec la racine
		treeModel = new DefaultTreeModel(root);

		// Créez le JTree avec le modèle
		peopleTree = new JTree(treeModel);

		// Ajoutez le JTree à un JScrollPane et à la frame
		JScrollPane treeScrollPane = new JScrollPane(peopleTree);
		frame.add(treeScrollPane, BorderLayout.WEST);

		Person perso = new Person("John", "Doe", new Date("2022-12-01"));
		// Exemple pour ajouter une personne et une photo
		addPersonForTree(perso);
		// addPhoto(perso, DirectoryManager.getPersonWorkspaceDirectory(perso));

		// Rafraîchissez le modèle du JTree
		treeModel.reload();
//	        // Affichez la frame
//	        frame.setVisible(true);
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

	private void initializeJTree() {
		// ... Autres parties de votre code ...

		// Ajoutez la liste de photos (arborescence) à votre interface utilisateur
		tree = new JTree();
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

		// Ajoutez le JScrollPane de l'arborescence à votre interface utilisateur
		frame.add(treeScrollPane, BorderLayout.WEST);

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
	private void loadPhotos(File directory) throws PhotoLoadException, IOException {
		listModel.clear();

		File[] files = directory.listFiles();
		if (files != null) {
			for (File file : files) {
				if (isImageFile(file)) {
					listModel.addElement(file);
				}
			}
		} else {
			String message = "Erreur lors du chargement des photos : le répertoire est vide ou inaccessible.";

			throw new PhotoLoadException(message);
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
		if (selectedPerson == null) {
			return;
		}

		String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);
		File pdfFilePerson = new File(pdfFilePath);

		if (!pdfFilePerson.getName().toLowerCase().endsWith(".pdf")) {
			pdfFilePerson = new File(pdfFilePerson.getAbsolutePath() + ".pdf");
		}

		// Ajoutez trois photos à partir de la liste listPhots
		List<File> listPhotos = photoList.getSelectedValuesList();

//		PDFGenerationGUI pdfGenerationGUI = new PDFGenerationGUI(pdfFilePerson.getAbsolutePath(), listPhotos);
//		// Appel de la classe PersonInfoEntryUI
//		SwingUtilities.invokeLater(() -> pdfGenerationGUI.setVisible(true));
//		
		pdfGenerationGUI.updateData(pdfFilePerson.getAbsolutePath(), listPhotos);

// Refresh the PDF display panel
//		displayPDF(pdfFilePerson);

	}

	/**
	 * 
	 */
	public void printPDF() {

		Person selectedPerson = peopleJList.getSelectedValue();
		if (selectedPerson == null) {
			return;
		}

		String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(selectedPerson);
		File pdfFilePerson = new File(pdfFilePath);

		PhotoPDFCreator.printPDF(pdfFilePerson);
	}

	/***
	 * 
	 */

	/**
	 * 
	 * @param pdfFile
	 */
//	private void displayPDF(File pdfFile) {
//
//		try {
//			PDDocument document = PDDocument.load(pdfFile);
//
//			PDPageTree pages = document.getPages();
//			pdfPanel.removeAll();
//
//			for (PDPage page : pages) {
//				PDResources resources = page.getResources();
//				Iterable<COSName> xObjectNames = resources.getXObjectNames();
//
//				for (COSName cosName : xObjectNames) {
//					PDImageXObject image = (PDImageXObject) resources.getXObject(cosName);
//					JLabel imageLabel = new JLabel(new ImageIcon(image.getImage()));
//					pdfPanel.add(imageLabel);
//				}
//			}
//
//			pdfPanel.revalidate();
//			pdfPanel.repaint();
//
//			pdfScrollPane.setViewportView(pdfPanel);
//			document.close(); // Close the document after loading the images
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
//
//	}

}
