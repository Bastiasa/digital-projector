import { FoldersManager } from "@/electron/classes/MultimediaFoldersManager/FoldersManager.ts";
import { createMocks } from "../utils/createMocks.ts";


export const FoldersManagerMock = () => createMocks(
    'addFolder',
    'alreadyHas',
    'getFile',
    'getFiles',
    'getFolder',
    'getFolders',
    'getFoldersRaw',
    'loadFoldersRaw',
    'removeFolder'
)