import { GlobalConstants } from "@digital-projector/shared";
import { DataManager } from "../../singletons/dataManager.js";

export class FolderRepository {

    save(data: [number, string][]) {
        const arrayData = Array.from(data.entries());

        DataManager.store(
            {
                [GlobalConstants.SETTINGS_FIELDS.MULTIMEDIA_FOLDERS]: arrayData 
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