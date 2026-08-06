import type { FastifyInstance } from "fastify";
import type { MultiFoldersManager } from "../MultimediaFoldersManager/MultimediaFoldersManager.js";
import path from "path";
import { createReadStream } from "fs";

import mime from 'mime-types';
import { createLogger } from "../../utils/logger.js";
import { FolderController } from "./controllers/FolderController.js";
import { FileController } from "./controllers/FileController.js";

const {
    logError,
    logInfo
} = createLogger("App/WebsiteServer/RouterRegister");

export class RouteRegister {

    constructor(
        private foldersManager: MultiFoldersManager,
        private folderController: FolderController = new FolderController(foldersManager),
        private fileController: FileController = new FileController(foldersManager)
    ) {
        
    }

    register(
        app:FastifyInstance
    ) {
        app.get('/folders', (req, reply) => {

            try {
                const result = reply.send(
                            {
                                success: true,
                                data: this.foldersManager.getFoldersRaw()
                            }
                        );
                logInfo("GET /folders")
                return result;
            } catch(error) {
                logError("Error in folders request: \n", error);
            }
       
        });

        app.get("/folder/:id", (req,reply) => {
            try {
                const result = this.folderController.getFolder(req,reply)
                logInfo(`${req.url} GET`);
                return result;
            } catch(err) {
                logError(`Error in FolderController: \n`, err);
                reply.status(500).send({
                    error: "Internal server error"
                });
            }
        });
        app.get("/file/:id", async (req, reply)=> {
            try {
                const result = await this.fileController.getFile(req, reply);;
                logInfo(`${req.url} GET`);
                return result
            } catch(err) {
                logError(`Error in FileController: `, err);
                reply.status(500).send({
                    error: "Internal server error"
                });
            }
        });
    
        app.setNotFoundHandler((req, reply) => {
            reply
                .sendFile(
                    "index.html"
                );
        });
    }
}