package org.hmd.image.ouils;

import java.awt.Component;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.swing.DefaultListCellRenderer;
import javax.swing.ImageIcon;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.SwingConstants;

public class ThumbnailRenderer4Tree   extends DefaultListCellRenderer {
	    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
		private static final int THUMB_SIZE = 100; // Taille des miniatures

	    @Override
	    public Component getListCellRendererComponent(JList<?> list, Object value, int index,
	                                                  boolean isSelected, boolean cellHasFocus) {
	        JLabel label = (JLabel) super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);

	        if (value instanceof File file) {
	            ImageIcon icon = createThumbnail(file);
	            label.setIcon(icon);
	            label.setText(file.getName()); // Affiche le nom de l'image
	            label.setHorizontalTextPosition(SwingConstants.CENTER);
	            label.setVerticalTextPosition(SwingConstants.BOTTOM);
	        }

	        return label;
	    }

	    private ImageIcon createThumbnail(File file) {
	        try {
	            BufferedImage img = ImageIO.read(file);
	            Image scaledImg = img.getScaledInstance(THUMB_SIZE, THUMB_SIZE, Image.SCALE_SMOOTH);
	            return new ImageIcon(scaledImg);
	        } catch (IOException e) {
	            e.printStackTrace();
	            return null; // Retourne une icône vide en cas d'erreur
	        }
	    }
	}
