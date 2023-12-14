package org.hmd.angio.ihm.tree;
import java.io.File;
import java.util.List;

import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTree;
import javax.swing.SwingUtilities;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;

import org.hmd.angio.dto.Person;
import org.hmd.image.ouils.DirectoryManager;

 

public class PhotoTreeExample {
	
	
	
	
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Photo Tree Example");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            
            
            JTree photoTree = createPhotoTree();
            JScrollPane scrollPane = new JScrollPane(photoTree);

            
            frame.getContentPane().add(scrollPane);
            frame.setSize(300, 400);
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
        });
    }
    
    
 
    

    private static JTree createPhotoTree() {
    	
    	
   	   DefaultMutableTreeNode toDay = new DefaultMutableTreeNode("Today");

        DefaultMutableTreeNode root = new DefaultMutableTreeNode("Workspace");

        // Ajouter quelques personnes pour l'exemple
        PersonTreeNode person1 = new PersonTreeNode("John Doe");
        person1.addPhotoDirectory("2022-01-01");
        person1.addPhoto("photo1.jpg");
        person1.addPhoto("photo2.jpg");

        PersonTreeNode person2 = new PersonTreeNode("Jane Smith");
        person2.addPhotoDirectory("2022-02-01");
        person2.addPhoto("photo3.jpg");
        person2.addPhoto("photo4.jpg");

        String parentDirectory = "C:\\\\Users\\\\DELL\\\\Documents\\\\0APng\\\\1_aaa_aaa\\";
        
       List<String> directories=  PhotoDirectoryUtils.getPhotoDirectories(parentDirectory);
       PersonTreeNode person3 = new PersonTreeNode("XXXS Smith");
       
       for (String dir : directories) {
    	   File localdir = new File(dir);
    	   person3.addPhotoDirectory(localdir.getName());
    	    
    	   List<String> files=  PhotoDirectoryUtils.getListPhotoDirectories(dir);
    	   for (String file : files) {
    		   File localfile = new File(file); 
    		   person3.addPhoto(localfile.getName());
		} 
	}
        
        
        root.add(person1);
        root.add(person2);
        root.add(person3);

        JTree tree=   new JTree(new DefaultTreeModel(root));
        
        return tree;
    }
}
