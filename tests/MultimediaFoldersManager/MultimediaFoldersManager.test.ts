import type { MediaIndex } from '@/electron/classes/MultimediaFoldersManager/MediaIndex.ts';
import { ConstantsSingletonMocks } from '../utils/mocks/ConstantsSingletonMocks.ts';

ConstantsSingletonMocks();

import { MultiFoldersManager } from '@/electron/classes/MultimediaFoldersManager/MultimediaFoldersManager.ts';
import {vi, it, describe, expect, beforeEach} from 'vitest';
import { join } from 'path';
import { DataManager } from '@/electron/singletons/dataManager.ts';
import { MediaIndexMock } from './MediaIndex.test.ts';
import { FoldersManager } from '@/electron/classes/MultimediaFoldersManager/FoldersManager.ts';

const EXAMPLE_FOLDER_PATH = join(
    __dirname,
    'example_folder'
);

describe("MultimediaFoldersManager", () => {

    let manager!: MultiFoldersManager;
    let index!: ReturnType<typeof MediaIndexMock>;
    let picker!: MockedObj<'pick'>;

    beforeEach(() => {
        index = MediaIndexMock();

        picker = {
            pick: vi.fn()
        };

        manager = new MultiFoldersManager(
            index as any,
            undefined,
            undefined,
            picker
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

        index.getPreviousId.mockReturnValue('prev');
        index.getNextId.mockReturnValue('next');

        expect(
            manager.getPreviousIdFileFrom('current')
        ).toBe('prev');

        expect(
            manager.getNextIdFileFrom('current')
        ).toBe('next');

        expect(index.getPreviousId).toHaveBeenCalledWith('current');
        expect(index.getNextId).toHaveBeenCalledWith('current');
    });

    it('removes folder from index', async () => {

        await manager.removeFolder(10);

        expect(index.removeFolder)
            .toHaveBeenCalledWith(10);
    });

    it('picks a folder and inserts its files', async () => {

        picker.pick.mockReturnValue(EXAMPLE_FOLDER_PATH);


        await manager.pickFolder(null as any);
        
        expect(picker.pick).toHaveBeenCalledWith(null);

        const folderId = DataManager.get<number>(FoldersManager.FOLDER_ID_KEY, 0) ?? 0;

        console.log("Folder ID", folderId)

        expect(index.addFiles).toHaveBeenCalledWith([
            {
                folderId,
                fileName: "a.png",
                id: expect.any(String)
            },

            {
                folderId,
                fileName: "b.png",
                id: expect.any(String)
            }
        ]);

        
        expect(manager.getFolderFiles(folderId)).toStrictEqual([
            {
                fileName: 'a.png',
                id: expect.any(String)
            },
            
            {
                fileName: 'b.png',
                id: expect.any(String)
            }
        ]);

        expect(manager.getFolderFiles(3)).toBeNullable();
    })

})