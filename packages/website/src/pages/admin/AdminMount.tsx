import { Outlet } from "react-router-dom";
import { PlaybackManagerProvider } from "../../context/PlaybackManagerContext";
import { AdminProvider } from "./context/AdminContext";
import { PlaybackPanel } from "./components/PlaybackPanel";

export const AdminMount = () => {
    return (
        <PlaybackManagerProvider>
            <AdminProvider>
                <Outlet/>

                <PlaybackPanel/>
            </AdminProvider>
        </PlaybackManagerProvider>
    );
}