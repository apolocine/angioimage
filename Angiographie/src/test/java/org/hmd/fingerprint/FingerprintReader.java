package org.hmd.fingerprint;
import com.digitalpersona.onetouch.*;
import com.digitalpersona.onetouch.processing.DPFPFeatureExtraction;
import com.digitalpersona.onetouch.processing.DPFPImageQualityException;
import com.digitalpersona.onetouch.verification.DPFPVerification;
import com.digitalpersona.onetouch.verification.DPFPVerificationFactory;
import com.digitalpersona.onetouch.verification.DPFPVerificationResult;
import com.digitalpersona.onetouch.verification._impl.DPFPVerificationFactoryImpl;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class FingerprintReader {
    private DPFPTemplate template;
    private DPFPVerification verification;
    private Connection connection;

    public FingerprintReader() {
        try {
            // Charger le pilote JDBC
			//Class.forName("com.mysql.cj.jdbc.Driver");

            // Connexion à la base de données MySQL
            String url = "jdbc:mysql://localhost:3306/angiographie";
            String user = "root";
            String password = "";
//            private static final String JDBC_URL = "jdbc:mysql://localhost:3306/angiographie";
//            private static final String USER = "root";
//            private static final String PASSWORD = "";
            
            
            connection = DriverManager.getConnection(url, user, password);

            // Initialiser la vérification des empreintes digitales
//            verification = DPFPVerificationFactory.getInstance().createVerification();
            DPFPVerificationFactory gPFPVerificationFactory = new DPFPVerificationFactoryImpl();
            verification = gPFPVerificationFactory.createVerification();
        } catch (/*ClassNotFoundException |*/ SQLException e) {
            e.printStackTrace();
        }
    }

    // Charger l'empreinte digitale de la base de données
    private void loadTemplateFromDatabase(String username) {
        try {
            String query = "SELECT fingerprint FROM users WHERE username = ?";
            PreparedStatement preparedStatement = connection.prepareStatement(query);
            preparedStatement.setString(1, username);
            ResultSet resultSet = preparedStatement.executeQuery();

            if (resultSet.next()) {
                byte[] templateData = resultSet.getBytes("fingerprint");
                DPFPTemplateFactory templateFactory = DPFPGlobal.getTemplateFactory();
                template = templateFactory.createTemplate(templateData);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Vérifier l'empreinte digitale fournie par le lecteur avec celle enregistrée dans la base de données
    public boolean verifyFingerprint(byte[] fingerprintData, String username) {
        loadTemplateFromDatabase(username);

        if (template != null) {
            DPFPFeatureSet featureSet = extractFeatures(fingerprintData);
            DPFPVerificationResult result = verification.verify(featureSet, template);

            return result.isVerified();
        }

        return false;
    }

    // Extraire les caractéristiques de l'empreinte digitale à partir des données fournies par le lecteur
    private DPFPFeatureSet extractFeatures(byte[] fingerprintData) {
        DPFPGlobal.getSampleFactory().createSample(fingerprintData);
        DPFPFeatureExtraction featureExtraction = DPFPGlobal.getFeatureExtractionFactory().createFeatureExtraction();
        try {
			return featureExtraction.createFeatureSet(DPFPGlobal.getSampleFactory().createSample(fingerprintData), DPFPDataPurpose.DATA_PURPOSE_VERIFICATION);
		} catch (IllegalArgumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (DPFPImageQualityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
    }

    public static void main(String[] args) {
        FingerprintReader fingerprintReader = new FingerprintReader();
        // Utilisez votre lecteur d'empreintes digitales pour obtenir les données de l'empreinte digitale
        byte[] fingerprintData = obtenirDonneesEmpreinte();
        String username = "root";

        if (fingerprintReader.verifyFingerprint(fingerprintData, username)) {
            System.out.println("Empreinte digitale vérifiée avec succès!");
        } else {
            System.out.println("L'empreinte digitale n'est pas valide.");
        }
    }

    // Méthode fictive pour simuler l'obtention des données de l'empreinte digitale à partir du lecteur
    private static byte[] obtenirDonneesEmpreinte() {
        // Remplacez cette méthode par l'utilisation de votre propre lecteur d'empreintes digitales
        // pour obtenir les données de l'empreinte digitale.
        return new byte[0];
    }
}
