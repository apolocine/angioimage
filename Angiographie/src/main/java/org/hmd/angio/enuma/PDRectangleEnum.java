package org.hmd.angio.enuma;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

public enum PDRectangleEnum {

	  A1(PDRectangle.A1, "A1"),
	  A2(PDRectangle.A2, "A2"),
	  A3(PDRectangle.A4, "A3"),
	  A4(PDRectangle.A4, "A4"),
	  A5(PDRectangle.A4, "A5"), 
    LETTER(PDRectangle.LETTER, "Letter"),
    LEGAL(PDRectangle.LEGAL, "Legal");

    private final PDRectangle pdRectangle;
    private final String displayName;

    PDRectangleEnum(PDRectangle pdRectangle, String displayName) {
        this.pdRectangle = pdRectangle;
        this.displayName = displayName;
    }

    public PDRectangle getPDRectangle() {
        return pdRectangle;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
