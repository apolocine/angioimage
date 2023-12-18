package org.bio.mesure;
import javax.swing.*;
import javax.swing.text.AbstractDocument;
import javax.swing.text.AttributeSet;
import javax.swing.text.BadLocationException; 
import javax.swing.text.DocumentFilter;
import java.awt.*;
import java.util.regex.Pattern;

public class NumericTextFieldExample   {

    public NumericTextFieldExample() {
    	
    	
    	JFrame frame = new JFrame();
    	
        JTextField numericTextField = new JTextField(10);
        restrictToNumeric(numericTextField);

        // Le reste de votre interface utilisateur
        JButton button = new JButton("Click me");

        frame.setLayout(new FlowLayout());
        frame.add(numericTextField);
        frame.add(button);

        frame. setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.pack();
        frame. setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    public static  void restrictToNumeric(JTextField textField) {
        AbstractDocument document = (AbstractDocument) textField.getDocument();
        document.setDocumentFilter(new DocumentFilter() {
            private final Pattern pattern = Pattern.compile("\\d*");

            @Override
            public void replace(FilterBypass fb, int offset, int length, String text, AttributeSet attrs)
                    throws BadLocationException {
                String currentText = fb.getDocument().getText(0, fb.getDocument().getLength());
                String newText = currentText.substring(0, offset) + text + currentText.substring(offset + length);

                if (isNumeric(newText)) {
                    super.replace(fb, offset, length, text, attrs);
                }
            }

            @Override
            public void insertString(FilterBypass fb, int offset, String string, AttributeSet attr)
                    throws BadLocationException {
                String currentText = fb.getDocument().getText(0, fb.getDocument().getLength());
                String newText = currentText.substring(0, offset) + string + currentText.substring(offset);

                if (isNumeric(newText)) {
                    super.insertString(fb, offset, string, attr);
                }
            }

            @Override
            public void remove(FilterBypass fb, int offset, int length) throws BadLocationException {
                super.remove(fb, offset, length);
            }

            private boolean isNumeric(String text) {
                return pattern.matcher(text).matches();
            }
        });
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new NumericTextFieldExample());
    }
}
