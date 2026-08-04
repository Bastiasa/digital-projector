import type { PlaybackData, UpdatePlaybackData } from "@digital-projector/shared";

export class MediaStatePlayback {

    private mediaData: PlaybackData = {
        currentFileId: null,
        currentTime: 0,
        pause: false,
        brightness: 1,
        saturation: 1,
        contrast: 1,
        blur: 0,
        opacity: 1,
        volume: 1
    }

    update(data: UpdatePlaybackData) {
        this.mediaData = {
            ...this.mediaData,
            ...data
        };
    }

    toObject() {
        return {
            ...this.mediaData
        };
    }

    getData() {
        return this.mediaData;
    }
}