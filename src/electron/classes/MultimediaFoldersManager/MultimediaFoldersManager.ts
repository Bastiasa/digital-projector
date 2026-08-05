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

type FileData = {
    fileName: string,
    id: string
};

export type FolderFile = {
    folderId:number;
} & ScannedFile;


export class MultiFoldersManager {
    
    constructor(
        private foldersManager = new FoldersManager(),
        private scanner = new FileScanner(),
        private repository = new FolderRepository(),
        private folderPicker = new FolderPicker()
    ) {
        try {

            logInfo('Initializating...');

            logInfo('Loading saved folders...');

            const loadedFolders = this.repository.load();

            if (!loadedFolders) {
                logInfo("There are no folders saved.");
                return;
            }

            if (loadedFolders !instanceof Array) {
                logWarn("Saved folders aren't an array:\n", loadedFolders);
                return;
            }

            this.foldersManager.loadFoldersRaw(loadedFolders);
            logInfo('Last data Loaded successfully');

        } catch (error) {
            logError(`Couldn't iniatlize correctly: `, error);
        } finally {
            logInfo("Initializing finished.");
        }
    }

    private saveFolders() {
        this.repository.save(
            this.foldersManager.getFoldersRaw()
        );
    }

    public getFolders() {
        return this.foldersManager.getFolders();
    }

    public getFoldersRaw() {
        return this.foldersManager.getFoldersRaw();
    }

    public getFilePath(fileId: string) {
        return this.foldersManager.getFile(fileId);
    }

    public async pickFolder(window: BrowserWindow): Promise<{ id: number, folder: string } | undefined> {

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

        return {
            folder: selectedFolder,
            id: folder.id
        };
    }

    public async removeFolder(id: number) {
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

        const files = this.foldersManager.getFiles();
        const indexManager = new IndexManager(files);

        return indexManager.getIndexValue(
            indexManager.getPreviousIndex(id)
        );
    }

    public getNextIdFileFrom(id: string | null) {

        if (!id) {
            return null;
        }

        const files = this.foldersManager.getFiles();
        const indexManager = new IndexManager(files);

        return indexManager.getIndexValue(
            indexManager.getNextIndex(id)
        );
    }
}