import { useCallback, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client'
import { usePlaybackManagerContext } from '../context/PlaybackManagerContext';

export const useSocket = (role: string) => {

    const [socket, setSocket] = useState<Socket | null>(null);

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

        socket.on('disconnect', onClosed);
        socket.on('connect', onOpen);

        return () => {
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