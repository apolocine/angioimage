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
     * @param photosCount
     * @param listPhots
     * @param margin 
     */ 
	// Initialisation des marges
//    float margin = 5; // Marge en millimètres
	
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
            

            
            
//            float width = 130;// page.getMediaBox().getWidth() - 2 * margin;
//            float height =130;// page.getMediaBox().getHeight() - 2 * margin;

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

    
    
     
    
    
    
    
    ////-----------------------------------------------------
    
    
    
    
    
    private static final float MARGIN = 50;
    private static final int FONT_SIZE = 40;

//    private static void addTextInformation(PDDocument document, PDPage page, Person selectedPerson) throws IOException {
//        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
//            float yStart = page.getMediaBox().getHeight() - MARGIN;
//            float yPosition = yStart;
//
//            contentStream.setFont(PDType1Font.HELVETICA_BOLD, FONT_SIZE);
//            contentStream.beginText();
//            contentStream.newLineAtOffset(MARGIN, yPosition);
//
//            addTextLine(contentStream, "Nom: " + selectedPerson.getNom());
//            addTextLine(contentStream, "Prénom: " + selectedPerson.getPrenom());
//
//            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd/MM/yyyy");
//            String dateStr = simpleDateFormat.format(selectedPerson.getDateNaissance());
//            addTextLine(contentStream, "Date de naissance: " + dateStr);
//
//            contentStream.endText();
//        }
//    }

    private static void addTextLine(PDPageContentStream contentStream, String text, float x, float y) throws IOException {
    	 System.out.println("x + 5 = "+x + 5);
		  System.out.println("x + ( 15) = "+x + ( 15));
		contentStream.beginText();
		contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
		contentStream.newLineAtOffset(x, y); // Ajustez cela en fonction de l'espacement souhaité entre les lignes

		contentStream.showText(text);
		contentStream.endText();
    }

    // ...

    // Utilisation d'une boucle améliorée
    private static void addPhotosToPage(PDDocument document,
    		PDPage page,
    		List<File> listPhotos,
    		float xMargin,
    		float yMargin,
    		float widthByPhotosCount,
    		float heightByPhotosCount,
    		int nombreDePhotosParLigne,
    		int nombreDePhotosParColonne) throws IOException {
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            float startX = xMargin;
            float startY = page.getMediaBox().getHeight() - yMargin;

            float cellWidth = widthByPhotosCount;
            float cellHeight = heightByPhotosCount;

            int photoIndex = 1;
            for (File filePhoto : listPhotos) {
                float cellX = startX + (photoIndex % nombreDePhotosParLigne) * (cellWidth + xMargin);
                float cellY = startY - (photoIndex / nombreDePhotosParColonne + 1) * (cellHeight + yMargin);

                try {
                    BufferedImage resizedImage = loadImage(filePhoto);
                    BufferedImage image = Thumbnails.of(resizedImage)
                            .width((int) widthByPhotosCount)
                            .keepAspectRatio(true)
                            .asBufferedImage();

                    PDImageXObject pdImage = LosslessFactory.createFromImage(document, image);

                    contentStream.drawImage(pdImage, cellX, cellY, pdImage.getWidth(), pdImage.getHeight());
                    contentStream.setLineWidth(1f);
                    contentStream.setStrokingColor(Color.BLACK);
                    contentStream.addRect(cellX, cellY, pdImage.getWidth(), pdImage.getHeight());
                    contentStream.stroke();

                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, FONT_SIZE);
                    contentStream.newLineAtOffset(cellX + 5, cellY + (pdImage.getHeight() + 15));
                    contentStream.showText("Photo " + photoIndex++);
                    contentStream.endText();
                } catch (IndexOutOfBoundsException e) {
                    // Gérer l'exception si nécessaire
                }
            }
        }
    }

    ///---------------------------------------------------

	
    
    
    
    
    private static void addTextInformation(PDDocument document, PDPage page, Person selectedPerson) throws IOException {
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            float margin = 50;
            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            float yStart = pageHeight - margin;
            float yPosition = yStart;

            float textWidth = PDType1Font.HELVETICA_BOLD.getStringWidth("Nom: " + selectedPerson.getNom()) / 1000 * FONT_SIZE;

            contentStream.setFont(PDType1Font.HELVETICA_BOLD, FONT_SIZE);
            contentStream.beginText();

            // Centrer le texte horizontalement
            float xPosition = (pageWidth - textWidth) / 2;

            contentStream.newLineAtOffset(xPosition, yPosition);

            addTextLine(contentStream, "Nom: " + selectedPerson.getNom(),xPosition,yPosition);
            addTextLine(contentStream, "Prénom: " + selectedPerson.getPrenom(),xPosition,yPosition);

            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd/MM/yyyy");
            String dateStr = simpleDateFormat.format(selectedPerson.getDateNaissance());
            addTextLine(contentStream, "Date de naissance: " + dateStr,xPosition,yPosition);

            contentStream.endText();
        }
    }

    
    
    
    
    
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

//             try {
//            	 System.out.println(selectedPerson);
//            	 
//				SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
//				 String dateStr = simpleDateFormat.format(selectedPerson.getDateNaissance());
//				 System.out.println(dateStr);
//			} catch (Exception e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}
//             addTextLine(contentStream, "Date de naissance: " + dateStr); 
//             contentStream.endText();
			  
			  
			  
			  
           
  		/*
  		 * 
  		 * 
  		 * @a decommenté 	 
              
              */  
             
             float startX = xMargin;
              float startY = page.getMediaBox().getHeight() - yMargin;
 
                
              float cellWidth = widthByPhotosCount; //(width - margin * 3) / 2;  // 3 marges entre 4 cellules
              float cellHeight = widthByPhotosCount; //(height - margin * 2) / 2; // 2 marges entre 3 lignes
              
              String textUser = "Dr Hamid MADANI";
              float textWidth =getTextWidth(textUser);
              
              
              // Ajouter le numéro de photo (à des fins de démonstration)
			  contentStream.beginText();
			  contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
			  
			  contentStream.newLineAtOffset(pageWidth-textWidth, yPosition);
			  
			  contentStream.showText( textUser);
			  contentStream.endText();
			  
			  
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
  	
 
  	
	private static float getTextWidth(String text) {
		// TODO Auto-generated method stub
		try {
			return  PDType1Font.HELVETICA_BOLD.getStringWidth(text) / 1000 * FONT_SIZE;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		};
		return 0;
	}

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

	
	
	
//	public static void main(String[] args) {
//	int photoCount = 4;
//	for (int i = 0; i < photoCount; i++) {
//		createPdf("" + i + "output.pdf", i); 
//	}
//
//}
	
	
	
	

//    public static void createPdf(String filePath,int photosCount) {
//    	
//        try (PDDocument document = new PDDocument()) {
//            // Configuration de la page A4 en mode paysage
//            PDPage page = new PDPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
//            document.addPage(page);
//
//            // Initialisation des marges
//            float margin = 5; // Marge en millimètres
//            float width = page.getMediaBox().getWidth() - 2 * margin;
//            float height = page.getMediaBox().getHeight() - 2 * margin;
//
//            // Configuration des différentes mises en page
//            float[][] layouts = {
//                    {0.5f, 0.5f},  // Deux photos
//                    {0.5f, 0.5f, 0.5f, 0.5f},  // Quatre photos
//                    {0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f},  // Six photos
//                    {0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f, 0.33f}  // Neuf photos
//            }; 
//        
//				float[] fs = layouts[photosCount];
//				
//			    addPhotosToPage(document, page, fs, margin, width, height);
//                // Ajoutez une nouvelle page pour la prochaine mise en page
//               // page = new PDPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
//               // document.addPage(page);  
//			    
//            // Sauvegarde du document PDF
//            document.save(filePath);
//            System.out.println("Fichier PDF créé avec succès : " + filePath);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//
//    
//  
//	
//	/**
//	 * 
//	 * @param document
//	 * @param page
//	 * @param layout
//	 * @param margin
//	 * @param width
//	 * @param height
//	 * @throws IOException
//	 */
//	private static void addPhotosToPage(
//			PDDocument document, PDPage page,
//			float[] layout, float margin, 
//			float width,
//			float height) throws IOException {
//		try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
//            float startX = margin;
//            float startY = page.getMediaBox().getHeight() - margin;
//
//            float cellWidth = width / layout.length;
//            float cellHeight = height / (layout.length / 2);
//
//            int photoIndex = 1;
//            for (int i = 0; i < layout.length; i++) {
//                float cellX = startX + (i % 2) * cellWidth;
//                float cellY = startY - (i / 2 + 1) * cellHeight;
//
//                float photoWidth = layout[i] * cellWidth;
//                float photoHeight = cellHeight;
//
//                // Ajouter votre rendu de miniatures (ThumbnailRenderer) ici
//                // Utilisez les valeurs cellX, cellY, photoWidth, photoHeight pour positionner et dimensionner chaque miniature
//
//                
//                
//                contentStream.setLineWidth(1f);
//                contentStream.setStrokingColor(Color.BLACK);
//                contentStream.addRect(cellX, cellY, photoWidth, photoHeight);
//                contentStream.stroke();
//
//                // Ajouter le numéro de photo (à des fins de démonstration)
//                contentStream.beginText();
//                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
//                contentStream.newLineAtOffset(cellX + 5, cellY - 15);
//                contentStream.showText("Photo " + photoIndex++);
//                contentStream.endText();
//            }
//        }
//    }
//    
    
  	
  
	
	
	

//	/**
//	 * 
//	 * @param organizedPhotos
//	 * @param outputPdf
//	 * @throws IOException
//	 */
//	public void createPDF(List<List<File>> organizedPhotos, File outputPdf) throws IOException {
//		PDDocument document = new PDDocument();
//
//		for (List<File> batch : organizedPhotos) {
//			PDPage page = new PDPage(PDRectangle.A4);
//			document.addPage(page);
//
//			try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
//				float margin = 50;
//				float yStart = page.getMediaBox().getHeight() - margin;
//				float tableWidth = page.getMediaBox().getWidth() - 2 * margin;
//				float yPosition = yStart;
//				int rows = batch.size() / 2 + (batch.size() % 2 == 0 ? 0 : 1);
//				float rowHeight = 20f;
//				float tableHeight = rowHeight * rows;
//				float tableTopY = yStart - tableHeight;
//
//				contentStream.setLineWidth(1f);
//
//				float y = yStart;
//				for (File photo : batch) {
//					contentStream.beginText();
//					contentStream.newLineAtOffset(margin + tableWidth / 2, y);
//
//					float sz = 38;// 0xFF0000;
//					contentStream.setFont(/* font */ PDType1Font.HELVETICA, sz);
//					contentStream.showText(photo.getName());
//					contentStream.endText();
//					PDImageXObject pdImage = PDImageXObject.createFromFile(photo.getAbsolutePath(), document);
//					contentStream.drawImage(pdImage, 70, 250);
//					y -= rowHeight;
//				}
//			}
//		}
//
//		document.save(outputPdf);
//		document.close();
//	}
	
	
	
}
