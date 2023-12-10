package org.hmd.image.ouils;

import java.awt.Component;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.swing.DefaultListCellRenderer;
import javax.swing.ImageIcon;
import javax.swing.JLabel;
import javax.swing.JList;

import net.coobird.thumbnailator.Thumbnails;

public class ThumbnailRenderer extends DefaultListCellRenderer {

	    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
		private int thumbnailSize = 50;

	    @Override
	    public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected,
	            boolean cellHasFocus) {
	        JLabel label = (JLabel) super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);

	        File file = (File) value;

	        try {
	            // Utilise Thumbnailator pour créer une miniature
	            BufferedImage thumbnail = Thumbnails.of(file)
	                    .size(thumbnailSize, thumbnailSize)
	                    .asBufferedImage();

	            
//	            Thumbnails.of(new File("path/to/directory").listFiles())
//	            .size(640, 480)
//	            .outputFormat("jpg")
//	            .toFiles(Rename.PREFIX_DOT_THUMBNAIL);
	            
	            
	            
	            // Définit l'image miniature dans l'étiquette
	            label.setIcon(new ImageIcon(thumbnail));
	            
	            //sans nom de l'image
	            label.setText(file.getName());

	        } catch (IOException e) {
	            e.printStackTrace();
	        }

	        return label;
	    }
	}