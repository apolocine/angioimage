package org.hmd.angio.exception;
public class PhotoLoadException extends Exception {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public PhotoLoadException(String message) {
        super(message);
    }

    public PhotoLoadException(String message, Throwable cause) {
        super(message, cause);
    }
}
