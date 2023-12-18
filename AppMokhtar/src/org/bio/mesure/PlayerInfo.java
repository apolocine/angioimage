package org.bio.mesure;

import java.io.Serializable;
import java.util.Date;

public class PlayerInfo implements Serializable {
	private static final long serialVersionUID = 1L;

	public int getPlayerId() {
		return playerId;
	}

	public void setPlayerId(int playerId) {
		this.playerId = playerId;
	}

	public String getPlayerName() {
		return playerName;
	}

	public void setPlayerName(String playerName) {
		this.playerName = playerName;
	}

	public int getAge() {
		return age;
	}

	public void setAge(int age) {
		this.age = age;
	}

	public int getRestingHeartRate() {
		return restingHeartRate;
	}

	public void setRestingHeartRate(int restingHeartRate) {
		this.restingHeartRate = restingHeartRate;
	}

	public int getMaxHeartRate() {
		return maxHeartRate;
	}

	public void setMaxHeartRate(int maxHeartRate) {
		this.maxHeartRate = maxHeartRate;
	}

	public int getTrainingHeartRate() {
		return trainingHeartRate;
	}

	public void setTrainingHeartRate(int trainingHeartRate) {
		this.trainingHeartRate = trainingHeartRate;
	}

	public double getMaxOxygenConsumption() {
		return maxOxygenConsumption;
	}

	public void setMaxOxygenConsumption(double maxOxygenConsumption) {
		this.maxOxygenConsumption = maxOxygenConsumption;
	}

	public double getMaxAirSpeed() {
		return maxAirSpeed;
	}

	public void setMaxAirSpeed(double maxAirSpeed) {
		this.maxAirSpeed = maxAirSpeed;
	}

	public double getMaxAirCapacity() {
		return maxAirCapacity;
	}

	public void setMaxAirCapacity(double maxAirCapacity) {
		this.maxAirCapacity = maxAirCapacity;
	}

	public Date getDateOfEntry() {
		return dateOfEntry;
	}

	public void setDateOfEntry(Date dateOfEntry) {
		this.dateOfEntry = dateOfEntry;
	}

	private int playerId;
	private String playerName;
	private int age;
	private int restingHeartRate;
	private int maxHeartRate;
	private int trainingHeartRate;
	private double maxOxygenConsumption;
	private double maxAirSpeed;
	private double maxAirCapacity;
	private Date dateOfEntry;

	// Constructeur, getters, setters
	// ...

	public PlayerInfo() {
		// Initialisez la date de saisie avec la date actuelle
		dateOfEntry = new Date();
	}
}
