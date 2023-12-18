package org.bio.mesure;
import java.awt.Component;

import javax.swing.DefaultListCellRenderer;
import javax.swing.JList;

public class PlayerListCellRenderer extends DefaultListCellRenderer {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Override
    public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
		
		// on ne passe aucune valeur iniialement identifié mais en fonction du control à chaudon choisi la valeur à afficher  
        if (value instanceof PlayerInfo) {
            value = ((PlayerInfo) value).getPlayerName();
        }
        return super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
    }
}
