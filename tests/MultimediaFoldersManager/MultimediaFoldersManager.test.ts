import type { MediaIndex } from '@/electron/classes/MultimediaFoldersManager/MediaIndex.ts';
import { ConstantsSignletonMocks } from '../utils/mocks/ConstantsSignletonMocks.ts';

ConstantsSignletonMocks();

import { MultiFoldersManager } from '@/electron/classes/MultimediaFoldersManager/MultimediaFoldersManager.ts';
import {vi, it, describe, expect} from 'vitest';
import { join } from 'path';
import { makeSha256 } from '@/electron/utils/makeSha256.ts';

const EXAMPLE_FOLDER_PATH = join(
    __dirname,
    'example_folder'
);

describe("MultimediaFoldersManager", () => {


    const manager = new MultiFoldersManager();

    const folders = manager.getFolders();
    folders.set(99, "EmptyFolder");

    it('duplicates folders map', ()=>{
        expect(manager.getFolders().has(99)).toBeFalsy();
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
        const getPreviousId = vi.fn();
        const getNextId = vi.fn();

        const manager = new MultiFoldersManager(
            {
                getPreviousId,
                getNextId,
                addFiles: vi.fn(),
                removeFolder: vi.fn(),
                getFilePath: vi.fn(),
            } as unknown as MediaIndex
        );

        getPreviousId.mockReturnValue('prev');
        getNextId.mockReturnValue('next');

        expect(
            manager.getPreviousIdFileFrom('current')
        ).toBe('prev');

        expect(
            manager.getNextIdFileFrom('current')
        ).toBe('next');

        expect(getPreviousId).toHaveBeenCalledWith('current');
        expect(getNextId).toHaveBeenCalledWith('current');
    });

    it('removes folder from index', async () => {
        
        const removeFolder = vi.fn();

        const manager = new MultiFoldersManager(
            {
                removeFolder
            } as any
        );

        await manager.removeFolder(10);

        expect(removeFolder)
            .toHaveBeenCalledWith(10);
    });

    it('picks a folder and inserts its files', () => {

        const addFiles = vi.fn();
        const pick = vi.fn();

        const manager = new MultiFoldersManager(
            {
                addFiles
            } as any,
            undefined,
            undefined,
            {
                pick
            } as any
        );

        pick.mockReturnValue(EXAMPLE_FOLDER_PATH);


        manager.pickFolder(null as any);
        
        expect(pick).toHaveBeenCalledWith(null);

        expect(addFiles).toHaveBeenLastCalledWith(
            {
                folderId: 2,
                fileName: "a.png",
                id: expect.any(String)
            },

            {
                folderId: 2,
                fileName: "b.png",
                id: expect.any(String)
            });

        
        expect(manager.getFolderFiles(2)).toStrictEqual([
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