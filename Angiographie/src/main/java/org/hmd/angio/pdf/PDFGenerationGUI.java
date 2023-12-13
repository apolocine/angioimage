package org.hmd.angio.pdf;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.List;

import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSlider;
import javax.swing.JSpinner;
import javax.swing.JSplitPane;
import javax.swing.JTextArea;
import javax.swing.SpinnerNumberModel;
import javax.swing.SwingUtilities;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.hmd.angio.enuma.PDRectangleEnum;

public class PDFGenerationGUI extends JFrame {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private JComboBox<String> orientationComboBox;
	JComboBox<PDRectangleEnum> rectangleComboBox ;
	private JComboBox<Integer> photosPerLineComboBox;
	private JComboBox<Integer> widthHeightPhotoSizeComboBox; 
	private JSlider xMarginSlider;
	private JSlider yMarginSlider;
	
	private JSlider sideMarginSlider;
	private JSpinner pageCountSpinner; // Nouveau ajout
	private JButton generatePDFButton;
	private JButton printePDFButton;
	private JTextArea previewTextArea;
	private JPanel pdfPanel; // Nouveau ajout
	private String absolutePath;
	private List<File> listPhotos;
	private JScrollPane pdfScrollPane;

	public PDFGenerationGUI() {
		initPDFGeneration();
	}

	public PDFGenerationGUI(String absolutePath, List<File> listPhotos) {
		initPDFGeneration();
		this.absolutePath = absolutePath;
		this.listPhotos = listPhotos;
	}	
	
	
	public void updateData(String absolutePath, List<File> listPhotos) {
		this.absolutePath = absolutePath;
		this.listPhotos = listPhotos;
	}

	
	
	public JSplitPane getsplitPanel() {
		

		//	initializeComponents();
			
			orientationComboBox = new JComboBox<>(new String[] { "Portrait", "Paysage" });
			rectangleComboBox = new JComboBox<>(PDRectangleEnum.values());
			photosPerLineComboBox = new JComboBox<>(new Integer[] { 1, 2, 3, 4, 5, 6, 8, 9, 10 });
			widthHeightPhotoSizeComboBox = new JComboBox<>(new Integer[] { 150, 200, 300, 400, 500 });
			xMarginSlider = new JSlider(0, 100, 10);
			yMarginSlider = new JSlider(0, 100, 10);
			sideMarginSlider = new JSlider(0, 100, 10);
			pageCountSpinner = new JSpinner(new SpinnerNumberModel(1, 1, 10, 1)); // Nouveau ajout
			generatePDFButton = new JButton("Générer PDF");
			printePDFButton = new JButton("Print  PDF");
			previewTextArea = new JTextArea();
			pdfPanel = new JPanel();
			
			
			
			JPanel optionsPanel = new JPanel(new GridLayout(8, 2)); // Ajout d'une rangée pour le nombre de pages
			optionsPanel.add(new JLabel("Orientation de la page:"));
			optionsPanel.add(orientationComboBox);
			optionsPanel.add(new JLabel("Nombre de photos par ligne:"));
			optionsPanel.add(photosPerLineComboBox);
			optionsPanel.add(new JLabel("Taille des photos W/H :"));
			optionsPanel.add(widthHeightPhotoSizeComboBox);
			optionsPanel.add(new JLabel("Marge supérieure:"));
			optionsPanel.add(yMarginSlider);
			optionsPanel.add(new JLabel("Marge latérale:"));
			optionsPanel.add(xMarginSlider);
			optionsPanel.add(new JLabel("Marge latérale:"));
			optionsPanel.add(sideMarginSlider);
			optionsPanel.add(new JLabel("Nombre de pages:")); // Nouveau ajout
			optionsPanel.add(pageCountSpinner); // Nouveau ajout
			

			optionsPanel.add(new JLabel("Format de page :"));
			optionsPanel.add(rectangleComboBox); // Nouveau ajout
			
			
			optionsPanel.add(new JLabel(""));
			optionsPanel.add(generatePDFButton);
			optionsPanel.add(new JLabel(""));
			optionsPanel.add(printePDFButton);
			
			JPanel panelOptionsView = new JPanel();
			
			panelOptionsView.add(generatePDFButton);
			panelOptionsView.add(printePDFButton);
			
			
			previewTextArea = new JTextArea();
			
			 
			
			JSplitPane splitTextArea = new JSplitPane(JSplitPane.VERTICAL_SPLIT, panelOptionsView, previewTextArea);
			
			
			JSplitPane splitViewOptions = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, optionsPanel, splitTextArea);
			
			
			pdfPanel = new JPanel(); // Nouveau ajout
			pdfPanel.setBorder(BorderFactory.createLineBorder(Color.BLACK));
			pdfPanel.setPreferredSize(new Dimension(400, 400));
			pdfPanel.setLayout(new BorderLayout());

		
			pdfScrollPane = new JScrollPane(pdfPanel);			
			JSplitPane splitViewPdf = new JSplitPane(JSplitPane.VERTICAL_SPLIT, splitViewOptions, pdfScrollPane);
			
//			add(optionsPanel, BorderLayout.NORTH);
//			add(pdfScrollPane, BorderLayout.CENTER);
			
			return splitViewPdf;
	}
	
	/**
	 * 
	 */
	private void initPDFGeneration() {
		
		
		setLayout(new BorderLayout());
	
		
		JSplitPane splitViewPdf = getsplitPanel() ;
	 
		add(splitViewPdf, BorderLayout.CENTER);	
	
		
		
	//	add(new JScrollPane(previewTextArea), BorderLayout.SOUTH);

		generatePDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				try {
					generatePDF();
				} finally {

					displayPDF(absolutePath, pdfPanel);
					
				}

			}
		});

		printePDFButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				try {
					generatePDF();
					
					
				} finally {  
					PDFCreator.printPDF( new File(absolutePath));
				}

			}
		});
		
		pageCountSpinner.addChangeListener(new ChangeListener() { // Nouveau ajout
			@Override
			public void stateChanged(ChangeEvent e) {
				updatePDFPreview();
			}
		});

		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		setSize(500, 600);
		setTitle("Génération PDF");
		setLocationRelativeTo(null);

	}

	private void initializeComponents() {
		orientationComboBox = new JComboBox<>(new String[] { "Portrait", "Paysage" });
		photosPerLineComboBox = new JComboBox<>(new Integer[] { 1, 2, 3, 4, 5, 6, 8, 9, 10 });
		widthHeightPhotoSizeComboBox = new JComboBox<>(new Integer[] { 150, 200, 300, 400, 500 });
		xMarginSlider = new JSlider(0, 100, 10);
		sideMarginSlider = new JSlider(0, 100, 10);
		pageCountSpinner = new JSpinner(new SpinnerNumberModel(1, 1, 10, 1)); // Nouveau ajout
		generatePDFButton = new JButton("Générer PDF");
		printePDFButton = new JButton("Print  PDF");
		previewTextArea = new JTextArea();
		pdfPanel = new JPanel();
	}

	private void generatePDF() {

		// Mise à jour de l'aperçu dans previewTextArea
		previewTextArea.setText("PDF généré avec succès!\n" + "Orientation: " + orientationComboBox.getSelectedItem()
				+ "\n" + "Nombre de photos par ligne: " + photosPerLineComboBox.getSelectedItem() + "\n"
				+ "Taille des photos: " + widthHeightPhotoSizeComboBox.getSelectedItem() + "\n" + "Marge supérieure: "
				+ xMarginSlider.getValue() + "\n" + "Marge latérale: " + sideMarginSlider.getValue() + "\n"
				+ "Nombre de pages: " + pageCountSpinner.getValue());
		
		PDFCreator.createPdf(
				

	  			 
				orientationComboBox.getSelectedItem().equals("Portrait"),
				xMarginSlider.getValue(),
				yMarginSlider.getValue(),
				(int) widthHeightPhotoSizeComboBox.getSelectedItem(), 
				(int) widthHeightPhotoSizeComboBox.getSelectedItem(),
				(int) photosPerLineComboBox.getSelectedItem(),
				(int) photosPerLineComboBox.getSelectedItem(),

				(PDRectangleEnum) rectangleComboBox.getSelectedItem(),
		        
				listPhotos,
				absolutePath,
				null
				);

	}

	private void updatePDFPreview() {
		// Mettez à jour le contenu du panneau PDF en fonction du nombre de pages
		// sélectionné
		int pageCount = (int) pageCountSpinner.getValue();
		pdfPanel.removeAll();

		// Ajoutez ici le code pour afficher l'aperçu du PDF en fonction du nombre de
		// pages
		// Utilisez la variable 'pageCount' pour déterminer combien de pages doivent
		// être affichées.

		pdfPanel.repaint();
		pdfPanel.revalidate();
	}

	public void displayPDF(String filePath, JPanel pdfPanel_) {
		try {
			PDDocument document = PDDocument.load(new File(filePath));
			PDFRenderer pdfRenderer = new PDFRenderer(document);

			for (int pageIndex = 0; pageIndex < document.getNumberOfPages(); pageIndex++) {
				BufferedImage image = pdfRenderer.renderImageWithDPI(pageIndex, 100);
				JLabel label = new JLabel(new ImageIcon(image));
				pdfPanel_.add(label);
			}

			document.close();

			pdfPanel_.setLayout(new GridLayout(0, 1));
			pdfPanel_.revalidate();
			pdfPanel_.repaint();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		SwingUtilities.invokeLater(() -> new PDFGenerationGUI().setVisible(true));
	}

 
}
