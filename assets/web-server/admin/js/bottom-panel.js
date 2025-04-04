const bottomPanel = document.querySelector("#bottom-panel");
const currentMediaInfoContainer = document.querySelector("#current-media-info-container");
const currentMediaName = document.querySelector("#current-media-name");
const closeCurrentMediaButton = document.querySelector("#quit-current-media-button");

const currentTimeText = document.querySelector("#current-time-text");
const durationText = document.querySelector("#duration-text");
const playButton = document.querySelector("#play-button");

const volumeRangeInput = document.querySelector("#volume-range-input");
const currentTimeRange = document.querySelector("#current-time-range-input");

window.volumeRanges.push(volumeRangeInput);

function syncronizeCurrentTimeRangeAndText() {
    currentTimeText.value = toMinutesAndSeconds(parseFloat(currentTimeRange.value));
}

function setPlayButton(_playing) {
    playButton.src = (_playing) ? '/icons/pause.svg' : '/icons/play_arrow.svg';
}

playButton.addEventListener('click', () => {
    playing = playing == false;
    window.socketSendMessage("p " + playing.toString());
    // setPlayButton(playing);
});

currentTimeText.addEventListener('change', () => {
    const newValue = currentTimeText.value;
    const splitted = newValue.split(":");

    if (splitted.length < 2) {
        return;
    }

    let minutes = parseInt(splitted[0], 10);
    let seconds = parseInt(splitted[1], 10);

    if (isNaN(seconds) || isNaN(minutes)) {
        return;
    }

    seconds += minutes * 60

    const currentTime = Math.min(parseFloat(currentTimeRange.max), seconds);
    window.socketSendMessage("t " + currentTime.toString());
    playing = true;
    setPlayButton(true);
    currentTimeRange.value = seconds.toString();

    currentTimeText.blur();
});

currentTimeRange.addEventListener('input', syncronizeCurrentTimeRangeAndText);

currentTimeRange.addEventListener("change", () => {
    window.socketSendMessage("t " + currentTimeRange.value);
    playing = true;
    setPlayButton(true);
    syncronizeCurrentTimeRangeAndText();
});

closeCurrentMediaButton.addEventListener("click", () => {
    window.socketSendMessage("id ");
    setMediaId("");
});

volumeRangeInput.addEventListener("input", () => {
    window.socketSendMessage('v ' + volumeRangeInput.value);
    window.volumeRanges.forEach(range => range.value = volumeRangeInput.value);
});


async function nextButton() {
    if (currentMediaId.length <= 0) {
        window.socketSendMessage("id 0.0");
        setMediaId("0.0");
        return;
    }

    const folderId = currentMediaId.split(".")[0];
    const files = await getFilesInFolder(folderId);
    let fileId = parseInt(currentMediaId.split('.')[1], 10) - 1;

    if (fileId <= -1) {
        fileId = files.length - 1;
    }

    const newMediaId = folderId + "." + fileId.toString();
    window.socketSendMessage("id " + newMediaId);
    setMediaId(newMediaId);
}

async function prevButton() {
    if (currentMediaId.length <= 0) {
        window.socketSendMessage("id 0.0");
        setMediaId("0.0");
        return;
    }

    if (currentMediaId.length <= 0) {
        window.socketSendMessage("id 0.0");
        setMediaId("0.0");
    }

    const folderId = currentMediaId.split(".")[0];
    const files = await getFilesInFolder(folderId);
    let fileId = parseInt(currentMediaId.split('.')[1], 10) + 1;

    if (fileId >= files.length) {
        fileId = 0;
    }

    const newMediaId = folderId + "." + fileId.toString();
    window.socketSendMessage("id " + newMediaId);
    setMediaId(newMediaId);
}

async function setMediaId(mediaId, resetCurrentTime = true, resetPlaying = true) {

    currentMediaId = mediaId;

    console.log(mediaId);
    

    function cleanCurrentMedia() {
        playing = false;

        currentTimeRange.max = 0;
        currentTimeRange.disabled = true;
        playButton.classList.add('disabled');

        currentTimeText.value = "00:00";
        durationText.textContent = "/ 00:00";

        hide(currentMediaInfoContainer);
        setPlayButton(false);
    }

    cleanCurrentMedia();

    if (mediaId.length >= 1) {
        const url = "/content?id=" + encodeURIComponent(mediaId)
        const headRequest = await fetch(url, { method: "HEAD" , "cache":"no-cache"});   
        const contentType = headRequest.headers.get('content-type');
        const fileName = decodeURIComponent(headRequest.headers.get('name') || "") || null;

        if (!headRequest.ok) {
            mediaId = "";
            cleanCurrentMedia();
            return;
        }

        show(currentMediaInfoContainer);
        currentMediaName.textContent = fileName;

        if (contentType.startsWith("video") || contentType.startsWith("audio")) {
            const tmpVideoElement = createElement("video", null, null, document.body, { style: "display:none;" });

            tmpVideoElement.onloadeddata = e => {
                durationText.textContent = "/ " + toMinutesAndSeconds(tmpVideoElement.duration);
                
                if (resetCurrentTime) {
                    currentTimeRange.value = 0;
                }

                if (resetPlaying) {
                    playing = true;
                    setPlayButton(true);
                }
                
                currentTimeRange.max = tmpVideoElement.duration;
                currentTimeRange.disabled = false;
                
                volumeRangeInput.disabled = false;
                playButton.classList.remove('disabled');

                tmpVideoElement.remove();
            }

            tmpVideoElement.src = url;

        } else {
            currentTimeRange.max = 0;
            currentTimeRange.disabled = true;

            currentTimeText.value = "00:00";
            durationText.textContent = "/ 00:00";
            playButton.classList.add('disabled');

            setPlayButton(false);
        }
    }

}

function updateVolumeIcon() {
    const volumeIcon = document.querySelector('#volume-icon');
    const volume = parseFloat(volumeRangeInput.value);

    const mute = "/icons/volume_mute.svg";
    const down = "/icons/volume_down.svg";
    const up = "/icons/volume_up.svg";

    if (volume < 1 / 3) {

        if (volumeIcon.getAttribute('src') != mute) {
            volumeIcon.src = mute;
        }
    } else if (volume > 1 / 3 && volume < (1 / 3) * 2) {
        if (volumeIcon.getAttribute('src') != down) {
            volumeIcon.src = down;
        }
    } else {
        if (volumeIcon.getAttribute('src') != up) {
            volumeIcon.src = up;
        }
    }
}

addEveryFrameAction(e => {
    if (document.activeElement !== currentTimeText) {
        syncronizeCurrentTimeRangeAndText();
    }

    updateVolumeIcon();
});

/**
 * @type {Array<BottomPanelPropertyCallback>}
 */
const bottomPanelPropertyCallbacks = [];

class BottomPanelPropertyCallback {
    
    /**
     * 
     * @param {string} prefix 
     * @param {'string'|'number'|'boolean'} type 
     * @param {(newValue:string|number|boolean)=>void} onChanged 
     */
    constructor(prefix, type, onChanged) {
        this.prefix = prefix;
        this.type = type;
        this.onChanged = onChanged;

        bottomPanelPropertyCallbacks.push(this);
    }
}

new BottomPanelPropertyCallback("id ", "string", setMediaId);
new BottomPanelPropertyCallback("t ", 'number', newValue => currentTimeRange.value = newValue);
new BottomPanelPropertyCallback("st ", 'number', newValue => currentTimeRange.value = newValue);
new BottomPanelPropertyCallback("v ", 'number', newValue => volumeRangeInput.value = newValue.toString());
new BottomPanelPropertyCallback("ss ", 'boolean', newValue => smoothStart = newValue);
new BottomPanelPropertyCallback("se ", 'boolean', newValue => smoothEnd = newValue);
new BottomPanelPropertyCallback("p ", 'boolean', newValue => { playing = newValue; setPlayButton(newValue)});
new BottomPanelPropertyCallback("sp ", 'boolean', newValue => { playing = newValue; setPlayButton(newValue)});

window.addEventListener('load', e => {
    addOnSocketMessageReceivedListener(e => {
        const stringContent = typeof e.data == "string"
            ? e.data
            : "";
        
        
        let ended = false;

        bottomPanelPropertyCallbacks.forEach(callback => {

            if (ended) {
                return;
            }

            if (stringContent.startsWith(callback.prefix)) {
                console.log(callback);
                
                let newValue = stringContent.substring(callback.prefix.length);
                ended = true;

                switch (callback.type) {
                    case 'number':

                        newValue = parseFloat(newValue);

                        if (!isNaN(newValue) && isFinite(newValue)) {
                            callback.onChanged(newValue);
                        }
                        
                        break;
                
                    case 'boolean':

                        callback.onChanged(newValue == "true");

                        break;
                        
                    case 'string':
                        callback.onChanged(newValue);
                        
                        break;
                    
                }

            }
        });
    });
})