import { BrowserWindow } from "electron";
import { createFire } from "./fireEvent.js";
import { WebsiteServer } from "../classes/WebsiteServer/WebsiteServer.js";


export const handleEvents = (
    websiteServer: WebsiteServer,
    {webContents}:BrowserWindow
) => {

    const fire = createFire(webContents);

    websiteServer.events.on('started', ()=>{
        fire('rc-server-started', websiteServer.url!);
    });

    websiteServer.events.on('stopped', ()=>{
        fire('rc-server-stopped');
    });
}