package org.hmd.angio.ihm.tree;
import java.io.File;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.swing.JTree;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;

import org.hmd.angio.dto.Person;
import org.hmd.image.ouils.DirectoryManager;

public class PhotoDirectoryUtils {
	
	
	
    public static List<String> getPhotoDirectories(String parentDirectory) {
        List<String> photoDirectories = new ArrayList<>();

        File parentDir = new File(parentDirectory);
        if (parentDir.isDirectory()) {
            File[] subDirectories = parentDir.listFiles(File::isDirectory);

            if (subDirectories != null) {
                for (File subDir : subDirectories) {
                    String directoryName = subDir.getName();
                    if (isValidDateFormat(directoryName)) {
                        photoDirectories.add(subDir.getPath());
                    }
                }
            }
        }

        return photoDirectories;
    }

    public static List<String> getListPhotoDirectories(String parentDirectory) {
        List<String> photoList = new ArrayList<>();
       System.out.println(parentDirectory);
        File parentDir = new File(parentDirectory);
        if (parentDir.isDirectory()) {
            File[] subFiles = parentDir.listFiles(File::isFile);

            if (subFiles != null) {
                for (File file : subFiles) {
                    String fileName = file.getPath();
                    System.out.println(fileName);
                    photoList.add(fileName);
//                    if (isValidDateFormat(fileName)) {
//                        photoList.add(fileName);
//                    }
                }
            }
        }

        return photoList;
    }
    
    
    String dirToDate(String directory) {
    	if(isValidDateFormat(  directory)) {
    		 SimpleDateFormat dateFormat = new SimpleDateFormat("ddMMyyyy");
    	        dateFormat.setLenient(false);
    	        return   dateFormat.toString();
    	}
    	return null;
    }
    
    
    String dateToDir(Date date) {
    	
    		 SimpleDateFormat dateFormat = new SimpleDateFormat("ddMMyyyy");
    	        dateFormat.setLenient(false);
    	        return   dateFormat.format(date);
    }
    
    private static boolean isValidDateFormat(String directoryName) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("ddMMyyyy");
        dateFormat.setLenient(false);

        try {
            Date date = dateFormat.parse(directoryName);
            return true;
        } catch (ParseException e) {
            return false;
        }
    }

    
    public static PersonTreeNode createPhotoTreeAsFileNodes(DefaultMutableTreeNode root, Person person) {
     
    PersonTreeNode personNode = new PersonTreeNode(person);
    root.add(personNode);
	return personNode;
   	 
   	
    }
    
    public static PersonTreeNode createPhotoTreeAsFileNodes_old(DefaultMutableTreeNode root, Person person) {
        // Récupérer le répertoire parent de la personne
        String parentDirectory = DirectoryManager.getPersonWorkspaceDirectory(person);
        File personDirectory = new File(parentDirectory);

        // Vérifier si le répertoire existe
        if (!personDirectory.exists() || !personDirectory.isDirectory()) {
            System.out.println("Le répertoire de la personne n'existe pas ou n'est pas un répertoire.");
            return null;
        }

        // Créer un nœud pour la personne, associé à son répertoire
      //  DefaultMutableTreeNode personNode = new DefaultMutableTreeNode(personDirectory);
        
        PersonTreeNode personNode = new PersonTreeNode(person); 
        
        
        // Récupérer les sous-répertoires (par exemple, les dates des examens)
        List<String> directories = PhotoDirectoryUtils.getPhotoDirectories(parentDirectory);

        for (String dir : directories) {
            File localDir = new File(dir);

            // Créer un nœud pour chaque sous-répertoire
            DefaultMutableTreeNode directoryNode = new DefaultMutableTreeNode(localDir);// (localDir.getName() );

            // Ajouter les fichiers photo au nœud du répertoire
            List<String> files = PhotoDirectoryUtils.getListPhotoDirectories(dir);
            for (String file : files) {
                File localFile = new File(file);
                //ne pas charger les photos seulement les repertoires 'examens
                if(!localFile.isFile()) {
                	DefaultMutableTreeNode fileNode = new DefaultMutableTreeNode(localFile);//(localFile.getName());

                // Ajouter le fichier comme nœud enfant
                directoryNode.add(fileNode);
                }
                
            }

            // Ajouter le nœud du répertoire comme enfant du nœud de la personne
            personNode.add(directoryNode);
        }

        // Ajouter le nœud de la personne à la racine
        root.add(personNode);

        return personNode;
    }

    
    
    
	public static PersonTreeNode createPhotoTreeAsStringNodes(DefaultMutableTreeNode root, Person person) {
    	
   	 String parentDirectory = DirectoryManager.getPersonWorkspaceDirectory(person);  
   	 // Ajouter quelques personnes pour l'exemple
        PersonTreeNode person1 = new PersonTreeNode(person); 
       List<String> directories=  PhotoDirectoryUtils.getPhotoDirectories(parentDirectory); 
       for (String dir : directories) {
    	   File localdir = new File(dir);
    	   
    	   person1.addPhotoDirectory(localdir.getName());
    	    
    	   List<String> files=  PhotoDirectoryUtils.getListPhotoDirectories(dir);
    	   for (String file : files) {
    		   File localfile = new File(file); 
    		   person1.addPhoto(localfile.getName());
		} 
	}
        root.add(person1); 
        JTree tree=   new JTree(new DefaultTreeModel(root)); 
        return person1;
    }
   
	
	
	// Normalization du non du repertoire
		public static String normalizeDirectoryName(Person person) {
		    String prenom = person.getPrenom().replaceAll("[^a-zA-Z0-9]", "_");
		    String nom = person.getNom().replaceAll("[^a-zA-Z0-9]", "_");
		    int id = person.getId();  // Nouvel identifiant unique
		    return id+ "_" + nom + "_" + prenom ;
		}
    
		/**
		 *  Normalization du non du fichier pdf en fonction du nom dela personne et de la date d'examen 
		 *  PDF Name not the path
		 * @param selectedPerson
		 * @return
		 */
		
				public static String normalizePDFName(Person selectedPerson) {
					 
					String pdfFilePath = ""+selectedPerson.getId()+"_"+selectedPerson.getNom()+".pdf"; 
					
					return pdfFilePath;
				}
		
    public static void main(String[] args) {
        String parentDirectory = "C:\\\\Users\\\\DELL\\\\Documents\\\\0APng\\\\1_aaa_aaa";
        List<String> photoDirectories = getPhotoDirectories(parentDirectory);

        System.out.println("Liste des sous-répertoires de photos :");
        for (String directory : photoDirectories) {
            System.out.println(directory);
        }
    }
}
