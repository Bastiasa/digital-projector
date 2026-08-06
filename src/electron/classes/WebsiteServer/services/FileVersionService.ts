import { stat } from "fs/promises";
import { FoundFileType } from "../../MultimediaFoldersManager/FoldersManager.js";
import { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";
import { makeSha256 } from "../../../utils/makeSha256.js";

export class FileVersionService {

    constructor(
        private folders: MultiFoldersManager
    ) {
        
    }

    async generateEtag(file:FoundFileType) {
        
        const {mtimeMs, size} = await stat(file.getPath());
        const etag = makeSha256(`${file.getPath()}~${mtimeMs}~${size}`);

        return etag;
        
    }
}