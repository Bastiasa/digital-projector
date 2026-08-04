import { BrowserWindow } from "electron";

export const fire = <EventName extends keyof BridgeEvents>(webContents: BrowserWindow["webContents"], eventName:EventName, ...args:BridgeEvents[EventName]) => {
    webContents.send(eventName, ...args);
}

export const createFire = (webContents: BrowserWindow["webContents"])=> {
    return <EventName extends keyof BridgeEvents>(eventName:EventName, ...args:BridgeEvents[EventName]) => fire(
        webContents,
        eventName,
        ...args
    );
}