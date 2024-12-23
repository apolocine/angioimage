package org.hmd.image.ouils;
import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics;
import java.io.File;

import javax.swing.ImageIcon;


/**
 * @author drmdh
 */
public class ImageIconBorder extends ImageIcon {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private Color borderColor;

    public ImageIconBorder(File photo, Color borderColor) {
        super(photo.getAbsolutePath());
        this.borderColor = borderColor;
    }

    @Override
    public void paintIcon(Component c, Graphics g, int x, int y) {
        super.paintIcon(c, g, x, y);
        g.setColor(borderColor);
        g.drawRect(x, y, getIconWidth() - 1, getIconHeight() - 1);
    }
}
