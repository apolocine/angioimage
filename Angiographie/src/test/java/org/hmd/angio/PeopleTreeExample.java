package org.hmd.angio;
import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTree;
import javax.swing.SwingUtilities;
import javax.swing.text.Position;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import javax.swing.tree.TreePath;

public class PeopleTreeExample {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("People Tree Example");
            frame.setSize(400, 300);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            // Créez la racine du tree
            DefaultMutableTreeNode root = new DefaultMutableTreeNode("Root");

            // Ajoutez des nœuds "Personne" (par exemple, Person 1, Person 2, etc.) à la racine
            for (int i = 1; i <= 3; i++) {
                DefaultMutableTreeNode personNode = new DefaultMutableTreeNode("Person " + i);
                root.add(personNode);

                // Ajoutez des nœuds "Photos" à chaque nœud "Personne"
                for (int j = 1; j <= 2; j++) {
                    DefaultMutableTreeNode photoNode = new DefaultMutableTreeNode("Photo " + j);
                    personNode.add(photoNode);
                }
            }

            // Créez le modèle de l'arbre avec la racine
            DefaultTreeModel treeModel = new DefaultTreeModel(root);

            // Appliquez le modèle à votre composant JTree
            JTree tree = new JTree(treeModel);

            // Ajoutez le JTree à un JScrollPane et affichez le tout dans la JFrame
            JScrollPane scrollPane = new JScrollPane(tree);
            frame.add(scrollPane);

            // Affichez la JFrame
            frame.setVisible(true);

            // Exemple pour sélectionner le premier nœud "Personne"
            TreePath path = tree.getNextMatch("Person 1", 0, Position.Bias.Forward);
            if (path != null) {
                tree.setSelectionPath(path);
            }
        });
    }
}
