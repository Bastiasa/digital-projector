import { app } from "electron";
import path from "path";

const {
    ENV_MODE    
} = process.env;

export class Constants { 
    static readonly IS_DEVELOPMENT = ENV_MODE === 'development'; 

    static readonly PATHS = {
        PRELOAD_FILE: path.join(
            app.getAppPath(),
            'dist-electron',
            'preload.cjs'
        ),

        WEBSITE_FOLDER: path.join(
            app.getAppPath(),
            'dist-website'
        ),

        DATA_FILE: path.join(
            app.getPath('userData'),
            'data.json'
        )

    } as const;
}