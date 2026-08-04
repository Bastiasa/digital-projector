import { mkdirSync } from "fs"

export const ensureFolder = (path:string) => {
    mkdirSync(path, {recursive:true});
    return path;
}