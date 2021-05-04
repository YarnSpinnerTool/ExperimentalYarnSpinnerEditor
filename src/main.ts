let fs = require("fs");
let { app, BrowserWindow } = require("electron");
let path = require("path");

/**
 * Creates the main window. This is a change.
 * 
 * @returns {null} No return
 */

var contents = fs.readFileSync(path.join(__dirname, "/Test.txt")).toString();
console.log(contents);
function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
	    height: 540,
	    width: 960,
        minHeight: 480,
        minWidth: 480,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			
		}	
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