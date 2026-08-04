import {useEffect, type RefObject } from "react"

export const useFullscreen = (elementRef: RefObject<HTMLElement|null>) => {
    const switchFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();                    
        } else {
            elementRef.current?.requestFullscreen();
        }
    }

    useEffect(()=>{
        const onKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() == 'f') {
                switchFullscreen();
            }
        }

        addEventListener('keypress', onKeyPress);

        return () => {
            removeEventListener('keypress', onKeyPress);
        }

    }, []); 
}