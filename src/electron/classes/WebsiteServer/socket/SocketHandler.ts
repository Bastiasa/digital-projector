import type { Socket } from "socket.io";
import type { MediaSyncService } from "../services/MediaSyncService.js";

export class SocketHandler {

    constructor(
        protected mediaSync: MediaSyncService
    ) {
        
    }

    public register(socket:Socket) {
        
    }
}