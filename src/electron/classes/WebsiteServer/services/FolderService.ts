import type { GetFolderResponse } from "@digital-projector/shared";
import type { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";

export class FolderService {

    constructor(
        private folders: MultiFoldersManager
    ) {
        
    }

    getFolder(id:number) {
        const files = this.folders.getFolderFiles(id);
        const path = this.folders.getFolders().get(id);

        if (!files || !path) {
            return null;
        }


        return {
            id,
            path, 
            files
        } satisfies GetFolderResponse['data'];
    }
}