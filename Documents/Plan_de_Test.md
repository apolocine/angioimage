# Plan de Test - Logiciel de Gestion d'Angiographie Topcon TRC-50DX

## 1. INTRODUCTION

### 1.1 Objectif du Plan de Test
Ce document définit la stratégie de test complète pour valider toutes les fonctionnalités du logiciel d'angiographie, garantir la qualité et la fiabilité du système, et assurer la conformité aux exigences médicales.

### 1.2 Portée des Tests
- Tests unitaires des composants individuels
- Tests d'intégration des modules
- Tests fonctionnels de l'interface utilisateur
- Tests de performance et de charge
- Tests de sécurité et de confidentialité
- Tests de compatibilité avec l'angiographe Topcon TRC-50DX

### 1.3 Environnement de Test
- **OS** : Windows 10/11, Linux Ubuntu 20.04+
- **Java** : OpenJDK 17+
- **Base de données** : MySQL 8.0 et H2 (test)
- **Matériel** : Configuration minimale et recommandée
- **Angiographe** : Simulation et tests réels sur Topcon TRC-50DX

## 2. STRATÉGIE DE TEST

### 2.1 Types de Tests
```
┌─────────────────┐
│  Tests Manuels  │
├─────────────────┤
│ - Tests UI/UX   │
│ - Tests Métier  │
│ - Tests Accept. │
└─────────────────┘

┌─────────────────┐
│ Tests Automatisés│
├─────────────────┤
│ - Tests Unit.   │
│ - Tests Intégr. │
│ - Tests Régr.   │
└─────────────────┘

┌─────────────────┐
│ Tests Spéciaux  │
├─────────────────┤
│ - Performance   │
│ - Sécurité      │
│ - Compatibilité │
└─────────────────┘
```

### 2.2 Critères d'Acceptation
- **Fonctionnel** : 100% des cas de test fonctionnels passent
- **Performance** : Temps de réponse < 2s pour les opérations standard
- **Stabilité** : 0 crash lors des tests de stress
- **Sécurité** : Chiffrement et authentification validés
- **Compatibilité** : Tests réussis sur Topcon TRC-50DX

## 3. TESTS FONCTIONNELS

### 3.1 Module d'Authentification

#### 3.1.1 Tests de Connexion Utilisateur
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| AUTH-001 | Connexion valide | User: admin, Pass: correct | Accès à l'application | Élevée |
| AUTH-002 | Mot de passe incorrect | User: admin, Pass: wrong | Message d'erreur | Élevée |
| AUTH-003 | Utilisateur inexistant | User: unknown, Pass: any | Message d'erreur | Élevée |
| AUTH-004 | Champs vides | User: "", Pass: "" | Validation des champs | Moyenne |
| AUTH-005 | Déconnexion | Session active | Retour écran connexion | Moyenne |

#### 3.1.2 Tests de Configuration Base de Données
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| DB-001 | Connexion MySQL valide | URL, user, pass corrects | Connexion établie | Élevée |
| DB-002 | Connexion MySQL invalide | Paramètres incorrects | Message d'erreur | Élevée |
| DB-003 | Installation DB | Base vide | Tables créées | Élevée |
| DB-004 | Migration H2 vers MySQL | Base H2 existante | Données migrées | Moyenne |

### 3.2 Module de Gestion des Patients

#### 3.2.1 Tests CRUD Patients
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| PAT-001 | Ajout nouveau patient | Nom, prénom, date naiss. | Patient créé dans BD | Élevée |
| PAT-002 | Recherche patient existant | Nom ou prénom | Patient trouvé et affiché | Élevée |
| PAT-003 | Modification patient | Nouvelles informations | Données mises à jour | Moyenne |
| PAT-004 | Suppression patient | Patient sélectionné | Patient supprimé + confirmation | Moyenne |
| PAT-005 | Validation données | Données invalides | Messages d'erreur appropriés | Moyenne |

#### 3.2.2 Tests d'Organisation des Dossiers
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| DIR-001 | Création répertoire patient | Nouveau patient | Dossier créé dans workspace | Élevée |
| DIR-002 | Structure hiérarchique | Patient avec examens | Arborescence correcte | Élevée |
| DIR-003 | Suppression répertoire | Suppression patient | Dossier supprimé + confirmation | Moyenne |

### 3.3 Module de Gestion des Images

#### 3.3.1 Tests d'Import et Affichage
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| IMG-001 | Import images JPG | Fichiers JPG valides | Images importées et affichées | Élevée |
| IMG-002 | Import images PNG | Fichiers PNG valides | Images importées et affichées | Élevée |
| IMG-003 | Import formats non supportés | Fichiers PDF, DOC | Messages d'erreur | Moyenne |
| IMG-004 | Génération miniatures | Images haute résolution | Miniatures créées | Élevée |
| IMG-005 | Affichage plein écran | Sélection image | Visualiseur ouvert | Moyenne |

#### 3.3.2 Tests de Traitement d'Images
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| PROC-001 | Égalisation histogramme | Image normale | Contraste amélioré | Élevée |
| PROC-002 | Modification RVB | Ajustements couleurs | Prévisualisation temps réel | Élevée |
| PROC-003 | Sauvegarde modifications | Image modifiée | Copie sauvegardée | Élevée |
| PROC-004 | Annulation modifications | Bouton Reset | Image originale restaurée | Moyenne |
| PROC-005 | Zoom et navigation | Actions souris | Zoom fonctionnel | Moyenne |

### 3.4 Module d'Angiographie Fluorescéine

#### 3.4.1 Tests de Séquences Temporelles
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| ANGIO-001 | Démarrage séquence | Injection fluorescéine | Chronométrage activé | Élevée |
| ANGIO-002 | Capture séquentielle | Intervalles définis | Images horodatées | Élevée |
| ANGIO-003 | Arrêt séquence | Fin d'examen | Séquence sauvegardée | Élevée |
| ANGIO-004 | Synchronisation timing | Injection + capture | Timing précis respecté | Élevée |

### 3.5 Module de Génération PDF

#### 3.5.1 Tests de Configuration PDF
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| PDF-001 | Configuration A4 Portrait | Format A4, orientation portrait | PDF correctement formaté | Élevée |
| PDF-002 | Configuration A4 Paysage | Format A4, orientation paysage | PDF correctement formaté | Élevée |
| PDF-003 | Nombre photos par ligne | 3 photos par ligne | Mise en page respectée | Élevée |
| PDF-004 | Ajustement marges | Marges personnalisées | Espacement correct | Moyenne |
| PDF-005 | Informations patient | Données patient | En-tête PDF correct | Élevée |

#### 3.5.2 Tests d'Impression et Export
| ID Test | Description | Données d'entrée | Résultat attendu | Priorité |
|---------|-------------|------------------|------------------|----------|
| PRINT-001 | Aperçu PDF | PDF généré | Prévisualisation correcte | Élevée |
| PRINT-002 | Impression directe | Imprimante configurée | Document imprimé | Moyenne |
| PRINT-003 | Export PDF | Chemin de sauvegarde | Fichier PDF sauvegardé | Élevée |

## 4. TESTS NON-FONCTIONNELS

### 4.1 Tests de Performance

#### 4.1.1 Tests de Charge
| ID Test | Description | Charge | Critère de succès | Priorité |
|---------|-------------|--------|-------------------|----------|
| PERF-001 | Chargement 100 images | 100 images 5MB | < 10 secondes | Élevée |
| PERF-002 | Génération PDF 50 photos | 50 photos HD | < 30 secondes | Élevée |
| PERF-003 | Recherche dans 1000 patients | 1000 patients | < 2 secondes | Moyenne |
| PERF-004 | Modification temps réel | Ajustement RVB | < 100ms réactivité | Élevée |

#### 4.1.2 Tests de Mémoire
| ID Test | Description | Condition | Critère de succès | Priorité |
|---------|-------------|-----------|-------------------|----------|
| MEM-001 | Utilisation mémoire normale | Usage standard | < 1GB RAM | Moyenne |
| MEM-002 | Fuites mémoire | Session longue | Pas d'augmentation continue | Élevée |
| MEM-003 | Libération ressources | Fermeture images | Mémoire libérée | Moyenne |

### 4.2 Tests de Sécurité

#### 4.2.1 Tests d'Authentification
| ID Test | Description | Attaque simulée | Résultat attendu | Priorité |
|---------|-------------|-----------------|------------------|----------|
| SEC-001 | Tentatives brute force | 100 tentatives login | Blocage temporaire | Élevée |
| SEC-002 | Injection SQL | Requêtes malicieuses | Requêtes bloquées | Élevée |
| SEC-003 | Chiffrement config | Lecture fichier config | Données chiffrées | Élevée |

#### 4.2.2 Tests de Confidentialité
| ID Test | Description | Condition | Résultat attendu | Priorité |
|---------|-------------|-----------|------------------|----------|
| CONF-001 | Accès données patients | Utilisateur non autorisé | Accès refusé | Élevée |
| CONF-002 | Sauvegarde sécurisée | Export données | Données anonymisées | Moyenne |

### 4.3 Tests de Compatibilité

#### 4.3.1 Tests Système d'Exploitation
| ID Test | Description | Environnement | Critère de succès | Priorité |
|---------|-------------|---------------|-------------------|----------|
| COMPAT-001 | Windows 10 | Windows 10 Pro | Application fonctionnelle | Élevée |
| COMPAT-002 | Windows 11 | Windows 11 | Application fonctionnelle | Élevée |
| COMPAT-003 | Ubuntu 20.04 | Linux Ubuntu | Application fonctionnelle | Moyenne |

#### 4.3.2 Tests Matériels
| ID Test | Description | Configuration | Critère de succès | Priorité |
|---------|-------------|---------------|-------------------|----------|
| HW-001 | Configuration minimale | 4GB RAM, CPU 2GHz | Application utilisable | Élevée |
| HW-002 | Configuration recommandée | 8GB RAM, CPU 3GHz | Performance optimale | Moyenne |
| HW-003 | Topcon TRC-50DX | Angiographe réel | Compatibilité complète | Élevée |

## 5. PROCÉDURES DE TEST

### 5.1 Tests Unitaires (JUnit)
```java
// Exemple de test unitaire
@Test
public void testPersonCreation() {
    Person person = new Person("Doe", "John", new Date());
    assertNotNull(person);
    assertEquals("Doe", person.getNom());
    assertEquals("John", person.getPrenom());
}

@Test
public void testImageProcessing() {
    BufferedImage image = createTestImage();
    BufferedImage processed = HistogramEQBtn.computeHistogramEQ(image);
    assertNotNull(processed);
    assertEquals(image.getWidth(), processed.getWidth());
}
```

### 5.2 Tests d'Intégration
```java
@Test
public void testPatientWorkflow() {
    // 1. Créer patient
    Person patient = new Person("Test", "Patient", new Date());
    PersonDAO dao = new PersonDAO();
    patient = dao.saveOrUpdatePerson(patient);
    
    // 2. Créer répertoire
    String directory = DirectoryManager.getPersonWorkspaceDirectory(patient);
    assertTrue(new File(directory).exists());
    
    // 3. Ajouter photos
    // 4. Générer PDF
    // 5. Vérifier résultat
}
```

### 5.3 Tests d'Interface Utilisateur
```java
// Tests avec AssertJ Swing ou similaire
@Test
public void testLoginForm() {
    window.textBox("usernameField").enterText("admin");
    window.textBox("passwordField").enterText("password");
    window.button("loginButton").click();
    
    // Vérifier redirection vers application principale
    window.requireVisible();
}
```

## 6. AUTOMATISATION DES TESTS

### 6.1 Configuration Maven
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>
    </configuration>
</plugin>
```

### 6.2 Tests d'Intégration Continue
```yaml
# Exemple pipeline CI/CD
stages:
  - test-unit
  - test-integration
  - test-ui
  - test-performance
  - deploy

test-unit:
  script:
    - mvn test
  coverage: '/Total.*?([0-9]{1,3})%/'
```

### 6.3 Rapports de Test
- **Couverture de code** : JaCoCo > 80%
- **Rapports HTML** : Surefire reports
- **Métriques qualité** : SonarQube integration

## 7. TESTS SPÉCIFIQUES ANGIOGRAPHIE

### 7.1 Tests Workflow Clinique
| ID Test | Description | Étapes | Résultat attendu | Priorité |
|---------|-------------|--------|------------------|----------|
| CLINIC-001 | Examen complet | Preparation → Injection → Capture → Rapport | Workflow complet | Élevée |
| CLINIC-002 | Phases angiographiques | Précoce → Intermédiaire → Tardive | Séquences distinctes | Élevée |
| CLINIC-003 | Qualité images | Acquisition haute résolution | Images diagnostiques | Élevée |

### 7.2 Tests Timing Fluorescéine
| ID Test | Description | Timing | Résultat attendu | Priorité |
|---------|-------------|--------|------------------|----------|
| TIME-001 | Phase précoce | 0-30 secondes | Capture automatique | Élevée |
| TIME-002 | Phase intermédiaire | 30-120 secondes | Capture continue | Élevée |
| TIME-003 | Phase tardive | 120-600 secondes | Capture sélective | Moyenne |

## 8. GESTION DES DÉFAUTS

### 8.1 Classification des Défauts
- **Critique** : Blocage complet de l'application
- **Majeur** : Fonctionnalité principale indisponible
- **Mineur** : Problème d'ergonomie ou performance
- **Trivial** : Amélioration cosmétique

### 8.2 Processus de Correction
1. **Identification** : Documentation détaillée du défaut
2. **Reproduction** : Cas de test reproduisant le problème
3. **Correction** : Développement du correctif
4. **Test de régression** : Validation de la correction
5. **Livraison** : Intégration en version stable

## 9. MÉTRIQUES ET INDICATEURS

### 9.1 Métriques de Qualité
- **Taux de réussite des tests** : > 98%
- **Couverture de code** : > 80%
- **Nombre de défauts critiques** : 0
- **Temps moyen de correction** : < 2 jours

### 9.2 Métriques de Performance
- **Temps de démarrage** : < 5 secondes
- **Chargement image** : < 1 seconde
- **Génération PDF** : < 30 secondes
- **Consommation mémoire** : < 1GB

## 10. VALIDATION ET RECETTE

### 10.1 Tests d'Acceptation Utilisateur
- **Tests avec praticiens** : Validation workflow clinique
- **Tests ergonomie** : Interface intuitive
- **Tests formation** : Facilité d'apprentissage

### 10.2 Validation Réglementaire
- **Conformité médicale** : Standards ISO 14155
- **Protection données** : RGPD compliance
- **Archivage** : Durée de conservation légale

### 10.3 Critères de Livraison
- [ ] 100% tests fonctionnels validés
- [ ] Performance conforme aux exigences
- [ ] Sécurité validée par audit
- [ ] Documentation utilisateur complète
- [ ] Formation équipe réalisée
- [ ] Validation utilisateur finale

Ce plan de test garantit la qualité, la fiabilité et la conformité du logiciel d'angiographie pour un usage médical professionnel.