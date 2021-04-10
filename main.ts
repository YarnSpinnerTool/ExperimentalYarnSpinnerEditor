import { app, BrowserWindow } from "electron";
import * as path from "path";

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
	  height: 600,
	  webPreferences: {
		  preload: path.join(__dirname, "src/ts/preload.js"),
		},
		width: 800,
	});
	
	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "../src/html/index.html"));
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