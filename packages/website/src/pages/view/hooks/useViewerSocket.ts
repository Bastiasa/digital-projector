import { usePlaybackManagerContext } from "../../../context/PlaybackManagerContext";
import { usePlaybackSocket } from "../../../hooks/usePlaybackSocket";

type ViewerSyncSetData = {
    currentTime?:number;
    pause?: boolean;
}

export const useViewerSocket = () => {

    const {update} = usePlaybackManagerContext();
    const socket = usePlaybackSocket('viewer');


    const remoteUpdate = (data:ViewerSyncSetData) => {
        socket?.emit('update', data);
    }

    const syncUpdate = (data: ViewerSyncSetData)=> {
        update(data);
        remoteUpdate(data);
    }

    return {
        socket,
        syncUpdate,
        remoteUpdate
    }

}