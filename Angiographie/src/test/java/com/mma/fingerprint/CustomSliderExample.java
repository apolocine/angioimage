package com.mma.fingerprint;

import javax.swing.*;

import javax.swing.plaf.basic.BasicSliderUI;
import java.awt.*;

public class CustomSliderExample {
	public static void main(String[] args) {

		SwingUtilities.invokeLater(() -> {
			JFrame frame = new JFrame("Custom Slider Example");
			frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

			JSlider slider = new JSlider(JSlider.HORIZONTAL, 0, 100, 50);
			slider.setUI(new CustomSliderUI(slider));

			JPanel panel = new JPanel();
			panel.add(slider);

			frame.getContentPane().add(panel);
			frame.setSize(300, 100);
			frame.setLocationRelativeTo(null);
			frame.setVisible(true);
		});
	}
}

/**

 * 
 */
class CustomSliderUI extends BasicSliderUI {
	public CustomSliderUI(JSlider b) {

		super(b);
	}

	protected Color getThumbColor() {
		int value = slider.getValue();
		if (value < 33) {
			return Color.RED;
		} else if (value < 66) {
			return Color.BLUE;
		} else {
			return Color.GREEN;
		}
	}

//    couleur du jslider red en red bue en blue green en green
//	public void paintThumb(Graphics g) {
////		Rectangle knobBounds = thumbRect;
////		int w = knobBounds.width;
////		int h = knobBounds.height;
////
////		g.translate(knobBounds.x, knobBounds.y);
//
////		if (slider.isEnabled()) {
////			g.setColor(slider.getBackground());
////		}
////        else {
////            g.setColor(slider.getBackground().darker());
////        }
//
//	}

}
