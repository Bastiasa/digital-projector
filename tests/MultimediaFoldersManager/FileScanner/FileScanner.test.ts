import { describe, expect, it } from "vitest";
import { FileScanner} from '@/electron/classes/MultimediaFoldersManager/FileScanner.ts';
import { makeSha256 } from "@/electron/utils/makeSha256.ts";
import { join } from "path";
import { createMocks } from "../../utils/createMocks.ts";

const EXAMPLE_FOLDER = join(
    __dirname,
    "example_folder"
);

export const FileScannerMocks = ()=> createMocks(
    'getFiles'
)

describe("FileScanner", ()=> {

    const scanner = new FileScanner();
    const folderFiles = scanner.getFiles(EXAMPLE_FOLDER);

    const getId = (fileName:string)=>{
        return makeSha256(`${EXAMPLE_FOLDER}~${fileName}`);
    } 
    
    const includesId = (id:string) => {
        return folderFiles.findIndex(f=>f.id === id) > -1;
    }

    it("has a length of 3", () => {
        expect(folderFiles.length) .toBe(3);
    });

    it("includes correct ids", () => {
        expect(includesId(getId('a.png'))).toBe(true);
        expect(includesId(getId('b.png'))).toBe(true);
        expect(includesId(getId('c.png'))).toBe(true);
    })

    it("have correct shape", () => {
        expect(folderFiles).toStrictEqual([
            {
                id: getId('a.png'),
                fileName: 'a.png'
            },

            {
                id: getId('b.png'),
                fileName: 'b.png'
            },

            {
                id: getId('c.png'),
                fileName: 'c.png'
            }
        ]);
    })
});