import { usePlaybackManagerContext } from '../../../context/PlaybackManagerContext';
import { usePlaybackSocket } from '../../../hooks/usePlaybackSocket';

import { type UpdatePlaybackData } from '@digital-projector/shared';

export const useAdminSocket = () => {

    const { update } = usePlaybackManagerContext();
    const socket = usePlaybackSocket('admin');

    const syncUpdate = (data: UpdatePlaybackData) => {
        if (!socket) {
            return;
        }

        socket.emit("update", data);
        update(data);
        console.log("update sent to server: ", data);
    }

    return {
        socket,
        syncUpdate
    };
}