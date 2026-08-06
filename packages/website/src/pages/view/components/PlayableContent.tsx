import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useViewerContext } from "../ViewerContext";
import { usePlaybackManagerContext } from "../../../context/PlaybackManagerContext";

export const PlayableContent = ({type}:{type:'audio'|'video'}) => {


    type HTMLPlayableElement = HTMLVideoElement|HTMLAudioElement;

    const {currentFileId, currentTime, pause, volume, update} = usePlaybackManagerContext();
    const {socket, remoteUpdate} = useViewerContext();

    const elementRef = useRef<HTMLPlayableElement>(null)

    const onlyIfExists = (action:(element:HTMLPlayableElement)=>(()=>void)|undefined) => {
        if (elementRef.current) {
            return action(elementRef.current);
        } else {
            console.warn("action cancelled because elementRef is null.\n", action);
        }
    }

    const source = `/file/${currentFileId}`

    useEffect(()=> {
        console.log("CURRENT SOURCE:", currentFileId);
    }, [currentFileId]);


    const remoteUpdateCurrentTime = (time: number) => remoteUpdate({currentTime: time});


    useEffect(()=>{
        return onlyIfExists(element=>{
            //@ts-ignore
            window.PLAYABLE_ELEMENT = element;

            if (pause) {
                element.pause();
                console.log("paused");

                remoteUpdateCurrentTime(element.currentTime);
            } else {
                element.play();

                console.log("playing");

                const interval = setInterval(()=> {
                    if (element.paused) {
                        return;
                    }

                    remoteUpdateCurrentTime(element.currentTime);
                }, 1000);

                return () => {
                    clearInterval(interval);
                }
            }

        });
    }, [pause, currentFileId, socket]);

    useEffect(()=>{
        onlyIfExists(element=>{
            element.currentTime = currentTime;
            console.log("CURRENT TIME SET TO ", currentTime);
        });
    }, [currentTime]);

    useEffect(()=>{
        onlyIfExists(element=>{
            element.volume = volume;
        })
    }, [volume]);

    const onVideoFinishedOrPaused = () => {
        remoteUpdate({
            pause: true,
            currentTime: elementRef.current?.currentTime
        });

        update({
            pause: true
        });

        console.log("pause sent");
    }

    const props = useMemo(() => ({
        className: "w-full h-full object-contain",
        key: currentFileId,
        controls: false,
        ref: elementRef as RefObject<any>,
        src: source,
        onEnded: onVideoFinishedOrPaused,
        onPause: onVideoFinishedOrPaused
    }), [currentFileId]);

    if (type == 'video') {
        return <video {...props}/>
    } else if (type == 'audio') {
        return <audio {...props}/>
    }
}