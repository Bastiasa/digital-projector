import type { Socket } from "socket.io";
import { SocketHandler } from "./SocketHandler.js";
import { createLogger } from "../../../utils/logger.js";


const {
    logInfo
} = createLogger("App/WebsiteServer/AdminSocketHandler");

export class AdminSocketHandler extends SocketHandler{

    register(socket:Socket) {

        socket.join('admins');
        
        socket.on('update', data => {
            this.mediaSync.update(socket, data);
            logInfo(`Update from ${socket.id} [${Object.keys(data).length} properties]`);
        });

        socket.on('next', ()=>{
            this.mediaSync.next();
            logInfo(`Next from admin #${socket.id} received`);
        });
        
       socket.on('prev', ()=>{
            this.mediaSync.prev();
            logInfo(`Previous from admin #${socket.id} received`);
        });
    }
}