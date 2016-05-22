const electron = require('electron');
const {app, BrowserWindow} = electron;

let mainWindow;

let createMainWindow = function() {
	mainWindow = new BrowserWindow({
		width: 800, height: 600,
		minWidth: 200, minHeight: 100,
		backgroundColor: '#efefef',
		title: 'Markdown Preview'
	});
	mainWindow.loadURL(`file://${__dirname}/index.html`);
	// Emitted when the mainWindowdow is closed.
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
};

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow();
	}
});