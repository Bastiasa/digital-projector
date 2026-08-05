import { useEffect } from "react";
import { useSocket } from "./useSocket"
import { usePlaybackManagerContext } from "../context/PlaybackManagerContext";
import type { UpdatePlaybackData } from "@digital-projector/shared";

export const usePlaybackSocket = (role:'admin'|'viewer') => {
    const socket = useSocket(role);
    const {update} = usePlaybackManagerContext();

    const onUpdate = (data:UpdatePlaybackData) => {
        console.log("update received from server: ", data);
        update(data);
    }

    useEffect(()=>{

        if (!socket) {
            return;
        }

        socket.on('update', onUpdate);

        return () => {
            socket.off('update', onUpdate);
        }
    }, [socket]);


    return socket;
}