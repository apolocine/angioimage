package org.hmd.angio;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Desktop;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;
import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.DefaultComboBoxModel;
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
import javax.swing.JTextPane;
import javax.swing.JToolBar;
import javax.swing.JTree;
import javax.swing.SpinnerNumberModel;
import javax.swing.SwingUtilities;
import javax.swing.SwingWorker;
import javax.swing.UIManager;
import javax.swing.event.HyperlinkEvent;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import javax.swing.tree.TreePath;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.hmd.angio.conf.ConfigEditorUI;
import org.hmd.angio.dto.Person;
import org.hmd.angio.dto.PersonDAO;
import org.hmd.angio.enuma.PDRectangleEnum;
import org.hmd.angio.exception.PhotoLoadException;
import org.hmd.angio.ihm.HistogramEQBtn;
import org.hmd.angio.ihm.PersonInfoEntryUI;
import org.hmd.angio.ihm.tree.ExamTreeNode;
import org.hmd.angio.ihm.tree.PersonTreeNode;
import org.hmd.angio.ihm.tree.PhotoDirectoryUtils;
import org.hmd.angio.ihm.tree.PhotoTreeNode;
import org.hmd.angio.pdf.PDFCreator;
import org.hmd.angio.pdf.PDFGenerationGUI;
import org.hmd.angio.search.SearchPersonUI;
import org.hmd.image.ouils.DirectoryManager;
import org.hmd.image.ouils.ImageIconBorder;
import org.hmd.image.ouils.ThumbnailRenderer;

import net.coobird.thumbnailator.Thumbnails;

public class PhotoOrganizerTreeApp implements PhotoOrganizer {
	String[] extensions = { "jpg", "jpeg", "png", "bmp", "gif" };
	// Ajouter l'instance de PersonDAO
	// Initialisez l'instance de PersonDAO
	private PersonDAO personDAO = new PersonDAO();
	// Modifiez le type de peopleList
//	private DefaultListModel<Person> peopleListModel;

	JPanel peoplePanel = new JPanel(new BorderLayout());

	private DefaultListModel<File> listModel = new DefaultListModel<>();
	private Map<File, ImageIconBorder> photoMap = new HashMap<>();

	private JList<File> photoList = new JList<>(listModel);

	private File selectedDirectory;
	private JFrame frame;
	private JPanel pdfPanel;
	JPanel previewPDFPanel;
	boolean isPDFGenerated = false;

	private float zoomFactor = 1.0f;
	private int currentPage = 0;

 // Appel de la classe PersonInfoEntryUI
		PersonInfoEntryUI personInfoEntryUI = new PersonInfoEntryUI(this);
	
	/**
	 * PDF generator IHM
	 */
	JComboBox<String> printPageModelComboBox = new JComboBox<>( );
	private Properties printModels = new Properties(); 
	
	boolean controleurDeModifications = false;
	BufferedImage modifiedImage = null;

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

		frame = new JFrame("Photo Organizer");
		frame.setSize(800, 600);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		JToolBar toolBar = getToolBar();
		// Configuration de la barre d'outils
		frame.add(toolBar, BorderLayout.PAGE_START);

		initializeMenu();

		// Ajoutez votre liste de photos (par exemple, photoList) ici
		// ...
		// Ajoutez un bouton pour afficher les photos de la personne sélectionnée
		JButton showPhotosButton = new JButton("Afficher les Photos");
		showPhotosButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				/// displayPhotosForPerson();
				displayPhotosBasedOnSelection();
			}
		});

		// Ajoutez la liste des personnes au-dessus de la liste de photos
		JPanel treePeoplePhotsPanel = new JPanel(new BorderLayout());
		treePeoplePhotsPanel.add(new JLabel("Liste des personnes "), BorderLayout.NORTH);
		treePeoplePhotsPanel.add(new JScrollPane(initializePeopleTree()), BorderLayout.CENTER);

		// treePeoplePhotsPanel.add(showPhotosButton, BorderLayout.SOUTH);

		// Ajoutez la liste de photos
		JPanel treePhotosPanel = new JPanel(new BorderLayout());
		treePhotosPanel.add(new JLabel("Tree -> Liste de Photos"), BorderLayout.NORTH);
		treePhotosPanel.add(new JScrollPane(initializePhotoList()), BorderLayout.CENTER);

		JSplitPane treeSplitDirectoryPeoplePhotoPane = new JSplitPane(JSplitPane.VERTICAL_SPLIT, treePeoplePhotsPanel,
				treePhotosPanel);

		JSplitPane dashBoardSplitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, treeSplitDirectoryPeoplePhotoPane,
				getsplitPanel());
		frame.add(dashBoardSplitPane, BorderLayout.CENTER);
		frame.setVisible(true);

		// Ajoutez le JScrollPane de l'arborescence à votre interface utilisateur
		frame.add(peoplePanel, BorderLayout.WEST);
	}

	/**
	 * 
	 * @return
	 */
	private void initPeopleTreeListe() {

		peopleJTree.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent e) {

				if (personDAO.isConnected()) {

					if (e.getClickCount() == 1) {

						if (!peopleJTree.isSelectionEmpty()) {

							TreePath path = peopleJTree.getPathForLocation(e.getX(), e.getY());

							if (path != null) {
								DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path
										.getLastPathComponent();

								if (selectedNode instanceof ExamTreeNode) {
									ExamTreeNode examNode = (ExamTreeNode) selectedNode;
									System.out.println(" selectedPerson.getNom()  :" + examNode.getPerson().getNom());
									String pdfFilePath = DirectoryManager
											.getPDFPersonExamListInDirectory(examNode.getPerson(), examNode);
									pdfExam4Person(pdfFilePath);
								}
								if (selectedNode instanceof PersonTreeNode) {

									PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;

									System.out.println(
											" selectedPerson.getNom()  :" + personTreeNode.getPerson().getNom());
									String pdfFilePath = DirectoryManager
											.getPDFPersonListInWorkspaceDirectory(personTreeNode.getPerson());
									pdfExam4Person(pdfFilePath);

								}

							}

						} else {
							showPopup(e);

						}
					}
				} else {

					/// showErrorDialog("Erreur de connection à la base de donnée " , new
					/// Exception());

					int confirmation = JOptionPane.showConfirmDialog(frame,
							"Voulez-vous modifier la configuration de connexion à la base de données" + "?",
							"Erreur de connection à la base de donnée ", JOptionPane.YES_NO_OPTION);

					if (confirmation == JOptionPane.YES_OPTION) {
						// Ouvrez l'IHM de modification de la configuration
						openConfigEditorUI();
					}
				}

			}

			private void pdfExam4Person(/* Person selectedPerson , */String pdfFilePath) {
//				if (selectedPerson!=null){
//					System.out.println(" selectedPerson.getNom()  :"+selectedPerson.getNom());
//					String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);

				File pdfFilePerson = new File(pdfFilePath);

				if (pdfFilePerson.exists()) {
					isPDFGenerated = true;
					showPDFButton.setEnabled(true);
					printePDFButton.setEnabled(true);
					// premier viewer
					displayPDF(pdfFilePath, pdfPanel);
					// Add zoom functionality
					pdfPanel.addMouseWheelListener(new ZoomHandler(pdfFilePath, pdfPanel));
					pdfPanel.addMouseListener(new ContextMenuMouseListener(pdfFilePath, pdfPanel));

					// premier viewer
					displayPDF(pdfFilePath, previewPDFPanel);
					// Add zoom functionality
					// previewPDFPanel.addMouseWheelListener(new ZoomHandler(pdfFilePath,
					// previewPDFPanel));
					previewPDFPanel.addMouseListener(new ContextMenuMouseListener(pdfFilePath, previewPDFPanel));
				}
//					}else {
//						
//						   showErrorDialog("Erreur de selection de patient "  , new  Exception());
//					}
			}

		});

		peopleJTree.addMouseListener(new MouseAdapter() {
			@Override
			public void mousePressed(MouseEvent e) {
				showPopup(e);
			}

			@Override
			public void mouseReleased(MouseEvent e) {
				showPopup(e);
			}
		});

	}

	private void showPopup(MouseEvent e) {
		if (e.isPopupTrigger()) {
			// Affichez le menu contextuel ici
			createPeoplePopupMenu().show(e.getComponent(), e.getX(), e.getY());
		}
	}

	private void displayPhotosBasedOnSelection() {
		// Récupérer le nœud sélectionné dans peopleJTree
		TreePath selectedPath = peopleJTree.getSelectionPath();

		if (selectedPath != null) {
			DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) selectedPath.getLastPathComponent();

			System.out.println("Selected userObject: " + selectedNode.getUserObject() + " | Type: "
					+ selectedNode.getUserObject().getClass().getSimpleName());

			if (selectedNode instanceof PersonTreeNode) {
				displayPhotosForPerson((PersonTreeNode) selectedNode);
			} else if (selectedNode instanceof ExamTreeNode) {
				displayPhotosForExam((ExamTreeNode) selectedNode, false);
			} else {
				showWarningDialog("Veuillez sélectionner une personne ou un examen.");
			}

		} else {
			showWarningDialog("Aucun élément sélectionné.");
		}
	}

	private void displayPhotosForPerson(PersonTreeNode personNode) {
		listModel.clear(); // Vider la liste des photos actuelles

		String path = DirectoryManager.getPersonWorkspaceDirectory(personNode.getPerson());
		File personDir = new File(path);

		if (personDir.isDirectory()) {
			// Charger les photos générales du répertoire de la personne
			loadPhotosJTree(personDir, "Photos générales", Color.BLACK); // Noir pour différencier

			// Charger récursivement les photos des sous-répertoires (examens)
			for (int i = 0; i < personNode.getChildCount(); i++) {
				DefaultMutableTreeNode childNode = (DefaultMutableTreeNode) personNode.getChildAt(i);
				if (childNode instanceof ExamTreeNode) {
					displayPhotosForExam((ExamTreeNode) childNode, true);
				}
			}
		} else {
			showWarningDialog("Le répertoire de la personne est introuvable.");
		}
	}

	private void displayPhotosForExam(ExamTreeNode examNode, boolean fromPerson) {
		File examDir = (File) examNode.getUserObject();

		if (examDir.isDirectory()) {
			// Ajouter un séparateur visuel pour les photos d'examen
			String examTitle = "Photos examen - " + examDir.getName();
			Color borderColor = fromPerson ? Color.BLUE : Color.RED; // Bleu si via Person, Rouge si direct

			loadPhotosJTree(examDir, examTitle, borderColor);
		} else {
			showWarningDialog("Le répertoire de l'examen est introuvable.");
		}
	}

 	private void showWarningDialog(String message) {
		JOptionPane.showMessageDialog(frame, message, "Attention", JOptionPane.WARNING_MESSAGE);
	}
	private void showInfoDialog(String message) {
	    JOptionPane.showMessageDialog(null, message, "Information", JOptionPane.INFORMATION_MESSAGE);
	}
	private void showErrorDialog(String message) {
	    JOptionPane.showMessageDialog(null, message, "Erreur", JOptionPane.ERROR_MESSAGE);
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

		TreePath path = peopleJTree.getSelectionPath();

		if (path != null) {
			// Ajoutez les éléments au menu contextuel
			popupMenu.add(reloadPersonPhotosItem);
			popupMenu.add(removePersonItem);
			popupMenu.add(browseDirecty);
		}

		return popupMenu;
	}
 
	private void browseDirectyAction() {

		TreePath path = peopleJTree.getSelectionPath();

		if (path != null) {
			DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

			if (selectedNode instanceof ExamTreeNode) {
				ExamTreeNode examNode = (ExamTreeNode) selectedNode;
				String directoryExam = examNode.getDirectory().getAbsolutePath();
				DirectoryManager.browseDirectory(directoryExam);
			}
			if (selectedNode instanceof PersonTreeNode) {

				PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
				String directory = DirectoryManager.getPersonWorkspaceDirectory(personTreeNode.getPerson());
				DirectoryManager.browseDirectory(directory);

			}
		}

	}
 
	private void reloadPhotosAction() {

		TreePath path = peopleJTree.getSelectionPath();

		if (path != null) {
			DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

			if (selectedNode instanceof ExamTreeNode) {
				ExamTreeNode examNode = (ExamTreeNode) selectedNode;
				File directoryExam = examNode.getDirectory();

					//reloadSelectedTreeNode();
				try {
					loadPhotos(directoryExam);
					refreshTreeNode(selectedNode); // Mise à jour de l'arborescence
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			if (selectedNode instanceof PersonTreeNode) {
				PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
				File directory = new File(DirectoryManager.getPersonWorkspaceDirectory(personTreeNode.getPerson()));
				//reloadSelectedTreeNode();
					try {
					loadPhotos(directory);
					refreshTreeNode(selectedNode); // Mise à jour de l'arborescence
	                
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}
 
	

	// Rafraîchir un nœud spécifique de l'arbre
	private void refreshTreeNode(DefaultMutableTreeNode node) {
	    DefaultTreeModel model = (DefaultTreeModel) peopleJTree.getModel();
	    model.nodeStructureChanged(node);  // Met à jour la structure du nœud
	    
	}
	
	private void reloadSelectedTreeNode() {
	    TreePath path = peopleJTree.getSelectionPath();

	    if (path != null) {
	        DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

	        // Lancer un SwingWorker pour le chargement
	        new PhotoLoaderWorker(selectedNode).execute();
	    }
	}

	// SwingWorker pour charger les photos en arrière-plan
	private class PhotoLoaderWorker extends SwingWorker<Void, Void> {
	    private final DefaultMutableTreeNode selectedNode;

	    public PhotoLoaderWorker(DefaultMutableTreeNode selectedNode) {
	        this.selectedNode = selectedNode;
	    }

	    @Override
	    protected Void doInBackground() throws Exception {
	        if (selectedNode instanceof ExamTreeNode) {
	            ExamTreeNode examNode = (ExamTreeNode) selectedNode;
	            File directoryExam = examNode.getDirectory();
	            loadPhotos(directoryExam);  // Chargement en arrière-plan
	        }

	        if (selectedNode instanceof PersonTreeNode) {
	            PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
	            File directory = new File(DirectoryManager.getPersonWorkspaceDirectory(personTreeNode.getPerson()));
	            loadPhotos(directory);  // Chargement en arrière-plan
	        }
	        return null;
	    }

	    @Override
	    protected void done() {
	        try {
	            get();  // Récupère le résultat (gère les exceptions si elles ont eu lieu)
	            refreshTreeNode(selectedNode);  // Met à jour l'arborescence après le chargement
	        } catch (Exception e) {
	            e.printStackTrace();
	            showErrorDialog("Erreur lors du chargement des photos.");
	        }
	    }
	}

	
	
	private void removePersonAction() {
		TreePath path = peopleJTree.getSelectionPath();

		if (path != null) {
			DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

			if (selectedNode instanceof ExamTreeNode) {
				ExamTreeNode examTreeNode = (ExamTreeNode) selectedNode;
				int confirmation = JOptionPane.showConfirmDialog(frame,
						"Êtes-vous sûr de vouloir supprimer L'examen du : " + examTreeNode.getFormattedExamDate()
								+ " // " + examTreeNode.getPerson().getPrenom() + "?",
						"Confirmation de suppression", JOptionPane.YES_NO_OPTION);

				if (confirmation == JOptionPane.YES_OPTION) {

					// Supprimez la personne de la liste et de la base de données
					removeExam(examTreeNode);
				}
			}
			if (selectedNode instanceof PersonTreeNode) {
				PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
				int confirmation = JOptionPane.showConfirmDialog(frame,
						"Êtes-vous sûr de vouloir supprimer la personne : " + personTreeNode.getPerson().getNom() + "_"
								+ personTreeNode.getPerson().getPrenom() + "?",
						"Confirmation de suppression", JOptionPane.YES_NO_OPTION);

				if (confirmation == JOptionPane.YES_OPTION) {

					// Supprimez la personne de la liste et de la base de données
					removePerson(personTreeNode.getPerson());
				}
			}

		}

	}

	private void removeExam(ExamTreeNode examenDate) {
		// Supprimez le répertoire de la personne avec confirmation
		int confirmation = JOptionPane.showConfirmDialog(frame,
				"Voulez-vous supprimer le répertoire de la personne avec toutes les photos?",
				"Confirmation de suppression du répertoire", JOptionPane.YES_NO_OPTION);

		if (confirmation == JOptionPane.YES_OPTION) {
			deleteExamenDirectory(examenDate);
		}
	}

	private void removePerson(Person person) {
		// Supprimez la personne de la base de données
		personDAO.deletePerson(person);

		// Supprimez la personne de la liste
		/** @TOD implmente remose person */
		// peopleListModel.removeElement(person);

		// Supprimez le répertoire de la personne avec confirmation
		int confirmation = JOptionPane.showConfirmDialog(frame,
				"Voulez-vous supprimer le répertoire de la personne avec toutes les photos?",
				"Confirmation de suppression du répertoire", JOptionPane.YES_NO_OPTION);

		if (confirmation == JOptionPane.YES_OPTION) {
			deletePhotosAndDirectory(person);
		}
	}
 
	private void deleteExamenDirectory(ExamTreeNode examen) {
		// Obtenez le répertoire de la personne
		File examenDirectory = examen.getDirectory();
		// Vérifiez si le répertoire existe
		if (examenDirectory.exists()) {
			// Supprimez toutes les photos du répertoire
			File[] photoFiles = examenDirectory.listFiles();
			if (photoFiles != null) {
				for (File photoFile : photoFiles) {
					photoFile.delete();
				}
				photoList.removeAll();
				listModel.clear();
			}

			// Supprimez le répertoire lui-même
			if (examenDirectory.delete()) {
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

	private JList initializePhotoList() {

		// Au démarrage, chargez la configuration depuis le fichier
		// lecture directed des informationsà partir du ficher nous avons pas besoins de
		// l'interface utilisateur

		// Utilisez la configuration chargée, par exemple :
		String directory = DirectoryManager.getWorkspaceDirectory();

		if (directory != null && new File(directory).isDirectory()) {
			selectedDirectory = new File(directory);
		}

		// "ListSelectionModel.MULTIPLE_INTERVAL_SELECTION" voir JList.MULTIPLE_INTERVAL_SELECTION
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

				if (e.getClickCount() == 3) {
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

		return photoList;
	}
 
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
		SearchPersonUI search = new SearchPersonUI(this);

		rechercherPersonneItem.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				// Appel de la classe PersonInfoEntryUI
				SwingUtilities.invokeLater(() -> search.setVisible(true));

			}
		});
		personnesMenu.add(rechercherPersonneItem);

		// Ajoutez l'élément de menu "Ajouter Personne"
		JMenuItem ajouterPersonneItem = new JMenuItem("Ajouter Personne");
 
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
		fileMenu.add(ajouterPersonneItem);
		fileMenu.add(rechercherPersonneItem);
		fileMenu.addSeparator();
		fileMenu.add(openConfigButton);
		fileMenu.addSeparator();
		fileMenu.add(exitItem);

		// Ajout du menu "File" à la barre de menu
		menuBar.add(fileMenu);

		// Ajoutez le menu "Personnes" à la barre de menu
		// menuBar.add(personnesMenu);

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
		frame.setJMenuBar(menuBar);

	}

	private static void showAboutUsDialog(JFrame parentFrame) {
		JTextPane textPane = new JTextPane();
		textPane.setContentType("text/html");
		textPane.setEditable(false);

		String aboutText = "<html><b>About Us</b><br>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br>"
				+ "Welcome to our application!" + "\r\n"
				+ "Contact us: <a href=\"mailto:drmdh@msncom\">drmdh@msncom</a><br>"
				+ "Visit our website: <a href=\"http://amia.fr\">http://amia.fr</a></html>";

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

//	private void chooseDirectory() throws PhotoLoadException, IOException {
//		JFileChooser fileChooser = new JFileChooser();
//		fileChooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
//
//		int result = fileChooser.showOpenDialog(frame);
//
//		if (result == JFileChooser.APPROVE_OPTION) {
//			selectedDirectory = fileChooser.getSelectedFile();
//
//			loadPhotos(selectedDirectory);
//
//		}
//	}

	/**
	 * la fonction vas etre utiliser lors du chargement d repertoire de la personne
	 * pour les test par un bouton de load
	 * 
	 * @param workingDirectory
	 */
//	private void chooseDirectory(File workingDirectory) {
//
//		try {
//			loadPhotos(workingDirectory);
//		}
//
//		catch (/** PhotoLoadException | */
//		IOException e) {
////				le chargement par la section directe du repertoire 
//			try {
//				String message = "Erreur lors du chargement des photos : le répertoire est vide ou inaccessible.";
//				// Ajoutez votre logique pour afficher les photos de la personne sélectionnée
//				JOptionPane.showMessageDialog(frame, message,"",JOptionPane.ERROR_MESSAGE);
//				chooseDirectory();
//			} catch (PhotoLoadException | IOException e1) {
//				// TODO Auto-generated catch block
//				e1.printStackTrace();
//			}
//		}
//	}

//	private void chooseDirectory(File directory) throws IOException {
//		if (directory != null && directory.exists() && directory.isDirectory()) {
//			loadPhotos(directory);
//			// JOptionPane.showMessageDialog(frame, "Photos du répertoire chargé avec
//			// succès.", "Succès", JOptionPane.INFORMATION_MESSAGE);
//		} else {
//			throw new IOException("Répertoire invalide ou inaccessible : " + directory);
//		}
//	}

 
//	public void addPerson(Person person,DefaultMutableTreeNode node) {
//		// Ajoutez la personne à la base de données
//		personDAO.saveOrUpdatePerson(person);
//
//		// Ajoutez la personne à la liste
////		peopleListModel.addElement(person);
//		node.add(new PersonTreeNode(person));
//		// Affichez le répertoire de photos de la personne dans photoList
//		loadPhotosForPerson(person);
//		today.add(node);
//		PhotoDirectoryUtils.createPhotoTreeAsFileNodes(today, person);
//		// Mettez à jour peopleList pour refléter les changements
//		peopleJTree.updateUI();
//  
//	}

	
	@Override
	public void showPerson(Person person) {

		// Effacer tous les enfants de la racine
		inAction.removeAllChildren();
		PersonTreeNode photoTre = PhotoDirectoryUtils.createPhotoTreeAsFileNodes(inAction, person);
		JTree people = new JTree(new DefaultTreeModel(photoTre));
		peopleJTree.add(people);

		// Rafraîchissez le modèle du JTree
		treeModel.reload();
		peopleJTree.updateUI();
		// Affichez le répertoire de photos de la personne dans photoList
		loadPhotosForPerson(person);
	}
	
//	@Override
//	public void addPerson(Person person) {
//		
//		// Ajoutez la personne à la liste
////		peopleListModel.addElement(person);
//		PersonTreeNode photoTre = PhotoDirectoryUtils.createPhotoTreeAsFileNodes(today, person);
//		JTree peopleToday = new JTree(new DefaultTreeModel(photoTre));
//		
//		peopleJTree.add(peopleToday);
//
//		// Rafraîchissez le modèle du JTree
//		treeModel.reload();
//		// Mettez à jour peopleList pour refléter les changements
//		peopleJTree.updateUI();
//		 
//		// Affichez le répertoire de photos de la personne dans photoList
//		loadPhotosForPerson(person);
//		
//	}
	@Override
	public void addPerson(Person person) {
		
//		// Ajoutez la personne à la base de données
//		personDAO.saveOrUpdatePerson(person);
//		
//		 showPerson(  person);
		
		// Effacer tous les enfants de la racine
		today.removeAllChildren();
		PersonTreeNode photoTre = PhotoDirectoryUtils.createPhotoTreeAsFileNodes(today, person);
		JTree peopleToday = new JTree(new DefaultTreeModel(photoTre));
		peopleJTree.add(peopleToday);

		// Rafraîchissez le modèle du JTree
		treeModel.reload();
		peopleJTree.updateUI();
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

		JPanel initOptionPDF = initOptionPDF();
		JPanel buttonPDFAction = buttonPDFAction();

		JScrollPane panelPDFView = panelPDFView();
		JScrollPane panelPDFView2 = panelPDFView2();

//		JSplitPane optioNbuttonArea = new JSplitPane(JSplitPane.VERTICAL_SPLIT, optionsPanel, panelOptionsView);
		
		JSplitPane splitViewOptions = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, initOptionPDF, panelPDFView);
		JSplitPane splitTextArea = new JSplitPane(JSplitPane.VERTICAL_SPLIT, buttonPDFAction, panelPDFView2);
		
		JSplitPane splitViewPdf = new JSplitPane(JSplitPane.VERTICAL_SPLIT, splitViewOptions,splitTextArea );

		return splitViewPdf;
	}

	private JScrollPane panelPDFView2() {
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
		pdfScrollPane.setAutoscrolls(true);
		return pdfScrollPane;
	}

	private JScrollPane panelPDFView() {
		if (previewPDFPanel == null) {
			previewPDFPanel = new JPanel();
		}

		previewPDFPanel.setLayout(new GridLayout(0, 1));
		JScrollPane previewScrollPane = new JScrollPane(previewPDFPanel);
		previewScrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
		previewScrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
		return previewScrollPane;
	}

	/**
	 * les button et leur action
	 * 
	 * @return
	 */
	private JPanel buttonPDFAction() {
		JPanel panelOptionsView = new JPanel();

		panelOptionsView.add(generatePDFButton);
		panelOptionsView.add(showPDFButton);
		panelOptionsView.add(printePDFButton);

		generatePDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				TreePath path = peopleJTree.getSelectionPath();

				Person selectedPerson = null;
				if (path != null) {
					DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

					if (selectedNode instanceof ExamTreeNode) {
						ExamTreeNode examNode = (ExamTreeNode) selectedNode;
						selectedPerson = examNode.getPerson();

						String pdfFilePath = DirectoryManager.getPDFPersonExamListInDirectory(selectedPerson, examNode);
						makeshowPDF(selectedPerson, pdfFilePath); 
					}

					if (selectedNode instanceof PersonTreeNode) { 
						PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
						selectedPerson = personTreeNode.getPerson();

						String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
						makeshowPDF(selectedPerson, pdfFilePath);
 
					}
				} else {
					showWarningDialog("aucune personne selectionnée");
				}

			}
		});

		showPDFButton.setEnabled(false);
		printePDFButton.setEnabled(false);

		showPDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				if (isPDFGenerated) {
					TreePath path = peopleJTree.getSelectionPath();

					if (path != null) {
						DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();
						Person selectedPerson = null;

						if (selectedNode instanceof ExamTreeNode) {
							ExamTreeNode examNode = (ExamTreeNode) selectedNode;
							selectedPerson = examNode.getPerson();

							String pdfFilePath = DirectoryManager.getPDFPersonExamListInDirectory(selectedPerson,
									examNode);
							PDFCreator.openBrowseFile(pdfFilePath);
						}

						if (selectedNode instanceof PersonTreeNode) {
							PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
							selectedPerson = personTreeNode.getPerson();

							String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
							PDFCreator.openBrowseFile(pdfFilePath);
						}
					} else {
						showWarningDialog("aucune personne selectionnée");
					}
				}

			}
		});

		printePDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				TreePath path = peopleJTree.getSelectionPath();

				if (path != null) {
					DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();
					Person selectedPerson = null;

					if (selectedNode instanceof ExamTreeNode) {
						ExamTreeNode examNode = (ExamTreeNode) selectedNode;
						selectedPerson = examNode.getPerson();
						String pdfFilePath = DirectoryManager.getPDFPersonExamListInDirectory(selectedPerson, examNode);
						File pdfFilePerson = new File(pdfFilePath);
						PDFCreator.printPDF(pdfFilePerson);

					}

					if (selectedNode instanceof PersonTreeNode) {
						PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
						selectedPerson = personTreeNode.getPerson();
						String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
						File pdfFilePerson = new File(pdfFilePath);
						PDFCreator.printPDF(pdfFilePerson);

					}

				} else {
					showWarningDialog("aucune personne selectionnée");
				}

			}
		});
		return panelOptionsView;
	}

	/**
	 * 
	 * @param selectedNode
	 */
	protected void makeshowPDF(Person selectedPerson, String generatedPDFFile) {

		if (selectedPerson != null) {
			boolean pdfGenerated = generatePDF(selectedPerson, generatedPDFFile);
			try {
				if (pdfGenerated) {
					isPDFGenerated = true;
					showPDFButton.setEnabled(true);
					printePDFButton.setEnabled(true);
				}

			} finally {
				if (pdfGenerated) {
					// String generatedPDFFile =
					// DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);

					// premier viewer
					displayPDF(generatedPDFFile, pdfPanel);
					// Add zoom functionality
					pdfPanel.addMouseWheelListener(new ZoomHandler(generatedPDFFile, pdfPanel));
					pdfPanel.addMouseListener(new ContextMenuMouseListener(generatedPDFFile, pdfPanel));

					// premier viewer
					displayPDF(generatedPDFFile, previewPDFPanel);
					// Add zoom functionality
					// previewPDFPanel.addMouseWheelListener(new ZoomHandler(generatedPDFFile,
					// previewPDFPanel));
					previewPDFPanel.addMouseListener(new ContextMenuMouseListener(generatedPDFFile, previewPDFPanel));
				}

			}
		} else {

		}

	}

	 

	
	/**
	 * 
	 * @return
	 */
	private JPanel initOptionPDF() {
	    loadPrintModels();  // Charger les modèles d'impression au démarrage
	    
	   ///  printPageModelComboBox.addActionListener(e -> applySelectedModel());
	    printPageModelComboBox.addItemListener(e -> {
	        if (e.getStateChange() == ItemEvent.SELECTED) {
	            applySelectedModel();
	        }
	    });

	    JPanel panel = new JPanel(new GridLayout(9, 2));
	    
	    // Bouton pour ouvrir le menu contextuel
	     JButton menuModelButton = new JButton("...");  
	    // Initialisation du menu contextuel
	    modelsPopupMenu = gestionModelsPopupMenu(); 
	    menuModelButton.addActionListener(e -> showModelPopup(menuModelButton));
         panel.add(new JLabel("___________________"));
	     panel.add(menuModelButton);  
	     
	      
	    panel.add(new JLabel("Modèle d'impression :"));
	    panel.add(printPageModelComboBox);
	    panel.add(new JLabel("Orientation de la page:"));
	    panel.add(orientationComboBox);
	    panel.add(new JLabel("Taille des photos:"));
	    panel.add(widthByPhotosSizeComboBox);
	    panel.add(new JLabel("Nombre de photos par ligne:"));
	    panel.add(photosPerLineComboBox);
	    panel.add(new JLabel("Format de page :"));
	    panel.add(rectangleComboBox);
	    panel.add(new JLabel("Marge supérieure:"));
	    panel.add(yMarginSlider);
	    panel.add(new JLabel("Marge latérale:"));
	    panel.add(xMarginSlider);

	    
	 
	   
	 
	    
	    return panel;
	}
	private JPopupMenu modelsPopupMenu;
	
	// Création du menu contextuel
	private JPopupMenu gestionModelsPopupMenu() {
	    JPopupMenu popupMenu = new JPopupMenu();

	    JMenuItem saveModel = new JMenuItem("Enregistrer Nouveau Modèle");
	    JMenuItem updateModel = new JMenuItem("Modifier Modèle Actuel");

	    // Actions du menu
	    saveModel.addActionListener(e -> saveNewPrintModel());
	    updateModel.addActionListener(e -> updateSelectedPrintModel());

	    popupMenu.add(saveModel);
	    popupMenu.add(updateModel);

	    return popupMenu;
	}

	
	
	// Affichage du menu contextuel à côté du bouton
	private void showModelPopup(Component invoker) {
	    modelsPopupMenu.show(invoker, invoker.getWidth(), invoker.getHeight());
	}
	
	private void applySelectedModel() {
	    String selectedModel = (String) printPageModelComboBox.getSelectedItem();
	    
	    if (selectedModel != null) {
	        System.out.println("Modèle sélectionné : " + selectedModel);
	        
	        // Lire chaque propriété
	        String orientation = printModels.getProperty(selectedModel + ".orientation");
	        String photosPerLine = printModels.getProperty(selectedModel + ".photosPerLine");
	        String photoWidth = printModels.getProperty(selectedModel + ".photoWidth");
	        String pageFormat = printModels.getProperty(selectedModel + ".pageFormat");
	        String xMargin = printModels.getProperty(selectedModel + ".xMargin");
	        String yMargin = printModels.getProperty(selectedModel + ".yMargin");
	        String sideMargin = printModels.getProperty(selectedModel + ".sideMargin");
	        String pageCount = printModels.getProperty(selectedModel + ".pageCount");

	        // Afficher les valeurs pour vérifier
	        System.out.println("Orientation : " + orientation);
	        System.out.println("Photos par ligne : " + photosPerLine);
	        System.out.println("Largeur des photos : " + photoWidth);
	        System.out.println("Format : " + pageFormat);
	        System.out.println("Marges : " + xMargin + ", " + yMargin + ", " + sideMargin);
	        System.out.println("Nombre de pages : " + pageCount);
	        
	        // Appliquer les valeurs (ajout de vérification pour éviter les erreurs null)
	        if (orientation != null) {
	            orientationComboBox.setSelectedItem(orientation);
	        }
	        if (photosPerLine != null) {
	            photosPerLineComboBox.setSelectedItem(Integer.parseInt(photosPerLine));
	        }
	        if (photoWidth != null) {
	            widthByPhotosSizeComboBox.setSelectedItem(Integer.parseInt(photoWidth));
	        }
	        if (pageFormat != null) {
	            rectangleComboBox.setSelectedItem(PDRectangleEnum.valueOf(pageFormat));
	        }
	        if (xMargin != null) {
	            xMarginSlider.setValue(Integer.parseInt(xMargin));
	        }
	        if (yMargin != null) {
	            yMarginSlider.setValue(Integer.parseInt(yMargin));
	        }
	        if (sideMargin != null) {
	            sideMarginSlider.setValue(Integer.parseInt(sideMargin));
	        }
	        if (pageCount != null) {
	            pageCountSpinner.setValue(Integer.parseInt(pageCount));
	        }
	    } else {
	        System.out.println("Aucun modèle sélectionné.");
	    }
	}


	
	
//	private void loadPrintModels_old() {
//	    try (BufferedReader reader = new BufferedReader(new FileReader("print_models.ini"))) {
//	        String line;
//	        String currentModel = null;
//	        
//	        while ((line = reader.readLine()) != null) {
//	            line = line.trim();
//	            
//	            if (line.startsWith("[") && line.endsWith("]")) {
//	                currentModel = line.substring(1, line.length() - 1);
//	                printPageModelComboBox.addItem(currentModel);
//	            } else if (currentModel != null && line.contains("=")) {
//	                printModels.setProperty(currentModel + "." + line.split("=")[0], line.split("=")[1]);
//	            }
//	        }
//	    } catch (IOException e) {
//	        e.printStackTrace();
//	        System.out.println("Erreur lors du chargement des modèles d'impression.");
//	    }
//	     
//	    if (printPageModelComboBox.getItemCount() > 0) {
//	        printPageModelComboBox.setSelectedIndex(0);  // Sélection du premier modèle
//	        applySelectedModel();  // Applique le modèle par défaut
//	    }
//
//	    for (String key : printModels.stringPropertyNames()) {
//	        System.out.println(key + " = " + printModels.getProperty(key));
//	    }
//
//	    
//	    
//	}
	
	private void loadPrintModels() {
	    try (FileReader reader = new FileReader("printModels.ini")) {
	        printModels.load(reader);

	        for (String key : printModels.stringPropertyNames()) {
	            if (key.endsWith(".orientation")) {
	                String modelName = key.substring(0, key.indexOf("."));
	                if (!(((DefaultComboBoxModel<String>) printPageModelComboBox.getModel()).getIndexOf(modelName) >= 0)) {
	                    printPageModelComboBox.addItem(modelName);
	                }
	            }
	        }
	    } catch (IOException e) {
	        System.out.println("Fichier de modèles introuvable. Un nouveau fichier sera créé.");
	    }
	}

//	private void saveNewPrintModel(String modelName) {
//	    try (FileWriter writer = new FileWriter("print_models.ini", true)) {
//	        writer.write("\n[" + modelName + "]\n");
//	        writer.write("orientation=" + orientationComboBox.getSelectedItem() + "\n");
//	        writer.write("photosPerLine=" + photosPerLineComboBox.getSelectedItem() + "\n");
//	        writer.write("photoWidth=" + widthByPhotosSizeComboBox.getSelectedItem() + "\n");
//	        writer.write("pageFormat=" + rectangleComboBox.getSelectedItem() + "\n");
//	        writer.write("xMargin=" + xMarginSlider.getValue() + "\n");
//	        writer.write("yMargin=" + yMarginSlider.getValue() + "\n");
//	        writer.write("sideMargin=" + sideMarginSlider.getValue() + "\n");
//	        writer.write("pageCount=" + pageCountSpinner.getValue() + "\n");
//
//	        // Rechargez les modèles après l'enregistrement
//	        printPageModelComboBox.addItem(modelName);
//	        JOptionPane.showMessageDialog(null, "Modèle enregistré avec succès !");
//	    } catch (IOException e) {
//	        e.printStackTrace();
//	        JOptionPane.showMessageDialog(null, "Erreur lors de l'enregistrement du modèle.");
//	    }
//	}
	
	
	private void saveNewPrintModel() {
	    String modelName = JOptionPane.showInputDialog("Nom du nouveau modèle :");

	    if (modelName == null || modelName.trim().isEmpty()) {
	        showWarningDialog("Le nom du modèle est requis.");
	        return;
	    }

	    // Vérifie si le modèle existe déjà
	    if (printModels.containsKey(modelName + ".orientation")) {
	        int option = JOptionPane.showConfirmDialog(null, 
	            "Un modèle avec ce nom existe déjà. Voulez-vous le remplacer ?", 
	            "Confirmer", JOptionPane.YES_NO_OPTION);
	        if (option != JOptionPane.YES_OPTION) {
	            return;
	        }
	    }

	    // Sauvegarde des paramètres
	    saveModelToProperties(modelName);
	    printPageModelComboBox.addItem(modelName);  // Ajout au ComboBox
	    printPageModelComboBox.setSelectedItem(modelName);  // Sélection automatique

	    showInfoDialog("Modèle '" + modelName + "' enregistré avec succès.");
	}

	
	
	private void updateSelectedPrintModel() {
	    String selectedModel = (String) printPageModelComboBox.getSelectedItem();

	    if (selectedModel == null) {
	        showWarningDialog("Aucun modèle sélectionné pour modification.");
	        return;
	    }

	    int option = JOptionPane.showConfirmDialog(null,
	        "Voulez-vous vraiment modifier le modèle '" + selectedModel + "' ?", 
	        "Modifier Modèle", JOptionPane.YES_NO_OPTION);

	    if (option == JOptionPane.YES_OPTION) {
	        saveModelToProperties(selectedModel);
	        showInfoDialog("Modèle '" + selectedModel + "' mis à jour.");
	    }
	}
	private void saveModelToProperties(String modelName) {
	    printModels.setProperty(modelName + ".orientation", 
	                            (String) orientationComboBox.getSelectedItem());
	    printModels.setProperty(modelName + ".photosPerLine", 
	                            String.valueOf(photosPerLineComboBox.getSelectedItem()));
	    printModels.setProperty(modelName + ".photoWidth", 
	                            String.valueOf(widthByPhotosSizeComboBox.getSelectedItem()));
	    printModels.setProperty(modelName + ".pageFormat", 
	                            ((PDRectangleEnum) rectangleComboBox.getSelectedItem()).name());
	    printModels.setProperty(modelName + ".xMargin", 
	                            String.valueOf(xMarginSlider.getValue()));
	    printModels.setProperty(modelName + ".yMargin", 
	                            String.valueOf(yMarginSlider.getValue()));
	    printModels.setProperty(modelName + ".sideMargin", 
	                            String.valueOf(sideMarginSlider.getValue()));
	    printModels.setProperty(modelName + ".pageCount", 
	                            String.valueOf(pageCountSpinner.getValue()));

	    // Enregistrer dans le fichier .ini
	    savePrintModelsToFile();
	}
	private void savePrintModelsToFile() {
	    try (FileWriter writer = new FileWriter("printModels.ini")) {
	        printModels.store(writer, "Modèles d'impression");
	    } catch (IOException e) {
	        showWarningDialog("Erreur lors de l'enregistrement du fichier : " + e.getMessage());
	    }
	}

	 


	
	
	
	
 
	
	
	/***
	 * 
	 * @param selectedPerson
	 * @return
	 */
	private boolean generatePDF(Person selectedPerson, String pdfFilePath) {

		if (selectedPerson == null) {

			// Image non encore modifiée
			JOptionPane.showMessageDialog(null,
					"Vous devez choisir une personne en suite selectionner les photos à mofifier\n"
							+ " (au moins une photo à modifier)",
					"pas de Modification", JOptionPane.INFORMATION_MESSAGE);
			return false;
		} else {

			if (!photoList.isSelectionEmpty()) {

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
				JOptionPane.showMessageDialog(null, "Vous devez choisir au moins une photo dans la liste des photos ",
						"Pas de Modification", JOptionPane.INFORMATION_MESSAGE);
				return false;
			}

		}

	}

	public void displayPDF(String filePath, JPanel pdfPanel) {

		if (filePath != null) {
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

	private class ZoomHandler implements MouseWheelListener {
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
			displayPDF(_pdfFile, panel);
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
				displayPDF(_pdfFile, panel);
			});

			zoomOutItem.addActionListener(e -> {
				zoomFactor /= 1.1;
				displayPDF(_pdfFile, panel);
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

	// Créez la racine du tree
//	DefaultMutableTreeNode root,today,inAction,allRecords  ;
	// Créez la racine du tree
	DefaultMutableTreeNode root = new DefaultMutableTreeNode("Workspace");
	DefaultMutableTreeNode today = new DefaultMutableTreeNode("Today");
	DefaultMutableTreeNode inAction = new DefaultMutableTreeNode("En Action");
	DefaultMutableTreeNode allRecords = new DefaultMutableTreeNode("All Records");
	// Créez le modèle de l'arbre avec la racine
	private DefaultTreeModel treeModel = new DefaultTreeModel(root);
	// Créez le JTree avec le modèle
	private JTree peopleJTree = new JTree(treeModel);

	private JScrollPane initializePeopleTree() {

		peopleJTree.setRootVisible(false); // Masquer la racine de l'arborescence

		initPeopleTreeListe();

		peopleJTree.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent e) {
				if (e.getClickCount() == 2) { // Double-clic

					TreePath path = peopleJTree.getPathForLocation(e.getX(), e.getY());

					if (path != null) {
						DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

						if (selectedNode instanceof ExamTreeNode) {
							ExamTreeNode examNode = (ExamTreeNode) selectedNode;
							// File directoryExam = examNode.getDirectory();
							File directoryExam = new File(
									DirectoryManager.getPersonExamDirectory(  examNode.getPerson() , examNode));
							 

							try {
								loadPhotos(directoryExam);
							} catch (IOException ec) {
								ec.printStackTrace();
							}
						}
						if (selectedNode instanceof PersonTreeNode) {
							PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
							File directory = new File(
									DirectoryManager.getPersonWorkspaceDirectory(personTreeNode.getPerson()));
						 

							try {
								loadPhotos(directory);
								// displayPhotosForPerson();
							} catch (IOException ec) {
								ec.printStackTrace();
							}
						}

					}
				}
			}
		});

		// Ajoutez le JTree à un JScrollPane et à la frame
		JScrollPane treeScrollPane = new JScrollPane(peopleJTree);
		frame.add(treeScrollPane, BorderLayout.WEST);

		addTextToTree(root, "Liste des patients");
		// addPhoto(perso, DirectoryManager.getPersonWorkspaceDirectory(perso));

		List<Person> people = personDAO.findAll();
		// DefaultMutableTreeNode root = new DefaultMutableTreeNode("Patients");

		for (Person person : people) {
			PhotoDirectoryUtils.createPhotoTreeAsFileNodes(allRecords, person);
		}

		addTextToTree(root, "Action  ->");
//			addTextToNode("Action", today);
		root.add(today);
		root.add(allRecords);
		root.add(inAction);

		// Rafraîchissez le modèle du JTree
		treeModel.reload();
//	        // Affichez la frame
//	        frame.setVisible(true);

		return treeScrollPane;
	}


	private void addTextToTree(DefaultMutableTreeNode node, String text) {
		DefaultMutableTreeNode textNode = new DefaultMutableTreeNode(text);
		node.add(textNode);
	}

	// Méthode pour copier un nœud avec tous ses fils
	private void copyNodeWithChildren(DefaultMutableTreeNode selectedNode, DefaultMutableTreeNode dest) {
		// Récupérer le nœud sélectionné
//        DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) tree.getLastSelectedPathComponent();

		if (selectedNode != null) {
			// Copier le nœud et tous ses fils
			DefaultMutableTreeNode copiedNode = copyNodeRecursive(selectedNode);

			// Ajouter le nœud copié à la racine (vous pouvez choisir un autre emplacement)
//            DefaultMutableTreeNode root = (DefaultMutableTreeNode) treeModel.getRoot();
			dest.add(copiedNode);

			// Actualiser le modèle de l'arbre
//            treeModel.reload();
		}
	}

	// Méthode récursive pour copier un nœud avec tous ses fils
	private DefaultMutableTreeNode copyNodeRecursive(DefaultMutableTreeNode originalNode) {
		DefaultMutableTreeNode copy = new DefaultMutableTreeNode(originalNode.getUserObject());

		// Copier tous les fils récursivement
		for (int i = 0; i < originalNode.getChildCount(); i++) {
			DefaultMutableTreeNode child = (DefaultMutableTreeNode) originalNode.getChildAt(i);
			DefaultMutableTreeNode copiedChild = copyNodeRecursive(child);
			copy.add(copiedChild);
		}

		return copy;
	}

	private void loadPhotosJTree(File directory, String sectionTitle, Color borderColor) {
		if (directory.isDirectory()) {
			File[] photoFiles = directory.listFiles((dir, name) -> {
				String lowerCaseName = name.toLowerCase();
				return lowerCaseName.endsWith(".jpg") || lowerCaseName.endsWith(".jpeg")
						|| lowerCaseName.endsWith(".png");
			});

			if (photoFiles != null && photoFiles.length > 0) {
				/**
				 * @TODO control of title
				 */
				// listModel.addElement("---- " + sectionTitle + " ----");

				for (File photo : photoFiles) {
					photoMap.put(photo, new ImageIconBorder(photo, borderColor));
					listModel.addElement(photo); // Continue d'ajouter des fichiers au modèle

				}
			}
		}
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

		// peopleJTree.getAccessibleContext();
		TreePath path = peopleJTree.getSelectionPath();
		Person selectedPerson = null;

		if (path != null) {
			DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

			if (selectedNode instanceof ExamTreeNode) {
				ExamTreeNode examNode = (ExamTreeNode) selectedNode;
				selectedPerson = examNode.getPerson();
			}

			if (selectedNode instanceof PersonTreeNode) {
				PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
				selectedPerson = personTreeNode.getPerson();
			}

		}

		if (selectedPerson != null) {
			// File selectedFile = photoList.getSelectedValue();
			if (/* selectedFile != null && */ !photoList.isSelectionEmpty()) {

				String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
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

	public void createPDFFromTree() throws IOException {
		// Récupérer le nœud sélectionné dans peopleJTree
		TreePath selectedPath = peopleJTree.getSelectionPath();

		if (selectedPath != null) {
			DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) selectedPath.getLastPathComponent();

			if (selectedNode instanceof PhotoTreeNode) {
				handlePhotoSelection((PhotoTreeNode) selectedNode);
			} else if (selectedNode instanceof ExamTreeNode) {
				handleExamSelection((ExamTreeNode) selectedNode);
			} else {
				JOptionPane.showMessageDialog(null, "Veuillez sélectionner une photo ou un examen.",
						"Sélection Invalide", JOptionPane.INFORMATION_MESSAGE);
			}
		} else {
			JOptionPane.showMessageDialog(null, "Vous devez sélectionner une personne, un examen ou une photo.",
					"Pas de Sélection", JOptionPane.INFORMATION_MESSAGE);
		}
	}

	// Gérer la sélection d'un fichier photo (photo individuelle)
	private void handlePhotoSelection(PhotoTreeNode photoNode) throws IOException {
		ExamTreeNode examNode = (ExamTreeNode) photoNode.getParent();
		// PersonTreeNode personNode = (PersonTreeNode) examNode.getParent();

		if (examNode != null) {
			// Créer le PDF pour une photo spécifique
			generatePDF(examNode, Arrays.asList((File) photoNode.getUserObject()));
		}
	}

	// Gérer la sélection d'un répertoire d'examen (ensemble de photos)
	private void handleExamSelection(ExamTreeNode examNode) throws IOException {
		// PersonTreeNode personNode = (PersonTreeNode) examNode.getParent();
		File examDir = (File) examNode.getUserObject();

		if (examNode != null && examDir.isDirectory()) {
			File[] listPhotos = examDir.listFiles((dir, name) -> name.toLowerCase().matches(".*\\.(jpg|png|jpeg)$"));

			if (listPhotos != null && listPhotos.length > 0) {
				generatePDF(examNode, Arrays.asList(listPhotos));
			} else {
				JOptionPane.showMessageDialog(null, "Aucune photo trouvée dans cet examen.", "Pas de Photos",
						JOptionPane.INFORMATION_MESSAGE);
			}
		}
	}

	// Méthode générique pour générer un PDF à partir d'une personne et d'une liste
	// de photos
	private void generatePDF(ExamTreeNode examTreeNode, List<File> photos) throws IOException {

		String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(examTreeNode);
		File pdfFilePerson = new File(pdfFilePath);

		if (!pdfFilePerson.getName().toLowerCase().endsWith(".pdf")) {
			pdfFilePerson = new File(pdfFilePerson.getAbsolutePath() + ".pdf");
		}

		// Appeler la génération de PDF
		pdfGenerationGUI.updateData(pdfFilePerson.getAbsolutePath(), photos);
	}

	// pour imprimer toutes les photo de la persone de tous ses examen
	private void generatePDF(PersonTreeNode personNode, List<File> photos) throws IOException {
		Person person = personNode.getPerson();
		String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(person);
		File pdfFilePerson = new File(pdfFilePath);

		if (!pdfFilePerson.getName().toLowerCase().endsWith(".pdf")) {
			pdfFilePerson = new File(pdfFilePerson.getAbsolutePath() + ".pdf");
		}

		// Appeler la génération de PDF
		pdfGenerationGUI.updateData(pdfFilePerson.getAbsolutePath(), photos);
	}

	/**
	 * 
	 */
	public void printPDF() {// Créez le modèle de l'arbre avec la racine

		TreePath path = peopleJTree.getSelectionPath();

		if (path != null) {
			DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

			if (selectedNode instanceof ExamTreeNode) {
				ExamTreeNode examNode = (ExamTreeNode) selectedNode;
				String pdfFilePath = DirectoryManager.getPDFPersonExamListInDirectory(examNode.getPerson(), examNode);
				File pdfFilePerson = new File(pdfFilePath);
				PDFCreator.printPDF(pdfFilePerson);
			}

			if (selectedNode instanceof PersonTreeNode) {

				PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
				String directory = DirectoryManager.getPersonWorkspaceDirectory(personTreeNode.getPerson());
				File pdfFilePerson = new File(directory);
				PDFCreator.printPDF(pdfFilePerson);

			}
		}

		else {
			// Image non encore modifiée
			JOptionPane.showMessageDialog(null, "Vous devez choisir au moins une photo à modifier",
					"pas de Modification", JOptionPane.INFORMATION_MESSAGE);

		}

	}

	private JToolBar getToolBar() {

		// Barre d'outils
		JToolBar toolBar = new JToolBar();
		int iconSize = 32; // Taille des icônes

		ImageIcon openIcon = createResizedIcon("images/patient.png", iconSize, iconSize);
		ImageIcon searchIcon = createResizedIcon("images/search.png", iconSize, iconSize);
		ImageIcon pdfIcon = createResizedIcon("images/pdf.png", iconSize, iconSize);
		ImageIcon reloadIcon = createResizedIcon("images/reload.png", iconSize, iconSize);
		ImageIcon sortiedurgenceIcon = createResizedIcon("images/sortie-durgence.png", iconSize, iconSize);

		JButton openToolBarButton = new JButton(openIcon);
		JButton searchToolBarButton = new JButton(searchIcon);
		JButton pdfToolBarButton = new JButton(pdfIcon);
		JButton reloadUrgenceButton = new JButton(reloadIcon);
		JButton sortiUrgenceButton = new JButton(sortiedurgenceIcon);

		toolBar.add(openToolBarButton);
		toolBar.add(searchToolBarButton);
		toolBar.addSeparator(); // Séparateur
		toolBar.add(pdfToolBarButton);
		toolBar.add(reloadUrgenceButton);
		toolBar.addSeparator(); // Séparateur
		toolBar.add(sortiUrgenceButton);

		SearchPersonUI search = new SearchPersonUI(this);

		

		// Configuration des actions pour les boutons de la barre d'outils
		openToolBarButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				// Appel de la classe PersonInfoEntryUI
				SwingUtilities.invokeLater(() -> personInfoEntryUI.setVisible(true));

				// aboutItem.addActionListener(e -> showAboutUsDialog(frame));

			}
		});

		searchToolBarButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				SwingUtilities.invokeLater(() -> search.setVisible(true));
			}
		});

		pdfToolBarButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				if (isPDFGenerated) {

					TreePath path = peopleJTree.getSelectionPath();
					Person selectedPerson = null;

					if (path != null) {
						DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();

						if (selectedNode instanceof ExamTreeNode) {
							ExamTreeNode examNode = (ExamTreeNode) selectedNode;
							selectedPerson = examNode.getPerson();

							String pdfFilePath = DirectoryManager.getPDFPersonExamListInDirectory(selectedPerson,
									examNode);
							PDFCreator.openBrowseFile(pdfFilePath);
						}

						if (selectedNode instanceof PersonTreeNode) {
							PersonTreeNode personTreeNode = (PersonTreeNode) selectedNode;
							selectedPerson = personTreeNode.getPerson();

							String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
							PDFCreator.openBrowseFile(pdfFilePath);
						}

					}

					if (selectedPerson == null) {
						showWarningDialog("aucune personne selectionnée");
					}
				}
			}
		});

		reloadUrgenceButton.addActionListener(e -> reloadPhotosAction());

		sortiUrgenceButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				System.exit(0);
			}
		});

		return toolBar;
	}

	private ImageIcon createResizedIcon(String path, int width, int height) {
		ImageIcon icon = new ImageIcon(path);
		Image img = icon.getImage().getScaledInstance(width, height, Image.SCALE_SMOOTH);
		return new ImageIcon(img);
	}

}
