package org.hmd.angio.conf;
import java.awt.Frame;
import java.awt.GridLayout;
import java.util.Properties;

import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JSlider;
import javax.swing.JSpinner;
import javax.swing.JTextField;
import javax.swing.SpinnerNumberModel;

import org.hmd.angio.enuma.PDRectangleEnum;

public class PrintPageModelEntryUI extends JDialog {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private JTextField modelNameField;
    private JComboBox<String> orientationComboBox;
    private JSpinner photosPerLineSpinner, photoWidthSpinner, pageCountSpinner;
    private JSlider xMarginSlider, yMarginSlider, sideMarginSlider;
    private JComboBox<PDRectangleEnum> pageFormatComboBox;
    private JButton saveButton, cancelButton;
    private Properties modelProperties;
    private String selectedModel;

    public PrintPageModelEntryUI(Frame parent, String model, Properties properties) {
        super(parent, "Modifier Modèle : " + model, true); // Modal
        this.modelProperties = properties;
        this.selectedModel = model;
        
        initUI();
        loadModelData();
    }

    private void initUI() {
        setLayout(new GridLayout(10, 2, 10, 10));
        setSize(400, 400);
        setLocationRelativeTo(getParent());

        modelNameField = new JTextField(selectedModel);
        orientationComboBox = new JComboBox<>(new String[]{"Portrait", "Paysage"});
        photosPerLineSpinner = new JSpinner(new SpinnerNumberModel(1, 1, 10, 1));
        photoWidthSpinner = new JSpinner(new SpinnerNumberModel(100, 50, 300, 10));
        pageCountSpinner = new JSpinner(new SpinnerNumberModel(1, 1, 20, 1));
        pageFormatComboBox = new JComboBox<>(PDRectangleEnum.values());
        xMarginSlider = new JSlider(0, 50, 10);
        yMarginSlider = new JSlider(0, 50, 10);
        sideMarginSlider = new JSlider(0, 50, 10);
        
        saveButton = new JButton("Enregistrer");
        cancelButton = new JButton("Annuler");

        add(new JLabel("Nom du modèle :"));
        add(modelNameField);
        add(new JLabel("Orientation :"));
        add(orientationComboBox);
        add(new JLabel("Photos par ligne :"));
        add(photosPerLineSpinner);
        add(new JLabel("Largeur photo :"));
        add(photoWidthSpinner);
        add(new JLabel("Format page :"));
        add(pageFormatComboBox);
        add(new JLabel("Marges X :"));
        add(xMarginSlider);
        add(new JLabel("Marges Y :"));
        add(yMarginSlider);
        add(new JLabel("Marges latérales :"));
        add(sideMarginSlider);
        add(new JLabel("Nombre de pages :"));
        add(pageCountSpinner);
        add(saveButton);
        add(cancelButton);

        saveButton.addActionListener(e -> saveModel());
        cancelButton.addActionListener(e -> dispose());
    }

    private void loadModelData() {
        modelNameField.setText(selectedModel);
        orientationComboBox.setSelectedItem(modelProperties.getProperty(selectedModel + ".orientation"));
        photosPerLineSpinner.setValue(Integer.parseInt(modelProperties.getProperty(selectedModel + ".photosPerLine", "1")));
        photoWidthSpinner.setValue(Integer.parseInt(modelProperties.getProperty(selectedModel + ".photoWidth", "100")));
        pageFormatComboBox.setSelectedItem(PDRectangleEnum.valueOf(modelProperties.getProperty(selectedModel + ".pageFormat", "A4")));
        xMarginSlider.setValue(Integer.parseInt(modelProperties.getProperty(selectedModel + ".xMargin", "10")));
        yMarginSlider.setValue(Integer.parseInt(modelProperties.getProperty(selectedModel + ".yMargin", "10")));
        sideMarginSlider.setValue(Integer.parseInt(modelProperties.getProperty(selectedModel + ".sideMargin", "10")));
        pageCountSpinner.setValue(Integer.parseInt(modelProperties.getProperty(selectedModel + ".pageCount", "1")));
    }

    private void saveModel() {
        String newName = modelNameField.getText().trim();
        if (newName.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Le nom du modèle ne peut pas être vide.");
            return;
        }

        // Mise à jour des propriétés
        modelProperties.setProperty(newName + ".orientation", (String) orientationComboBox.getSelectedItem());
        modelProperties.setProperty(newName + ".photosPerLine", photosPerLineSpinner.getValue().toString());
        modelProperties.setProperty(newName + ".photoWidth", photoWidthSpinner.getValue().toString());
        modelProperties.setProperty(newName + ".pageFormat", ((PDRectangleEnum) pageFormatComboBox.getSelectedItem()).name());
        modelProperties.setProperty(newName + ".xMargin", String.valueOf(xMarginSlider.getValue()));
        modelProperties.setProperty(newName + ".yMargin", String.valueOf(yMarginSlider.getValue()));
        modelProperties.setProperty(newName + ".sideMargin", String.valueOf(sideMarginSlider.getValue()));
        modelProperties.setProperty(newName + ".pageCount", pageCountSpinner.getValue().toString());

        JOptionPane.showMessageDialog(this, "Modèle '" + newName + "' enregistré avec succès !");
        dispose();  // Ferme la fenêtre modale après l'enregistrement
    }
}
