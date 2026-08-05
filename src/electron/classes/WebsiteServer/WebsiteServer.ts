import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import { DataManager } from "../../singletons/dataManager.js";
import { Constants } from "../../singletons/constants.js";
import EventEmitter from "events";
import { Socket, Server as SocketIoServer } from 'socket.io';
import { getLocalIp } from "../../utils/getLocalIp.js";
import { GlobalConstants } from "@digital-projector/shared";
import { createLogger } from "../../utils/logger.js";
import { MediaStatePlayback } from "../MediaStatePlayback/MediaStatePlayback.js";
import { RouteRegister } from "./RouteRegister.js";
import { MediaSyncService } from "./services/MediaSyncService.js";
import { SocketAuthenticator } from "./socket/SocketAuthenticator.js";
import { SocketConnectionHandler } from "./socket/SocketConnectionHandler.js";
import { AdminSocketHandler } from "./socket/AdminSocketHandler.js";
import { ViewerSocketHandler } from "./socket/ViewerSocketHandler.js";
import type { MultiFoldersManager } from "../MultimediaFoldersManager/MultimediaFoldersManager.js";

type WebsiteServerEvents = {
    'started': [],
    'stopped': []
};

const {
    logError,
    logInfo,
} = createLogger("App/WebsiteServer")

export class WebsiteServer {

    private app!: FastifyInstance;
    private io!: SocketIoServer;

    private isRunning:boolean = false;
    

    readonly events = new EventEmitter<WebsiteServerEvents>();

    private  __url: string | undefined;

    get url(): string | undefined {
        return this.__url;
    }

    get socketIO(): SocketIoServer {
        return this.io;
    }
    private mediaSync: MediaSyncService|undefined = undefined; 

    constructor(
        private foldersManager: MultiFoldersManager,
        private mediaState: MediaStatePlayback,
        private router: RouteRegister = new RouteRegister(foldersManager),
        private socketAuthenticator: SocketAuthenticator = new SocketAuthenticator()
    ) {
        
    }


    public getIsRunning() {
        return this.isRunning;
    }

    private onSocketConnected(socket: Socket) {

       const connectionHandler = new SocketConnectionHandler(
            new AdminSocketHandler(this.mediaSync!),
            new ViewerSocketHandler(this.mediaSync!)
       );

       connectionHandler.handle(socket);

        socket.emit('update', this.mediaState.toObject());

        socket.on('disconnect', () => {
            logInfo(`SocketIO client disconnected: ${socket.id}`);
        });
    }

    private onFastifyCreated() {
        
    }

    private onSocketIOCreated() {
        this.mediaSync = new MediaSyncService(
            this.io,
            this.foldersManager,
            this.mediaState
        );
    }

    private createServer() {

        logInfo("Creating server");

        this.app = Fastify();

        this.app.register(
            fastifyStatic,
            {
                root: Constants.PATHS.WEBSITE_FOLDER,
                prefix: '/'
            }
        );

        this.router.register(this.app);

        this.app.server.on('close', () => {
            this.__url = undefined;
            this.isRunning = false;
            this.events.emit('stopped');
            logInfo("Server stopped");
        });

        logInfo("Fastify created");
        this.onFastifyCreated();

        this.io = new SocketIoServer(
            this.app.server,
            {
                cors: {
                    origin: '*'
                }
            }
        );

        this.io.on('connection', (socket) => {
            logInfo(`SocketIO Client connected: ${socket.id}`);
            logInfo({
                id: socket.id,
                role: socket.handshake.auth.role,
                headers: socket.handshake.headers["user-agent"],
                url: socket.handshake.url,
                address: socket.handshake.address
            });

            this.onSocketConnected(socket);
        });

        logInfo("SocketIO created");
        this.onSocketIOCreated();
    }

    public async run(randomPort: boolean = false) {
        logInfo("Running server...");

        this.createServer();

        const PORT = DataManager.get<number>(GlobalConstants.SETTINGS_FIELDS.PORT, 3000);

        if (!randomPort) {
            logInfo(`Expected port: ${PORT}`);
        } else {
            logInfo("Trying with random port");
        }

        try {

            await this.app.listen({
                port: randomPort ? undefined : PORT,
                host: '0.0.0.0'
            });

            this.isRunning = true;
            logInfo("Server is listening");

            const usingAddress = this.app.server.address();
            const ip = getLocalIp();

            this.__url = undefined;

            if (ip && usingAddress && typeof usingAddress !== 'string') {
                this.__url = `http://${ip}:${usingAddress.port}`;
                logInfo(`URL: ${this.url}`);
            }

            this.events.emit('started');
            logInfo("Server started successfully.");
        } catch (err) {

            logError("Error when running server: ", err);

            if (!randomPort) {
                logInfo("Retrying with random port...");
                await this.run(true);
            }

            return;
        }
    }

    public async stop() {
        logInfo("Stopping server...");
        
        this.app.server.closeAllConnections();
        logInfo("All connections closed.");

        await this.io.close();
        logInfo("Socke.io server closed.");
        await this.app.close();
        logInfo("Fastify server closed.");
    }
}