package org.hmd.angio.dto;

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

	@Override
	public String toString() {
	 
		return "Nom: "+getNom()+"\n"+"Prenom: "+getPrenom()+"\n"+"Né(e): "+getDateNaissance();
	}
    // Ajoutez des getters et des setters selon vos besoins
}
