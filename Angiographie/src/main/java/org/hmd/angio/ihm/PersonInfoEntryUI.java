package org.hmd.angio.ihm;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextField;

import org.hmd.angio.PhotoOrganizer;
import org.hmd.angio.dto.Person;
import org.hmd.image.ouils.DatePicker;

public class PersonInfoEntryUI extends JDialog  {

	
	

   private PhotoOrganizer photoOrganizerApp;
 
	private static final long serialVersionUID = 1L;
	private JTextField idField;
	private JTextField nomField;
    private JTextField prenomField;
    private JTextField dateNaissanceField;
//    private JTextField datePrisePhotosField;
    
    private JTextField antecedentsField;
    private JButton enregistrerButton;

//    private JTextField nomField;
//    private JTextField prenomField;
//    private JXDatePicker dateNaissancePicker;
//    private JTextField antecedentsField;
//    private JXDatePicker datePrisePhotosPicker;  // Nouveau composant pour la date de prise des photos
//    private JButton enregistrerButton;
    
 
    public PersonInfoEntryUI(PhotoOrganizer photoOrganizerApp) {
		this.photoOrganizerApp = photoOrganizerApp;
	     initialize();
	}

	private void initialize() {
    	
        setTitle("Saisie des informations d'une personne");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);

        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new GridLayout(6, 2, 10, 10));
        
        
        // Ajouter des composants Swing pour la saisie des informations
        mainPanel.add(new JLabel("id :"));
        idField = new JTextField("0");
        idField.setEditable(false);
        
        mainPanel.add(idField);
        
        // Ajouter des composants Swing pour la saisie des informations
        mainPanel.add(new JLabel("Nom :"));
        nomField = new JTextField();
        mainPanel.add(nomField);

        mainPanel.add(new JLabel("Prénom :"));
        prenomField = new JTextField();
        mainPanel.add(prenomField);

        mainPanel.add(new JLabel("Date de Naissance :"));
        JPanel birthPanel = new JPanel();
        birthPanel.setLayout(new GridLayout(1, 2, 10, 10));
        
        dateNaissanceField = new JTextField();
        dateNaissanceField.setEditable(false);
        birthPanel.add(dateNaissanceField );
        
        final DatePicker dpBirthDay = new DatePicker();
        ImageIcon ii = dpBirthDay.getImage();
//      System.out.println(ii.getIconWidth());
//      System.out.println(ii.getIconHeight());
        final JButton datePicker = new JButton(ii);
        birthPanel.add(datePicker );
        datePicker.setPreferredSize(new Dimension(30, 24));
        datePicker.setMargin(new Insets(0,0,0,0));
        datePicker.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dpBirthDay.setDate(dateNaissanceField.getText());
                dpBirthDay.popupShow(datePicker);
            }
        });
        dpBirthDay.addPopupListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
            	dateNaissanceField.setText(dpBirthDay.getFormattedDate());
                dpBirthDay.popupHide();
            }
        });
        
         mainPanel.add(birthPanel);
         
//         JPanel prisePhotoPanel = new JPanel();
//         prisePhotoPanel.setLayout(new GridLayout(1, 2, 10, 10));
//        
    
//      mainPanel.add(new JLabel("Date prise de photo :"));
//        datePrisePhotosField = new JTextField();
//        datePrisePhotosField.setEditable(false);
//        prisePhotoPanel.add(datePrisePhotosField);
        
       
        
        
//        final DatePicker dpprisePhotoDay = new DatePicker();
//        ImageIcon ii2 = dpprisePhotoDay.getImage();
////      System.out.println(ii.getIconWidth());
////      System.out.println(ii.getIconHeight());
//        final JButton datePrisePicker = new JButton(ii2);
//        prisePhotoPanel.add(datePrisePicker );
//        datePrisePicker.setPreferredSize(new Dimension(30, 24));
//        datePrisePicker.setMargin(new Insets(0,0,0,0));
//        
//        datePrisePicker.addActionListener(new ActionListener() {
//            public void actionPerformed(ActionEvent e) {
//            	dpprisePhotoDay.setDate(datePrisePhotosField.getText());
//            	dpprisePhotoDay.popupShow(datePrisePicker);
//            }
//        });
//        dpprisePhotoDay.addPopupListener(new ActionListener() {
//            public void actionPerformed(ActionEvent e) {
//            	datePrisePhotosField.setText(dpprisePhotoDay.getFormattedDate());
//            	dpprisePhotoDay.popupHide();
//            }
//        });
//        
//         mainPanel.add(prisePhotoPanel);
//        
        
        mainPanel.add(new JLabel("Antécédents :"));
        antecedentsField = new JTextField();
        mainPanel.add(antecedentsField);

        enregistrerButton = new JButton("Enregistrer");
        enregistrerButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
            	saveOrUpdatePerson();
            	   // Effacez les champs après l'enregistrement/modification si nécessaire
                clearFields();
            }
        });
        mainPanel.add(enregistrerButton);

        add(mainPanel);
    }

    
 // Méthode appelée pour définir la personne en cours de modification
    public void setEditingPerson(Person person) {
    	
    	int idPerson = 0;
		try {	idPerson = Integer.parseInt(person.getId()+""); 
			
		} catch (NumberFormatException e) {
			idPerson = 0;
		 e.printStackTrace();		 
		}
		
    	idField.setText(""+idPerson);
    	
        // Initialisez les champs de l'interface utilisateur avec les informations de la personne en cours de modification
        nomField.setText(person.getNom());
        prenomField.setText(person.getPrenom());  
SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd/MM/yyyy");
     dateNaissanceField.setText( simpleDateFormat.format(person.getDateNaissance())     );
        
    }

    
    public void showForm(JFrame parentFrame,JScrollPane scrollPane) {
    	
    	JOptionPane.showMessageDialog(parentFrame,    JOptionPane.INFORMATION_MESSAGE);
    }
    
    /**
     * 
     * @return
     */
    public Person getNewPerson() {
    	
    	int idPerson = 0;
		try {
			if(idField.getText()!= null && idField.getText() != " "  && idField.getText() != "") {
				idPerson = Integer.parseInt(idField.getText());
			} 
			
		} catch (NumberFormatException e) {
			idPerson = 0;
		 e.printStackTrace();		 
		}
    	
    	// Récupérez les informations saisies dans l'interface utilisateur
        String nom = nomField.getText();
        String prenom = prenomField.getText();
    	
    	SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd/MM/yyyy");
    	
        Date dateNaissance = null;
		try {
			dateNaissance = simpleDateFormat.parse(dateNaissanceField.getText());
		} catch (ParseException e) {
					e.printStackTrace();
		} 
     

        // Vérifiez si tous les champs sont remplis
        if (nom.isEmpty() || prenom.isEmpty() /* || dateNaissance.isEmpty() || datePrisePhotos.isEmpty()*/) {
            JOptionPane.showMessageDialog(this, "Veuillez remplir tous les champs.", "Erreur", JOptionPane.ERROR_MESSAGE);
            return null; 
        }

        // Créez une instance de Person avec les données saisies
        Person newPerson = new Person(idPerson,nom, prenom, dateNaissance); 
        
        return newPerson;
    }
    
    
    private void saveOrUpdatePerson() {
        // Créez une instance de Person avec les données saisies
        Person newPerson = getNewPerson() ;
        photoOrganizerApp.addTodayWorkPerson(newPerson);
        
        dispose();
        
    }

     
    

	private void clearFields() {
		idField.setText("0");
        nomField.setText("");
        prenomField.setText("");
        dateNaissanceField.setText("");
//        datePrisePhotosField.setText("");
    }


}
