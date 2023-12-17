package org.hmd.angio.dto;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Person {
	private String nom;
	private String prenom;
	private Date dateNaissance;

	private int id;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getPrenom() {
		return prenom;
	}

	public void setPrenom(String prenom) {
		this.prenom = prenom;
	}

	public Date getDateNaissance() {
		return dateNaissance;
	}

	public void setDateNaissance(Date dateNaissance) {
		this.dateNaissance = dateNaissance;
	}

	public Person(String nom, String prenom, Date dateNaissance) {
		this.nom = nom;
		this.prenom = prenom;
		this.dateNaissance = dateNaissance;
	}

	public Person() {
		// TODO Auto-generated constructor stub
	}

	public Person(String nom2, String prenom2, String dateNaissance2) {
		this.nom = nom2;
		this.prenom = prenom2;
		SimpleDateFormat df = new SimpleDateFormat("yyyy-dd-MM");
		Date cDate = null;
		try {
			cDate = df.parse(dateNaissance2);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		this.dateNaissance = cDate;
	}

	public Person(int id, String nom, String prenom, Date dateNaissance) {
	
		this.id = id;
		this.nom = nom;
		this.prenom = prenom;
		this.dateNaissance = dateNaissance;
	}

	@Override
	public String toString() {

		return "Nom: " + getNom() + "\n" + "Prenom: " + getPrenom() + "\n" + "Né(e): " + getDateNaissance();
	}
	// Ajoutez des getters et des setters selon vos besoins
}
