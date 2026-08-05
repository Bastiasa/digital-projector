import { join } from "path";
import { DataManager } from "../../singletons/dataManager.js";
import { createLogger } from "../../utils/logger.js";
import { FileScanner } from "./FileScanner.js";


class FoundFile {

    constructor(
        public readonly folder: FolderContainer, 
        public readonly fileName:string,
        public readonly id:string
    ) {
        
    }

    getPath() {
        return join(
            this.folder.path,
            this.fileName
        );
    }
}

class FolderContainer {

    constructor(
        public readonly id: number,
        public readonly path:string,
        private readonly scanner: FileScanner
    ) {
        
    }

    getFiles() {
        return this.scanner.getFiles(this.path)
            .map(({fileName, id})=>{
                return new FoundFile(this, fileName, id);
            })
            .sort((a, b)=>{
                return a.fileName.localeCompare(b.fileName);
            });
    }

    getFile(id:string) {
        return this.getFiles().find((file)=> file.id === id);
    }

}

const {
    logWarn
} = createLogger('App/MultiFoldersManager/FoldersManager');

export class FoldersManager {

    static readonly FOLDER_ID_KEY = "IDS/FOLDER_MANAGEMENT/FOLDER_ID";
    private readonly folders:Map<number, FolderContainer> = new Map();

    constructor(
        private readonly scanner: FileScanner = new FileScanner()
    ) {
    
    }

    private static generateFolderId() {
        return DataManager.getNextId(FoldersManager.FOLDER_ID_KEY);
    }


    alreadyHas(folderPath:string) {
        return Array.from(this.folders.values()).findIndex(v => v.path === folderPath) >= 0;
    }

    addFolder(path:string, id?:number) {

        if (this.alreadyHas(path)) {
            logWarn(`Folder with path ${path} was already registered`);
            return null;
        }

        const folder = new FolderContainer(
            id ?? FoldersManager.generateFolderId(),
            path,
            this.scanner
        );

        this.folders.set(folder.id, folder);
        return folder;
    }

    removeFolder(id:number) {
        if (!this.folders.has(id)) {
            return;
        }
        this.folders.delete(id);
    }

    getFile(fileId:string): FoundFile | undefined {
        let result:FoundFile|undefined = undefined;

        this.folders.forEach((folder)=>{
            if (!result) {
                result = folder.getFile(fileId);
            }
        });

        return result;
    }

    getFolder(id:number) {
        if (!this.folders.has(id)) {
            return;
        }

        return this.folders.get(id);
    }

    getFolders() {
        return new Map(this.folders);
    }

    getFoldersRaw(): [id:number, path:string][] {
        return Array.from(this.folders.entries()).map(([id, folder]) => [id, folder.path]);
    }

    loadFoldersRaw(data:([id:number, path:string])[]) {
        data.forEach(([id, path])=>{
            this.folders.set(id, new FolderContainer(
                id,
                path,
                this.scanner
            ));
        });
    }

    getFiles() {
        const rawFiles: (readonly [id:string, file:FoundFile])[] = 
            Array.from(this.folders.values())
                .flatMap((folder) => {
                    return folder.getFiles()
                        .map(file => {
                            return [file.id, file] as const;
                        });
                });

        return new Map(rawFiles);
    }
}