const videoElement = document.createElement("video");
const imageElement = document.createElement("img");
const audioElement = document.createElement("audio");

const contentElement = document.querySelector("#content")

var currentElement = null;
var currentMediaId = "";

var smoothStart = false;
var smoothEnd = false;

var currentOpacityAnimation = null;
var currentVolume = 1;

var opacityAmount = 1;
var blurAmount = 0;
var brightnessAmount = 1;
var saturationAmount = 0;
var contrastAmount = 1;

var transform = {
    position: {
        x: 0,
        y: 0
    },

    rotation: 0,
    scale: 1
};

[videoElement, audioElement].forEach(elem => {
    ["pause", "ended"].forEach(eventName => {
        elem.addEventListener(eventName, e => {
            if (elem == currentElement) {
                playing = false;
                socketSendMessage("sp false");
            }
        });
    });

    elem.addEventListener("play", e => {
        if (elem == currentElement) {
            playing = true;
            socketSendMessage("sp true");
        }
    })
});

function updateImageEffects() {

    function op1(value) {
        return (value * 10) + 1
    }

    function op2(value) {
        let result = 0;

        if (value > 1) {
            result = (value - 1) * 30;
        } else {
            result = value;
        }

        return clamp(result, 0, 100);
    }


    [videoElement, imageElement].forEach(visualElement => {

        const renderedSize = getRenderedSize(visualElement);

        const x = transform.position.x * (contentElement.offsetWidth + renderedSize.renderedWidth * transform.scale) * .5;
        const y = transform.position.y * (contentElement.offsetHeight + renderedSize.renderedHeight * transform.scale) * .5;

        const filters = [
            `opacity(${clamp(opacityAmount, 0, 1)})`,
            `blur(${clamp(blurAmount * 13, 0, 100)}px)`,
            `brightness(${op2(brightnessAmount)})`,
            `saturate(${op2(saturationAmount)})`,
            `contrast(${op2(contrastAmount)})`
        ];

        const transformModifiers = [
            `scale(${transform.scale})`,
            `rotate(${transform.rotation}deg)`,
        ];

        visualElement.style.filter = filters.join(' ');
        visualElement.style.transform = transformModifiers.join(' ');

        visualElement.style.left = `${x}px`;
        visualElement.style.top = `${y}px`;
    });
}

window.addEventListener("resize", e => updateImageEffects());

var playing = false;
let currentFade = -1;

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(value, minimum));
}

/**
 * 
 * @param {(element:HTMLElement)=>void} action 
 */
function iterateMediaElements(action) {
    [videoElement, audioElement, imageElement].forEach(action);
}

function fadeVolume(playable, target = 1, limits = [0, 1], duration = 1.8, onFinish = null) {

    let velocity = (target - playable.volume) / duration * (1 / 60);
    let start = Date.now();

    if (currentFade != -1) {
        cancelAnimationFrame(currentFade);
        currentFade = -1;
    }

    const fadding = () => {
        if (playable instanceof HTMLVideoElement || playable instanceof HTMLAudioElement) {
            playable.volume = clamp(playable.volume + velocity, limits[0], limits[1]);

            if (Math.abs(target - playable.volume) > 0.001 || playable == limits[0] || playable == limits[1]) {
                currentFade = requestAnimationFrame(fadding);
            } else {
                playable.volume = target;
                let endTime = (Date.now() - start) / 1000;
                currentFade = -1;

                if (typeof onFinish == "function") {
                    onFinish(playable);
                }
            }
        }
    }
    
    currentFade = requestAnimationFrame(fadding);
}

function cancelCurrentOpacityAnimation() {
    if (currentOpacityAnimation instanceof Animation) {
        currentOpacityAnimation.cancel();
        currentOpacityAnimation = null;
    }
}

function opacityFade(element, to = 1, duration = 1.8) {

    let lastElementOpacity = getComputedStyle(element).opacity;
    cancelCurrentOpacityAnimation();

    const animation = element.animate(
        [
            { opacity: lastElementOpacity },
            { opacity: to.toString() }
        ],
        {
            "duration": duration * 1000
        }
    );

    animation.onfinish = () => {
        if (currentOpacityAnimation == animation) {
            element.style.opacity = to.toString();
            currentOpacityAnimation = null;
        }
    };

    currentOpacityAnimation = animation;
    animation.play();
}


imageElement.addEventListener('load', e => {

    instanceElement(e.target);

    if (smoothStart) {
        cancelCurrentOpacityAnimation();
        e.target.style.opacity = "0";
        opacityFade(e.target);
    } else {
        e.target.style.opacity = "1";
    }

    instanceElement(e.target);
    updateImageEffects();
});


function onCanPlayByOnce() {
    [videoElement, audioElement].forEach(playable => {
        // playable.addEventListener('play', e => {
        //     console.log("D");
            
        //     if (smoothStart) {
        //         fadeVolume(playable, currentVolume);

        //         if (playable instanceof HTMLVideoElement) {
        //             opacityFade(playable, 1);
        //         }

        //     } else {
        //         playable.style.opacity = "1";
        //         playable.volume = currentVolume;
        //     }
        // });

        playable.addEventListener('canplay', async e => {
            
            if (isVisual(playable)) {
                cancelCurrentOpacityAnimation();
                playable.style.opacity = "0";
            }

            playable.volume = 0;

            instanceElement(playable);
            await playOrPause();
        }, {once:true});
    });
}


function isVisual(element) {
    return element instanceof HTMLImageElement || element instanceof HTMLVideoElement;
}

function isPlayable(element) {
    return element instanceof HTMLMediaElement;
}

function instanceElement(element = null) {
    currentElement = element;
    iterateMediaElements((el) => el.remove());

    if (element != null) {
        contentElement.appendChild(element);
    }    
}


async function playOrPause() {
    if (!currentElement instanceof HTMLMediaElement || currentElement == null){
        return
    }

    if (!playing) {
        if (!smoothEnd) {
            await currentElement.pause();

            if (isVisual(currentElement)) {
                opacityFade(currentElement, 1, 0);
            }
        } else {
            fadeVolume(currentElement, 0, [0, 1], 1.8, async e=>{await currentElement.pause()});
            
            if (isVisual(currentElement)) {
                opacityFade(currentElement, 0);
            }
        }
    } else if (playing) {

        await currentElement.play();

        if (smoothStart) {
            fadeVolume(currentElement, currentVolume);
            if (isVisual(currentElement)) {
                opacityFade(currentElement);
            }
        } else {
            if (isVisual(currentElement)) {
                opacityFade(currentElement,1,0);
            }

            if (currentFade != -1) {
                cancelAnimationFrame(currentFade);
                currentFade = -1;
            }

            if (isPlayable(currentElement)) {
                currentElement.volume = currentVolume;
            }
        }
    }
}

function restrainAllElements() {
    iterateMediaElements(el => el.src = "");
}

let mediaVersion = parseFloat(localStorage.getItem("mediaVersion")) || 0;

async function setCurrentMedia(id = currentMediaId) {

    instanceElement();
    restrainAllElements();

    currentMediaId = id;

    if (id.length <= 0) {
        return;
    }

    mediaVersion += 0.1;
    localStorage.setItem("mediaVersion", mediaVersion.toString());

    const mediaUrl = "/content?id=" + encodeURIComponent(id) + "&v=" + encodeURIComponent(mediaVersion.toString());
    const request = await fetch(mediaUrl, { method: "HEAD" }); 
    const mimeType = request.headers.get('content-type');

    if (!request.ok || mimeType === null) {
        currentMediaId = "";
        return;
    }

    switch (mimeType.split('/')[0]) {
        case 'image':
            imageElement.src = mediaUrl;
            break;
        
        case 'video':
            onCanPlayByOnce();
            videoElement.src = mediaUrl;
            break;
        case 'audio':
            onCanPlayByOnce();
            audioElement.src = mediaUrl;
            break;
    }
}


setInterval(() => {
    if (playing && isPlayable(currentElement) && !currentElement.ended) {
        window.socketSendMessage("st " + currentElement.currentTime.toString());
    }
}, 1000);

/**@type {Array<{"prefix":string, "type":"number"|"string"|"boolean", "onChanged":(newValue:any)=>void}>} */
const attributeReceptors = [];

/**
 * 
 * @param {string} prefix 
 * @param {'number'|'boolean'|'string'} type 
 * @param {(newValue:any)=>void} onChanged 
 * @returns {number}
 */
function addAttributeReceptor(prefix, type, onChanged) {
    return attributeReceptors.push({
        "prefix": prefix,
        "type": type,
        "onChanged": onChanged
    });
}

addAttributeReceptor("id ", "string", setCurrentMedia);
addAttributeReceptor("t ", "number", newValue => { if (isPlayable(currentElement)) { currentElement.currentTime = newValue; playing = true; playOrPause() } });
addAttributeReceptor("ss ", "boolean", newValue => smoothStart = newValue);
addAttributeReceptor("se ", "boolean", newValue => smoothEnd = newValue);
addAttributeReceptor("p ", "boolean", newValue => { playing = newValue;  playOrPause()});
addAttributeReceptor("v ", "number", newValue => {
    if (currentFade != -1) {
        cancelAnimationFrame(currentFade);
        currentFade = -1;
    }

    currentVolume = newValue;
    videoElement.volume = currentVolume;
    audioElement.volume = currentVolume;
});

addAttributeReceptor("scal ", "number", newValue => {transform.scale = newValue; updateImageEffects(); });
addAttributeReceptor("rota ", "number", newValue => {transform.rotation = newValue; updateImageEffects(); });
addAttributeReceptor("posx ", "number", newValue => {transform.position.x = newValue; updateImageEffects(); });
addAttributeReceptor("posy ", "number", newValue => {transform.position.y = newValue; updateImageEffects(); });

addAttributeReceptor("opac ", "number", newValue => { opacityAmount = newValue; updateImageEffects(); });
addAttributeReceptor("blur ", "number", newValue => { blurAmount = newValue; updateImageEffects(); });
addAttributeReceptor("brig ", "number", newValue => { brightnessAmount = newValue; updateImageEffects(); });
addAttributeReceptor("satu ", "number", newValue => { saturationAmount = newValue; updateImageEffects(); });
addAttributeReceptor("cont ", "number", newValue => { contrastAmount = newValue; updateImageEffects(); });

window.addEventListener('load', e => {
    window.connectSocket('viewer');

    addOnAttributesLoadedListener(attributes => {
        playing = attributes.playing;
        smoothStart = attributes.smoothBegin;
        smoothEnd = attributes.smoothEnd;

        const loop = attributes.loop;
        const currentTime = attributes.currentTime;
        const mediaId = attributes.id;

        currentVolume = attributes.effects.audio.volume;

        audioElement.autoplay = false;
        videoElement.autoplay = false;

        audioElement.volume = currentVolume;
        videoElement.volume = currentVolume;

        audioElement.currentTime = currentTime;
        videoElement.currentTime = currentTime;

        audioElement.loop = loop;
        videoElement.loop = loop;

        opacityAmount = attributes.effects.image.opacity;
        brightnessAmount = attributes.effects.image.brightness;
        saturationAmount = attributes.effects.image.saturation;
        blurAmount = attributes.effects.image.blur;

        transform = attributes.effects.transform

        updateImageEffects();
        setCurrentMedia(mediaId);
        playOrPause();
    });

    addOnSocketMessageReceivedListener(e => {
        const stringContent = typeof e.data == "string"
            ? e.data
            : "";

        attributeReceptors.forEach(receptor => {
            if (stringContent.startsWith(receptor.prefix)) {
                let value = stringContent.substring(receptor.prefix.length);
                
                switch (receptor.type) {
                    case "number":
                        value = parseFloat(value, 10);
                        if (!isNaN(value) && isFinite(value)) {
                            receptor.onChanged(value);
                        }
                        break;
                    
                    case "boolean":
                        value = value == "true";
                        receptor.onChanged(value);
                        break;
                    
                    case "string":
                        receptor.onChanged(value);
                        break;
                
                    default:
                        break;
                }
            }
        });
    });
});

addEveryFrameAction(time => {
    if (isPlayable(currentElement) && smoothEnd) {
        const difference = currentElement.duration - currentElement.currentTime;

        if (difference <= 1.8 && currentFade == -1) {
            fadeVolume(currentElement, 0);
            
            if (currentOpacityAnimation == null && isVisual(currentElement)) {
                opacityFade(currentElement, 0);
            }
        }
    }
});
