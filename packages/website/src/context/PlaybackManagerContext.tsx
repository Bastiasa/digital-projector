import { createContext, useContext, useMemo, useReducer } from 'react';
import { useObject } from '../hooks/useObject';
import { IS_DEVELOPMENT } from '../constants';
import { MockData } from '../mock';
import type { PlaybackData, UpdatePlaybackData } from '@digital-projector/shared';

export type PlaybackManagerContextType = {
    mediaData: PlaybackData;
    update: (data: UpdatePlaybackData) => void;
} & PlaybackData

export const PlaybackManagerContext = createContext<PlaybackManagerContextType | undefined>(undefined);

export const usePlaybackManagerContext = () => {
    const context = useContext(PlaybackManagerContext);
    if (context === undefined) {
        throw new Error('usePlaybackManagerContext must be used within a PlaybackManagerProvider');
    }
    return context;
};


interface PlaybackManagerProviderProps {
    children: React.ReactNode;
}


export function PlaybackManagerProvider({
    children,
}: PlaybackManagerProviderProps) {

    const { value: mediaData, set: update } = useObject<PlaybackData>({
        currentFileId: IS_DEVELOPMENT ? MockData.SELECTED_FILE_ID : "",
        currentTime: 0,
        pause: false,
        volume: 1,
        brightness: 1,
        saturation: 1,
        contrast: 1,
        blur: 0,

        opacity: 1
    });

    return (
        <PlaybackManagerContext.Provider value={{
            ...mediaData,
            mediaData,
            update
        }}>
            {children}
        </PlaybackManagerContext.Provider>
    );
}
