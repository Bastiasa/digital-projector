import { ConstantsSignletonMocks } from "../utils/mocks/ConstantsSignletonMocks.ts";
ConstantsSignletonMocks();


import {expect, describe, it} from 'vitest';


import { FolderRepository } from "@/electron/classes/MultimediaFoldersManager/FolderRepository.ts";

describe("MultimediaFoldersManager/FolderRepository", () => {


    const repository = new FolderRepository();

    const folders = new Map([
        [122, "/videos"],
        [32, "/music"],
        [59, "/pictures"],
    ]);

    repository.save(folders);

    const storedData = repository.load();

    it("stored the correct data", ()=> {
        expect(storedData).toStrictEqual(folders);
    })
})