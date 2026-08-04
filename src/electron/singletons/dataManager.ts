import { readFileSync, writeFileSync } from "fs";
import { Constants } from "./constants.js";
import { createLogger } from "../utils/logger.js";


const {
    logError,
    logInfo,
    logWarn
} = createLogger('Singletons/DataManager');

export class DataManager {

    private static data: Record<string, any> = {};

    private constructor() {

    }

    static {
        try {

            logInfo("Starting DataManager.");
            logInfo(`Reading data file. (${Constants.PATHS.DATA_FILE})`);

            const rawData = readFileSync(Constants.PATHS.DATA_FILE, 'utf8');
            this.data = JSON.parse(rawData);

            logInfo("File read successfully");

        } catch(error) {
            logError(`Saved data in ${Constants.PATHS.DATA_FILE} is invalid JSON`);
        }
    }

    private static saveFile() {
        try {

            logInfo("Trying to save file.");

            writeFileSync(
                Constants.PATHS.DATA_FILE,
                JSON.stringify(this.data),
                'utf8'
            );

            logInfo("File saved successfully.");

        } catch(err) {
            logError("Error saving file:", err);
        }

    }

    public static store(fields: Record<string, any>) {

        logInfo("Storing fields: ", fields);

        this.data = {
            ...this.data,
            ...fields
        };

        this.saveFile();

        logInfo("Fields stored.");
    }

    public static get<T extends any>(key:string, dflt:any = null):T {
        return this.data[key] ?? dflt;
    }

    public static getNextId(key:string): number {
        logInfo(`Getting next id of '${key}'`);
        let id:number = this.get(key);

        if (typeof id !== 'number') {
            id = -1;
            logInfo(`Id didn't exists. Starting with -1.`);
        } else {
            logInfo(`Current id: ${id}`);
        }

        id++;

        this.store({
            [key]: id
        });

        logInfo(`New id stored: ${id}.`);
        return id;
    }
}