import { Outlet } from "react-router-dom";
import { PlaybackManagerProvider } from "../../context/PlaybackManagerContext";
import { AdminProvider } from "./context/AdminContext";

export const AdminMount = () => {
    return (
        <PlaybackManagerProvider>
            <AdminProvider>
                <Outlet/>
            </AdminProvider>
        </PlaybackManagerProvider>
    );
}