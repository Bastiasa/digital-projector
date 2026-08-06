import { GlobalConstants } from "@digital-projector/shared";
import { DataManager } from "../../singletons/dataManager.js";

export class FolderRepository {

    save(data: [number, string][]) {
        DataManager.store(
            {
                [GlobalConstants.SETTINGS_FIELDS.MULTIMEDIA_FOLDERS]: data 
            }
        );
    }

    load() {
        const folders = DataManager.get<[number, string][]>(
            GlobalConstants.SETTINGS_FIELDS.MULTIMEDIA_FOLDERS,
            []
        );

        return folders;
    }
}