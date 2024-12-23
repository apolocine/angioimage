package org.hmd.angio.ihm.tree;



import java.io.File;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.swing.tree.DefaultMutableTreeNode;

import org.hmd.angio.dto.Person;

// Nœud représentant un répertoire d'examen (répertoire de date)
public class ExamTreeNode extends DefaultMutableTreeNode {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	
	 private static final SimpleDateFormat dateFormat = new SimpleDateFormat("ddMMyyyy");
	    private static final SimpleDateFormat readableFormat = new SimpleDateFormat("ddMMyyyy");
	    private Date examDate;
	    
	    
	    public ExamTreeNode(File directory) {
	        super(directory);
	        parseExamDate(directory.getName());
	    }

	    // Analyse le nom du répertoire et extrait la date
	    private void parseExamDate(String directoryName) {
	        try {
	            this.examDate = dateFormat.parse(directoryName);
	        } catch (ParseException e) {
	            System.err.println("Format de date invalide pour le répertoire : " + directoryName);
	            this.examDate = null;
	        }
	    }

	   
	   
	    // Retourne la date d'examen sous forme d'objet Date
	    public Date getExamDate() {
	        return examDate;
	    }

	    // Retourne la date au format lisible (ex: 21 Décembre 2024)
	    public String getFormattedExamDate() {
	        return (examDate != null) ? readableFormat.format(examDate) : getDirectory().getName();
	    }
	    
	    
 // Retourne l'objet File
    public File getDirectory() {
        return (File) getUserObject();
    }
 // Retourne la personne parente (PersonTreeNode)
    public PersonTreeNode getParentPersonNode() {
        return (PersonTreeNode) getParent();
    }

    // Retourne les photos associées à cet examen
    public PhotoTreeNode[] getPhotoNodes() {
        PhotoTreeNode[] photos = new PhotoTreeNode[getChildCount()];
        for (int i = 0; i < getChildCount(); i++) {
            photos[i] = (PhotoTreeNode) getChildAt(i);
        }
        return photos;
    }
    @Override
    public String toString() {
        return getDirectory().getName();  // Affiche uniquement le nom du répertoire
    }

	public Person getPerson() {
		// TODO Auto-generated method stub
		return getParentPersonNode().getPerson();
	}
}