package org.bio.mesure;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Image;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.*;

import java.io.File;
import java.io.FileOutputStream;

public class PdfWatermark {

	public static void main(String[] args) {
		String inputPdfPath = "C:\\dev\\input.pdf"; // Replace with your input PDF file
		String outputPdfPath = "C:\\\\dev\\\\output.pdf"; // Replace with your output PDF file
		String watermarkText = "CONFIDENTIAL";

		boolean  deletOrginal =true;
		addWaterMarkImage(inputPdfPath,deletOrginal , watermarkText, null);
	}

 

	public static String addWatermark(String inputPdfPath, String outputPdfPath,boolean deleteOrginal,  String watermarkText,
			String imagePath) {

		// addWatermark( inputPdfPath, watermarkText, imagePath);

		try {
			PdfReader reader = new PdfReader(inputPdfPath);
			PdfStamper stamper = new PdfStamper(reader, new FileOutputStream(outputPdfPath));

			int pageCount = reader.getNumberOfPages();
			BaseFont font = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, BaseFont.EMBEDDED);

			for (int i = 1; i <= pageCount; i++) {
				PdfContentByte content = stamper.getUnderContent(i);

				// Add text watermark
				content.beginText();
				content.setFontAndSize(font, 50);
				content.setColorFill(BaseColor.LIGHT_GRAY);
				content.showTextAligned(Element.ALIGN_CENTER, watermarkText, 300, 400, 45);
				content.endText();

				if (imagePath != null) {
					// Add image watermark
					Image watermarkImage = Image.getInstance(imagePath);
					watermarkImage.setAbsolutePosition(200, 300);
					content.addImage(watermarkImage);
				}

			}

			stamper.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		
		//n pas concerver l'original?
	if(deleteOrginal) { 
	 
		new File(inputPdfPath).delete();
	}
		
		
		return outputPdfPath;
	}

	public static String addWaterMarkImage(String inputPdfPath,  boolean deleteOrginal, String watermarkText, String imagePath) {

	 
		File modifiedFile = null;
		try {
			// Obtenez le répertoire du fichier original
//        String originalFilePath = inputPdfPath;
			String originalFileDir = inputPdfPath.substring(0, inputPdfPath.lastIndexOf(File.separator));
 
			File originalFile = new File(inputPdfPath);
			// Générez un nom de fichier pour la copie modifiée
			String modifiedFileName = "hmd_" + originalFile.getName();

			modifiedFile = new File(originalFileDir, modifiedFileName);
 
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		
		return addWatermark(inputPdfPath, modifiedFile.getAbsolutePath(),deleteOrginal,  watermarkText, imagePath);

	}

//	public static void main(String[] args) {
//		String inputPdfPath = "input.pdf"; // Replace with your input PDF file
//		String outputPdfPath = "output.pdf"; // Replace with your output PDF file
//		String watermarkText = "CONFIDENTIAL";
//
//		addWatermark(inputPdfPath, outputPdfPath, watermarkText);
//	}
//
//	public static String addWatermark(String inputPdfPath, String watermarkText) {
//
//		// Obtenez le répertoire du fichier original
////        String originalFilePath = inputPdfPath;
//		String originalFileDir = inputPdfPath.substring(0, inputPdfPath.lastIndexOf(File.separator));
//		File originalFile = new File(inputPdfPath);
//		// Générez un nom de fichier pour la copie modifiée
//		String modifiedFileName = "hmd_" + originalFile.getName();
//
//		File modifiedFile = new File(originalFileDir, modifiedFileName);
//
//		try {
//			PdfReader reader = new PdfReader(inputPdfPath);
//			PdfStamper stamper = new PdfStamper(reader, new FileOutputStream(modifiedFile));
//
//			int pageCount = reader.getNumberOfPages();
//			BaseFont font = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, BaseFont.EMBEDDED);
//
//			for (int i = 1; i <= pageCount; i++) {
//				PdfContentByte content = stamper.getUnderContent(i);
//
//				// Add text watermark
//				content.beginText();
//				content.setFontAndSize(font, 50);
//				content.setColorFill(BaseColor.LIGHT_GRAY);
//				content.showTextAligned(Element.ALIGN_CENTER, watermarkText, 300, 400, 45);
//				content.endText();
//
//				// Add image watermark
//                Image watermarkImage = Image.getInstance("icons/exit.png");
//                watermarkImage.setAbsolutePosition(200, 300);
//                content.addImage(watermarkImage);
//
//			}
//
//			stamper.close();
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//
//		return modifiedFile.getAbsolutePath();
//	}
//
//	public static void addWatermark(String inputPdfPath, String outputPdfPath, String watermarkText) {
//		try {
//			PdfReader reader = new PdfReader(inputPdfPath);
//			PdfStamper stamper = new PdfStamper(reader, new FileOutputStream(outputPdfPath));
//
//			int pageCount = reader.getNumberOfPages();
//			BaseFont font = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, BaseFont.EMBEDDED);
//
//			for (int i = 1; i <= pageCount; i++) {
//				PdfContentByte content = stamper.getUnderContent(i);
//
//				// Add text watermark
//				content.beginText();
//				content.setFontAndSize(font, 50);
//				content.setColorFill(BaseColor.LIGHT_GRAY);
//				content.showTextAligned(Element.ALIGN_CENTER, watermarkText, 300, 400, 45);
//				content.endText();
//
//				// Add image watermark
//				Image watermarkImage = Image.getInstance("path/to/your/image.png");
//				watermarkImage.setAbsolutePosition(200, 300);
//				content.addImage(watermarkImage);
//
//			}
//
//			stamper.close();
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//	}
}
