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
        const filePath = this.folders.getFilePath(fileId);

        if (!filePath) {
            return;
        }

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