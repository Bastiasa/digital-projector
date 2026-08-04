import { ipcRenderer } from "electron";

export const invoke = <MethodName extends keyof ApplicationBridge>(name: MethodName, ...args:Parameters<ApplicationBridge[MethodName]>) => {
    return ipcRenderer.invoke(name, ...args);
}