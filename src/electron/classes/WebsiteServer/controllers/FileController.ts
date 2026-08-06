import type { FastifyReply, FastifyRequest } from "fastify";
import type { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";
import { createLogger } from "../../../utils/logger.js";
import { FileStreamingService } from "../services/FileStreamingService.js";
import { FileVersionService } from "../services/FileVersionService.js";

const {
    logInfo,
    logError
} = createLogger('App/WebsiteServer/FileController');

export class FileController {

    constructor(
        private folders: MultiFoldersManager,
        private fileStreamingService: FileStreamingService = new FileStreamingService(folders),
        private fileVersionService: FileVersionService = new FileVersionService(folders)
    ) {
        
    }

    async getFile(req:FastifyRequest, reply:FastifyReply) {

        const {id:fileId}= (req.params as {id?:string});

        if (!fileId) {
            reply
                .status(400)
                .send({
                    error: "Invalid request"
                });
            return;
        }

        const file = this.folders.getFile(fileId)
        const {stream, mimeType, fileName} = this.fileStreamingService.getFileStream(file);

        if (!file) {
            reply
                .status(404)
                .send({
                    error: "Not found"
                });
            return;
        }

        const etag = await this.fileVersionService.generateEtag(file);
        const requestEtag = req.headers['if-none-match'] ?? undefined;

        reply
            .header('ETag', etag)
            .header('Content-Type', mimeType)
            .header('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`)
            .header('X-Filename', encodeURIComponent(fileName!));

        if (requestEtag === etag) {
            
            stream!.close();

            return reply
                .code(304)
                .send();
        }
        
        return reply
            .send(stream);
    }
}