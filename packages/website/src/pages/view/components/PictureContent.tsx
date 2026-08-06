import { useEffect, useRef } from "react";
import { usePlaybackManagerContext } from "../../../context/PlaybackManagerContext";

export const PictureContent = () => {
    const { currentFileId } = usePlaybackManagerContext();
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imgRef.current) {
            return;
        }

        imgRef.current.src = `/file/${currentFileId}`;
    }, [currentFileId]);

    return <img
        ref={imgRef}
        className="w-full h-full object-contain"
        alt="" />;
};