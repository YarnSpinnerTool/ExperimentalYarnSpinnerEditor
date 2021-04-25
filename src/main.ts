let { app, BrowserWindow } = require("electron");
let path = require("path");

/**
 * Creates the main window. This is a change.
 * 
 * @returns {null} No return
 */
function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
	    height: 1080,
	    width: 1920,
    });
	
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../src/index.html"));
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