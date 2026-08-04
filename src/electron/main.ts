import { app, BrowserWindow } from "electron";
import { Constants } from "./singletons/constants.js";
import path from "path";
import { handleBridgeMethods } from "./bridge/methodsHandler.js";
import { handleEvents } from "./bridge/eventsHandler.js";
import { MediaStatePlayback } from "./classes/MediaStatePlayback/MediaStatePlayback.js";
import { WebsiteServer } from "./classes/WebsiteServer/WebsiteServer.js";
import { MultiFoldersManager } from "./classes/MultimediaFoldersManager/MultimediaFoldersManager.js";
import { ApplicationSingleton } from "./singletons/application.js";


let mainWindow:BrowserWindow|null = null;

function initWindow(window:BrowserWindow) {
    if (Constants.IS_DEVELOPMENT) {
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
        window.setMenu(null);
    }

    ApplicationSingleton.init();

    handleBridgeMethods(
        ApplicationSingleton.websiteServer,
        ApplicationSingleton.foldersManager, 
        window
    );

    handleEvents(
        ApplicationSingleton.websiteServer, 
        window
    );
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 500,
        backgroundColor: "#000000",
        webPreferences: {
            webgl: false,
            devTools: Constants.IS_DEVELOPMENT,
            preload: Constants.PATHS.PRELOAD_FILE
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