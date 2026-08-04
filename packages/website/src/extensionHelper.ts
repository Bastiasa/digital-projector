export const extensionIsVideo = (ext: string) => {
    return ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'flv'].includes(ext.toLowerCase());
}

export const extensionIsImage = (ext: string) => {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'].includes(ext.toLowerCase());
}

export const extensionIsAudio = (ext: string) => {
    return ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'].includes(ext.toLowerCase());
}