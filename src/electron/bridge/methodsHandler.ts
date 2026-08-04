import { BrowserWindow, shell } from "electron";
import { handleMethod } from "./handleMethod.js"
import { DataManager } from "../singletons/dataManager.js";
import { WebsiteServer } from "../classes/WebsiteServer/WebsiteServer.js";
import { MultiFoldersManager } from "../classes/MultimediaFoldersManager/MultimediaFoldersManager.js";

export const handleBridgeMethods = (
    websiteServer: WebsiteServer,
    folders:MultiFoldersManager,
    window: BrowserWindow
) => {





    handleMethod('runRcServer', () => {
        websiteServer.run();
    });

    handleMethod('stopRcServer', () => {
        websiteServer.stop();
    });

    handleMethod('shellOpen', (url) => {
        shell.openExternal(url);
    });

    handleMethod('pickMultimediaFolder', () => {
        return folders.pickFolder(window);
    });

    handleMethod('deleteMultimediaFolder', (id) => {
        folders.removeFolder(id);
    });

    handleMethod('fetchMultimediaFolders', async () => {
        return folders.getFolders();
    });

    handleMethod('setFields', (fields) => {
        DataManager.store(fields);
    });

    handleMethod('getData', (value, dflt) => {
        return DataManager.get(value, dflt);
    });

    handleMethod('getServerState', async ()=>{
        return {
            state: websiteServer.getIsRunning(),
            url: websiteServer.url
        };
    });
}   