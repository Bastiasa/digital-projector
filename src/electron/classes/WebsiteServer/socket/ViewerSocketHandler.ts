import type { Socket } from "socket.io";
import { SocketHandler } from "./SocketHandler.js";
import { createLogger } from "../../../utils/logger.js";


const {
    logInfo
} = createLogger("App/WebsiteServer/AdminSocketHandler");


export class ViewerSocketHandler extends SocketHandler {

    public register(socket: Socket): void {
        socket.join("viewers");

        socket.on(
            "update",
            (data)=>{
                this.mediaSync.updateFromViewer(socket, data);
                logInfo(`Update from viewer ${socket.id} received.`);
            }
        );
        
    }
}