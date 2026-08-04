import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";
import { useAdminSocket } from "../hooks/useAdminSocket";
import type { PlaybackManagerContextType } from "../../../context/PlaybackManagerContext";


type AdminContextType = {
    socket: Socket | null;
    syncUpdate: (data: Partial<Omit<PlaybackManagerContextType, 'set'>>) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {

    const { socket, syncUpdate } = useAdminSocket();

    return <AdminContext.Provider value={{ socket, syncUpdate }}>{children}</AdminContext.Provider>
}

export const useAdminContext = () => {
    const adminContext = useContext(AdminContext);

    if (!adminContext) {
        throw new Error('useAdminContext must be used within AdminProvider');
    }

    return adminContext;
}