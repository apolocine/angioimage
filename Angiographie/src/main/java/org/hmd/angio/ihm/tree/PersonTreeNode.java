package org.hmd.angio.ihm.tree;
import javax.swing.tree.DefaultMutableTreeNode;

public class PersonTreeNode extends DefaultMutableTreeNode {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public PersonTreeNode(String personName) {
        super(personName);
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
}
