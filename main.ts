import { app, BrowserWindow } from "electron";
import * as path from "path";

/**
 * Creates the main window. This is a change.
 * 
 * @returns {null} No return
 */
function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
	  height: 600,
	  webPreferences: {
		  preload: path.join(__dirname, "src/controllers/preload.js"),
        },
        width: 800,
    });
	
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../src/views/html/index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});