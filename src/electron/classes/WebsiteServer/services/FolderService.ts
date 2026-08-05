import type { GetFolderResponse } from "@digital-projector/shared";
import type { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";

export class FolderService {

    constructor(
        private folders: MultiFoldersManager
    ) {
        
    }

    getFolder(id:number) {
        return this.folders.getFolders().get(id);
    }
}