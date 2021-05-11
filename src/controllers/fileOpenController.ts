const BrowserWindow = require('electron').BrowserWindow;
const dialog = require('electron').dialog;
const path = require('path');
const fs = require('fs');

function openFile() {
	var currentFocused = BrowserWindow.getFocusedWindow()

	if (currentFocused) {
		const openFileResult = dialog.showOpenDialog(
			currentFocused,
			{
				filters: [{ name: "Text file", extensions: ["txt", "yarn"] }],
				properties: ["openFile", "createDirectory"],
				defaultPath: path.join(__dirname, "/Test.txt")	//!change before release!
			});

		openFileResult.then(result => {
			const contents = fs.readFileSync(result.filePaths[0]).toString();
			return contents
		});
	}
}

export = openFile;