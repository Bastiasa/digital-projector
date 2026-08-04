import { MediaStatePlayback } from "../classes/MediaStatePlayback/MediaStatePlayback.js";
import { MultiFoldersManager } from "../classes/MultimediaFoldersManager/MultimediaFoldersManager.js";
import { WebsiteServer } from "../classes/WebsiteServer/WebsiteServer.js";

export class ApplicationSingleton {

    static mediaState:MediaStatePlayback;
    static foldersManager: MultiFoldersManager;
    static websiteServer: WebsiteServer;

    static init() {
        this.mediaState = new MediaStatePlayback();
        this.foldersManager = new MultiFoldersManager();
        this.websiteServer = new WebsiteServer(this.foldersManager, this.mediaState);
    }
}