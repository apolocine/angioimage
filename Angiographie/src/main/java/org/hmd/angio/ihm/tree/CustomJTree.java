package org.hmd.angio.ihm.tree;

import java.awt.Graphics;

import javax.swing.CellRendererPane;
import javax.swing.JTree;
import javax.swing.tree.TreeModel;

/**
 * 
 */
public class CustomJTree extends JTree {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	CellRendererPane rendererPane = new CellRendererPane();
    public CustomJTree(TreeModel model) {
        super(model);
    }

    @Override
    public void updateUI() {
        super.updateUI();
        
		if (rendererPane == null) {
            rendererPane = new CellRendererPane();
            add(rendererPane);  // Important pour éviter NullPointerException
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (rendererPane == null) {
            rendererPane = new CellRendererPane();
            add(rendererPane);
        }
    }
}
