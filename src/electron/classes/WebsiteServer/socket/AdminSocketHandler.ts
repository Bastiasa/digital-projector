import type { Socket } from "socket.io";
import { SocketHandler } from "./SocketHandler.js";

export class AdminSocketHandler extends SocketHandler{

    register(socket:Socket) {

        socket.join('admins');
        
        socket.on('update', data => {
            this.mediaSync.update(socket, data);
        });

        socket.on('next', this.mediaSync.next.bind(this.mediaSync));
        socket.on('prev', this.mediaSync.prev.bind(this.mediaSync));
    }
}