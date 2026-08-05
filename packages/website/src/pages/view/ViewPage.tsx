import { useEffect, useRef } from "react";
import { useFullscreen } from "./hooks/useFullscreen";
import { ViewContent } from "./ViewContent";
import { PlaybackManagerProvider } from "../../context/PlaybackManagerContext";
import PageTitle from "../../components/PageTitle";
import { ViewerProvider } from "./ViewerContext";

export default function ViewPage() {

    const containerRef = useRef<HTMLDivElement>(null);

    useFullscreen(containerRef);

    return (


        <PlaybackManagerProvider>
            <ViewerProvider>
                <PageTitle>Digital Projector | Viewer</PageTitle>

                <div
                    ref={containerRef}
                    className="w-dvw h-dvh bg-black">
                    <ViewContent />
                </div>
            </ViewerProvider>
        </PlaybackManagerProvider>
    );
}