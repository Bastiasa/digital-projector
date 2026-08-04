import { ipcMain } from "electron"

export const handleMethod = <MethodName extends keyof ApplicationBridge>(name:MethodName, handler: ApplicationBridge[MethodName]) => {
    return ipcMain.handle(name, (event, ...args:any[]) => {
        return (handler as (...args:any)=>void)(...args);
    });
}