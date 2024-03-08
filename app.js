const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require("electron-updater")
var tcpPortUsed = require('tcp-port-used');
const startServer = require('./app/modules/server');
const AutoLaunch = require('auto-launch');
const fs = require('fs');
const logStream = fs.createWriteStream("C:\\Users\\Public\\Documents\\OctopusXMLLogs\\logfile.txt", { flags: 'a' });

// Redireciona a saída do console para o arquivo
console.log = function (msg) {
    logStream.write(new Date().toString() + " - " + msg + '\n');
};
// parse application/json
let tray = null;
let mainWindow = null;
autoUpdater.checkForUpdatesAndNotify()
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Updated');

});
function createWindow() {


    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + './app/assets/images/favicon_io/favicon.ico',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    tray = new Tray(path.join(__dirname, "app", "assets", "images", "favicon_io", 'favicon.ico')); // Path to your tray icon
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
    tcpPortUsed.check(3000, '127.0.0.1')

        .then(function (inUse) {
            if (inUse) {
                console.log("parou")
                app.exit(0)
                return;
            } else {
                createWindow();
                mainWindow.webContents.send('alterarDOM', 'do something for me');

                createTray();

                startServer();
            }
        }, function (err) {
            console.error('Error on check:', err.message);
        });
    let autoLaunch = new AutoLaunch({
        name: 'octopusxml.exe',
        path: app.getPath('exe'),
    });

    autoLaunch.isEnabled().then((isEnabled) => {
        if (!isEnabled) autoLaunch.enable();
    });



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
