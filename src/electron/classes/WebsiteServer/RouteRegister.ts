import type { FastifyInstance } from "fastify";
import type { MultiFoldersManager } from "../MultimediaFoldersManager/MultimediaFoldersManager.js";
import path from "path";
import { createReadStream } from "fs";

import mime from 'mime-types';
import { createLogger } from "../../utils/logger.js";
import { FolderController } from "./controllers/FolderController.js";
import { FileController } from "./controllers/FileController.js";

const {
    logError
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
            reply.send(
                {
                    success: true,
                    data: Array.from(this.foldersManager.getFolders().entries())
                }
            );
        });

        app.get("/folder/:id", (req,reply) => {
            try {
                return this.folderController.getFolder(req,reply)
            } catch(err) {
                logError(`Error in folder controller: `, err);
                reply.status(500).send({
                    error: "Internal server error"
                });
            }
        });
        app.get("/file/:id", (req, reply)=> {
            try {
                return this.fileController.getFile(req, reply);
            } catch(err) {
                logError(`Error in file controller: `, err);
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