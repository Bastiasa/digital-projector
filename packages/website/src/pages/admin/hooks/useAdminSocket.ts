import { usePlaybackManagerContext, type PlaybackManagerContextType } from '../../../context/PlaybackManagerContext';
import { useSocket } from '../../../hooks/useSocket';

import { type UpdatePlaybackData } from '@digital-projector/shared';

export const useAdminSocket = () => {

    const { update } = usePlaybackManagerContext();
    const socket = useSocket('admin');

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