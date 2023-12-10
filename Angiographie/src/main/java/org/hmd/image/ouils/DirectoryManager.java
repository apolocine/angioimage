package org.hmd.image.ouils;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.imageio.ImageIO;
import javax.swing.JOptionPane;

import org.hmd.angio.dto.Person;
import org.hmd.angio.ihm.Config;
 
public class DirectoryManager {

	private static final String CONFIG_FILE = "config.properties";
	private static Config config;
	
	
	public static String getWorkspaceDirectory( ) {
		config = new Config(CONFIG_FILE);
		// Utilisez la configuration chargée, par exemple :
		String directory = config.getProperty("directory");
	//	System.out.println("Directory: " + directory);
		return directory+"\\";
	}
	
	public static String getByPersonPhotosDirectory(Person person) {
		
		
		return person.getId()+"_"+person.getNom()+"_"+person.getPrenom()+"\\";
	}
	
	public static String getPersonWorkspaceDirectory(Person person ) {
		return getWorkspaceDirectory( )+getByPersonPhotosDirectory(  person);
	}
	
	
	
	public static boolean mkdir(String directoryPath) {
		File directory = new File(directoryPath);
		boolean success = false;

		if (!directory.exists()) {
			// Essayez de créer le répertoire
			success = directory.mkdir(); // Utilisez mkdirs() si vous avez besoin de créer des répertoires parents

			if (success) {
				System.out.println("Répertoire créé avec succès !");
			} else {
				System.err.println("Échec de la création du répertoire.");
			}
		}
		return success;

	}
	/**
	 * 
	 * @param newPerson
	 * @return
	 */
public static String createphotosDirectory(Person newPerson) { 
			// Spécifiez le chemin du répertoire que vous souhaitez créer
			String directoryPath = DirectoryManager.getPersonWorkspaceDirectory(newPerson); 
			
		 	if (mkdir(directoryPath)) {
		 		System.out.println(directoryPath);
				return directoryPath;
			}else {
				System.out.println("null");
				return null;
			}  
	}
/**
 * 
 * @param newPerson
 * @param date
 * @return
 */
public static String createphotosDirectoryByDate(Person newPerson,Date date) { 
	
	SimpleDateFormat simpleDateFormat = new SimpleDateFormat("ddMMyyyy"); 
	//Date date_ = simpleDateFormat. parse("25122010");
	
	String strDate = simpleDateFormat.format(date);
	System.out.println(strDate);
	
	// Spécifiez le chemin du répertoire que vous souhaitez créer
	String directoryPath =  createphotosDirectory(  newPerson);
	
	if (directoryPath!=null) {
		directoryPath+=strDate+"\\"; 
		if (mkdir(directoryPath)) { 		 
			return directoryPath;
		}  
	}
	
	return null;  
}


/**
 * 
 * @param selectedPerson
 * @return
 */
public static String getPDFPersonInWorkspaceDirectory(Person selectedPerson) {
	String personWorkspace = DirectoryManager.getPersonWorkspaceDirectory(selectedPerson);	
	String pdfFilePath = personWorkspace+""+selectedPerson.getId()+"_"+selectedPerson.getNom()+".pdf"; 
	
	return pdfFilePath;
}
	


public static void saveModifiedCopy(File originalFile, BufferedImage modifiedImage) {
	try {
		
		System.out.println("DirectoryManager.saveModifiedCopy");
		// Obtenez le répertoire du fichier original
		String originalFilePath = originalFile.getAbsolutePath();
		String originalFileDir = originalFilePath.substring(0, originalFilePath.lastIndexOf(File.separator));

		// Générez un nom de fichier pour la copie modifiée
		String modifiedFileName = "modified_" + originalFile.getName();

		// Créez un nouveau fichier pour la copie modifiée dans le même répertoire
		File modifiedFile = new File(originalFileDir, modifiedFileName);

		// Écrivez l'image modifiée dans le fichier
		ImageIO.write(modifiedImage, "jpg", modifiedFile);

		// Affichez un message de confirmation
		JOptionPane.showMessageDialog(null, "Copie modifiée sauvegardée avec succès dans le même répertoire.",
				"Sauvegarde réussie", JOptionPane.INFORMATION_MESSAGE);
	} catch (IOException ex) {
		ex.printStackTrace();
		// Gérez les erreurs d'entrée/sortie
		JOptionPane.showMessageDialog(null, "Erreur lors de la sauvegarde de la copie modifiée.", "Erreur",
				JOptionPane.ERROR_MESSAGE);
	}
}


}
