import { createReadStream } from "fs";
import type { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";
import { lookup } from "mime-types";
import path from "path";
import { FoundFileType } from "../../MultimediaFoldersManager/FoldersManager.js";

export class FileStreamingService {


    constructor(
        private folders:MultiFoldersManager
    ) {
        
    }

    getFileStream(file?:FoundFileType) {
        
        if (!file) {
            return {};
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