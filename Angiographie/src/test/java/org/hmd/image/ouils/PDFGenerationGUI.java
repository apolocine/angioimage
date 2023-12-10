package org.hmd.angio.pdf;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.util.Arrays;
import java.util.List;

public class PDFGenerationGUI extends JFrame {

    private JComboBox<String> orientationComboBox;
    private JComboBox<Integer> photosPerLineComboBox;
    private JComboBox<Integer> photoSizeComboBox;
    private JSlider topMarginSlider;
    private JSlider sideMarginSlider;
    private JButton generatePDFButton;
    private JTextArea previewTextArea;
	private String absolutePath;
	private List<File> listPhotos;

    public PDFGenerationGUI() {
        initPDFGeneration();
    }

	private void initPDFGeneration() {
		initializeComponents();
        setLayout(new BorderLayout());

        JPanel optionsPanel = new JPanel(new GridLayout(6, 2));
        optionsPanel.add(new JLabel("Orientation de la page:"));
        optionsPanel.add(orientationComboBox);
        optionsPanel.add(new JLabel("Nombre de photos par ligne:"));
        optionsPanel.add(photosPerLineComboBox);
        optionsPanel.add(new JLabel("Taille des photos:"));
        optionsPanel.add(photoSizeComboBox);
        optionsPanel.add(new JLabel("Marge supérieure:"));
        optionsPanel.add(topMarginSlider);
        optionsPanel.add(new JLabel("Marge latérale:"));
        optionsPanel.add(sideMarginSlider);
        optionsPanel.add(new JLabel(""));
        optionsPanel.add(generatePDFButton);

        add(optionsPanel, BorderLayout.NORTH);
        add(new JScrollPane(previewTextArea), BorderLayout.CENTER);

        generatePDFButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                generatePDF();
            }
        });

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(500, 400);
        setTitle("Génération PDF");
        setLocationRelativeTo(null);
	}

    public PDFGenerationGUI(String absolutePath, List<File> listPhotos) {
    	 
    	 initPDFGeneration();
    	 
    	this.absolutePath = absolutePath;
    	this.listPhotos = listPhotos;
    	
	}

	private void initializeComponents() {
        orientationComboBox = new JComboBox<>(new String[]{"Portrait", "Paysage"});
        photosPerLineComboBox = new JComboBox<>(new Integer[]{1, 2, 3, 4, 5});
        photoSizeComboBox = new JComboBox<>(new Integer[]{150, 200, 300, 400, 500});
        topMarginSlider = new JSlider(0, 100, 10);
        sideMarginSlider = new JSlider(0, 100, 10);
        generatePDFButton = new JButton("Générer PDF");
        previewTextArea = new JTextArea();
    }

    private void generatePDF() {
        // Insérer le code de génération PDF en fonction des paramètres sélectionnés
        // Mise à jour de l'aperçu dans previewTextArea
        previewTextArea.setText("PDF généré avec succès!\n" +
                "Orientation: " + orientationComboBox.getSelectedItem() + "\n" +
                "Nombre de photos par ligne: " + photosPerLineComboBox.getSelectedItem() + "\n" +
                "Taille des photos: " + photoSizeComboBox.getSelectedItem() + "\n" +
                "Marge supérieure: " + topMarginSlider.getValue() + "\n" +
                "Marge latérale: " + sideMarginSlider.getValue());
        
//        // Implement PDF generation logic here
//        // Retrieve selected options and apply them to the PDF generator
//        int selectedPhotoSize = (int) photoSizeComboBox.getSelectedItem();
//        int orientation = orientationComboBox.getSelectedIndex();// portraitRadioButton.isSelected();
//        int marginTop = topMarginSlider.getValue();//Integer.parseInt(marginTopField.getText());
//        int marginLeft = sideMarginSlider.getValue();//Integer.parseInt(marginLeftField.getText());
//
 
        previewTextArea.setText("PDF généré avec succès!\n" +
                "Orientation: " + orientationComboBox.getSelectedItem() + "\n" +
                "Nombre de photos par ligne: " + photosPerLineComboBox.getSelectedItem() + "\n" +
                "Taille des photos: " + photoSizeComboBox.getSelectedItem() + "\n" +
                "Marge supérieure: " + topMarginSlider.getValue() + "\n" +
                "Marge latérale: " + sideMarginSlider.getValue());
        
        
        
        // Add logic to use these values for PDF generation
        // For example, you can use a PDF library like iText or Apache PDFBox
        // to create a PDF document with the specified options.
        
        
        
        
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new PDFGenerationGUI().setVisible(true);
        });
    }
}
