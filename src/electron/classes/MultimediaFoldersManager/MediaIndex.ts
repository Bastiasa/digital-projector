import { join } from "path";
import type { FolderFile } from "./MultimediaFoldersManager.js";

type IndexedFile = {
    folderId: number;
    fileName:string;
}

export class MediaIndex {

    private ids = new Map<string, IndexedFile>();
    


    addFile({id, folderId, fileName}:FolderFile) {
        this.ids.set(id, {
            folderId,
            fileName
        });
    }

    addFiles(files:FolderFile[]) {
        for (const file of files) {
            this.addFile(file);
        }
    }

    removeFolder(folderId:number) {

        for (const [id, indexFile] of Array.from(this.ids.entries())) {
            if (indexFile.folderId == folderId) {
                this.ids.delete(id);
            }
        }
    }

    private entries() {
        return Array.from(this.ids.entries());
    }
    private getIndex(id:string) {
        return this
            .entries()
            .findIndex(([key]) => key === id);
    }

    getNextId(id:string) {
        const index = this.getIndex(id);
        
        if (index < 0) {
            return;
        }

        const nextIndex = index+1;

        if (nextIndex >= this.ids.size) {
            return this.entries()[0]?.[0];
        }

        return this.entries()[nextIndex][0];
    }

    getPreviousId(id:string) {
        const index = this.getIndex(id);
        
        if (index < 0) {
            return;
        }

        const prevIndex = index-1;

        if (prevIndex < 0) {
            return this.entries().pop()?.[0];
        }

        return this.entries()[prevIndex][0];
    }

    getFilePath(fileId:string, foldersMap:Map<number, string>) {
        const file = this.ids.get(fileId);

        if (!file) {
            return;
        }

        const folderPath = foldersMap.get(file.folderId);

        if (!folderPath) {
            return;
        }

        return join(
            folderPath,
            file.fileName
        );
    }

}