
import log from 'electron-log';

export const createLogger = (tag: string) => ({
    
    logError(...params:any[]) {
        log.error(`${performance.now()}\t\x1b[34m[${tag}]\x1b[0m:\t`, ...params);
    },

    logInfo(...params:any[]) {
        log.info(`${performance.now()}\t\x1b[34m[${tag}]\x1b[0m:\t`, ...params);
    },

    logWarn(...params:any[]) {
        log.warn(`${performance.now()}\t\x1b[34m[${tag}]\x1b[0m:\t`, ...params);
    }

});