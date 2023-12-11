package org.hmd.angio.security;
 

import static org.hmd.angio.security.Encryption.*;

import java.io.FileInputStream;
import java.util.Properties;
import javax.crypto.spec.SecretKeySpec;

public class ConfigFileEncryption {
	
  public static void main(String[] args) throws Exception {
    Properties properties = new Properties();
    FileInputStream inputStream = new FileInputStream("config.properties");
    properties.load(inputStream);
    String password = properties.getProperty("password");

    if (password == null) {
      throw new IllegalArgumentException("No such parameter present in config file");
    }

    byte[] salt = new String("12345678").getBytes();
    int iterationCount = 40000;
    int keyLength = 128;
    SecretKeySpec key = createSecretKey(password.toCharArray(), salt, iterationCount, keyLength);

    String originalPassword = password;
    System.out.println("Original password: " + originalPassword);
    String encryptedPassword =  encrypt(originalPassword, key);//encrypt(originalPassword);
    System.out.println("Encrypted password: " + encryptedPassword);
    String decryptedPassword = decrypt(encryptedPassword, key);
    System.out.println("Decrypted password: " + decryptedPassword);
  }
}