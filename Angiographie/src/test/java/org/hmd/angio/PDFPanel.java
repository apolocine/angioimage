package org.hmd.angio;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.PDPageTree;
import org.apache.pdfbox.pdmodel.PDResources;
  
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class PDFPanel extends JPanel {

    private File pdfFile;

    public PDFPanel(File pdfFile) {
        this.pdfFile = pdfFile;
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        try {
            if (pdfFile != null) {
                PDDocument document = PDDocument.load(pdfFile);
                PDPageTree pages = document.getPages();
                for (PDPage page : pages) {
                    BufferedImage image = convertPageToImage(page);
                    g.drawImage(image, 0, 0, null);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private BufferedImage convertPageToImage(PDPage page) throws IOException {
        float scale = 1.0f; // You can adjust the scale factor
        BufferedImage image = new BufferedImage((int) (page.getMediaBox().getWidth() * scale),
                (int) (page.getMediaBox().getHeight() * scale), BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
//        g2d.scale(scale, scale);
//        
//        PDPageContentStream contentStream = new PDPageContentStream(document, page)
//        		
//         contentStream.drawContent(g2d);
//        
//        g2d.dispose();
        return image;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("PDF Viewer");
            frame.setSize(800, 600);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            File pdfFile = new File("1output.pdf");
            PDFPanel pdfPanel = new PDFPanel(pdfFile);

            JScrollPane scrollPane = new JScrollPane(pdfPanel);
            frame.getContentPane().add(scrollPane, BorderLayout.CENTER);

            frame.setVisible(true);
        });
    }
}
