
import { ConstantsSingletonMocks } from '../utils/mocks/ConstantsSingletonMocks.ts';

ConstantsSingletonMocks();

import { MultiFoldersManager } from '@/electron/classes/MultimediaFoldersManager/MultimediaFoldersManager.ts';
import {vi, it, describe, expect, beforeEach} from 'vitest';
import { join } from 'path';
import { DataManager } from '@/electron/singletons/dataManager.ts';

import { FoldersManager } from '@/electron/classes/MultimediaFoldersManager/FoldersManager.ts';
import { FoldersManagerMock } from './FoldersManager.test.ts';
import { IndexManagerMocks } from './IndexManager.test.ts';
import { FileScannerMocks } from './FileScanner/FileScanner.test.ts';

const EXAMPLE_FOLDER_PATH = join(
    __dirname,
    'example_folder'
);

describe("MultimediaFoldersManager", () => {

    let manager!: MultiFoldersManager;
    let index!: ReturnType<typeof IndexManagerMocks>
    let foldersManager!: ReturnType<typeof FoldersManagerMock>;
    let picker!: MockedObj<'pick'>;
    let scanner!: ReturnType<typeof FileScannerMocks>

    beforeEach(() => {
        foldersManager = FoldersManagerMock();

        index = IndexManagerMocks();

        picker = {
            pick: vi.fn()
        };

        scanner = FileScannerMocks();

        manager = new MultiFoldersManager(
            scanner as any,
            foldersManager as any,
            undefined,
            picker,
            ()=> index as any
        );


        
    });
    
    it('returns null when previous file id receives null', () => {
        expect(
            manager.getPreviousIdFileFrom(null)
        ).toBeNull();
    });

    it('returns null when next file id receives null', () => {
        expect(
            manager.getNextIdFileFrom(null)
        ).toBeNull();
    });


    it('delegates previous & next id lookup', () => {

        index.getNextIndex.mockReturnValue('next');
        index.getPreviousIndex.mockReturnValue('prev');

        //#region PREVIOUS TEST
        index.getIndexValue.mockReturnValue('prev');

        expect(
            manager.getPreviousIdFileFrom('current')
        ).toBe('prev');

        expect(index.getPreviousIndex).toHaveBeenCalledWith('current');
        expect(index.getIndexValue).toHaveBeenCalledWith('prev');
        //#endregion
        
        //#region NEXT TEST
        index.getIndexValue.mockReturnValue('next');
        

        expect(
            manager.getNextIdFileFrom('current')
        ).toBe('next');

        expect(index.getIndexValue).toHaveBeenCalledWith('next');
        expect(index.getNextIndex).toHaveBeenCalledWith('current');
        //#endregion

    });

    it('removes folder', () => {

        manager.removeFolder(10);

        expect(foldersManager.removeFolder)
            .toHaveBeenCalledWith(10);
    });

    it('picks a folder and inserts its files', async () => {

        const folders: [number, string][] = [];

        picker.pick.mockReturnValue(EXAMPLE_FOLDER_PATH);

        foldersManager.getFoldersRaw.mockImplementation(()=> folders);

        foldersManager.addFolder.mockImplementation((folderPath:string)=>{
            const result: [number, string] = [
                DataManager.getNextId(FoldersManager.FOLDER_ID_KEY), folderPath
            ];

            folders.push(result);
            return result;
        })


        await manager.pickFolder(null as any);
        
        expect(picker.pick).toHaveBeenCalledWith(null);

        const folderId = DataManager.get<number>(FoldersManager.FOLDER_ID_KEY, 0) ?? 0;

        console.log("Folder ID", folderId)

        expect(foldersManager.addFolder).toHaveBeenCalledWith(EXAMPLE_FOLDER_PATH);
        
        expect(manager.getFoldersRaw()).toStrictEqual([
            [folderId, EXAMPLE_FOLDER_PATH]
        ]);

        expect(manager.getFolderFiles(3)).toBeNullable();
    })

})