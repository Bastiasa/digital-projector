import { describe, it, expect } from 'vitest';
import { MediaIndex } from '@/electron/classes/MultimediaFoldersManager/MediaIndex.ts';
import { createMocks } from '../utils/createMocks.ts';

export const MediaIndexMock = () => createMocks(
    'getPreviousId',
    'getNextId',
    'addFiles',
    'addFile',
    'removeFolder',
    'getFilePath'
);

describe('MediaIndex', () => {

    it('returns the next file correctly', () => {

        const index = new MediaIndex();

        index.addFiles([
            {
                id: 'a',
                fileName: 'video.mp4',
                folderId: 1
            },
            {
                id: 'b',
                fileName: 'image.jpg',
                folderId: 2
            },
            {
                id: 'c',
                fileName: 'audio.mp3',
                folderId: 1
            }
        ]);

        expect(index.getNextId('a')).toBe('b');
        expect(index.getNextId('b')).toBe('c');
        expect(index.getNextId('c')).toBe('a');

    });

    it('returns the previous file correctly', () => {

        const index = new MediaIndex();

        index.addFiles([
            {
                id: 'a',
                fileName: 'video.mp4',
                folderId: 1
            },
            {
                id: 'b',
                fileName: 'image.jpg',
                folderId: 2
            },
            {
                id: 'c',
                fileName: 'audio.mp3',
                folderId: 1
            }
        ]);

        expect(index.getPreviousId('a')).toBe('c');
        expect(index.getPreviousId('b')).toBe('a');
        expect(index.getPreviousId('c')).toBe('b');

    });

});