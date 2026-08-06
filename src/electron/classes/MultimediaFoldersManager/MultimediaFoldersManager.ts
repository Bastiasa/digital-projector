import { BrowserWindow } from "electron";
import { FileScanner, type ScannedFile } from "./FileScanner.js";
import { FolderRepository } from "./FolderRepository.js";
import { FolderPicker } from "./FolderPicker.js";
import { MediaIndex } from "./MediaIndex.js";
import { createLogger } from "../../utils/logger.js";
import { DataManager } from "../../singletons/dataManager.js";
import { FoldersManager } from "./FoldersManager.js";
import { IndexManager } from "./IndexManager.js";

const {
    logInfo,
    logError,
    logWarn
} = createLogger("Singletons/MultimediaFoldersManager");


export type FolderFile = {
    folderId:number;
} & ScannedFile;


export class MultiFoldersManager {
    
    constructor(
        scanner = new FileScanner(), 
        private foldersManager = new FoldersManager(scanner),
        private repository = new FolderRepository(),
        private folderPicker = new FolderPicker(),
        private createIndexManager = () => new IndexManager(this.foldersManager.getFiles())

    ) {
        try {

            logInfo('Initializating...');

            logInfo('Loading saved folders...');

            const loadedFolders = this.repository.load();

            if (!loadedFolders) {
                logInfo("There are no folders saved.");
                return;
            }

            if (!(loadedFolders instanceof Array)) {
                logWarn(`Saved folders aren't an array:\n`, loadedFolders);
                return;
            }

            this.foldersManager.loadFoldersRaw(loadedFolders);
            logInfo('Saved folders loaded successfully');

        } catch (error) {
            logError(`Couldn't iniatlize correctly: `, error);
        } finally {
            logInfo("Initializing finished.");
        }
    }

    private saveFolders() {
        try {
            this.repository.save(
                this.foldersManager.getFoldersRaw()
            );    
        } catch(err) {
            logError(`Error saving folders:\n`, err);
        }
        
    }

    public getFolders() {
        return this.foldersManager.getFolders();
    }

    public getFoldersRaw() {
        return this.foldersManager.getFoldersRaw();
    }

    public async pickFolder(window: BrowserWindow) {

        logInfo("Picking folder.");

        const selectedFolder = await this.folderPicker.pick(window);

        logInfo(`User selected folder: ${selectedFolder}`);

        if (!selectedFolder) {
            return;
        }
        
        logInfo("Registering folder...");
        const folder = this.foldersManager.addFolder(selectedFolder);

        if (!folder) {
            return;
        }

        logInfo(`Folder id: ${folder.id}.`);

        this.saveFolders();

        return folder;
    }

    public removeFolder(id: number) {
        logInfo(`Folder removed: ${id}`);
        this.foldersManager.removeFolder(id);
        this.saveFolders();
    }

    public getFolderFiles(id: number) {

        const folder = this.foldersManager.getFolder(id);

        if (!folder) {
            return;
        }
        
        return folder.getFiles();
    }

    public getPreviousIdFileFrom(id: string | null) {

        if (!id) {
            return null;
        }

        const index = this.createIndexManager();

        return index.getIndexValue(
            index.getPreviousIndex(id)
        );
    }

    public getNextIdFileFrom(id: string | null) {

        if (!id) {
            return null;
        }

        const index = this.createIndexManager();

        return index.getIndexValue(
            index.getNextIndex(id)
        );
    }

    public getFile(fileId:string) {
        return this.foldersManager.getFile(fileId);
    }
}