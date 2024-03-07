const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const { updateElectronApp } = require('update-electron-app')
const startServer = require('./server');
const AutoLaunch = require('auto-launch');
const dotenv = require('dotenv');
dotenv.config();

// parse application/json
let tray = null;
let mainWindow = null;
function createWindow() {
updateElectronApp()

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + '/favicon_io/favicon.ico',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    tray = new Tray(path.join(__dirname, "favicon_io",'favicon.ico')); // Path to your tray icon
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Abrir', click: () => createWindow() },
        { label: 'Fechar ( parar impressão )', click: () => app.quit() }
    ]);
    tray.setToolTip('Octopus');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        createWindow()
    });
}

app.whenReady().then(() => {
    let autoLaunch = new AutoLaunch({
        name: 'octopusxml.exe',
        path: app.getPath('exe'),
      });
      autoLaunch.isEnabled().then((isEnabled) => {
        if (!isEnabled) autoLaunch.enable();
      });

    createWindow();
    createTray();

    startServer();

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {

    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
