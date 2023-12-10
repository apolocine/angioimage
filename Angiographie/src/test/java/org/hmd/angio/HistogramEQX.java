package org.hmd.angio;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import javax.imageio.ImageIO;

public class HistogramEQX extends JFrame {

    private BufferedImage original, equalized;
    private JLabel imageLabel;
    private JSlider slider;

    public HistogramEQX(BufferedImage image) {
        original = image;
        equalized = histogramEqualization(original);

        // UI setup
        setTitle("Histogram Equalization");
        setLayout(new BorderLayout());

        imageLabel = new JLabel(new ImageIcon(equalized));
        add(imageLabel, BorderLayout.CENTER);

        slider = new JSlider(0, 255, 128);
        slider.setMajorTickSpacing(50);
        slider.setPaintTicks(true);
        slider.addChangeListener(e -> {
            equalized = histogramEqualization(original, slider.getValue());
            imageLabel.setIcon(new ImageIcon(equalized));
        });
        add(slider, BorderLayout.SOUTH);

        pack();
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setVisible(true);
    }

    public static void main(String[] args) {
        try {
            BufferedImage image = ImageIO.read(new File("C:\\Users\\DELL\\Documents\\0APng\\4Rotated_Cube.jpg"));
            SwingUtilities.invokeLater(() -> new HistogramEQX(image));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    
    
    
    private static BufferedImage histogramEqualization(BufferedImage original) {
        ArrayList<int[]> histLUT = histogramEqualizationLUT(original);

        int width = original.getWidth();
        int height = original.getHeight();

        BufferedImage histogramEQ = new BufferedImage(width, height, original.getType());

        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                int rgb = original.getRGB(i, j);

                int alpha = (rgb >> 24) & 0xFF;
                int red = (rgb >> 16) & 0xFF;
                int green = (rgb >> 8) & 0xFF;
                int blue = rgb & 0xFF;

                red = histLUT.get(0)[red];
                green = histLUT.get(1)[green];
                blue = histLUT.get(2)[blue];

                int newPixel = colorToRGB(alpha, red, green, blue);

                histogramEQ.setRGB(i, j, newPixel);
            }
        }

        return histogramEQ;
    }

    private static ArrayList<int[]> histogramEqualizationLUT(BufferedImage input) {
        ArrayList<int[]> imageHist = imageHistogram(input);
        ArrayList<int[]> imageLUT = new ArrayList<>();

        for (int channel = 0; channel < 3; channel++) {
            int[] histogram = imageHist.get(channel);
            int[] lut = new int[256];

            long sum = 0;
            float scale_factor = (float) (255.0 / (input.getWidth() * input.getHeight()));

            for (int i = 0; i < histogram.length; i++) {
                sum += histogram[i];
                int val = (int) (sum * scale_factor);
                lut[i] = (val > 255) ? 255 : val;
            }

            imageLUT.add(lut);
        }

        return imageLUT;
    }

    
    
    
    // Return an ArrayList containing histogram values for separate R, G, B channels
    public static ArrayList<int[]> imageHistogram(BufferedImage input) {
 
        int[] rhistogram = new int[256];
        int[] ghistogram = new int[256];
        int[] bhistogram = new int[256];
 
        for(int i=0; i<rhistogram.length; i++) rhistogram[i] = 0;
        for(int i=0; i<ghistogram.length; i++) ghistogram[i] = 0;
        for(int i=0; i<bhistogram.length; i++) bhistogram[i] = 0;
 
        for(int i=0; i<input.getWidth(); i++) {
            for(int j=0; j<input.getHeight(); j++) {
 
                int red = new Color(input.getRGB (i, j)).getRed();
                int green = new Color(input.getRGB (i, j)).getGreen();
                int blue = new Color(input.getRGB (i, j)).getBlue();
 
                // Increase the values of colors
                rhistogram[red]++; ghistogram[green]++; bhistogram[blue]++;
 
            }
        }
 
        ArrayList<int[]> hist = new ArrayList<int[]>();
        hist.add(rhistogram);
        hist.add(ghistogram);
        hist.add(bhistogram);
 
        return hist;
 
    }
 
    // Convert R, G, B, Alpha to standard 8 bit
    private static int colorToRGB(int alpha, int red, int green, int blue) {
 
        int newPixel = 0;
        newPixel += alpha; newPixel = newPixel << 8;
        newPixel += red; newPixel = newPixel << 8;
        newPixel += green; newPixel = newPixel << 8;
        newPixel += blue;
 
        return newPixel;
 
    }
    
//    // Other methods remain unchanged
//    private static ArrayList<int[]> histogramEqualizationLUT(BufferedImage input) {
//        // Implementation to calculate histogram equalization lookup table
//        // ...
//        return null; // Modify this to return the lookup table
//    }
//
//    // Other methods remain unchanged
//    private static BufferedImage histogramEqualization(BufferedImage original) {
//        // Implementation of histogram equalization
//        // ...
//        return original; // Modify this to return the processed image
//    }

    
    
    private static BufferedImage histogramEqualization(BufferedImage original, int threshold) {
        // Implementation of histogram equalization with thresholding
        // ...

        return original; // Modify this to return the processed image
    }
    
    // Other methods remain unchanged
    private static void writeImage(String output) throws IOException {
        // Implementation to write the equalized image to a file
        // ...
    	
    }


//    // Other methods remain unchanged
//    public static ArrayList<int[]> imageHistogram(BufferedImage input) {
//        // Implementation to calculate image histogram
//        // ...
//        return null; // Modify this to return the histogram
//    }
//
//    // Other methods remain unchanged
//    private static int colorToRGB(int alpha, int red, int green, int blue) {
//        // Implementation to convert color to RGB
//        // ...
//        return 0; // Modify this to return the new pixel value
//    }
//    
    
}
