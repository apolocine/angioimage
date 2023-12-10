package org.hmd.angio.enuma;
import javax.swing.*;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
 

import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class PDFCreatorGUI extends JFrame {

    public PDFCreatorGUI() {
        // ...

        JComboBox<PDRectangleEnum> rectangleComboBox = new JComboBox<>(PDRectangleEnum.values());
        rectangleComboBox.setSelectedItem(PDRectangleEnum.A4);

        JButton createPDFButton = new JButton("Create PDF");
        createPDFButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                PDRectangleEnum selectedRectangle = (PDRectangleEnum) rectangleComboBox.getSelectedItem();
                createPDF("output.pdf", selectedRectangle);
            }
        });

        // Add other components and layout code as needed

        // ...

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(400, 200);
        setLocationRelativeTo(null);
        setVisible(true);
    }

    private void createPDF(String filePath, PDRectangleEnum rectangleEnum) {
        try {
            // Similar to the previous code
            // ...

            PDDocument document = new PDDocument();
            PDPage page = new PDPage(rectangleEnum.getPDRectangle());
            document.addPage(page);
            document.save(filePath);
            document.close();
            System.out.println("PDF created successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new PDFCreatorGUI());
    }
}
