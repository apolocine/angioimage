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
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;
import javax.swing.BorderFactory;
import javax.swing.Box;
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
import javax.swing.JTextPane;
import javax.swing.JToolBar;
import javax.swing.JTree;
import javax.swing.SpinnerNumberModel;
import javax.swing.SwingUtilities;
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
import org.hmd.image.ouils.ThumbnailRenderer;

import net.coobird.thumbnailator.Thumbnails;

public class PhotoOrganizerTreeApp2 implements PhotoOrganizer {
	 String[] extensions = {"jpg", "jpeg", "png", "bmp", "gif"};
	private PersonDAO personDAO; // Ajouter l'instance de PersonDAO

	// Modifiez le type de peopleList
	private DefaultListModel<Person> peopleListModel;
	private JList<Person> peopleJList;
	JPanel peoplePanel = new JPanel(new BorderLayout());
	
	
	private JList<File> photoList;
	private DefaultListModel<File> listModel;

	
	
	
	
	private File selectedDirectory;
	private JFrame frame;
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
			new PhotoOrganizerTreeApp2();
		});
	}

	public PhotoOrganizerTreeApp2() {
		
		
		frame = new JFrame("Photo Organizer");
		frame.setSize(800, 600);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		JToolBar toolBar = getToolBar();
		// Configuration de la barre d'outils
		frame.add(toolBar, BorderLayout.PAGE_START);

		initializeMenu();

		
		
		
		// Ajoutez la liste des personnes au-dessus de la liste de photos
		JPanel directoryPeoplePanel = new JPanel(new BorderLayout());
		directoryPeoplePanel.add(new JLabel("Liste des   personnes "), BorderLayout.NORTH);
		directoryPeoplePanel.add(new JScrollPane(initPeopleListe()), BorderLayout.CENTER);

		
		
		// Ajoutez votre liste de photos (par exemple, photoList) ici
		// ...
		// Ajoutez un bouton pour afficher les photos de la personne sélectionnée
		JButton showPhotosButton = new JButton("Afficher les Photos");
		showPhotosButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				displayPhotosForPerson();

			}
		});
		directoryPeoplePanel.add(showPhotosButton, BorderLayout.SOUTH);
		
		
		
		
		
		// Ajoutez la liste des personnes au-dessus de la liste de photos
		JPanel directoryImagePanel = new JPanel(new BorderLayout());
		directoryImagePanel.add(new JLabel("Liste des Photos"), BorderLayout.NORTH);
		directoryImagePanel.add(new JScrollPane(initializePhotoList()), BorderLayout.CENTER); 
		
		JSplitPane splitDirectoryPeoplePhotoPane = new JSplitPane(JSplitPane.VERTICAL_SPLIT,directoryPeoplePanel , directoryImagePanel);
		
		
		
		
		
		// Ajoutez la liste des personnes au-dessus de la liste de photos
				JPanel treePeoplePhotsPanel = new JPanel(new BorderLayout());
				treePeoplePhotsPanel.add(new JLabel("Liste des personnes "), BorderLayout.NORTH);
				treePeoplePhotsPanel.add(new JScrollPane(initializePeopleTree()), BorderLayout.CENTER);
				
				
				
		// Ajoutez la liste de photos
				JPanel treePhotosPanel = new JPanel(new BorderLayout());
				treePhotosPanel.add(new JLabel("Tree -> Liste de Photos"), BorderLayout.NORTH);
				treePhotosPanel.add(new JScrollPane(initializeTreePhotoList()), BorderLayout.CENTER);
				
				JSplitPane treeSplitDirectoryPeoplePhotoPane = new JSplitPane(JSplitPane.VERTICAL_SPLIT,treePeoplePhotsPanel , treePhotosPanel);
				
				
				
				
		
		// splite vertivcale liste des patients
		// liste des photois du patient selectioné
		JSplitPane splitPeoplePhotoPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT ,treeSplitDirectoryPeoplePhotoPane ,splitDirectoryPeoplePhotoPane);

		
		
		JSplitPane dashBoardSplitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, splitPeoplePhotoPane, getsplitPanel());

		
		frame.add(dashBoardSplitPane, BorderLayout.CENTER);

		frame.setVisible(true);

		
		
		// Ajoutez le JScrollPane de l'arborescence à votre interface utilisateur
	  
 	frame.add(peoplePanel, BorderLayout.WEST);

	} 

	
	/**
	 * 
	 * @return
	 */
	private JList<Person>  initPeopleListe() {
		
		
		 
		
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

				if(personDAO.isConnected()) {
					
					if (e.getClickCount() == 2) {
					// Double-clic détecté
					displayPhotosForPerson();

				}
				
				if (e.getClickCount() == 1) {
					
						if (!photoList.isSelectionEmpty()) {
							System.out.println("!photoList.isSelectionEmpty() Not null :"+!photoList.isSelectionEmpty());
							Person selectedPerson = peopleJList.getSelectedValue();
		
							if (selectedPerson!=null){
								String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
								File pdfFilePerson = new File(pdfFilePath);
								System.out.println(" selectedPerson.getNom()  :"+selectedPerson.getNom());
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
									//	previewPDFPanel.addMouseWheelListener(new ZoomHandler(pdfFilePath, previewPDFPanel));
										previewPDFPanel.addMouseListener(new ContextMenuMouseListener(pdfFilePath, previewPDFPanel));
									}
								}
						
						}else {
						  showPopup(  e) ;
							
						}
				}
				}else {
					
					   showErrorDialog("Erreur de connection à la base de donnée "  , new  Exception());
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

			
		});

		
		return peopleJList;
		
	}
	
private void showPopup(MouseEvent e) {
				if (e.isPopupTrigger()) {
					// Affichez le menu contextuel ici
					createPeoplePopupMenu().show(e.getComponent(), e.getX(), e.getY());
				}
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

//	private void displayPhotosForPerson() {
//
//		Person selectedPerson = peopleJList.getSelectedValue();
//
//		if (selectedPerson != null) {
//
//			// Ajoutez votre logique pour afficher les photos de la personne sélectionnée
//			// JOptionPane.showMessageDialog(frame, "Afficher les photos de peretoire : " +
//			// selectedPerson.getNom());
//
//			String directory = DirectoryManager.getPersonWorkspaceDirectory(selectedPerson);
//			File workingDirectory = new File(directory);
//			chooseDirectory(workingDirectory);
//
//		} else {
//			JOptionPane.showMessageDialog(frame, "Personne non trouvée.", "Erreur", JOptionPane.ERROR_MESSAGE);
//		}
//
//	}

	
	
	
	private void displayPhotosForPerson() {
	    Person selectedPerson = peopleJList.getSelectedValue();

	    if (selectedPerson != null) {
	        String directory = DirectoryManager.getPersonWorkspaceDirectory(selectedPerson);
	        File workingDirectory = new File(directory);

	        if (workingDirectory.exists() && workingDirectory.isDirectory()) {
	            try {
	                chooseDirectory(workingDirectory); // Charge les photos
	            } catch (IOException e) {
	                showErrorDialog("Impossible de charger les photos pour " + selectedPerson.getNom(), e);
	            }
	        } else {
	            showWarningDialog("Le répertoire pour " + selectedPerson.getNom() + " n'existe pas.");
	        }
	    } else {
	        showWarningDialog("Aucune personne sélectionnée.");
	    }
	}
	
	


	
	private void showErrorDialog(String message, Exception e) {
	    JOptionPane.showMessageDialog(frame, message + "\n" + e.getMessage(), "Erreur", JOptionPane.ERROR_MESSAGE);
	    e.printStackTrace();
	}

	private void showWarningDialog(String message) {
	    JOptionPane.showMessageDialog(frame, message, "Attention", JOptionPane.WARNING_MESSAGE);
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

	private JList initializePhotoList() { 
		
		// Au démarrage, chargez la configuration depuis le fichier
		// lecture directed des informationsà partir du ficher nous avons pas besoins de
		// l'interface utilisateur

		// Utilisez la configuration chargée, par exemple :
		String directory = DirectoryManager.getWorkspaceDirectory();

		if (directory != null && new File(directory).isDirectory()) {
			selectedDirectory = new File(directory);
		}


	



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

	
	
	private JList  initializeTreePhotoList(){

		
		// Au démarrage, chargez la configuration depuis le fichier
		// lecture directed des informationsà partir du ficher nous avons pas besoins de
		// l'interface utilisateur

		// Utilisez la configuration chargée, par exemple :
		String directory = DirectoryManager.getWorkspaceDirectory();

		if (directory != null && new File(directory).isDirectory()) {
			selectedDirectory = new File(directory);
		}


	

		listTreeModel = new DefaultListModel<>();
		photoTreeList = new JList<>(listTreeModel);

		// "ListSelectionModel.MULTIPLE_INTERVAL_SELECTION"
		photoTreeList.setSelectionMode(2);

		//en grande icone  
//		photoTreeList.setCellRenderer(new ThumbnailRenderer4Tree());
		
		//en petites icones
		photoTreeList.setCellRenderer(new ThumbnailRenderer());
		
		photoTreeList.addMouseListener(new MouseAdapter() {
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

		peopleJTree.addMouseListener(new MouseAdapter() {
		    @Override
		    public void mouseClicked(MouseEvent e) {
		    	
		    
		        if (e.getClickCount() == 3) { // Double-clic
		         	System.out.println("People tree triple clicked");   
		         	TreePath path = peopleJTree.getPathForLocation(e.getX(), e.getY());
		            if (path != null) {
		            	System.out.println("TreePath is not null");
		            	
		                DefaultMutableTreeNode selectedNode = 
		                        (DefaultMutableTreeNode) path.getLastPathComponent();
		                	Object userObject = selectedNode.getUserObject();
		            	    System.out.println("User object: " + userObject + ", Type: " + userObject.getClass().getName());

		            	    if (userObject instanceof File) {
		            	    	 
		                    File selectedDir = (File) selectedNode.getUserObject();

		                    if (selectedDir.isDirectory()) {
		                        loadPhotosJTree(selectedDir); // Charge les miniatures
		                    }
		                }else {
		                	System.out.println("selectedNode is not  instanceof File");
		                }
		            }else {
		            	System.out.println("TreePath is null");
		            }
		        }
		    }
		});

		
		
//		photoTreeList.addMouseListener(new MouseAdapter() {
//			@Override
//			public void mouseClicked(MouseEvent e) {
//
//				if (e.getClickCount() == 3) {
//					// Double-clic détecté
//					File selectedFile = photoTreeList.getSelectedValue();
//					if (selectedFile != null) {
//						try {
// 
//							displayImage(selectedFile);
//
//						} finally {
//							File selectedDirectory = new File(selectedFile.getParent());
//
//							try {
//								loadPhotos(selectedDirectory);
//							} catch (IOException e1) {
//								// TODO Auto-generated catch block
//								e1.printStackTrace();
//							}
//						}
//
////						String originalFilePath = selectedFile.getAbsolutePath();
////						String originalFileDir = originalFilePath.substring(0, 
////								originalFilePath.lastIndexOf(File.separato(File.separator));
////						 
//
//					}
//				}
//
//			}
//
//		});

	
		return photoTreeList;
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
		 frame.setJMenuBar(menuBar);
 
	}

 
	
	private static void showAboutUsDialog(JFrame parentFrame) {
        JTextPane textPane = new JTextPane();
        textPane.setContentType("text/html");
        textPane.setEditable(false);

        String aboutText = "<html><b>About Us</b><br>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br>" +
                "Welcome to our application!"
             + "\r\n"+ 
             "Contact us: <a href=\"mailto:drmdh@msncom\">drmdh@msncom</a><br>" +
             "Visit our website: <a href=\"http://amia.fr\">http://amia.fr</a></html>";

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

	
	private void chooseDirectory(File directory) throws IOException {
	    if (directory != null && directory.exists() && directory.isDirectory()) {
	        loadPhotos(directory);
	      //  JOptionPane.showMessageDialog(frame, "Photos du répertoire chargé avec succès.", "Succès", JOptionPane.INFORMATION_MESSAGE);
	    } else {
	        throw new IOException("Répertoire invalide ou inaccessible : " + directory);
	    }
	}
	
	

	
	
	@Override
	public Person addTodayWorkPerson(Person person_) {
		
		
//		// Ajoutez la personne à la base de données
		Person person = personDAO.saveOrUpdatePerson(person_); 
//		 showPerson(  person);
		
		if(person != null) { 

		// Ajoutez la personne à la liste
		peopleListModel.addElement(person);

		// Mettez à jour peopleList pour refléter les changements
		peopleJList.updateUI();

		// Affichez le répertoire de photos de la personne dans photoList
		loadPhotosForPerson(person);
		}
		return person;
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

		JPanel optionsPanel = initOptionPDF();

		JPanel panelOptionsView = buttonPDFAction();

		JScrollPane previewScrollPane = panelPDFView();
		JScrollPane pdfScrollPane = panelPDFView2();

		JSplitPane splitTextArea = new JSplitPane(JSplitPane.VERTICAL_SPLIT, panelOptionsView, previewScrollPane);
		JSplitPane splitViewOptions = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, optionsPanel, splitTextArea);
		JSplitPane splitViewPdf = new JSplitPane(JSplitPane.VERTICAL_SPLIT, splitViewOptions, pdfScrollPane);

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
							String  generatedPDFFile = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);

							
							//premier viewer 
							displayPDF(generatedPDFFile, pdfPanel);
							// Add zoom functionality
							pdfPanel.addMouseWheelListener(new ZoomHandler(generatedPDFFile, pdfPanel));
							pdfPanel.addMouseListener(new ContextMenuMouseListener(generatedPDFFile, pdfPanel));
							
							
							//premier viewer
							displayPDF(generatedPDFFile, previewPDFPanel);
							// Add zoom functionality
							// previewPDFPanel.addMouseWheelListener(new ZoomHandler(generatedPDFFile, previewPDFPanel));
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
					String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
					PDFCreator.openBrowseFile(pdfFilePath);
				}

			}
		});

		printePDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				Person selectedPerson = peopleJList.getSelectedValue();

//				try {
//					generatePDF(selectedPerson);
//				}  				
//				finally {
				
					String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
					File pdfFilePerson = new File(pdfFilePath);
					PDFCreator.printPDF(pdfFilePerson);
//				}

			}
		});
		return panelOptionsView;
	}

	private JPanel initOptionPDF() {
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
		return optionsPanel;
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

				String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
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
	private JList<File> photoTreeList;
	private DefaultListModel<File> listTreeModel;
	
	private DefaultTreeModel treeModel;
	private JTree peopleJTree;
	// Créez la racine du tree
	DefaultMutableTreeNode root,today,inAction,allRecords  ;
	
	
	private JScrollPane initializePeopleTree() {
		
		
		// Initialisation de la frame et d'autres composants

		// Créez la racine du tree
		  root = new DefaultMutableTreeNode("Workspace");  
		  today = new DefaultMutableTreeNode("Today");  
		  inAction = new DefaultMutableTreeNode("En Action");
		  allRecords = new DefaultMutableTreeNode("All Records");
		  
		  
		
		  
		// Créez le modèle de l'arbre avec la racine
		treeModel = new DefaultTreeModel(root);

		// Créez le JTree avec le modèle
		peopleJTree = new JTree(treeModel);
		peopleJTree.setRootVisible(false); // Masquer la racine de l'arborescence
		
		
//		peopleJTree.addTreeSelectionListener(new TreeSelectionListener() {
//			@Override
//			public void valueChanged(TreeSelectionEvent e) {
//				DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) peopleJTree.getLastSelectedPathComponent();
//
//				if (selectedNode != null && selectedNode.getUserObject() instanceof File) {
//					File selectedFile = (File) selectedNode.getUserObject();
//					// Ajoutez votre logique pour afficher les photos du répertoire sélectionné
//					loadPhotosJTree(selectedFile);
//				}
//
//			}
//		});

		
		peopleJTree.addMouseListener(new MouseAdapter() {
		    @Override
		    public void mouseClicked(MouseEvent e) {
		        if (e.getClickCount() == 2) { // Double-clic
		            TreePath path = peopleJTree.getPathForLocation(e.getX(), e.getY());
		            if (path != null) {
		                DefaultMutableTreeNode selectedNode = 
		                        (DefaultMutableTreeNode) path.getLastPathComponent();

		                if (selectedNode.getUserObject() instanceof File) {
		                    File selectedDir = (File) selectedNode.getUserObject();

		                    if (selectedDir.isDirectory()) {
		                        loadPhotosJTree(selectedDir); // Charge les miniatures
		                    }
		                }
		            }
		        }
		    }
		});

		
  
		 
		// Ajoutez le JTree à un JScrollPane et à la frame
		JScrollPane treeScrollPane = new JScrollPane(peopleJTree);
 		frame.add(treeScrollPane, BorderLayout.WEST);

		
//	    String dDate="Sat Apr 11 12:16:44 IST 2015"; 
//	    SimpleDateFormat df = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
//	    Date cDate = df.parse(dDate); 
		
		
		Person perso = new Person("H", "Madani", new Date());
		// Exemple pour ajouter une personne et une photo
		addPersonForTree(perso);
		// addPhoto(perso, DirectoryManager.getPersonWorkspaceDirectory(perso));

		
		 List<Person> people = personDAO.findAll();	
	    // DefaultMutableTreeNode root = new DefaultMutableTreeNode("Patients");   
	     
	        for (Person person : people) {
				
	      	 PhotoDirectoryUtils.createPhotoTreeAsFileNodes(allRecords, person) ; 
//	       	  PersonTreeNode personNode = new PersonTreeNode(person);
//	       	allRecords.add(personNode);
	       	 
			}
	        
	 

	        
			addTextToTree("Action");
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
	
 
	@Override
	public void showSearchResultPerson(Person person) {
		  
		copyNodeWithChildren(inAction.getNextNode(), today ); 
		// Effacer tous les enfants de la racine 
        inAction.removeAllChildren(); 
		PersonTreeNode photoTre =  	PhotoDirectoryUtils.createPhotoTreeAsFileNodes(inAction, person) ;   
		peopleJTree = new JTree(new DefaultTreeModel(photoTre)); 
		// Rafraîchissez le modèle du JTree
		treeModel.reload();
		peopleJTree.updateUI();  
		// Affichez le répertoire de photos de la personne dans photoList
		loadPhotosForPerson(person);
	}
	
	private void addTextToTree(String  text ) { 
		
		DefaultMutableTreeNode textNode = new DefaultMutableTreeNode(text); 
		treeModel.insertNodeInto(textNode, (DefaultMutableTreeNode) treeModel.getRoot(),
				treeModel.getChildCount(treeModel.getRoot())); 
	}
	
	
    // Méthode pour copier un nœud avec tous ses fils
    private void copyNodeWithChildren(DefaultMutableTreeNode selectedNode, DefaultMutableTreeNode dest ) {
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
    
    
    
	private void addTextToNode(String  text,DefaultMutableTreeNode node) { 
		
		DefaultMutableTreeNode textNode = new DefaultMutableTreeNode(text);

		treeModel.insertNodeInto(textNode, node,
				treeModel.getChildCount(node));
	}
	
	private void addPersonForTree(Person perso) {
		
		 addTextToTree(perso.getNom() + " " + perso.getPrenom());
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

//	private JScrollPane  initializeJTree() {
//		// ... Autres parties de votre code ...
// 
//		personDAO = new PersonDAO();
//		List<Person> people = personDAO.findAll();		
//		DefaultMutableTreeNode toDay = new DefaultMutableTreeNode("Today");
//        DefaultMutableTreeNode root = new DefaultMutableTreeNode("Workspace");
//	        
//        // Ajoutez la liste de photos (arborescence) à votre interface utilisateur
//		tree = new JTree(new DefaultTreeModel(toDay));
//		
//        for (Person person : people) {
//			
//        	 PhotoDirectoryUtils.createPhotoTree(toDay, person) ; 
//		}
//		// Ajoutez la liste de photos (arborescence) à votre interface utilisateur
//		   
//		tree.setRootVisible(false); // Masquer la racine de l'arborescence
//		tree.addTreeSelectionListener(new TreeSelectionListener() {
//			@Override
//			public void valueChanged(TreeSelectionEvent e) {
//				DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) tree.getLastSelectedPathComponent();
//
//				if (selectedNode != null && selectedNode.getUserObject() instanceof File) {
//					File selectedFile = (File) selectedNode.getUserObject();
//					// Ajoutez votre logique pour afficher les photos du répertoire sélectionné
//					loadPhotosJTree(selectedFile);
//				}
//
//			}
//		});
//
//		JScrollPane treeScrollPane = new JScrollPane(tree);
//		treeScrollPane.setPreferredSize(new Dimension(200, 400));
// 
//		return treeScrollPane; 
//	}

//	private void loadPhotosJTree(File directory) {
//		listModel.clear();
//
//		File[] files = directory.listFiles();
//		if (files != null) {
//			for (File file : files) {
//				if (isImageFile(file)) {
//					listModel.addElement(file);
//				}
//			}
//		}
//
////	        loadPhotos( directory);
//
//	}

	
	private void loadPhotosJTree(File directory) {
	    if (directory.isDirectory()) {
	       // listTreeModel.clear(); // Videz la liste existante
	        listModel.clear(); // Videz la liste existante
	        File[] photoFiles = directory.listFiles((dir, name) -> {
	            // Filtre les fichiers qui sont des images (par extension)
	            String lowerCaseName = name.toLowerCase();
	            return lowerCaseName.endsWith(".jpg") || lowerCaseName.endsWith(".jpeg") || 
	                   lowerCaseName.endsWith(".png") || lowerCaseName.endsWith(".gif");
	        });

	        if (photoFiles != null) {
	            for (File photo : photoFiles) {
	               // listTreeModel.addElement(photo); // Ajoutez chaque fichier image au modèle
	                listModel.addElement(photo); // Ajoutez chaque fichier image au modèle
	            }
	        }
	    }
	}

	
	
	
	
	/**
	 * 
	 * @param directory
	 */
	private void updateTree(File directory) {
		DefaultMutableTreeNode rootNode = createTreeNode(directory);
		DefaultTreeModel treeModel = new DefaultTreeModel(rootNode);
		 peopleJTree.setModel(treeModel);
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
		
		// peopleJTree.getAccessibleContext();
		Person selectedPerson = peopleJList.getSelectedValue();
		if (selectedPerson != null) {
			//File selectedFile = photoList.getSelectedValue();
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
	            JOptionPane.showMessageDialog(null,
	                    "Veuillez sélectionner une photo ou un examen.",
	                    "Sélection Invalide", JOptionPane.INFORMATION_MESSAGE);
	        }
	    } else {
	        JOptionPane.showMessageDialog(null,
	                "Vous devez sélectionner une personne, un examen ou une photo.",
	                "Pas de Sélection", JOptionPane.INFORMATION_MESSAGE);
	    }
	}

	// Gérer la sélection d'un fichier photo (photo individuelle)
	private void handlePhotoSelection(PhotoTreeNode photoNode) throws IOException {
	    ExamTreeNode examNode = (ExamTreeNode) photoNode.getParent();
	    //PersonTreeNode personNode = (PersonTreeNode) examNode.getParent();

	    if (examNode != null) {
	        // Créer le PDF pour une photo spécifique
	        generatePDF(examNode, Arrays.asList((File) photoNode.getUserObject()));
	    }
	}

	// Gérer la sélection d'un répertoire d'examen (ensemble de photos)
	private void handleExamSelection(ExamTreeNode examNode) throws IOException {
	  //  PersonTreeNode personNode = (PersonTreeNode) examNode.getParent();
	    File examDir = (File) examNode.getUserObject();

	    if (examNode != null && examDir.isDirectory()) {
	        File[] listPhotos = examDir.listFiles((dir, name) -> 
	            name.toLowerCase().matches(".*\\.(jpg|png|jpeg)$")
	        );

	        if (listPhotos != null && listPhotos.length > 0) {
	            generatePDF(examNode, Arrays.asList(listPhotos));
	        } else {
	            JOptionPane.showMessageDialog(null,
	                    "Aucune photo trouvée dans cet examen.",
	                    "Pas de Photos", JOptionPane.INFORMATION_MESSAGE);
	        }
	    }
	}

	// Méthode générique pour générer un PDF à partir d'une personne et d'une liste de photos
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
	
 
	
	private Person getPersonFromNode(DefaultMutableTreeNode node) {
	    while (node != null) {
	        if (node.getUserObject() instanceof PersonTreeNode) {
	            return ((PersonTreeNode) node.getUserObject()).getPerson();
	        }
	        node = (DefaultMutableTreeNode) node.getParent( );
	    }
	    return null;
	}

	public void printPDF() {
	    TreePath path = peopleJTree.getSelectionPath();
	    ExamTreeNode examTreeNode = null;

	    if (path != null) {
	        DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) path.getLastPathComponent();
	        Object userObject = selectedNode.getUserObject();
	        
	        // Parcours ascendant pour trouver l'ExamTreeNode
	        while (selectedNode != null) {
	            if (userObject instanceof ExamTreeNode) {
	                examTreeNode = (ExamTreeNode) userObject;
	                System.out.println("Examen détecté : " + examTreeNode.getUserObject());
	                break;
	            }
	            selectedNode = (DefaultMutableTreeNode) selectedNode.getParent();
	            userObject = selectedNode != null ? selectedNode.getUserObject() : null;
	        }
	        
	        if (examTreeNode == null) {
	            JOptionPane.showMessageDialog(null,
	                    "Veuillez sélectionner un examen pour imprimer les photos.",
	                    "Sélection Invalide", JOptionPane.WARNING_MESSAGE);
	            return;
	        }
	    } else {
	        JOptionPane.showMessageDialog(null,
	                "Aucun élément sélectionné dans l'arbre.",
	                "Pas de Sélection", JOptionPane.WARNING_MESSAGE);
	        return;
	    }

	    // Vérification de la sélection de photo
	    File selectedFile = photoTreeList.getSelectedValue();

	    if (selectedFile != null || !photoTreeList.isSelectionEmpty()) {
	        String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(examTreeNode);
	        File pdfFilePerson = new File(pdfFilePath);

	        if (pdfFilePerson.exists()) {
	            PDFCreator.printPDF(pdfFilePerson);
	        } else {
	            JOptionPane.showMessageDialog(null,
	                    "Le fichier PDF n'a pas été trouvé.",
	                    "Erreur d'Impression", JOptionPane.ERROR_MESSAGE);
	        }
	    } else {
	        JOptionPane.showMessageDialog(null,
	                "Vous devez sélectionner au moins une photo pour imprimer.",
	                "Pas de Photo Sélectionnée", JOptionPane.INFORMATION_MESSAGE);
	    }
	}


	
	
	/**
	 * 
	 */
	public void printPDF____() {// Créez le modèle de l'arbre avec la racine
//		treeModel = new DefaultTreeModel(root);
//
//		// Créez le JTree avec le modèle
//		peopleJTree = new JTree(treeModel);
//		peopleJTree.setRootVisible(false); // Masquer la racine de l'arborescence
//		
		
	   	TreePath path = peopleJTree.getSelectionPath( );
	   	ExamTreeNode examTreeNode = null;
        if (path != null) {
        	System.out.println("TreePath is not null");
        	
            DefaultMutableTreeNode selectedNode = 
                    (DefaultMutableTreeNode) path.getLastPathComponent();
            	Object userObject = selectedNode.getUserObject();
        	    System.out.println("User object: " + userObject + ", Type: " + userObject.getClass().getName());

        	    if (userObject instanceof ExamTreeNode) {
        	    	 
        	    	examTreeNode =   (ExamTreeNode) selectedNode.getUserObject();

                
            }
//        	    else  if (userObject instanceof ExamTreeNode){
//            	examTreeNode =   (ExamTreeNode) selectedNode.getUserObject();
//            	
//            }
            
            else  {
            	System.out.println("selectedNode is not  instanceof File");
            }
        }else {
        	System.out.println("TreePath is null");
        }
        
        
		if (examTreeNode == null) {

			// Image non encore modifiée
			JOptionPane.showMessageDialog(null,
					"Vous devez choisir une date d'examen pour imprimer les photos  à mofifier\n"
							+ " (au moins une photo à modifier)",
					"pas de Modification", JOptionPane.INFORMATION_MESSAGE);
			return;
		}

		File selectedFile = photoTreeList.getSelectedValue();

		if (selectedFile != null || !photoTreeList.isSelectionEmpty()) {

			String pdfFilePath = DirectoryManager.getPDFPersonInWorkspaceDirectory(examTreeNode);
			File pdfFilePerson = new File(pdfFilePath);

			PDFCreator.printPDF(pdfFilePerson);

		} else {
			// Image non encore modifiée
			JOptionPane.showMessageDialog(null, "Vous devez choisir au moins une photo à modifier",
					"pas de Modification", JOptionPane.INFORMATION_MESSAGE);

		}

	}
	
	
	/**
	 * 
	 */
	public void printPDF__() {// Créez le modèle de l'arbre avec la racine
		treeModel = new DefaultTreeModel(root);

		// Créez le JTree avec le modèle
		peopleJTree = new JTree(treeModel);
		peopleJTree.setRootVisible(false); // Masquer la racine de l'arborescence
		

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

			String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
			File pdfFilePerson = new File(pdfFilePath);

			PDFCreator.printPDF(pdfFilePerson);

		} else {
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
    	
    	// Appel de la classe PersonInfoEntryUI
       PersonInfoEntryUI personInfoEntryUI = new PersonInfoEntryUI(this);
            	 
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
					Person selectedPerson = peopleJList.getSelectedValue();
					String pdfFilePath = DirectoryManager.getPDFPersonListInWorkspaceDirectory(selectedPerson);
					PDFCreator.openBrowseFile(pdfFilePath);
				}
            }
        });
        
        
        reloadUrgenceButton.addActionListener(e -> reloadPhotosAction());
        
//		reloadUrgenceButton.addActionListener(new ActionListener() {
//            @Override
//            public void actionPerformed(ActionEvent e) {
//            	SwingUtilities.invokeLater(() -> search.setVisible(true));
//            }
//        });
     

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
	//
//	= l'interieur du jar 
//	private ImageIcon createResizedIcon(String imagePath, int width, int height) {
//        try {
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

}
