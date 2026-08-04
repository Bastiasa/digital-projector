import { BrowserWindow, dialog } from 'electron';

export class FolderPicker {

    async pick(window: BrowserWindow) {
        const result =
            await dialog.showOpenDialog(
                window,
                {
                    properties: [
                        "openDirectory"
                    ]
                }
            );

        return result.filePaths[0];
    }

}