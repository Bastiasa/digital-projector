import { createReadStream } from "fs";
import type { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";
import { lookup } from "mime-types";
import path from "path";

export class FileStreamingService {


    constructor(
        private folders:MultiFoldersManager
    ) {
        
    }

    getFile(fileId:string,) {
        const file = this.folders.getFilePath(fileId);

        if (!file) {
            return;
        }

        const filePath = file.getPath();

        return {
            stream: 
                createReadStream(filePath),
            mimeType:
                lookup(filePath),
            fileName:
                path.basename(filePath)        
        };
    }
}