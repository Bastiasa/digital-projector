import type { FastifyReply, FastifyRequest } from "fastify";
import type { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";
import { createLogger } from "../../../utils/logger.js";
import { FileStreamingService } from "../services/FileStreamingService.js";

const {
    logError
} = createLogger('App/WebsiteServer/FileController');

export class FileController {

    constructor(
        private folders: MultiFoldersManager,
        private fileStreamingService: FileStreamingService = new FileStreamingService(folders)
    ) {
        
    }

    getFile(req:FastifyRequest, reply:FastifyReply) {

        const {id:fileId}= (req.params as {id?:string});

        if (!fileId) {
            reply
                .status(400)
                .send({
                    error: "Invalid request"
                });
            return;
        }

        const file = this.fileStreamingService.getFile(fileId);

        if (!file) {
            reply
                .status(404)
                .send({
                    error: "Not found"
                });
            return;
        }

        try {
            
            reply
                .header('Content-Type', file.mimeType)
                .header('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`)
                .header('X-Filename', encodeURIComponent(file.fileName))
                .send(file.stream);
        } catch (err) {
            logError("Error sending file to client: ", err);
        }
    }
}