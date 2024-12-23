package org.hmd.angio.ihm.tree;

import java.io.File;

import javax.swing.tree.DefaultMutableTreeNode;

// Nœud représentant une photo (fichier image)
public class PhotoTreeNode extends DefaultMutableTreeNode {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public PhotoTreeNode(File photoFile) {
        super(photoFile);
    }

    public File getPhotoFile() {
        return (File) getUserObject();
    }
    // Retourne le nœud d'examen parent
    public ExamTreeNode getParentExamNode() {
        return (ExamTreeNode) getParent();
    }

    // Retourne le nœud de personne en remontant de 2 niveaux
    public PersonTreeNode getParentPersonNode() {
        return (PersonTreeNode) getParent().getParent();
    }
    @Override
    public String toString() {
        return getPhotoFile().getName();  // Affiche uniquement le nom du fichier photo
    }
}