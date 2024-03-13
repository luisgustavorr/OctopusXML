const {ipcMain,contextBridge,ipcRenderer} = require("electron")

let indexBridge = {
    update: (callback) => ipcRenderer.on('update',callback),
    changePercentDisplay: (callback) => ipcRenderer.on('changePercentDisplay',callback),

    renderToMainOneWay: (arg) => ipcRenderer.send('renderToMainOneWay',arg),

    openFile: () => ipcRenderer.invoke('sendInfo')

}
ipcRenderer.send('renderToMainOneWay',"arg")
contextBridge.exposeInMainWorld("indexBridge",indexBridge)
