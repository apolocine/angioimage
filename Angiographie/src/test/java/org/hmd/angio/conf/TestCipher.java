package org.hmd.angio.conf;

import javax.crypto.Cipher;
import javax.crypto.*;
import java.security.*;
import javax.crypto.spec.*;

public class TestCipher {
 
	public static String encrypt(String password,String key){
		try {
			Key clef = new SecretKeySpec(key.getBytes("ISO-8859-2"),"Blowfish");
			Cipher cipher=Cipher.getInstance("Blowfish");
			cipher.init(Cipher.ENCRYPT_MODE,clef);
			return new String(cipher.doFinal(password.getBytes()));
		}
		catch (Exception e) {
			return null;
		}
	} 
 
	public static String decrypt(String password,String key){
		try {
			Key clef = new SecretKeySpec(key.getBytes("ISO-8859-2"),"Blowfish");
			Cipher cipher=Cipher.getInstance("Blowfish");
			cipher.init(Cipher.DECRYPT_MODE,clef);
			return new String(cipher.doFinal(password.getBytes()));
		}
		catch (Exception e) {
			System.out.println(e);
			return null;
		}
	}
 
	public static void main(String[] args) {
		String maCle = "concombre";
		System.out.println("Ma clé de cryptage : " + maCle);
		System.out.println("");
		String phrase = "Mon secret ne doit pas être divulgué.";
		System.out.println("Message a crypter : " + phrase);
		System.out.println("");
		String resultatCrypte = encrypt(phrase, maCle);
		System.out.println("Résultat crypté: " + resultatCrypte);
		System.out.println("");
		String resultatDecrypte = decrypt(resultatCrypte,maCle);
		System.out.println("Decryptage du resultat precedent : " + resultatDecrypte);
	}
 
}