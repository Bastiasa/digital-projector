const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const os = require('os');
const { open } = require('openurl');
const { exec, ChildProcess } = require('child_process');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) {

                if (!alias.address.endsWith('.1')) {  
                    return alias.address;
                }
            }
        }
    }
    return '127.0.0.1'; // Default to localhost if no IP found
}

/**@type {BrowserWindow?} */
var mainWindow = null;

/**@type {ChildProcess?} */
var localServerWorker = null;
var localServerStatus = 'stopped';

const settingsTemplate = {
    folders: [],
    port:6677
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 600,
        maxHeight: 650,
        maxWidth: 650,
        minHeight: 400,
        minWidth: 400,
        autoHideMenuBar:true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: false,
            webgl:false
        }
    });

    mainWindow.loadFile("assets/application/index.html");

    mainWindow.on('close', () => {
        if (localServerWorker != null) {
            localServerWorker.stdin.write('close');
        }
        mainWindow = null;
    });
}

function relativePath(source) {
    return path.resolve(source)
}

function getResourcePath(relative) {
    let resourcesFolder = path.resolve("resources")

    if (!fs.existsSync(resourcesFolder)) {
        resourcesFolder = path.resolve(".");
    }

    return path.join(resourcesFolder, relative);
    
}

function getSettings() {
    const settingsFilePath = relativePath('settings.json');
    if (fs.existsSync(settingsFilePath)) {
        const fileContents = fs.readFileSync(settingsFilePath, {encoding:'utf-8'});
        return JSON.parse(fileContents.toString());
    } else {
        const newFileContents = JSON.stringify(settingsTemplate);
        fs.writeFileSync(settingsFilePath, newFileContents, {'encoding':'utf-8'});
        return JSON.parse(newFileContents);
    }
}

function saveSettings(newSettings) {
    if (typeof newSettings == "object") {
        newSettings = JSON.stringify(newSettings);
    }
    
    const settingsFilePath = relativePath('settings.json');

    fs.writeFileSync(settingsFilePath, newSettings.toString(), {encoding:'utf-8'});
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow == null) {
        createWindow();
   } 
});

var qrCodeData = null;

ipcMain.on('server-switch', (event, data) => {
    if (localServerStatus == 'stopping') {
        return;
    }

    if (localServerWorker == null) {
        const command = `"${getResourcePath("servers.exe")}"`;
        
        // dialog.showMessageBoxSync(mainWindow, { "title": "Comando para ejecutar", "message": command, "type": "info" });
        
        localServerWorker = exec(
            command,
            (err) => {
                if (err) {
                    exec(`powershell -ExecutionPolicy Bypass -File "${relativePath("stop_servers.ps1")}"`, (err) => { if(err){console.log(err);}
                    });
                    console.log("Error al iniciar servidores, intentando cerrarlos en PowerShell.", err.message);
                }

                
        });
        
        console.log(`Ejecutando comando: ${command}`);
        
        localServerWorker.on('exit', (exitCode) => {
            localServerWorker = null;

            console.log("Se ha detenido el servidor local.");

            if (mainWindow) {
                mainWindow.webContents.send('get-server-status', 'stopped');
                localServerStatus = 'stopped';
            }

            qrCodeData = null;
        });

        const ip = getLocalIP();
        const port = getSettings()['port'];
    
        QRCode.toBuffer(`http://${ip}:${port}/admin`, {
            "color": {
                "dark": "#FFFFFF",
                "light": "#2e2e2e"
            },
            "width": 1000,
            errorCorrectionLevel: "L",
            "type": "png"
        })
            .then(dataUrl => qrCodeData = dataUrl)
            .catch(err=>qrCodeData = null);

        mainWindow.webContents.send('get-server-status', 'started');
        localServerStatus = 'started';
    } else {
        closingLocalServer = true;

        mainWindow.webContents.send('get-server-status', 'stopping');

        localServerStatus = 'stopping';
        localServerWorker.stdin.write("close");
    }
});

function propertyCallback(name, returner) {
    ipcMain.on(name, () => {
        mainWindow.webContents.send(name, returner());
    })
}

propertyCallback('get-server-status', ()=>localServerStatus);
propertyCallback('get-server-port', () => getSettings().port);
propertyCallback('get-settings', () => getSettings());

propertyCallback('get-qr-data', () => qrCodeData);

ipcMain.on('set-settings', (event, newSettings) => saveSettings(newSettings));
ipcMain.on('query-folders', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory", "multiSelections"]
    });

    mainWindow.webContents.send('query-folders-completed', result.filePaths);
});

ipcMain.on("open-link", (event, link) => {
    open(link);
});
