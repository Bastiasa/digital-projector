import type { Socket } from "socket.io";
import { SocketHandler } from "./SocketHandler.js";

export class ViewerSocketHandler extends SocketHandler {

    public register(socket: Socket): void {
        socket.join("viewers");

        socket.on(
            "update",
            (data)=>{
                this.mediaSync.updateFromViewer(socket, data);
            }
        );
        
    }
}