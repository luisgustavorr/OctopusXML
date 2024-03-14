const {ipcMain,contextBridge,ipcRenderer} = require("electron")

let indexBridge = {
    update: (callback) => ipcRenderer.on('update',callback),
    changePercentDisplay: (callback) => ipcRenderer.on('changePercentDisplay',callback),

    renderToMainOneWay: (arg) => ipcRenderer.send('renderToMainOneWay',arg),

    restartServer: (port) => ipcRenderer.sendSync('restartServer',port),
    checkPort: (port) => ipcRenderer.invoke('checkPort',port)


}

contextBridge.exposeInMainWorld("indexBridge",indexBridge)
