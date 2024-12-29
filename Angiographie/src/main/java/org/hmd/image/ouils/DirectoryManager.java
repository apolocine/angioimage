package org.hmd.image.ouils;

import java.awt.Desktop;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.imageio.ImageIO;
import javax.swing.JOptionPane;

import org.hmd.angio.conf.Config;
import org.hmd.angio.dto.Person;
import org.hmd.angio.ihm.tree.ExamTreeNode;
import org.hmd.angio.ihm.tree.PhotoDirectoryUtils;

public class DirectoryManager {

	// Spécifiez le chemin du répertoire que vous souhaitez ouvrir

	public static void browseDirectory(String directoryPath) {

		// Vérifiez si Desktop est pris en charge sur cette plateforme
		if (Desktop.isDesktopSupported()) {
			Desktop desktop = Desktop.getDesktop();

			// Créez un objet File pour représenter le répertoire
			File directory = new File(directoryPath);

			// Vérifiez si le répertoire existe avant de l'ouvrir
			if (directory.exists()) {
				try {
					// Ouvrir le répertoire avec l'application par défaut
					desktop.open(directory);
				} catch (IOException e) {
					e.printStackTrace();
				}
			} else {
				System.out.println("Le répertoire n'existe pas.");
			}
		} else {
			System.out.println("Desktop n'est pas pris en charge sur cette plateforme.");
		}
	}

	public static String getWorkspaceDirectory() {

		// Utilisez la configuration chargée, par exemple :
		String directory = null;
		try {
			directory = Config.getProperty("directory");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		// System.out.println("Directory: " + directory);
		return directory + File.separator;
	}

	public static String getByPersonPhotosDirectory(Person person) {

		// return
		// person.getId()+"_"+person.getNom()+"_"+person.getPrenom()+File.separator;

		return PhotoDirectoryUtils.normalizeDirectoryName(person);
	}

	public static String getPersonWorkspaceDirectory(Person person) {
		return getWorkspaceDirectory() + getByPersonPhotosDirectory(person);
	}

	public static String mkdir(String directoryPath) {
		File directory = new File(directoryPath);
		boolean success = false;

		if (!directory.exists()) {
			try {
				// Essayez de créer le répertoire
				success = directory.mkdir(); // Utilisez mkdirs() si vous avez besoin de créer des répertoires parents

				if (success) {
					System.out.println("Répertoire créé avec succès !");

					return directoryPath;
				} else {
					System.err.println("Échec de la création du répertoire.");

					return null;
				}

			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		} else {
			return directoryPath;
		}
		return directoryPath;

	}

	/**
	 * 
	 * @param newPerson
	 * @return
	 */
	public static String createphotosDirectory(Person newPerson) {
		// Spécifiez le chemin du répertoire que vous souhaitez créer
		String directoryPath = DirectoryManager.getPersonWorkspaceDirectory(newPerson);

		if (mkdir(directoryPath) != null) {
			System.out.println(directoryPath);
			return directoryPath;
		} else {
			System.out.println("null");
			return null;
		}
	}

	/**
	 * methode utiliser pour migrer les données et changer les noms de repertoires
	 * en fonction de la mormalisation des noms des repertoires
	 */
//public static void migrateExistingDirectories() {
//    File baseDir = new File("C:/dev/test/photos/");
//    for (File dir : baseDir.listFiles()) {
//        String[] parts = dir.getName().split("_");
//        if (parts.length >= 3) {
//            int id = Integer.parseInt(parts[0]);
//            Person person = personDAO.findById(id);
//            if (person != null) {
//                String newDirName = normalizeDirectoryName(person);
//                dir.renameTo(new File(baseDir, newDirName));
//            }
//        }
//    }
//}

	/**
	 * 
	 * @param newPerson
	 * @param date
	 * @return
	 */
	public static String createphotosDirectoryByDate(Person newPerson, Date date) {

		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("ddMMyyyy");
		// Date date_ = simpleDateFormat. parse("25122010");

		String strDate = simpleDateFormat.format(date);
		System.out.println(strDate);

		// Spécifiez le chemin du répertoire que vous souhaitez créer
		String directoryPath = createphotosDirectory(newPerson);

		if (directoryPath != null) {
			directoryPath += File.separator + strDate + File.separator;
			if (mkdir(directoryPath) != null) {
//			open directory 
				DirectoryManager.browseDirectory(directoryPath);

				return directoryPath;
			}
		}

		return null;
	}

	/**
	 * 
	 * @param examTreeNod
	 * @return
	 */
	public static String getPDFPersonInWorkspaceDirectory(ExamTreeNode examTreeNod) {
		Person person = examTreeNod.getPerson();
		String personWorkspace = DirectoryManager.getPersonWorkspaceDirectory(person);
		String dateExam = examTreeNod.getFormattedExamDate();
		String pdfFilePath = personWorkspace + File.separator + dateExam + File.separator + person.getId() + "_"
				+ person.getNom() + ".pdf";

		return pdfFilePath;
	}

	/**
	 * pour imprimer toutes les photo de la persone de tous ses examen
	 * 
	 * @param person
	 * @return
	 */
	public static String getPDFPersonInWorkspaceDirectory(Person person) {

		String personWorkspace = DirectoryManager.getPersonWorkspaceDirectory(person);
		String pdfFilePath = personWorkspace + File.separator + person.getId() + "_" + person.getNom() + ".pdf";

		return pdfFilePath;
	}

	public static String getPDFPersonListInWorkspaceDirectory(Person person) {

		String personWorkspace = DirectoryManager.getPersonWorkspaceDirectory(person);
		String pdfFilePath = personWorkspace + File.separator + person.getId() + "_" + person.getNom() + ".pdf";

		return pdfFilePath;
	}

	public static String getPDFPersonExamListInDirectory(Person person, ExamTreeNode exam) {

		String personWorkspace = DirectoryManager.getPersonWorkspaceDirectory(person);
		String pdfFilePath = personWorkspace + File.separator + exam.getFormattedExamDate() + File.separator
				+ person.getId() + "_" + exam.getFormattedExamDate() + ".pdf";

		return pdfFilePath;
	}

	/**
	 * repertoire d'examen file:\\..\\person\\ddMMyyy
	 * 
	 * @param person
	 * @param exam
	 * @return
	 */
	public static String getPersonExamDirectory(Person person, ExamTreeNode exam) {
		String personWorkspace = DirectoryManager.getPersonWorkspaceDirectory(person);
		String pdfFilePath = personWorkspace + File.separator + exam.getFormattedExamDate();

		return pdfFilePath;
	}

	/**
	 * 
	 * @param originalFile
	 * @param modifiedImage
	 */
	public static void saveModifiedCopy(File originalFile, BufferedImage modifiedImage) {
		try {

			System.out.println("DirectoryManager.saveModifiedCopy");
			// Obtenez le répertoire du fichier original
			String originalFilePath = originalFile.getAbsolutePath();
			String originalFileDir = originalFilePath.substring(0, originalFilePath.lastIndexOf(File.separator));

			// Générez un nom de fichier pour la copie modifiée
			String modifiedFileName = "mdf_" + originalFile.getName();

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
