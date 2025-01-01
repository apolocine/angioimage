package org.hmd.image.ouils;

import java.awt.Component;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.swing.DefaultListCellRenderer;
import javax.swing.ImageIcon;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.ListCellRenderer;

import net.coobird.thumbnailator.Thumbnails;

public class ThumbnailPDFRenderer extends DefaultListCellRenderer {

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
 
    
            //sans nom de l'image
             label.setText(file.getName());

     

        return label;
    }
}
