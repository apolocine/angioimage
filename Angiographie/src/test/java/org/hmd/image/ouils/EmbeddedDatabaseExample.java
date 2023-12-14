package org.hmd.image.ouils;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class EmbeddedDatabaseExample {
	
//	 static {
//			try {
//				Class.forName("org.h2.Driver");
//			} catch (ClassNotFoundException e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			} 
//	 }

	
    public static void main(String[] args) {
        // Connexion à la base de données (mode embarqué)
        try (Connection connection = DriverManager.getConnection("jdbc:h2:./data/mydatabase", "sa", "")) {
            // Création de la table (si elle n'existe pas déjà)
            createTable(connection);

            // Insertion d'une entrée
            insertData(connection, "John Doe", 25);

            // Récupération des données
            retrieveData(connection);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static void createTable(Connection connection) throws SQLException {
        String createTableSQL = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), age INT)";
        try (PreparedStatement preparedStatement = connection.prepareStatement(createTableSQL)) {
            preparedStatement.execute();
        }
    }

    private static void insertData(Connection connection, String name, int age) throws SQLException {
        String insertDataSQL = "INSERT INTO users (name, age) VALUES (?, ?)";
        try (PreparedStatement preparedStatement = connection.prepareStatement(insertDataSQL)) {
            preparedStatement.setString(1, name);
            preparedStatement.setInt(2, age);
            preparedStatement.execute();
        }
    }

    private static void retrieveData(Connection connection) throws SQLException {
        String retrieveDataSQL = "SELECT * FROM users";
        try (PreparedStatement preparedStatement = connection.prepareStatement(retrieveDataSQL);
             ResultSet resultSet = preparedStatement.executeQuery()) {
            while (resultSet.next()) {
                int id = resultSet.getInt("id");
                String name = resultSet.getString("name");
                int age = resultSet.getInt("age");
                System.out.println("ID: " + id + ", Name: " + name + ", Age: " + age);
            }
        }
    }
}
