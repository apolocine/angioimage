package org.hmd.angio.dto;
import java.sql.Connection; 
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hmd.angio.install.sgbd.DatabaseManager;

public class PersonDAO {

	
	private static String tb_patients ="tb_patients";
	
	
//    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/angiographie";
//    private static final String USER = "root";
//    private static final String PASSWORD = "";

//    String dDate="Sat Apr 11 12:16:44 IST 2015"; 
//    DateFormat df = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
//    Date cDate = df.parse(dDate); 
    
    public static void createTableIfNotExists() {
        try (Connection connection = 
        		DatabaseManager.getConnection()
        		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		
        		) {
            String createTableSQL = "CREATE TABLE IF NOT EXISTS "+tb_patients+" ("
                    + "id INT AUTO_INCREMENT PRIMARY KEY,"
                    
                    + "nom VARCHAR(255),"
                    + "prenom VARCHAR(255),"
                    + "naissance DATE"
//                    + ","
//                    + "idx INT( 11 ) NOT NULL"
                    + ")";
//            ALTER TABLE `tb_patients` ADD `idx` INT( 11 ) NOT NULL ,
//            ADD INDEX ( `idx` )
            try (PreparedStatement preparedStatement = connection.prepareStatement(createTableSQL)) {
                preparedStatement.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
    }
 
public boolean isConnected() {
	try {
		return DatabaseManager.getConnection()!=null;
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
		return false;
	}
}
   

private int insertNewPerson(Person person) {
	
        try (Connection connection = 
        		DatabaseManager.getConnection()
        		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		) {
            String insertSQL = "INSERT INTO "+tb_patients+" (nom, prenom, naissance) VALUES (?, ?, ? )";
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
        } catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
        return -1; // Retourne -1 en cas d'échec
    }

private Person createPerson(Person person) {
        try (Connection connection = 
        		DatabaseManager.getConnection()
        		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		) {
            PersonDAO.createTableIfNotExists();
             
            
            java.sql.Date sqlDate = new java.sql.Date(person.getDateNaissance().getTime());

            String sql = "INSERT INTO "+tb_patients+" ( nom, prenom, naissance ) VALUES (?, ?,   ?)";
            try (PreparedStatement preparedStatement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            	  preparedStatement.setString(1, person.getNom());
                    preparedStatement.setString(2, person.getPrenom());
                preparedStatement.setDate(3, sqlDate/*new java.sql.Date(person.getDateNaissance().getTime())*/);
                
                int affectedRows = preparedStatement.executeUpdate();

                if (affectedRows == 0) {
                    throw new SQLException("Insertion échouée, aucune ligne ajoutée.");
                }

                try (ResultSet generatedKeys = preparedStatement.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        person.setId(generatedKeys.getInt(1));
                    } else {
                        throw new SQLException("Échec de la récupération de l'ID généré.");
                    } 
            }
            
            
              return person;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
            
            
    
        return null;
    }

    
    
    public static Person findById(int personId) {
        Person person = null;
        try (Connection connection = 
        		DatabaseManager.getConnection()
        		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		) {
            String selectSQL = "SELECT * FROM "+tb_patients+" WHERE id = ?";
            try (PreparedStatement preparedStatement = connection.prepareStatement(selectSQL)) {
                preparedStatement.setInt(1, personId);

                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    if (resultSet.next()) {
                        person = new Person();
                        person.setId(resultSet.getInt("id"));
                        person.setNom(resultSet.getString("nom"));
                        person.setPrenom(resultSet.getString("prenom"));
                        // Vérifier si la colonne naissance est NULL
                        Date dateNaissance = resultSet.getDate("naissance");
                        person.setDateNaissance(dateNaissance != null ? dateNaissance : null);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
        return person;
    }

    public static List<Person> listAllPersons() {
        List<Person> persons = new ArrayList<>();
        try (Connection connection = 
        		DatabaseManager.getConnection()
        		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		) {
            String selectAllSQL = "SELECT * FROM "+tb_patients+"";
            try (PreparedStatement preparedStatement = connection.prepareStatement(selectAllSQL)) {
                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    while (resultSet.next()) {
                        Person person = new Person();
                        person.setId(resultSet.getInt("id"));
                        person.setNom(resultSet.getString("nom"));
                        person.setPrenom(resultSet.getString("prenom"));
                        person.setDateNaissance(resultSet.getDate("naissance"));
                        persons.add(person);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
        return persons;
    }

 
    
    private Person updatePerson(Person person) {
    	
    	 try (Connection connection = 
         		DatabaseManager.getConnection()
         		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
         		) {
            String query = "UPDATE "+tb_patients+" SET nom=?, prenom=?, naissance=?  WHERE id=?";
            try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
                preparedStatement.setString(1, person.getNom());
                preparedStatement.setString(2, person.getPrenom());
                preparedStatement.setDate(3, new java.sql.Date(person.getDateNaissance().getTime()));
               
                preparedStatement.setInt(4, person.getId());

                preparedStatement.executeUpdate();
            }
            
            return person;
        } catch (SQLException e) {
            e.printStackTrace();
            // Gérer les exceptions SQL
        } catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
    	 return null;
    }

    
    public void deletePerson(int personId) { 
  
        try (Connection connection = 
        		DatabaseManager.getConnection()
        		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
        		) {
            String sql = "DELETE FROM "+tb_patients+" WHERE id=?";
            try (PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
                preparedStatement.setInt(1, personId);
                preparedStatement.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
    }

    
    // Méthode pour supprimer une personne de la base de données
    public void deletePerson(Person person) {  
    	deletePerson(person.getId()); 
    	
//    	  try (Connection connection = 
//          		DatabaseManager.getConnection()
//          		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
//          		) {
//              String sql = "DELETE FROM "+tb_patients+" WHERE id=?";
//              try (PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
//                  preparedStatement.setInt(1, person.getId());
//                  preparedStatement.executeUpdate();
//              }
//          } catch (SQLException e) {
//              e.printStackTrace();
//          } catch (Exception e1) {
//			// TODO Auto-generated catch block
//			e1.printStackTrace();
//		}
    	  
     
    }
    
    
    
    public Person saveOrUpdatePerson(Person person) {
        if (person.getId() == 0) {
            // La personne n'a pas encore d'ID, effectuez une insertion
          return   createPerson(person);
        } else {
            // La personne a déjà un ID, effectuez une mise à jour
         return   updatePerson(person);
        }
    }

    

    public List<Person> findAll() {
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        List<Person> people = new ArrayList<>();

        try {
           
            connection =
            		DatabaseManager.getConnection()
            		//DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
            		;/* obtenir une connexion à votre base de données */;
            String query = "SELECT * FROM "+tb_patients+"";
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
        } catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
            // Fermer les ressources (ResultSet, PreparedStatement, Connection)
            // ... assurez-vous de gérer correctement les exceptions ici
        }

        return people;
    }
    
    public List<Person> searchPersons(String nom, String prenom, Date dateNaissance) throws Exception {
        List<Person> result = new ArrayList<>();

        try ( Connection connection =
        		DatabaseManager.getConnection()) {
            StringBuilder query = new StringBuilder("SELECT * FROM  "+tb_patients+ " WHERE 1=1");

            if (nom != null && !nom.isEmpty()) {
                query.append(" AND nom LIKE ?");
            }

            if (prenom != null && !prenom.isEmpty()) {
                query.append(" AND prenom LIKE ?");
            }
 
            if (dateNaissance != null) {
                query.append(" AND naissance = ?");
            }

            
            
            System.out.println(query);
            
            try (PreparedStatement preparedStatement = connection.prepareStatement(query.toString())) {
                int parameterIndex = 1;

                if (nom != null && !nom.isEmpty()) {
                    preparedStatement.setString(parameterIndex++, "%" + nom + "%");
                }

                if (prenom != null && !prenom.isEmpty()) {
                    preparedStatement.setString(parameterIndex++, "%" + prenom + "%");
                }

                if (dateNaissance != null) {
                    preparedStatement.setDate(parameterIndex, new java.sql.Date(dateNaissance.getTime()));
                }

                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    while (resultSet.next()) {
                        // Construire des objets Person à partir des résultats et les ajouter à la liste result
                    	// Extraire les valeurs de chaque colonne
                        int id = resultSet.getInt("id");
                        String resultNom = resultSet.getString("nom");
                        String resultPrenom = resultSet.getString("prenom");
                        Date resultDateNaissance = resultSet.getDate("naissance");

                        // Créer une instance de la classe Person
                        Person person = new Person(id, resultNom, resultPrenom, resultDateNaissance);

                        // Ajouter l'objet Person à la liste result
                        result.add(person);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return result;
    }

    
 
//   public static void main(String[] args) {
//            PersonDAO.createTableIfNotExists();
//
//            // Exemple d'insertion
//            Person person1 = new Person("Nom1", "Prenom1", Date.valueOf("1990-01-01"));
//            Person person2 = new Person("Nom2", "Prenom2", Date.valueOf("1995-02-15"));
//
//            PersonDAO.insertPerson(person1);
//            PersonDAO.insertPerson(person2);
//
//            // Exemple de récupération de toutes les personnes
//            List<Person> allPersons = PersonDAO.listAllPersons();
//            for (Person person : allPersons) {
//                System.out.println("Personne : " + person);
//            }
//
//            // ... Ajoutez d'autres opérations ici ...
//        }
//        
        
       
        
    }
 
