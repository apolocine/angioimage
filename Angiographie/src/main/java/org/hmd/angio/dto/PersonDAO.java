package org.hmd.angio.dto;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class PersonDAO {

    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/angiographie";
    private static final String USER = "root";
    private static final String PASSWORD = "";

//    String dDate="Sat Apr 11 12:16:44 IST 2015"; 
//    DateFormat df = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
//    Date cDate = df.parse(dDate); 
    
    public static void createTableIfNotExists() {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
            String createTableSQL = "CREATE TABLE IF NOT EXISTS personne ("
                    + "id INT AUTO_INCREMENT PRIMARY KEY,"
                    + "nom VARCHAR(255),"
                    + "prenom VARCHAR(255),"
                    + "date_naissance DATE"
                    + ")";
            try (PreparedStatement preparedStatement = connection.prepareStatement(createTableSQL)) {
                preparedStatement.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


 

    public static int insertPerson(Person person) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
            String insertSQL = "INSERT INTO personne (nom, prenom, date_naissance) VALUES (?, ?, ? )";
            try (PreparedStatement preparedStatement = connection.prepareStatement(insertSQL, PreparedStatement.RETURN_GENERATED_KEYS)) {
                preparedStatement.setString(1, person.getNom());
                preparedStatement.setString(2, person.getPrenom());
                preparedStatement.setDate(3, new java.sql.Date(person.getDateNaissance().getTime()) );
                
                
                preparedStatement.executeUpdate();

                // Récupérer l'identifiant généré
                try (ResultSet generatedKeys = preparedStatement.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        return generatedKeys.getInt(1);
                    } else {
                        throw new SQLException("Échec de la récupération de l'ID généré.");
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1; // Retourne -1 en cas d'échec
    }

    
    
    public void createPerson(Person person) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
            PersonDAO.createTableIfNotExists();
            
            
            java.sql.Date sqlDate = new java.sql.Date(person.getDateNaissance().getTime());

            String sql = "INSERT INTO personne (id, nom, prenom, date_naissance ) VALUES (?,?, ?,   ?)";
            try (PreparedStatement preparedStatement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            	  preparedStatement.setInt(1, person.getId());
            	  preparedStatement.setString(2, person.getNom());
                    preparedStatement.setString(3, person.getPrenom());
                preparedStatement.setDate(4, new java.sql.Date(person.getDateNaissance().getTime()));
                

                preparedStatement.executeUpdate();

                // Récupérer l'ID généré pour la nouvelle personne
                try (ResultSet generatedKeys = preparedStatement.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        person.setId(generatedKeys.getInt(1));
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static Person readPerson(int personId) {
        Person person = null;
        try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
            String selectSQL = "SELECT * FROM personne WHERE id = ?";
            try (PreparedStatement preparedStatement = connection.prepareStatement(selectSQL)) {
                preparedStatement.setInt(1, personId);

                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    if (resultSet.next()) {
                        person = new Person();
                        person.setId(resultSet.getInt("id"));
                        person.setNom(resultSet.getString("nom"));
                        person.setPrenom(resultSet.getString("prenom"));
                        // Vérifier si la colonne date_naissance est NULL
                        Date dateNaissance = resultSet.getDate("date_naissance");
                        person.setDateNaissance(dateNaissance != null ? dateNaissance : null);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return person;
    }

    public static List<Person> listAllPersons() {
        List<Person> persons = new ArrayList<>();
        try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
            String selectAllSQL = "SELECT * FROM personne";
            try (PreparedStatement preparedStatement = connection.prepareStatement(selectAllSQL)) {
                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    while (resultSet.next()) {
                        Person person = new Person();
                        person.setId(resultSet.getInt("id"));
                        person.setNom(resultSet.getString("nom"));
                        person.setPrenom(resultSet.getString("prenom"));
                        person.setDateNaissance(resultSet.getDate("date_naissance"));
                        persons.add(person);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return persons;
    }

 
    
    public void updatePerson(Person person) {
    	 try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
            String query = "UPDATE personne SET nom=?, prenom=?, date_naissance=?  WHERE id=?";
            try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
                preparedStatement.setString(1, person.getNom());
                preparedStatement.setString(2, person.getPrenom());
                preparedStatement.setDate(3, new java.sql.Date(person.getDateNaissance().getTime()));
               
                preparedStatement.setInt(4, person.getId());

                preparedStatement.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            // Gérer les exceptions SQL
        }
    }

    public void deletePerson(int personId) {
    	
  
        try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
            String sql = "DELETE FROM personne WHERE id=?";
            try (PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
                preparedStatement.setInt(1, personId);
                preparedStatement.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    
    // Méthode pour supprimer une personne de la base de données
    public void deletePerson(Person person) {
    	
    	  try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
              String sql = "DELETE FROM personne WHERE id=?";
              try (PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
                  preparedStatement.setInt(1, person.getId());
                  preparedStatement.executeUpdate();
              }
          } catch (SQLException e) {
              e.printStackTrace();
          }
    	  
     
    }
    
    
    
    public void saveOrUpdatePerson(Person person) {
        if (person.getId() == 0) {
            // La personne n'a pas encore d'ID, effectuez une insertion
            createPerson(person);
        } else {
            // La personne a déjà un ID, effectuez une mise à jour
            updatePerson(person);
        }
    }

        public static void main(String[] args) {
            PersonDAO.createTableIfNotExists();

            // Exemple d'insertion
            Person person1 = new Person("Nom1", "Prenom1", Date.valueOf("1990-01-01"));
            Person person2 = new Person("Nom2", "Prenom2", Date.valueOf("1995-02-15"));

            PersonDAO.insertPerson(person1);
            PersonDAO.insertPerson(person2);

            // Exemple de récupération de toutes les personnes
            List<Person> allPersons = PersonDAO.listAllPersons();
            for (Person person : allPersons) {
                System.out.println("Personne : " + person);
            }

            // ... Ajoutez d'autres opérations ici ...
        }
        
        
       
        public List<Person> findAll() {
            Connection connection = null;
            PreparedStatement statement = null;
            ResultSet resultSet = null;
            List<Person> people = new ArrayList<>();

            try {
               
                connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);/* obtenir une connexion à votre base de données */;
                String query = "SELECT * FROM personne";
                statement = connection.prepareStatement(query);
                resultSet = statement.executeQuery();

                while (resultSet.next()) {
                    Person person = new Person();
                    person.setId(resultSet.getInt("id"));
                    person.setNom(resultSet.getString("nom"));
                    person.setPrenom(resultSet.getString("prenom"));
                    // ... autres propriétés ...

                    people.add(person);
                }
            } catch (SQLException e) {
                e.printStackTrace(); // Gérer les erreurs d'accès à la base de données
            } finally {
                // Fermer les ressources (ResultSet, PreparedStatement, Connection)
                // ... assurez-vous de gérer correctement les exceptions ici
            }

            return people;
        }
        
        
    }
 
