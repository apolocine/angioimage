package org.hmd.angio;
import java.awt.BorderLayout;
import java.awt.Desktop;
import java.awt.Dimension;
import java.net.URI;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextPane;
import javax.swing.SwingUtilities;
import javax.swing.event.HyperlinkEvent;

public class AboutUsDialog {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> createAndShowGUI());
    }

    private static void createAndShowGUI() {
        JFrame frame = new JFrame("About Us Example");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JButton aboutButton = new JButton("About Us");
        aboutButton.addActionListener(e -> showAboutUsDialog(frame));

        JPanel panel = new JPanel();
        panel.add(aboutButton);

        frame.getContentPane().add(panel, BorderLayout.CENTER);
        frame.setSize(300, 200);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private static void showAboutUsDialog(JFrame parentFrame) {
        JTextPane textPane = new JTextPane();
        textPane.setContentType("text/html");
        textPane.setEditable(false);

        String aboutText = "<html><b>About Us</b><br>ب�?سْم�? اللَّه�? الرَّحْمَٰن�? الرَّح�?يم�?<br>" +
                   "Welcome to our application!"
                + "\r\n"+
               
                "Contact us: <a href=\"mailto:drmdh@msncom\">drmdh@msncom</a><br>" +
                "Visit our website: <a href=\"http://amia.fr\">http://amia.fr</a></html>";

        textPane.setText(aboutText);
        textPane.addHyperlinkListener(e -> {
            if (e.getEventType() == HyperlinkEvent.EventType.ACTIVATED) {
                try {
                    Desktop.getDesktop().browse(new URI(e.getURL().toString()));
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        });

        JScrollPane scrollPane = new JScrollPane(textPane);
        scrollPane.setPreferredSize(new Dimension(400, 200));

        JOptionPane.showMessageDialog(parentFrame, scrollPane, "About Us", JOptionPane.INFORMATION_MESSAGE);
    }
}
