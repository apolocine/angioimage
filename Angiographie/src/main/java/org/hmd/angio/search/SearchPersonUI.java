package org.hmd.angio.search;

import javax.swing.*;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
import javax.swing.table.DefaultTableModel;

import org.hmd.angio.PhotoOrganizer;
import org.hmd.angio.PhotoOrganizerApp;
import org.hmd.angio.PhotoOrganizerTreeApp;
import org.hmd.angio.dto.Person;
import org.hmd.angio.dto.PersonDAO;

import java.awt.BorderLayout;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class SearchPersonUI extends JFrame {

	PhotoOrganizer photoOrganizerApp;
	private JTextField txtNom, txtPrenom, txtDateNaissance;
	private JButton btnRecherche;
	private JTable tableResultats;
	PersonDAO personDAO;

	public SearchPersonUI(PhotoOrganizer photoOrganizerApp) {
		this.photoOrganizerApp = photoOrganizerApp;
		init();
	}

	private void init() {
		// Initialisez l'instance de PersonDAO
		personDAO = new PersonDAO();
		setTitle("Saisie des informations d'une personne");
		setSize(800, 600);
		setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
		setLocationRelativeTo(null);

		// Initialiser les composants UI ici...
		initializeUIComponents();

		btnRecherche.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				// Implémenter la logique de recherche ici...
				// Mettre à jour le modèle de tableau avec les résultats de la recherche.
				updateTableData();
			}
		});

		tableResultats.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent e) {
				if (e.getClickCount() == 2) {
					// Double-clic détecté, récupérer les informations de la personne sélectionnée
					int selectedRow = tableResultats.getSelectedRow();
					if (selectedRow != -1) {
						Person selectedPerson = getSelectedPersonFromRow(selectedRow);
						// Fermer l'IHM de recherche et faire quelque chose avec la personne
						// sélectionnée

						// envoyer la pzesonz a lih principake
						photoOrganizerApp.showPerson(selectedPerson);

						dispose();
						// Exemple : Afficher la personne dans une autre liste
						displaySelectedPerson(selectedPerson);
					}
				}
			}
		});

		// Assumez que 'table' est votre JTable
		tableResultats.getSelectionModel().addListSelectionListener(new ListSelectionListener() {
			@Override
			public void valueChanged(ListSelectionEvent e) {
				if (!e.getValueIsAdjusting()) {
					// Lorsque la sélection change, vérifiez si une ligne est sélectionnée
					if (tableResultats.getSelectedRow() != -1) {
						// Récupérez les données de la ligne sélectionnée
						int selectedRow = tableResultats.getSelectedRow();
						int id = (int) tableResultats.getValueAt(selectedRow, 0); // Assurez-vous de remplacer 0 par
																					// l'index correct
						String nom = (String) tableResultats.getValueAt(selectedRow, 1); // Assurez-vous de remplacer 1
																							// par l'index correct
						String prenom = (String) tableResultats.getValueAt(selectedRow, 2); // Assurez-vous de remplacer
																							// 2 par l'index correct
						Date dateNaissance = (Date) tableResultats.getValueAt(selectedRow, 3); // Assurez-vous de
																								// remplacer 3 par
																								// l'index correct

						// Utilisez ces données comme nécessaire (par exemple, créer un objet Person)
						Person selectedPerson = new Person(id, nom, prenom, dateNaissance);

						// Affichez ou utilisez selectedPerson comme nécessaire
						System.out.println("Personne sélectionnée : " + selectedPerson);
					}
				}
			}
		});
	}

	private void updateTableData() {
		// Implémenter la logique de recherche et mettre à jour le modèle de tableau
		// ...

		// Exemple de mise à jour du modèle de tableau (remplacez cela par votre logique
		// réelle)
		DefaultTableModel model = (DefaultTableModel) tableResultats.getModel();
		model.setRowCount(0); // Effacer les données existantes

		// Ajouter les nouvelles données de la recherche (remplacez cela par votre
		// logique réelle)

		List<Person> rowData = new ArrayList<Person>();
		try {

			SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy");
			Date cDate = null;
			if (!txtDateNaissance.getText().isBlank() || !txtDateNaissance.getText().isEmpty())
				cDate = df.parse(txtDateNaissance.getText());
System.out.println(cDate);

			rowData = personDAO.searchPersons(txtNom.getText(), txtPrenom.getText(), cDate);
			System.out.println("searh class " + rowData);

			for (Person person : rowData) {
				model.addRow(new Object[] { person.getId(), person.getNom(), person.getPrenom(),
						person.getDateNaissance() });
			}

		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private Person getSelectedPersonFromRow(int selectedRow) {
		// Implémenter la logique pour extraire les informations de la personne à partir
		// de la ligne de tableau
		// Remplacez cela par votre logique réelle
		int id = (int) tableResultats.getValueAt(selectedRow, 0); // Assurez-vous de remplacer 0 par l'index correct
		String nom = (String) tableResultats.getValueAt(selectedRow, 1); // Assurez-vous de remplacer 1 par l'index
																			// correct
		String prenom = (String) tableResultats.getValueAt(selectedRow, 2); // Assurez-vous de remplacer 2 par l'index
																			// correct
		Date dateNaissance = (Date) tableResultats.getValueAt(selectedRow, 3); // Assurez-vous de remplacer 3 par
																				// l'index correct

		// Utilisez ces données comme nécessaire (par exemple, créer un objet Person)
		return new Person(id, nom, prenom, dateNaissance);

	}

	private void displaySelectedPerson(Person selectedPerson) {
		// Exemple : Afficher la personne dans une autre liste
		// Remplacez cela par votre logique réelle
		System.out.println("Personne sélectionnée : " + selectedPerson);

	}

	public static void main(String[] args) {
		SwingUtilities.invokeLater(() -> {
			SearchPersonUI searchPersonUI = new SearchPersonUI(new PhotoOrganizerApp());
			searchPersonUI.setTitle("Recherche de Personne");
			searchPersonUI.setSize(800, 600);
			searchPersonUI.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
			searchPersonUI.setVisible(true);
		});
	}

	private void initializeUIComponents() {

		// Initialiser les composants UI
		txtNom = new JTextField();
		txtPrenom = new JTextField();
		txtDateNaissance = new JTextField();
		btnRecherche = new JButton("Rechercher");
		tableResultats = new JTable();

		// Configurer le modèle de tableau
		DefaultTableModel tableModel = new DefaultTableModel();
		tableModel.addColumn("ID");
		tableModel.addColumn("Nom");
		tableModel.addColumn("Prénom");
		tableModel.addColumn("Date de Naissance");

		tableResultats.setModel(tableModel);

		// Configurer la disposition des composants
		setLayout(new BorderLayout());

		JPanel inputPanel = new JPanel(new GridLayout(3, 2));
		inputPanel.add(new JLabel("Nom :"));
		inputPanel.add(txtNom);
		inputPanel.add(new JLabel("Prénom :"));
		inputPanel.add(txtPrenom);
		inputPanel.add(new JLabel("Date de naissance :"));
		inputPanel.add(txtDateNaissance);

		JPanel buttonPanel = new JPanel();
		buttonPanel.add(btnRecherche);

		JScrollPane tableScrollPane = new JScrollPane(tableResultats);

		// Ajouter les composants à la fenêtre principale
		add(inputPanel, BorderLayout.NORTH);
		add(buttonPanel, BorderLayout.CENTER);
		add(tableScrollPane, BorderLayout.SOUTH);
	}

}
