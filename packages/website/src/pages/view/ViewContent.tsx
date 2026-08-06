import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { useQuery } from "@tanstack/react-query";
import { usePlaybackManagerContext } from "../../context/PlaybackManagerContext";
import { useViewerContext } from "./ViewerContext";
import { PictureContent } from "./components/PictureContent";
import { PlayableContent } from "./components/PlayableContent";


export function ViewContent() {
    const { currentFileId, blur, brightness, contrast, opacity, saturation } = usePlaybackManagerContext();

    const [contentType, setContentType] = useState<'picture' | 'video' | 'audio' | ''>("");

    const query = useQuery({
        queryKey: ['file', currentFileId],
        queryFn: () => fetch(`/file/${currentFileId}`, { method: "HEAD" }).then(res => {
            const contentType = res.headers.get("content-type");
            if (contentType?.startsWith("video")) {
                return "video";
            }
            if (contentType?.startsWith("image")) {
                return "picture";
            }
            if (contentType?.startsWith("audio")) {
                return "audio";
            }
            return "";
        }),
        enabled: !!currentFileId,
        gcTime: Infinity,
    });

    useEffect(() => {
        if (query.data) {
            setContentType(query.data);
        }
    }, [query.data]);


    let content = null;

    if (contentType === "picture") {
        content = <PictureContent />;
    }

    if (contentType === 'audio' || contentType === 'video') {
        content = <PlayableContent 
            key={contentType} 
            type={contentType}/>
    }
    

    return (
        <div
            style={{
                filter: `saturate(${saturation}) contrast(${contrast}) brightness(${brightness}) blur(${blur}px)`,
                opacity: opacity
            }}
            className="w-dvw h-dvh">
            {content}
        </div>
    );
}