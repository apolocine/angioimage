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

    public static JTree createPhotoTree(DefaultMutableTreeNode root, Person person) {
    	
   	 String parentDirectory = DirectoryManager.getPersonWorkspaceDirectory(person);  
   	 // Ajouter quelques personnes pour l'exemple
        PersonTreeNode person1 = new PersonTreeNode(person.getNom()+" "+person.getPrenom()); 
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

        //JTree tree=   new JTree(new DefaultTreeModel(root));
        
        return null;
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
