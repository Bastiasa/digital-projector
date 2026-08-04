import { useCallback, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client'
import { usePlaybackManagerContext } from '../context/PlaybackManagerContext';

export const useSocket = (role: 'admin' | 'viewer') => {



    const [socket, setSocket] = useState<Socket | null>(null);
    const { update } = usePlaybackManagerContext();

    const connectSocket = useCallback(() => {

        setSocket(prevSocket => {
            if (prevSocket) {
                prevSocket.disconnect();
            }

            return io(window.origin, {
                auth: {
                    role
                },
            });
        });
    }, []);

    const onUpdate = (data: any) => {
        update(data);
        console.log("update from server: ", data);
    }

    const onClosed = () => {
        console.log("socket closed");
    }

    const onOpen = () => {
        console.log("socket opened");
    }

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('update', onUpdate);
        socket.on('disconnect', onClosed);
        socket.on('connect', onOpen);

        return () => {
            socket.off('update', onUpdate);
            socket.off('disconnect', onClosed);
            socket.off('connect', onOpen);
            socket.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        connectSocket();
    }, []);


    return socket;
}