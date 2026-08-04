
export type PlaybackData = {
    currentFileId: string | null;
    currentTime: number;

    pause: boolean;

    brightness: number;
    saturation: number;
    contrast: number;
    blur: number;
    opacity: number;

    volume: number;
}

export type UpdatePlaybackData = Partial<PlaybackData>;