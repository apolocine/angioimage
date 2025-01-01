package org.hmd.angio.ihm.tree;
import java.io.File;

import javax.swing.tree.DefaultMutableTreeNode;

import org.hmd.angio.dto.Person;
import org.hmd.image.ouils.DirectoryManager;

 
public class PersonTreeNode extends DefaultMutableTreeNode {
    private static final long serialVersionUID = 1L;
    private final Person person;  // Lien vers la personne associée

    
    // Constructeur prenant la personne directement 
   public PersonTreeNode(Person person) {
        super(person);
        this.person = person;
        buildPersonTree();
    }

    public String getPersonDirectoryName() {
    	
    	return PhotoDirectoryUtils.normalizeDirectoryName(person);
    }
    
    // Construit l'arborescence pour cette personne
//    private void buildPersonTree() {
//        String personDirectoryPath = DirectoryManager.getPersonWorkspaceDirectory(person);
//        File personDirectory = new File(personDirectoryPath);
//
//        if (personDirectory.exists() && personDirectory.isDirectory()) {
//            File[] examDirectories = personDirectory.listFiles(File::isDirectory);
//
//            if (examDirectories != null) {
//                for (File examDir : examDirectories) {
//                    DefaultMutableTreeNode examNode = new DefaultMutableTreeNode(examDir.getName());
//                    addPhotosToExamNode(examNode, examDir);
//                    this.add(examNode);  // Ajoute le répertoire de date en tant que sous-noeud
//                }
//            }
//        }
//    }

    
 
    // Construit l'arbre pour la personne (ajoute les examens et photos)
    private void buildPersonTree() {
        String personDirectoryPath = DirectoryManager.getPersonWorkspaceDirectory(person);
        File personDirectory = new File(personDirectoryPath);

        if (personDirectory.exists() && personDirectory.isDirectory()) {
            File[] examDirectories = personDirectory.listFiles(File::isDirectory);

            if (examDirectories != null) {
                for (File examDir : examDirectories) {
                    ExamTreeNode examNode = new ExamTreeNode(examDir);
                    addPhotosToExamNode(examNode, examDir);
                    this.add(examNode);  // Ajoute le nœud d'examen comme enfant
                }
            }
        }
    }
    public void refrechPersonTree() {
    	buildPersonTree();
    }
    // Ajoute les photos comme nœuds sous le répertoire d'examen
    private void addPhotosToExamNode(ExamTreeNode examNode, File examDir) {
        File[] photoFiles = examDir.listFiles((dir, name) -> 
        name.toLowerCase().endsWith(".jpg") || 
        name.toLowerCase().endsWith(".jpeg") || 
        name.toLowerCase().endsWith(".png") || 
        name.toLowerCase().endsWith(".bmp") || 
         name.toLowerCase().endsWith(".gif")
        );

        if (photoFiles != null) {
            for (File photo : photoFiles) {
                PhotoTreeNode photoNode = new PhotoTreeNode(photo);
                examNode.add(photoNode);
            }
        }
    }
    
    
    


    // Retourne la personne associée à ce nœud
    public Person getPerson() {
        return person;
    }

    // Retourne le nombre d'examens (répertoires de date)
    public int getExamCount() {
        return getChildCount();
    }

    // Retourne le nombre total de photos sous ce nœud
    public int getTotalPhotoCount() {
        int photoCount = 0;
        for (int i = 0; i < getChildCount(); i++) {
            DefaultMutableTreeNode examNode = (DefaultMutableTreeNode) getChildAt(i);
            photoCount += examNode.getChildCount();
        }
        return photoCount;
    }
    
    
    
 // Retourne les examens (sous-nœuds)
    public ExamTreeNode[] getExamNodes() {
        ExamTreeNode[] exams = new ExamTreeNode[getChildCount()];
        for (int i = 0; i < getChildCount(); i++) {
            exams[i] = (ExamTreeNode) getChildAt(i);
        }
        return exams;
    }
    
    
    
  public void addPhotoDirectory(String directoryName) {
  add(new DefaultMutableTreeNode(directoryName));
}

public void addPhoto(String photoName) {
  getLastPhotoDirectoryNode().add(new DefaultMutableTreeNode(photoName));
}



private DefaultMutableTreeNode getLastPhotoDirectoryNode() {
  int lastIndex = getChildCount() - 1;
  if (lastIndex >= 0) {
      return (DefaultMutableTreeNode) getChildAt(lastIndex);
  } else {
      // Ajoutez un répertoire de photos si nécessaire
      DefaultMutableTreeNode newPhotoDirectory = new DefaultMutableTreeNode("Photos");
      add(newPhotoDirectory);
      return newPhotoDirectory;
  }
}
@Override
public String toString() {
    return person.getNom()+" "+person.getPrenom();  // Affiche uniquement le nom du répertoire
}
}




//public class PersonTreeNode extends DefaultMutableTreeNode {
//   
//	private static final long serialVersionUID = 1L;
//
//	public PersonTreeNode(String personName) {
//        super(personName);
//    }
//
//    public void addPhotoDirectory(String directoryName) {
//        add(new DefaultMutableTreeNode(directoryName));
//    }
//
//    public void addPhoto(String photoName) {
//        getLastPhotoDirectoryNode().add(new DefaultMutableTreeNode(photoName));
//    }
//
//    private DefaultMutableTreeNode getLastPhotoDirectoryNode() {
//        int lastIndex = getChildCount() - 1;
//        if (lastIndex >= 0) {
//            return (DefaultMutableTreeNode) getChildAt(lastIndex);
//        } else {
//            // Ajoutez un répertoire de photos si nécessaire
//            DefaultMutableTreeNode newPhotoDirectory = new DefaultMutableTreeNode("Photos");
//            add(newPhotoDirectory);
//            return newPhotoDirectory;
//        }
//    }
//
// 
//    
//    private Person getPersonFromNode(DefaultMutableTreeNode node) {
//	    while (node != null) {
//	        if (node.getUserObject() instanceof PersonTreeNode) {
//	            return ((PersonTreeNode) node.getUserObject()).getPerson();
//	        }
//	        node = (DefaultMutableTreeNode) node.getParent();
//	        
//	    }
//	    return null;
//	}
//
//	public Person getPerson(PersonDAO personDAO) { 
//		DefaultMutableTreeNode node = (DefaultMutableTreeNode)  getParent();
//		String dirName = node.getUserObject().toString();
//		String[] parts = dirName.split("_");
//		int idx = Integer.parseInt(parts[0]);
//		Person person = personDAO.findById(idx);
//		return person;
//
//	}
// 
//	
//}
