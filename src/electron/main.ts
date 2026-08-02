import { app, BrowserWindow } from "electron";
import { IS_DEVELOPMENT } from "./utils/constants.js";
import path from "path";


let mainWindow:BrowserWindow|null = null;

function initWindow(window:BrowserWindow) {
    if (IS_DEVELOPMENT) {
        window.loadURL('http://localhost:5173/');
    } else {
        const file = path.join(
            app.getAppPath(),
            'dist-ui',
            'index.html'
        );
        window.loadFile(
          file  
        );

        console.log(file);
        //window.setMenu(null);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 500,
        webPreferences: {
            webgl: false,
            devTools: !IS_DEVELOPMENT
        }
    });

    return mainWindow as BrowserWindow;
}


app.whenReady().then(()=> {
    const window = createWindow();
    initWindow(window);
});

app.on('window-all-closed', ()=>{
    if (process.platform == 'darwin') {
        return;
    }

    app.quit();
})