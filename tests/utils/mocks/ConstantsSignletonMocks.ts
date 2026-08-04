import { mkdirSync } from "fs"
import { CACHE_FOLDER } from "../constants.ts"
import { ensureCacheFolder } from "../cache.ts"
import { join } from "path";
import {vi} from 'vitest';
import { ensureFolder } from "../ensureFolder.ts";


export const ConstantsSignletonMocks = () => {
    ensureCacheFolder();
    vi.mock('electron', () => ({
        app: {
            getAppPath() {
                const folder = join(CACHE_FOLDER, "electron", "app");
                return ensureFolder(folder);
            },
            getPath(folder:string) {
                const p = join(CACHE_FOLDER, "electron", "app", "custom", folder);
                return ensureFolder(p);
            }
        }
    }));
}