package org.hmd.angio;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class PDFViewer extends JFrame {

    private JPanel pdfPanel;

    public PDFViewer() {
        setTitle("PDF Viewer");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        pdfPanel = new JPanel();
        JScrollPane scrollPane = new JScrollPane(pdfPanel);
        add(scrollPane, BorderLayout.CENTER);

        displayPDF("C:\\Users\\DELL\\Documents\\0APng\\17_Hamid_MADANI\\17_Hamid.pdf",pdfPanel);
    }

    private void displayPDF(String filePath, JPanel pdfPanel_) {
        try {
            PDDocument document = PDDocument.load(new File(filePath));
            PDFRenderer pdfRenderer = new PDFRenderer(document);

            for (int pageIndex = 0; pageIndex < document.getNumberOfPages(); pageIndex++) {
                BufferedImage image = pdfRenderer.renderImageWithDPI(pageIndex, 100);
                JLabel label = new JLabel(new ImageIcon(image));
                pdfPanel_.add(label);
            }

            document.close();

            pdfPanel_.setLayout(new GridLayout(0, 1));
            pdfPanel_.revalidate();
            pdfPanel_.repaint();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            PDFViewer pdfViewer = new PDFViewer();
            pdfViewer.setVisible(true);
        });
    }
}
