import type { Socket } from "socket.io";
import { SocketAuthenticator } from "./SocketAuthenticator.js";
import type { ViewerSocketHandler } from "./ViewerSocketHandler.js";
import type { AdminSocketHandler } from "./AdminSocketHandler.js";

export class SocketConnectionHandler {

    constructor(
        private adminHandler: AdminSocketHandler,
        private viewerHandler: ViewerSocketHandler,
        private auth: SocketAuthenticator = new SocketAuthenticator(),
    ) {}

    handle(socket:Socket) {
        const role = this.auth.authenticate(socket);

        if (!role) {
            socket.disconnect(true);
            return;
        }
        
        switch (role) {
            case 'admin':
                this.adminHandler.register(socket)
                break;

            case 'viewer':
                this.viewerHandler.register(socket);
                break;
        
            default:
                break;
        }
    }
}