import type { GetFolderResponse } from "@digital-projector/shared";
import type { MultiFoldersManager } from "../../MultimediaFoldersManager/MultimediaFoldersManager.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { FolderService } from "../services/FolderService.js";

export class FolderController {
    constructor(
        private folders: MultiFoldersManager,
        private folderService: FolderService = new FolderService(folders)
    ) {
        
    }

    getFolder(req:FastifyRequest, reply:FastifyReply) {

        const folderId = Number((req.params as {id?:string})?.id);

        if (!Number.isFinite(folderId)) {
            return reply
                .status(400)
                .send({
                    error: "Invalid request"
                });
        }

        const folder = this.folderService.getFolder(folderId);

        if (!folder) {
            return reply
                .status(400)
                .send({
                    error: "Folder not found"
                });
        }

        const files = folder.getFiles().map(file => ({
            fileName: file.fileName,
            id: file.id
        }));

        return reply.send({
            success:true,
            data: {
                files,
                id: folderId,
                path: folder.path
            }
        } satisfies GetFolderResponse)
    }
}