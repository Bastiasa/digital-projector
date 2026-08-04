import { mkdirSync } from "fs";
import { CACHE_FOLDER } from "./constants.ts";

export const ensureCacheFolder = () => {
    mkdirSync(CACHE_FOLDER, {recursive:true});
}