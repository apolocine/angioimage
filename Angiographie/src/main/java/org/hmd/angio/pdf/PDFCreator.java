package org.hmd.angio.pdf;
import java.awt.Color;
import java.awt.Desktop;
import java.awt.HeadlessException;
import java.awt.image.BufferedImage;
import java.awt.print.PrinterException;
import java.awt.print.PrinterJob;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.printing.PDFPageable;
import org.hmd.angio.dto.Person;
import org.hmd.angio.enuma.PDRectangleEnum;

import net.coobird.thumbnailator.Thumbnails;

public class PDFCreator { 

	
     // Spécifiez le chemin du fichier PDF à ouvrir 
    public static void openBrowseFile(String filePath ) {
       
        // Vérifiez si Desktop est pris en charge sur la plate-forme actuelle
        if (Desktop.isDesktopSupported()) {
            Desktop desktop = Desktop.getDesktop();

            try {
                // Ouvrez le fichier PDF avec l'application par défaut
                desktop.open(new File(filePath));
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Desktop n'est pas pris en charge sur cette plate-forme.");
        }
    }
	
    
	/**
	 * 
	 * @param filePath
	 * @param listPhots
	 * @param xMargin
	 * @param widthByPhotosCount
	 * @param heightByPhotosCount
	 * @param portrait
	 * @param nombreDePhotosParLigne
	 * @param nombreDePhotosParColomn
	 * @param object 
	 */
    public static void createPdf(
    		
    		
    		boolean portrait,
    		
    		float widthByPhotosCount,
  			float heightByPhotosCount,
    		
  			int nombreDePhotosParLigne,
  			int nombreDePhotosParColomn,
  			
  			float xMargin,
  			float yMargin,
  			
  			PDRectangleEnum rectangle,
  			
  			List<File> listPhots,
  			String filePath,
  			Person selectedPerson
  			
    		) 
    {
    	 	
    	
    
 
        try (PDDocument document = new PDDocument()) {
        	
        	  PDPage page ;
        if(portrait) {
        	// Configuration de la page A4 en mode paysage
        	page  = new PDPage(new PDRectangle(rectangle.getPDRectangle().getWidth(),rectangle.getPDRectangle().getHeight()));
            document.addPage(page);
        }else {
        	// Configuration de la page A4 en mode paysage
              page = new PDPage(new PDRectangle(rectangle.getPDRectangle().getHeight(), rectangle.getPDRectangle().getWidth()));
            document.addPage(page);
        }
            
 
        
	int size  = listPhots.size();
		int count =0;
		if(size<=2) {
			
			count =0;
		}else if(size<=4) {
			count =1;
		}else if(size<=6) {
			count =2;
		}else  if(size<=9)  {
			count =3;
		}else  {
			count =4;
		}
		
 System.out.println("size : "+size);
 System.out.println("count : "+count);
 
            // Configuration des différentes mises en page
            float[][] layouts = {
                    {0.5f, 0.5f},  // Deux photos
                    {0.5f, 0.5f, 0.5f, 0.5f},  // Quatre photos
                    {0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f},  // Six photos
                    {0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f},  // Neuf photos
                    {0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f}  // douze photos
            }; 
        
				float[] fs = layouts[count];
				
				
				
			    addPhotosToPage(document,
			    		page, 
			    		fs, 
			    		listPhots,
			    		xMargin,
			    		yMargin,
			    		widthByPhotosCount,
			    		heightByPhotosCount, 
			  			  nombreDePhotosParLigne,
			  			  nombreDePhotosParColomn,
			  			selectedPerson);
			    
                // Ajoutez une nouvelle page pour la prochaine mise en page
               // page = new PDPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
               // document.addPage(page); 
			    
			    
            // Sauvegarde du document PDF
            document.save(filePath);
            System.out.println("Fichier PDF créé avec succès : " + filePath);
        } catch (IOException e) {
            e.printStackTrace();
        }
    } 
    private static final float MARGIN = 50;
    private static final int FONT_SIZE = 40;
 

    private static void addTextLine(PDPageContentStream contentStream, String text, float x, float y) throws IOException {
    	 System.out.println("x + 5 = "+x + 5);
		  System.out.println("x + ( 15) = "+x + ( 15));
		contentStream.beginText();
		contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
		contentStream.newLineAtOffset(x, y); // Ajustez cela en fonction de l'espacement souhaité entre les lignes

		contentStream.showText(text);
		contentStream.endText();
    }
 
    

    	private static void addTextOnFirstPage(PDPageContentStream contentStream, PDPage page, String textUser) throws IOException {
    	    float pageWidth = page.getMediaBox().getWidth();
    	    float pageHeight = page.getMediaBox().getHeight();
    	    
    	    // Calculer la position du texte à droite
    	    float textWidth = getTextWidth(textUser);
    	    float xPosition = pageWidth - textWidth - 10;  // Décalage de 10 pixels par rapport à la droite
    	    float yPosition = 50;  // Position Y pour le texte, près du bas

    	    // Ajouter le texte à la première page
    	    addStringToPage(contentStream, pageWidth, xPosition, yPosition, textUser);
    	}

   

    	private static void addPageNumber(PDPageContentStream contentStream, PDPage page, int pageNumber) throws IOException {
    	    float pageWidth = page.getMediaBox().getWidth();
    	    float pageHeight = page.getMediaBox().getHeight();
    	    
    	    // Paramètres de la position du texte
    	    float xPosition = pageWidth - 60;  // Position X pour le coin inférieur droit
    	    float yPosition = 30;              // Position Y pour le coin inférieur
    	    
    	    // Ajout du texte (numéro de page)
    	    contentStream.beginText();
    	    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
    	    contentStream.newLineAtOffset(xPosition, yPosition);
    	    contentStream.showText("Page " + pageNumber);
    	    contentStream.endText();
    	}


    
    /**
     * {@code} OK
     * @param document
     * @param page
     * @param selectedPerson
     * @param contentStream
     * @param xMargin
     * @param yMargin
     * @throws IOException
     */
    private static void addPhotosToPage(
    	    PDDocument document,
    	    PDPage page,
    	    float[] layout,
    	    List<File> listPhots,
    	    float xMargin,
    	    float yMargin,
    	    float widthByPhotosCount,
    	    float heightByPhotosCount,
    	    int nombreDePhotosParLigne,
    	    int nombreDePhotosParColomn,
    	    Person selectedPerson
    	) throws IOException {
    	    
    	    float pageWidth = page.getMediaBox().getWidth();
    	    float pageHeight = page.getMediaBox().getHeight();
    	    
    	    float cellWidth = (pageWidth - (xMargin * (nombreDePhotosParLigne + 1))) / nombreDePhotosParLigne;
    	    float cellHeight = (pageHeight - (yMargin * (nombreDePhotosParColomn + 1))) / nombreDePhotosParColomn;
    	    
    	    int photoIndex = 0;
    	    int totalPhotos = listPhots.size();
    	    int page_number=0;
    	    
    	    while (photoIndex < totalPhotos) {
    	        
    	        // Créer une nouvelle page si nécessaire
    	        if (photoIndex > 0) {
    	            page = new PDPage(page.getMediaBox());
    	            document.addPage(page);
    	        }

    	        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
    	        	
    	        	   // Ajouter les informations à la première page
    	            if (page.getRotation() == 0) {  // Ajout de texte uniquement à la première page
    	            	  float xMargin_ = 50;
    	          	    float yMargin_ = 50;
    	                addTextInformation(document, page, selectedPerson, contentStream,   xMargin_, yMargin_);
    	            }
    	              // Ajouter le texte seulement sur la première page
				    if (page.getRotation() == 0) {  
				        String textUser = "Dr Hamid MADANI";
				        addTextOnFirstPage(contentStream, page, textUser);
				    }	    
    	      
    	            
    	        	 
    	           
    	            for (int row = 0; row < nombreDePhotosParColomn; row++) {
    	                for (int col = 0; col < nombreDePhotosParLigne; col++) {
    	                    
    	                    if (photoIndex >= totalPhotos) break;
    	                    
    	                    float cellX = xMargin + col * (cellWidth + xMargin);
    	                    float cellY = pageHeight - (yMargin + (row + 1) * (cellHeight + yMargin));
    	                    
    	                    File filePhoto = listPhots.get(photoIndex);
    	                    BufferedImage image = Thumbnails.of(filePhoto)
    	                        .size((int) cellWidth, (int) cellHeight)
    	                        .keepAspectRatio(true)
    	                        .asBufferedImage();

    	                    PDImageXObject pdImage = LosslessFactory.createFromImage(document, image);
    	                    float imageWidth = pdImage.getWidth();
    	                    float imageHeight = pdImage.getHeight();
    	                    
    	                    // Centrer l'image dans la cellule
    	                    float xOffset = cellX + (cellWidth - imageWidth) / 2;
    	                    float yOffset = cellY + (cellHeight - imageHeight) / 2;

    	                    contentStream.drawImage(pdImage, xOffset, yOffset, imageWidth, imageHeight);
    	                    
    	                    // Bordure autour de chaque image
    	                    contentStream.setLineWidth(1f);
    	                    contentStream.setStrokingColor(Color.BLACK);
    	                    contentStream.addRect(xOffset, yOffset, imageWidth, imageHeight);
    	                    contentStream.stroke();
    	                    
    	                    // Ajouter texte sous chaque image (optionnel)
    	                    contentStream.beginText();
    	                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
    	                    contentStream.newLineAtOffset(xOffset, yOffset - 15);
    	                    contentStream.showText("Photo " + (photoIndex + 1));
    	                    contentStream.endText();
    	                    
    	                    photoIndex++;
    	                }
    	            }
    	            
    	            page_number++;
    	            // Ajouter le numéro de page
    	    	    addPageNumber(contentStream, page, page_number );

    	        }
    	    }
    	}

    
    private static void addTextInformation(
    	    PDDocument document,
    	    PDPage page,
    	    Person selectedPerson,
    	    PDPageContentStream contentStream,
    	     float xMargin  ,
    	    float yMargin  
    	) throws IOException {
    	    // Informations sur la personne sur la première page
    	    float pageWidth = page.getMediaBox().getWidth();
    	    float pageHeight = page.getMediaBox().getHeight();
    	   
    	    
    	    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
    	    contentStream.beginText();
    	    contentStream.newLineAtOffset(xMargin, pageHeight - yMargin);
    	    
    	    contentStream.showText("Nom: " + selectedPerson.getNom());
    	    contentStream.newLineAtOffset(0, -15);
    	    contentStream.showText("Prénom: " + selectedPerson.getPrenom());
    	    contentStream.endText();
    	}
    
    
    
    
//    private static void addPhotosToPage(PDDocument document,
//            PDPage page,
//            List<File> listPhotos,
//            float xMargin,
//            float yMargin,
//            float widthByPhotosCount,
//            float heightByPhotosCount,
//            int nombreDePhotosParLigne,
//            int nombreDePhotosParColomn,
//            Person selectedPerson) throws IOException {
//
//        float pageWidth = page.getMediaBox().getWidth();
//        float pageHeight = page.getMediaBox().getHeight();
//        float startX = xMargin;
//        float startY = pageHeight - yMargin;
//
//        int currentPhotoIndex = 0;  // Photo en cours
//        int totalPhotos = listPhotos.size();
//        int maxPhotosPerPage = nombreDePhotosParLigne * nombreDePhotosParColomn; // Photos max par page
//        int photoIndex = 1;
//
//        // Boucle pour remplir toutes les pages
//        while (currentPhotoIndex < totalPhotos) {
//            PDPageContentStream contentStream = new PDPageContentStream(document, page);
//            
//            float cellX = startX;
//            float cellY = startY;
//
//            int photosOnCurrentPage = 0;
//
//            // Ajouter les photos jusqu'à remplir la page
//            while (photosOnCurrentPage < maxPhotosPerPage && currentPhotoIndex < totalPhotos) {
//                cellX = startX + (photosOnCurrentPage % nombreDePhotosParLigne) * (widthByPhotosCount + xMargin);
//                cellY = startY - (photosOnCurrentPage / nombreDePhotosParLigne + 1) * (heightByPhotosCount + yMargin);
//
//                // Ajouter la photo
//                try {
//                    File filePhoto = listPhotos.get(currentPhotoIndex++);
//                    BufferedImage resizedImage = loadImage(filePhoto);
//                    BufferedImage image = Thumbnails.of(resizedImage)
//                            .width((int) widthByPhotosCount)
//                            .keepAspectRatio(true)
//                            .asBufferedImage();
//
//                    PDImageXObject pdImage = LosslessFactory.createFromImage(document, image);
//
//                    // Dessiner l'image
//                    contentStream.drawImage(pdImage, cellX, cellY, pdImage.getWidth(), pdImage.getHeight());
//
//                    // Ajouter bordure
//                    contentStream.setLineWidth(1f);
//                    contentStream.setStrokingColor(Color.BLACK);
//                    contentStream.addRect(cellX, cellY, pdImage.getWidth(), pdImage.getHeight());
//                    contentStream.stroke();
//
//                    // Ajouter texte sous l'image
//                    contentStream.beginText();
//                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
//                    contentStream.newLineAtOffset(cellX + 5, cellY + pdImage.getHeight() + 15);
//                    contentStream.showText("Photo " + photoIndex++);
//                    contentStream.endText();
//
//                } catch (IndexOutOfBoundsException e) {
//                    break;
//                }
//
//                photosOnCurrentPage++;
//            }
//            
//            contentStream.close();
//
//            // Si des photos restent à placer, créer une nouvelle page
//            if (currentPhotoIndex < totalPhotos) {
//                page = new PDPage(page.getMediaBox());
//                document.addPage(page);
//            }
//        }
//    }

    
    
//    private static void addPhotosToPage(
//            PDDocument document,
//            PDPage page,
//            float[] layout,
//            List<File> listPhotos,
//            float xMargin,
//            float yMargin,
//            float widthByPhotosCount,
//            float heightByPhotosCount,
//            int nombreDePhotosParLigne,
//            int nombreDePhotosParColomn,
//            Person selectedPerson) throws IOException {
//
//        float pageWidth = page.getMediaBox().getWidth();
//        float pageHeight = page.getMediaBox().getHeight();
//        float startX = xMargin;
//        float startY = pageHeight - yMargin;
//
//        int photoIndex = 1;
//        int currentPhotoIndex = 0;  // Suivi des photos à ajouter
//        int totalPhotos = listPhotos.size();
//        
//        // Boucle jusqu'à ce que toutes les photos soient ajoutées
//        while (currentPhotoIndex < totalPhotos) {
//            PDPageContentStream contentStream = new PDPageContentStream(document, page);
//            
//            // Réinitialiser les positions
//            float cellX = startX;
//            float cellY = startY;
//
//            // Parcourir la mise en page `fs` et remplir la page
//            for (int i = 0; i < layout.length && currentPhotoIndex < totalPhotos; i++) {
//                cellX = startX + (i % nombreDePhotosParLigne) * (widthByPhotosCount + xMargin);
//                cellY = startY - (i / nombreDePhotosParLigne + 1) * (heightByPhotosCount + yMargin);
//
//                // Si l'image dépasse la page, créer une nouvelle page
//                if (cellY < yMargin) {
//                    contentStream.close();  // Fermer la page actuelle
//                    page = new PDPage(page.getMediaBox());
//                    document.addPage(page);
//                    contentStream = new PDPageContentStream(document, page);
//                    cellY = startY - heightByPhotosCount;
//                }
//
//                // Ajouter la photo
//                try {
//                    File filePhoto = listPhotos.get(currentPhotoIndex++);
//                    BufferedImage resizedImage = loadImage(filePhoto);
//                    BufferedImage image = Thumbnails.of(resizedImage)
//                            .width((int) widthByPhotosCount)
//                            .keepAspectRatio(true)
//                            .asBufferedImage();
//
//                    PDImageXObject pdImage = LosslessFactory.createFromImage(document, image);
//
//                    // Dessiner l'image
//                    contentStream.drawImage(pdImage, cellX, cellY, pdImage.getWidth(), pdImage.getHeight());
//
//                    // Ajouter bordure
//                    contentStream.setLineWidth(1f);
//                    contentStream.setStrokingColor(Color.BLACK);
//                    contentStream.addRect(cellX, cellY, pdImage.getWidth(), pdImage.getHeight());
//                    contentStream.stroke();
//
//                    // Ajouter texte sous l'image
//                    contentStream.beginText();
//                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
//                    contentStream.newLineAtOffset(cellX + 5, cellY + pdImage.getHeight() + 15);
//                    contentStream.showText("Photo " + photoIndex++);
//                    contentStream.endText();
//
//                } catch (IndexOutOfBoundsException e) {
//                    break;
//                }
//            }
//            
//            contentStream.close();
//        }
//    }

    
    
  	private static void addPhotosToPage_old(
  			PDDocument document,
  			PDPage page,
  			float[] layout,
  			List<File> listPhots,
  			float xMargin,
  			float yMargin,
  			float widthByPhotosCount,
  			float heightByPhotosCount,
  			int nombreDePhotosParLigne,
  			int nombreDePhotosParColomn,
  			Person selectedPerson) throws IOException {
  		
  		
  		
  		try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
  			
//  			 addTextInformation(  document,   page,   selectedPerson);
  			
  			float  xStart = xMargin; 
     
           
            float bottomMargin = 70;
           

            float margin = 50;
            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            float yStart = pageHeight - margin;
            float yPosition = yStart;

           

        	 
            // Centrer le texte horizontalement
            float xPosition = xMargin;//(pageWidth - textWidth) / 2;
            
             contentStream.setFont(PDType1Font.HELVETICA_BOLD, FONT_SIZE);
             contentStream.beginText(); 
             contentStream.newLineAtOffset(xPosition, yPosition);
             contentStream.newLineAtOffset(xStart + 5, yStart + ( 15));
             
             contentStream.endText();
             
             addTextLine(contentStream, "Nom: " + selectedPerson.getNom(),xPosition,yPosition);
             addTextLine(contentStream, "Prénom: " + selectedPerson.getPrenom(),xPosition,yPosition+20);
 
             
             float startX = xMargin;
              float startY = page.getMediaBox().getHeight() - yMargin;
 
                
              float cellWidth = widthByPhotosCount; //(width - margin * 3) / 2;  // 3 marges entre 4 cellules
              float cellHeight = widthByPhotosCount; //(height - margin * 2) / 2; // 2 marges entre 3 lignes
              
              String textUser = "Dr Hamid MADANI";  
        	 float textWidth =getTextWidth(textUser);
        	 float xPosition_ = pageWidth-textWidth;
			addStringToPage(contentStream, pageWidth, xPosition_,  yPosition, textUser); 
			  
			  
              int photoIndex = 1;
              for (int i = 0; i < layout.length; i++) { 
            	   
                  float cellX = startX + (i % nombreDePhotosParLigne) * (cellWidth + xMargin);
                  float cellY = startY - (i / nombreDePhotosParColomn + 1) * (cellHeight + yMargin);
     
                 try { 
                	 File filePhoto = listPhots.get(i);
                
					BufferedImage resizedImage = loadImage(filePhoto); 
					BufferedImage  image= Thumbnails.of(resizedImage).width((int) widthByPhotosCount).keepAspectRatio(true)
							.asBufferedImage();
					 
					 PDImageXObject pdImage = LosslessFactory.createFromImage(document, image);

					 System.out.println(" pdImage.getWidth() ="+pdImage.getWidth()+" cellX= "+ cellX);
					
					 
					// Dessinez l'image sur la page PDF
					contentStream.drawImage(
							pdImage,
							cellX,
							cellY,
							pdImage.getWidth(),
							pdImage.getHeight() 							
							); 
					  contentStream.setLineWidth(1f);
					  contentStream.setStrokingColor(Color.BLACK);
					  contentStream.addRect(cellX, cellY, pdImage.getWidth(), pdImage.getHeight());
					  contentStream.stroke();

					  // Ajouter le numéro de photo (à des fins de démonstration)
					  contentStream.beginText();
					  contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
					  contentStream.newLineAtOffset(cellX + 5, cellY + (pdImage.getHeight()+15));
					  contentStream.showText("Photo " + photoIndex++);
					  contentStream.endText();
				} catch (IndexOutOfBoundsException e) {
					 
				} 
                 
           
              }
              
              
          }
      }


  
 	
	private static void addStringToPage(PDPageContentStream contentStream, float pageWidth,float xPosition, float yPosition, String textUser)
			throws IOException { 
		  
		  // Ajouter le numéro de photo (à des fins de démonstration)
		  contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
		   contentStream.beginText(); 
		  contentStream.newLineAtOffset(xPosition, yPosition);
		  
		  contentStream.showText( textUser);
		  contentStream.endText();
		   
  	    
  	    
	}
  	

	private static float getTextWidth(String text) throws IOException {
	    // Calculer la largeur du texte avec la police donnée
	    return PDType1Font.HELVETICA_BOLD.getStringWidth(text) / 1000f * FONT_SIZE;  // Multiplie par la taille de police (12 ici)
	}
  	
//	private static float getTextWidth(String text) {
//		// TODO Auto-generated method stub
//		try {
//			return  PDType1Font.HELVETICA_BOLD.getStringWidth(text) / 1000 * FONT_SIZE;
//		} catch (IOException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		};
//		return 0;
//	}

	/**
  	 * 
  	 * @param file
  	 * @return
  	 * @throws IOException
  	 */
    public static BufferedImage loadImage(File file) throws IOException {
        return ImageIO.read(file);
    }

 

	/**
	 * 
	 */
	public static  void printPDF(File pdfFile) {

	 
		try {
			PDDocument document = PDDocument.load(pdfFile);
			PrinterJob job = PrinterJob.getPrinterJob();
			job.setPageable(new PDFPageable(document));
 
			if (job.printDialog()) {
				job.print();
			}
			document.close();
		} catch (HeadlessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NullPointerException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (PrinterException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	
	 
	
}
