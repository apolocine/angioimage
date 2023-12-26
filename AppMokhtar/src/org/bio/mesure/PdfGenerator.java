package org.bio.mesure;
import java.awt.Desktop;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;

import javax.swing.JFileChooser;
import javax.swing.JOptionPane;

import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

public class PdfGenerator {
    public static void generatePdf(List<PlayerInfo> playerInfoList, String filePath) {
        Document document = new Document();
        FileOutputStream stream = null;
        try {
        	
        	  stream =	new FileOutputStream(filePath);
            PdfWriter.getInstance(document, stream);
            document.open();

            // Ajoutez les informations des joueurs au document PDF
            for (PlayerInfo playerInfo : playerInfoList) {
                addPlayerInfoToPdf(document, playerInfo);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            document.close();
            try {
				stream.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
    }

    private static void addPlayerInfoToPdf(Document document, PlayerInfo playerInfo) {
        try {
        	
        	
            // Ajoutez les informations du joueur au document PDF
            document.add(new Paragraph("Nom: " + playerInfo.getPlayerName()));
            document.add(new Paragraph("Âge: " + playerInfo.getAge()));
            document.add(new Paragraph("Fréquence cardiaque au repos: " + playerInfo.getRestingHeartRate()));
            
            document.add(new Paragraph("Max Heart Rate: " + playerInfo.getMaxHeartRate()));
            document.add(new Paragraph("Training Heart Rate: " + playerInfo.getTrainingHeartRate()));
            document.add(new Paragraph("Max Oxygen Consumption: " + playerInfo.getMaxOxygenConsumption()));
            document.add(new Paragraph("Max Air Speed: " + playerInfo.getMaxAirSpeed()));
            document.add(new Paragraph("Max Air Capacity: " + playerInfo.getMaxAirCapacity()));
         
            // Ajoutez d'autres informations selon vos besoins
            document.add(new Paragraph("\n"));  // Ligne vide entre les joueurs
            
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

//    public static void main(String[] args) {
//        // Exemple d'utilisation
//        List<PlayerInfo> playerInfoList = {new PlayerInfo(), new PlayerInfo()}/* récupérez votre liste de joueurs ici */;
//        generatePdf(playerInfoList, "liste_joueurs.pdf");
//    	
//    }
    
    
    public static String generatePdf(List<PlayerInfo> playerInfoList) {
    	
    	// Create a file chooser
        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Specify a file to save");
        fileChooser.setFileSelectionMode(JFileChooser.FILES_ONLY);

        int userSelection = fileChooser.showSaveDialog(null);
        String selectedFilePath = null;
        if (userSelection == JFileChooser.APPROVE_OPTION) {
              selectedFilePath = fileChooser.getSelectedFile().getAbsolutePath();

            // Add ".pdf" extension if not provided by the user
            if (!selectedFilePath.toLowerCase().endsWith(".pdf")) {
                selectedFilePath += ".pdf";
            }

            // Generate PDF with the selected file path 
            generatePdf(playerInfoList, selectedFilePath);
            // Inform the user about successful PDF generation
//            JOptionPane.showMessageDialog(null, "PDF saved successfully!");
        } else {
            // User canceled the operation
            JOptionPane.showMessageDialog(null, "Operation canceled by the user.");
        }
        
        return selectedFilePath;
    	
    }
    
    
    public static void openPDF(String filePath ) {
      
        // Vérifiez si Desktop est pris en charge sur la plate-forme actuelle
        if (Desktop.isDesktopSupported()) {
            Desktop desktop = Desktop.getDesktop();

            try {
                // Ouvrez le fichier PDF avec l'application par défaut
                desktop.open(new File(filePath));
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Desktop n'est pas pris en charge sur cette plate-forme.");
        }
    }
    
    
    public static void main(String[] args) {
        // Example content for the PDF
       
        List<PlayerInfo> playerInfoList = null;//{new PlayerInfo(), new PlayerInfo()}/* récupérez votre liste de joueurs ici */;
        // Create a file chooser
        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Specify a file to save");
        fileChooser.setFileSelectionMode(JFileChooser.FILES_ONLY);

        int userSelection = fileChooser.showSaveDialog(null);

        if (userSelection == JFileChooser.APPROVE_OPTION) {
            String selectedFilePath = fileChooser.getSelectedFile().getAbsolutePath();

            // Add ".pdf" extension if not provided by the user
            if (!selectedFilePath.toLowerCase().endsWith(".pdf")) {
                selectedFilePath += ".pdf";
            }

            // Generate PDF with the selected file path 
            generatePdf(playerInfoList, selectedFilePath);
            // Inform the user about successful PDF generation
            JOptionPane.showMessageDialog(null, "PDF saved successfully!");
        } else {
            // User canceled the operation
            JOptionPane.showMessageDialog(null, "Operation canceled by the user.");
        }
    }
    
    
}
