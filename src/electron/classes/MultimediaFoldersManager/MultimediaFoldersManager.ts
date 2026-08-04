import { BrowserWindow } from "electron";
import { FileScanner, type ScannedFile } from "./FileScanner.js";
import { FolderRepository } from "./FolderRepository.js";
import { FolderPicker } from "./FolderPicker.js";
import { MediaIndex } from "./MediaIndex.js";
import { createLogger } from "../../utils/logger.js";
import { DataManager } from "../../singletons/dataManager.js";

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

    public readonly FOLDER_ID_KEY = "IDS.MULTIMEDIA_FOLDERS_MANAGER";

    private folders: Map<number, string> = new Map();

    constructor(
        private index = new MediaIndex(),
        private scanner = new FileScanner(),
        private repository = new FolderRepository(),
        private folderPicker = new FolderPicker()
    ) {
        try {

            logInfo('Initializating...');

            logInfo('Loading last data...');

            this.folders = this.repository.load();

            for (const [folderId, folderPath] of Array.from(this.folders.entries())) {
                const files = this.scanner.getFiles(folderPath);

                if (files) {
                    this.index.addFiles(
                        ...files.map(sFile=>({
                            folderId,
                            ...sFile,
                        }))
                    );
                }
            }

            logInfo('Last data Loaded successfully');

        } catch (error) {
            logError(`Couldn't iniatlize correctly: `, error);
        } finally {
            logInfo("Initializing finished.");
        }
    }

    public getFolders() {
        return new Map(this.folders);
    }

    private alreadyHas(folder: string) {
        return Array.from(this.folders.values()).findIndex(v => v === folder) >= 0;
    }

    public getFilePath(fileId: string) {
        return this.index.getFilePath(fileId, this.folders);
    }

    public async pickFolder(window: BrowserWindow): Promise<{ id: number, folder: string } | undefined> {

        logInfo("Picking folder.");

        const selectedFolder = await this.folderPicker.pick(window);

        logInfo(`User selected folder: ${selectedFolder}`);

        if (selectedFolder) {

            if (this.alreadyHas(selectedFolder)) {
                logWarn(`Folder ${selectedFolder} was already registered.`);
                return;
            }

            const id = DataManager.getNextId(this.FOLDER_ID_KEY);

            logInfo(`Folder id: ${id}.`);

            this.folders.set(
                id,
                selectedFolder
            );

            const folderFiles = 
                this.scanner.getFiles(selectedFolder)
                    .map((f)=>({
                        ...f,
                        folderId: id
                    }));

            this.repository.save(this.folders);
            this.index.addFiles(...folderFiles);

            return {
                folder: selectedFolder,
                id
            };
        }

        return undefined;
    }

    public async removeFolder(id: number) {
        logInfo(`Removing folder: ${id}`);
        this.folders.delete(id);
        this.index.removeFolder(id);
        this.repository.save(this.folders);
    }

    public getFolderFiles(id: number): FileData[] | undefined {

        if (!this.folders.has(id)) {
            return;
        }

        const folderPath = this.folders.get(id)!;
        const fileList = this.scanner.getFiles(folderPath);

        return fileList.sort((a, b) => a.fileName.localeCompare(b.fileName));
    }

    public getPreviousIdFileFrom(id: string | null) {

        if (!id) {
            return null;
        }

        return this.index.getPreviousId(id);
    }

    public getNextIdFileFrom(id: string | null) {

        if (!id) {
            return null;
        }

        return this.index.getNextId(id);
    }
}