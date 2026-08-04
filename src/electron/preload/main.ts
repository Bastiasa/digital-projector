import EventEmitter from "./eventEmitter.js";
import { invoke } from "./invoke.js";
import { contextBridge, ipcRenderer } from "electron";


const applicationBridge = {
    runRcServer() {
        return invoke('runRcServer');
    },
    stopRcServer() {
        return invoke('stopRcServer');
    },

    shellOpen(url) {
        return invoke('shellOpen', url);
    },

    pickMultimediaFolder() {
        return invoke('pickMultimediaFolder');
    },
    fetchMultimediaFolders() {
        return invoke('fetchMultimediaFolders');
    },
    deleteMultimediaFolder(id) {
        return invoke('deleteMultimediaFolder', id);
    },
    setFields(fields) {
        return invoke('setFields', fields);
    },

    getData(value, dflt) {
        return invoke('getData', value, dflt);
    },

    getServerState() {
        return invoke('getServerState');
    },
} satisfies ApplicationBridge;

const events = {
    subscribe(eventName, callback: (...args:any[]) => void) {
        const listener:(event: Electron.IpcRendererEvent, ...args:any[])=>void = (_event, ...args) => {
            callback(...args);
        };

        ipcRenderer.on(eventName, listener);

        return () => {
            ipcRenderer.off(eventName, listener);
        }
    }
} satisfies Window["events"];
contextBridge.exposeInMainWorld('app', applicationBridge);

contextBridge.exposeInMainWorld('events', events);