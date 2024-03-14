const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require("electron-updater")
var tcpPortUsed = require('tcp-port-used');
const serverManager = require('./app/modules/server');
const Store = require('electron-store');
const AutoLaunch = require('auto-launch');
const fs = require('fs');
const { event } = require('jquery');
const logStream = fs.createWriteStream("C:\\Users\\Public\\Documents\\OctopusXMLLogs\\logfile.txt", { flags: 'a' });
const store = new Store();

let isDev = app.isPackaged
if (isDev) {
    console.log = function (msg) {
        logStream.write(new Date().toString() + " - " + msg + '\n');
    };
}
if (!store.has('PORT')) {
    store.set('PORT', 3000);
}
console.log(store.get("PORT"))
const gotTheLock = app.requestSingleInstanceLock()
let tray = null;
let mainWindow = null;
const appVersion = app.getVersion()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
        if (mainWindow === null) {
            createWindow();
            mainWindow.focus()

        }
    })
    // parse application/json
    const server = new serverManager()
    console.log(appVersion)

    autoUpdater.checkForUpdatesAndNotify()
    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
        console.log('Update available.');
        mainWindow.webContents.send('changePercentDisplay', "block")

    });

    autoUpdater.on('update-not-available', (info) => {
        console.log('Update not available.');
    });

    autoUpdater.on('error', (err) => {
        console.log('Error in auto-updater. ' + err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = 'Progresso Atualização :' + progressObj.percent + '%';
        if (mainWindow !== null) {
            mainWindow.webContents.send('update', log_message)
        }
        console.log(log_message);
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('Updated');
        mainWindow.webContents.send('changePercentDisplay', "none")


    });
    function createWindow() {


        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            icon: __dirname + './app/assets/images/favicon_io/favicon.ico',
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true
            }
        });

        mainWindow.loadURL('file://' + __dirname + '/index.html');


        //render to main 2-way

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
        tcpPortUsed.check(parseInt(server.getPort()), '127.0.0.1')

            .then(function (inUse) {
                if (inUse) {
                    console.log("parou")
                    createWindow();
                    mainWindow.webContents.send('alert', "Porta Ocupada, caso não seja o próprio Octopus XML Printer, altere a porta nas configurações do aplicativo.", "Mensagem do Sistema", "700px", 'fa fa-warning')
                    app.exit(0)
                    return;
                } else {
                    createWindow();

                    setTimeout(() => {
                        mainWindow.webContents.send("getVersion",appVersion)
                        ipcMain.on('renderToMainOneWay', (event, arg) => {
                            console.log("arg")
                            return arg
                        })
                    }, 500)

                    createTray();

                    server.startServer();
                }
            }, function (err) {
                console.error('Error on check:', err.message);
            });



    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {

        }
    });
    app.on("ready", () => {
        console.log("ready")
 
        ipcMain.handle('restartServer', async (event, arg) => {
            console.log(arg)
            server.setPort(arg)
            return "funcionou"
        })
        ipcMain.handle('checkPort', async (event, arg) => {
            try {
                let using = await tcpPortUsed.check(parseInt(arg), '127.0.0.1');
                console.log(using);
                return using;
            } catch (error) {
                console.error(error);
                return false;
            }
        })
        let autoLaunch = new AutoLaunch({
            name: 'octopusxml.exe',
            path: app.getPath('exe'),
        });

        autoLaunch.isEnabled().then((isEnabled) => {
            if (!isEnabled) autoLaunch.enable();
        });

    })
    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
}
