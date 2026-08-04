export {};

declare global {

    interface BridgeEvents {
        'rc-server-started': [url: string];
        'rc-server-stopped': [];
    }

    interface ApplicationBridge {

        getServerState(): Promise<{
            state:boolean,
            url?:string
        }>;

        runRcServer(): void;
        stopRcServer(): void;
        shellOpen(url:string): void;


        fetchMultimediaFolders(): Promise<Map<number, string>>;
        pickMultimediaFolder(): Promise<{id:number, folder:string}|undefined>;
        deleteMultimediaFolder(id:number): void;

        getData<T>(value:string, dflt: T) : Promise< T|null>;
        setFields(fields:Record<string, any>): void;
    }

    interface Window {
        app: ApplicationBridge;
        events: {
            subscribe<EventName extends keyof BridgeEvents>(eventName: EventName, callback:(...args:BridgeEvents[EventName])=>void): ()=>void
        };
    }
}