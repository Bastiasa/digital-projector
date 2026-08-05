import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { useQuery } from "@tanstack/react-query";
import { usePlaybackManagerContext } from "../../context/PlaybackManagerContext";
import { useViewerContext } from "./ViewerContext";



const PictureContent = () => {
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

const PlayableContent = ({type}:{type:'audio'|'video'}) => {


    type HTMLPlayableElement = HTMLVideoElement|HTMLAudioElement;

    const {currentFileId, currentTime, pause, volume} = usePlaybackManagerContext();
    const {socket, remoteUpdate} = useViewerContext();

    const elementRef = useRef<HTMLPlayableElement>(null)

    const onlyIfExists = (action:(element:HTMLPlayableElement)=>(()=>void)|undefined) => {
        if (elementRef.current) {
            return action(elementRef.current);
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
                remoteUpdateCurrentTime(element.currentTime);

            } else {
                element.play();

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
        });
    }, [currentTime]);

    useEffect(()=>{
        onlyIfExists(element=>{
            element.volume = volume;
        })
    }, [volume]);

    useEffect(()=>{


        return onlyIfExists(element=>{
            

            const sendPaused = ()=>{
                remoteUpdate({pause:true});
            }

            const onLoadError = () =>{ 
                element.load();
            }

            const events = ["pause", "ended"];

            element.addEventListener('error', onLoadError);
            events.forEach(eventName => element.addEventListener(eventName, sendPaused));
            return ()=>{
                element.removeEventListener('error', onLoadError);
                events.forEach(eventName => element.removeEventListener(eventName, sendPaused));
            }
        })

    }, [type]);

    const props = useMemo(() => ({
        className: "w-full h-full object-contain",
        key: currentFileId,
        controls: false,
        ref: elementRef as RefObject<any>,
        src: source
    }), [currentFileId]);

    if (type == 'video') {
        return <video {...props}/>
    } else if (type == 'audio') {
        return <audio {...props}/>
    }
}

//#region Old players
/*const AudioContent = ({socket}: {socket:Socket|null}) => {
    const { currentFileId, currentTime, pause, volume } = usePlaybackManagerContext();
    const audioRef = useRef<HTMLAudioElement>(null);

    const onlyIfExists = (action:(audioElement:HTMLAudioElement)=>((()=>void)|undefined)) => {

        if (!audioRef.current) {
            return;
        }

        return action(audioRef.current);
    }

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (pause) {
            audioRef.current.pause();
            socket?.emit('update', {
                currentTime: audioRef.current.currentTime
            });
        } else {
            audioRef.current.play();

            const interval = setInterval(() => {
                if (audioRef.current!.paused) {
                    return;
                }
                socket?.emit('update', {
                    currentTime: audioRef.current?.currentTime
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [pause, currentFileId, socket]);

    useEffect(()=>{
        onlyIfExists(audio=>{
            audio.volume = volume;
        })
    }, [volume])

    useEffect(()=>{
        onlyIfExists(audio=>{
            audio.currentTime = currentTime;
        })
    }, [currentTime]);

    useEffect(()=>{
        return onlyIfExists(audio=>{
            const sendPause = ()=>{
                socket?.emit('update', {pause: true, currentTime: audio.duration});
            }
            audio.addEventListener('ended', sendPause);

            return () => {
                audio.removeEventListener('ended', sendPause);
            }
        });
    }, [])

    return <audio
        src={`/file/${currentFileId}`}
        ref={audioRef}
        className="w-full h-full object-contain"
        controls={false} />;
};
const VideoContent = ({ socket }: { socket: Socket | null }) => {

    const { currentFileId, currentTime, pause, volume } = usePlaybackManagerContext();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }

        if (pause) {
            videoRef.current.pause();
            socket?.emit('update', {
                currentTime: videoRef.current.currentTime
            });
        } else {
            videoRef.current.play();

            const interval = setInterval(() => {
                if (videoRef.current!.paused) {
                    return;
                }
                socket?.emit('update', {
                    currentTime: videoRef.current?.currentTime
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [pause, currentFileId, socket]);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }

        videoRef.current.currentTime = currentTime;
    }, [currentTime]);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }

        videoRef.current.volume = volume;
    }, [volume]);


    return <video
        key={currentFileId}
        src={`/file/${currentFileId}`}
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={false}>
    </video>
}*/
//#endregion 

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
        content = <PlayableContent key={contentType} type={contentType}/>
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