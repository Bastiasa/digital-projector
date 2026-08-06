import { useEffect, useRef, useState } from "react"

export const useMediaDuration = (src:string)=>{

    const [duration, setDuration] = useState<number>(NaN);
    const audioElementRef = useRef(new Audio());
    const audio = audioElementRef.current;

    useEffect(()=> {

        //@ts-ignore
        window.DURATION_CHECKER = audio;

        audio.volume = 0;
        audio.muted = true;
        audio.style.display = "none";

        document.body.appendChild(audio);

        return () => {
            audio.remove();
        }
    }, []);

    useEffect(()=>{

        
        const updateDuration = () => setDuration(audio.duration);

        const updateInterval = setInterval(()=>{

            audio.currentTime = (audio.duration * 2) || audio.currentTime;

            if (audio.paused) {
                audio.play();
            }

            updateDuration();

        }, 1000);

        audio.addEventListener('loadedmetadata', updateDuration);

        audio.src = src;

        return () => {
            audio.removeEventListener('loadedmetadata', updateDuration);
            clearInterval(updateInterval);
            audio.src = "";
        }

    }, [src]);

    return duration;
}