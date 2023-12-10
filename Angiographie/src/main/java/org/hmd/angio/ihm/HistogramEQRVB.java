package org.hmd.angio.ihm;
import javax.swing.*;

import org.hmd.image.ouils.DirectoryManager;

import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import javax.imageio.ImageIO;

public class HistogramEQRVB extends JFrame {

    private BufferedImage original, equalized;
    private JLabel imageLabel;
    private JSlider redSlider, greenSlider, blueSlider,alphaSlider;
    private JButton saveCopyButton;
    private boolean controleurDeModifications = false;
    private File originalFile ;
   
    public HistogramEQRVB(File file, BufferedImage image) {
    	
    	this.originalFile =file;
    	
    	JPanel sliderNbuttonPanel = new JPanel(new GridLayout(1, 1));
        JPanel menuPanel = new JPanel(new GridLayout(4, 2));
        
        saveCopyButton = new JButton("Sauvegarder Copie");

        // UI setup
        setTitle("Histogram Equalization");
        setLayout(new BorderLayout());

        equalized = image;
        imageLabel = new JLabel(new ImageIcon(equalized));
        add(imageLabel, BorderLayout.CENTER);

//        redSlider = createSlider("Rouge", menuPanel);
//        greenSlider = createSlider("Vert", menuPanel);
//        blueSlider = createSlider("Bleu", menuPanel);

        // Création des sliders pour red, green, blue
        redSlider = new JSlider(0, 255,  255);//128);
        redSlider.setMajorTickSpacing(10);
        redSlider.setMinorTickSpacing(1);
        redSlider.setPaintTicks(true);
        redSlider.setPaintLabels(true);
		
		
        greenSlider = new JSlider(0, 255, 255);//128);
	        greenSlider.setMajorTickSpacing(10);
	        greenSlider.setMinorTickSpacing(1);
	        greenSlider.setPaintTicks(true);
	        greenSlider.setPaintLabels(true);
        blueSlider = new JSlider(0, 255, 255);//128);
	        blueSlider.setMajorTickSpacing(10);
	        blueSlider.setMinorTickSpacing(1);
	        blueSlider.setPaintTicks(true);
	        blueSlider.setPaintLabels(true);
        alphaSlider = new JSlider(0, 255, 255);//128);
	        alphaSlider.setMajorTickSpacing(10);
	        alphaSlider.setMinorTickSpacing(1);
	        alphaSlider.setPaintTicks(true);
	        alphaSlider.setPaintLabels(true);
        
        // Ajout de listeners pour mettre à jour l'image lorsqu'un slider est modifié
        redSlider.addChangeListener(e -> updateImage());
        greenSlider.addChangeListener(e -> updateImage());
        blueSlider.addChangeListener(e -> updateImage());
        alphaSlider.addChangeListener(e -> updateImage());
        
        
        
        // ... Ajout des sliders au panneau
   menuPanel.add(new JLabel("Red"));
        menuPanel.add(redSlider);//, BorderLayout.NORTH);
      menuPanel.add(new JLabel("Green"));
        menuPanel.add(greenSlider);//, BorderLayout.CENTER);
     menuPanel.add(new JLabel("Blue"), BorderLayout.CENTER);
        menuPanel.add(blueSlider);//, BorderLayout.SOUTH);
     menuPanel.add(new JLabel("Alpha"));
        menuPanel.add(alphaSlider);//, BorderLayout.SOUTH);
        
         //    //   // //    
        
        saveCopyButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
            	
            	
                // Ajoutez ici le code pour sauvegarder une copie modifiée dans le même
                // répertoire
        
                if (controleurDeModifications) {
                    saveModifiedCopy(originalFile, equalized);
                    controleurDeModifications = false;
                } else {
                    // Image non encore modifiée
                    JOptionPane.showMessageDialog(null, "Image non modifiée.", "Pas de sauvegarde",
                            JOptionPane.INFORMATION_MESSAGE);
                }
            }
             
        });

        
        
        sliderNbuttonPanel.add(menuPanel);//, BorderLayout.WEST);        
        sliderNbuttonPanel.add(saveCopyButton);//, BorderLayout.EAST);
         
        
        add(sliderNbuttonPanel, BorderLayout.SOUTH);

        original = image;
        equalized = histogramEqualization(original,
        		redSlider.getValue(), 
        		greenSlider.getValue(),
                blueSlider.getValue(),
                alphaSlider.getValue()
                );

        
        
        pack();
        
        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
            	
                if ( controleurDeModifications ) {
                    int result = JOptionPane.showConfirmDialog(
                            null,
                            "Do you want to save changes before closing?",
                            "Save Changes",
                            JOptionPane.YES_NO_CANCEL_OPTION);

                    if (result == JOptionPane.YES_OPTION) {
                    	
                    	
                    	System.out.println("Saving changes.by . local DirectoryManager.saveModifiedCopy.");
                    	DirectoryManager.saveModifiedCopy(originalFile, equalized /* resizedImage */ );

//						File selectedDirectory = file.getParentFile();						
//						try {
//							loadPhotos(selectedDirectory);
//						} 
//
//						catch (IOException e1) {
//							// TODO Auto-generated catch block
//							e1.printStackTrace();
//						}
						
						
						
//						
//                        // Save changes (replace this with your save logic)
//                        System.out.println("Saving changes.by . local saveModifiedCopy.");
//                        saveModifiedCopy(originalFile, equalized);
//                        
                        dispose(); // Close the frame after saving
                        
                        
                        
                        
                        
                        
                    } else if (result == JOptionPane.NO_OPTION) {
                        dispose(); // Close the frame without saving
                    }
                    // If the user clicks "Cancel," do nothing and keep the frame open
                } else {
                    // No unsaved changes, simply close the frame
                    dispose();
                }
            }
        });

        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        setLocationRelativeTo(null);
        setVisible(true);
    
    }

    
    // Méthode pour mettre à jour l'image lorsque les sliders sont modifiés
    private void updateImage() {
        int redThreshold = redSlider.getValue();
        int greenThreshold = greenSlider.getValue();
        int blueThreshold = blueSlider.getValue();
        int alphaValueold = alphaSlider.getValue();
        
        equalized = histogramEqualization(original, redThreshold, greenThreshold, blueThreshold,alphaValueold);
        imageLabel.setIcon(new ImageIcon(equalized));

        controleurDeModifications = true;
    }
    
    
    private JSlider createSlider(String label, JPanel panel) {
        JSlider slider = new JSlider(0, 255, 128);
        slider.setMajorTickSpacing(50);
        slider.setPaintTicks(true);
        slider.addChangeListener(e -> {
            equalized = histogramEqualization(original, 
            		redSlider.getValue(), 
            		greenSlider.getValue(),
                    blueSlider.getValue(),
            		alphaSlider.getValue());
            imageLabel.setIcon(new ImageIcon(equalized));
            controleurDeModifications = true;
        });

        JPanel sliderPanel = new JPanel(new BorderLayout());
        JLabel sliderLabel = new JLabel(label);
        sliderPanel.add(sliderLabel, BorderLayout.NORTH);
        sliderPanel.add(slider, BorderLayout.CENTER);
        panel.add(sliderPanel);

        return slider;
    }

    public static void saveModifiedCopy(File originalFile, BufferedImage modifiedImage) {
        try {
        	
 
     	   
            // Obtenez le répertoire du fichier original
            String originalFilePath = originalFile.getAbsolutePath();
            String originalFileDir = originalFilePath.substring(0, originalFilePath.lastIndexOf(File.separator));

            // Générez un nom de fichier pour la copie modifiée
            String modifiedFileName = "modified_" + originalFile.getName();

            // Créez un nouveau fichier pour la copie modifiée dans le même répertoire
            File modifiedFile = new File(originalFileDir, modifiedFileName);

            // Écrivez l'image modifiée dans le fichier
            ImageIO.write(modifiedImage, "jpg", modifiedFile);

            // Affichez un message de confirmation
            JOptionPane.showMessageDialog(null,
                    "Copie modifiée sauvegardée avec succès dans le même répertoire.",
                    "Sauvegarde réussie", JOptionPane.INFORMATION_MESSAGE);
        } catch (IOException ex) {
            ex.printStackTrace();
            // Gérez les erreurs d'entrée/sortie
            JOptionPane.showMessageDialog(null, "Erreur lors de la sauvegarde de la copie modifiée.",
                    "Erreur", JOptionPane.ERROR_MESSAGE);
        }
    }

    
    
    private static BufferedImage histogramEqualization02(BufferedImage original, int redThreshold, int greenThreshold,
            int blueThreshold, int alphaValue) {
        ArrayList<int[]> imageLUT = histogramEqualizationLUT(original);

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

                // Apply thresholds for each channel
                red = (red > redThreshold) ? 255 : 0;
                green = (green > greenThreshold) ? 255 : 0;
                blue = (blue > blueThreshold) ? 255 : 0;
                alpha = (alpha > alphaValue) ? 255 : 0;

                int newPixel = colorToRGB(alpha, red, green, blue);

                histogramEQ.setRGB(i, j, newPixel);
            }
        }

        return histogramEQ;
    }

    
    
    
 private static BufferedImage histogramEqualization(BufferedImage original,
													 int redThreshold, 
													 int greenThreshold,
													 int blueThreshold,
													 int alphaValueold
													 ) {
	 
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

            // Apply threshold for each channel
            if (red > redThreshold) {
                red = 255;
            }

            if (green > greenThreshold) {
                green = 255;
            }

            if (blue > blueThreshold) {
                blue = 255;
            }
            if (alpha > alphaValueold) {
                blue = 255;
            }
            int newPixel = colorToRGB(alpha, red, green, blue);

            histogramEQ.setRGB(i, j, newPixel);
        }
    }

    return histogramEQ;
}

 private static BufferedImage histogramEqualization01(BufferedImage original, int redThreshold, int greenThreshold,
	        int blueThreshold) {
	    ArrayList<int[]> imageLUT = histogramEqualizationLUT(original);

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

	            // Apply threshold for each channel
	            red = imageLUT.get(0)[red];
	            green = imageLUT.get(1)[green];
	            blue = imageLUT.get(2)[blue];

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

 
 
 
 
//Reste du code inchangé
private static ArrayList<int[]> imageHistogram(BufferedImage input) {
  int[] rhistogram = new int[256];
  int[] ghistogram = new int[256];
  int[] bhistogram = new int[256];

  for (int i = 0; i < input.getWidth(); i++) {
      for (int j = 0; j < input.getHeight(); j++) {
          int rgb = input.getRGB(i, j);

          int red = (rgb >> 16) & 0xFF;
          int green = (rgb >> 8) & 0xFF;
          int blue = rgb & 0xFF;

          rhistogram[red]++;
          ghistogram[green]++;
          bhistogram[blue]++;
      }
  }

  ArrayList<int[]> hist = new ArrayList<>();
  hist.add(rhistogram);
  hist.add(ghistogram);
  hist.add(bhistogram);

  return hist;
}

private static int colorToRGB(int alpha, int red, int green, int blue) {
  int newPixel = 0;
  newPixel += alpha;
  newPixel = newPixel << 8;
  newPixel += red;
  newPixel = newPixel << 8;
  newPixel += green;
  newPixel = newPixel << 8;
  newPixel += blue;

  return newPixel;
}

public static void main(String[] args) {
  try {
      File file = new File("C:\\Users\\DELL\\Documents\\0APng\\4Rotated_Cube.jpg");
      BufferedImage image = ImageIO.read(file);
      SwingUtilities.invokeLater(() -> new HistogramEQRVB(file, image));
  } catch (IOException e) {
      e.printStackTrace();
  }
}

}
