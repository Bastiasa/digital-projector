import { existsSync, readdirSync } from "fs";
import { extname } from "path";
import { makeSha256 } from "../../utils/makeSha256.js";

export type ScannedFile = {fileName:string, id:string};

const isValidFile = (fileName: string) => {
    switch (extname(fileName.toLowerCase())) {
        // return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'].includes(ext.toLowerCase());

        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.bmp':
        case '.webp':
        case '.tiff':
        case '.svg':

        // return ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'flv'].includes(ext.toLowerCase());
        case '.mp4':
        case '.webm':
        case '.mov':
        case '.avi':
        case '.mkv':
        case '.wmv':
        case '.flv':


        // return ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'].includes(ext.toLowerCase());

        case '.mp3':
        case '.wav':
        case '.aac':
        case '.flac':
        case '.ogg':
        case '.m4a':
        case '.wma':
            return true;


        default:
            return false;
    }
}
export class FileScanner {

    getFiles(folderPath: string) : ScannedFile[] {
        if (!existsSync(folderPath)) {
            return [];
        }

        return readdirSync(folderPath)
            .filter(isValidFile)
            .map(fileName => ({
                fileName,
                id: makeSha256(
                    `${folderPath}~${fileName}`
                )
            }));
    }

}