package org.hmd.angio;
import javax.swing.*;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import java.awt.*;

public class SliderWithToolTip extends JFrame {
    private JSlider slider;
    private JLabel valueLabel;

    public SliderWithToolTip() {
        super("JSlider avec Tooltip");

        slider = new JSlider(JSlider.HORIZONTAL, 0, 100, 50);
        slider.setMajorTickSpacing(10);
        slider.setMinorTickSpacing(1);
        slider.setPaintTicks(true);
        slider.setPaintLabels(true);

        valueLabel = new JLabel("Valeur actuelle: " + slider.getValue());

        // Ajouter un ChangeListener pour détecter les changements de valeur du JSlider
        slider.addChangeListener(new ChangeListener() {
            @Override
            public void stateChanged(ChangeEvent e) {
                // Mettre à jour le texte du Tooltip avec la valeur actuelle du JSlider
                slider.setToolTipText("Valeur actuelle : " + slider.getValue());
                // Mettre à jour le texte du JLabel
                valueLabel.setText("Valeur actuelle : " + slider.getValue());
            }
        });

        setLayout(new FlowLayout());
        add(slider);
        add(valueLabel);

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(300, 150);
        setLocationRelativeTo(null);
        setVisible(true);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new SliderWithToolTip();
            }
        });
    }
}
