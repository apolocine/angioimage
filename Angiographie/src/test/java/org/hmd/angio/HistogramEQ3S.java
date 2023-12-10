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

public class HistogramEQ3S extends JFrame {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private BufferedImage original, equalized;
    private JLabel imageLabel;
    JPanel menuPanel ;
    private JSlider slider;
    private JButton saveCopyButton  ;
    private boolean controleurDeModifications = true;
     
    public HistogramEQ3S(File file, BufferedImage image) {
     
    	menuPanel = new JPanel();
    	saveCopyButton  = new JButton("Sauvegarder Copie");
    	
        // UI setup
        setTitle("Histogram Equalization");
        setLayout(new BorderLayout());
        equalized = image;
        imageLabel = new JLabel(new ImageIcon(equalized));
        add(imageLabel, BorderLayout.CENTER);

        slider = new JSlider(0, 255, 128);
        slider.setMajorTickSpacing(50);
        slider.setPaintTicks(true);
        slider.addChangeListener(e -> {
            equalized = histogramEqualization(original, slider.getValue());
            imageLabel.setIcon(new ImageIcon(equalized)); 
            controleurDeModifications = true; 
        });
        
         
          JPanel menuPanel = new JPanel(new BorderLayout());
          menuPanel.add(slider, BorderLayout.CENTER);
          menuPanel.add(saveCopyButton, BorderLayout.EAST); 
  		 add(menuPanel, BorderLayout.NORTH);
        
  		 
  		 
  		 original = image;
  		 equalized = histogramEqualization(original,slider.getValue());

        
        saveCopyButton = new JButton("Sauvegarder Copie");
        
  		saveCopyButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {

				
			 try {
				saveModifiedCopy(file , equalized   );
			} catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
				
				
				
//				// Ajoutez ici le code pour sauvegarder une copie modifiée dans le même
//				// répertoire
//				System.out.println("controleurDeModifications =" +controleurDeModifications);
//				if (controleurDeModifications) {
//					System.out.println("controleurDeModifications =" +controleurDeModifications);
//					DirectoryManager.saveModifiedCopy(file , equalized   );
// 
//				 
//					controleurDeModifications = false;
//					System.out.println("controleurDeModifications =" +controleurDeModifications);
//
//				} else {
//					System.out.println("controleurDeModifications =" +controleurDeModifications);
//					controleurDeModifications = true;
//					System.out.println("controleurDeModifications =" +controleurDeModifications);
//					// Image non encore modifiée
//					JOptionPane.showMessageDialog(null, "Image non modifiée.", "pas de sauvegarde",
//							JOptionPane.INFORMATION_MESSAGE);
//
//				}

			}
		});
  		
  		
  		
  		
        pack();
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        setVisible(true);
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
    		JOptionPane.showMessageDialog(null, "Copie modifiée sauvegardée avec succès dans le même répertoire.",
    				"Sauvegarde réussie", JOptionPane.INFORMATION_MESSAGE);
    	} catch (IOException ex) {
    		ex.printStackTrace();
    		// Gérez les erreurs d'entrée/sortie
    		JOptionPane.showMessageDialog(null, "Erreur lors de la sauvegarde de la copie modifiée.", "Erreur",
    				JOptionPane.ERROR_MESSAGE);
    	}
    }
    
    
  

    private static BufferedImage histogramEqualization(BufferedImage original, int threshold) {
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

                // Apply threshold
                if (red > threshold) {
                    red = 255;
                }

                if (green > threshold) {
                    green = 255;
                }

                if (blue > threshold) {
                    blue = 255;
                }

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
        	  
            SwingUtilities.invokeLater(() -> new HistogramEQ3S(file,image));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    
}
