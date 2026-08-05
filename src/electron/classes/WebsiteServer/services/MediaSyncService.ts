import type { Server, Socket } from "socket.io";
import type { MediaStatePlayback } from "../../MediaStatePlayback/MediaStatePlayback.js";
import type { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";
import type { UpdatePlaybackData } from "@digital-projector/shared";

export class MediaSyncService {


    constructor(
        private io: Server,
        private folders: MultiFoldersManager,
        private mediaState: MediaStatePlayback 
    ) {
        
    }

    updateFromViewer(socket:Socket, data:{currentTime?:number, pause?:boolean}) {

        this.mediaState.update({
            currentTime: data.currentTime,
            pause: data.pause
        });

        this.io.in("admins").emit('update', {
            currentTime: data.currentTime,
            pause: data.pause
        });
    }

    update(socket:Socket, data:UpdatePlaybackData) {
        this.mediaState.update(data);
        socket.broadcast.emit('update', data);
            
    }

    prev() {
        const currentId = this.mediaState.getData().currentFileId;
        const prev = this.folders.getPreviousIdFileFrom(currentId);

        if (!prev) {
            return;
        }

        this.mediaState.update({
            currentFileId: prev.id,
            currentTime: 0,
            pause: false
        });

        this.io.emit(
            'update',
            this.mediaState.toObject()
        );
    }

    next() {
        const currentId = this.mediaState.getData().currentFileId;
        const next = this.folders.getNextIdFileFrom(currentId);

        if (!next) {
            return;
        }

        this.mediaState.update({
            currentFileId: next.id,
            currentTime: 0,
            pause: false
        });

        this.io.emit(
            'update',
            this.mediaState.toObject()
        );
    }
}