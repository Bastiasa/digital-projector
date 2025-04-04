const folderId = (new URL(location.href)).searchParams.get("id");
window.folderId = folderId;
window.folders = [{"folderId":folderId}];

if (!folderId) {
    window.location.assign("../");
} else {
    document.title += " "+folderId
}

const filesContainer = document.querySelector("#files-container");

// const foldersContainer = document.querySelector("main#folders-container");
const smoothEndElement = document.querySelector("#smooth-end");
const smoothStartElement = document.querySelector("#smooth-begin");

var smoothStart = false;
var smoothEnd = false;
var playing = false;

var currentMediaId = "";

setInterval(() => {
    if (playing) {
        currentTimeRange.value = parseFloat(currentTimeRange.value) + 1;

        if (document.activeElement !== currentTimeText) {
            syncronizeCurrentTimeRangeAndText();
        }

        if (parseFloat(currentTimeRange.max) - parseFloat(currentTimeRange.value) <= 0.001) {
            playing = false;
        }
    }
}, 1000);

smoothStartElement.addEventListener('click', () => {
    smoothStart = smoothStart == false;
    socketSendMessage('ss ' + smoothStart.toString());
    smoothStartElement.className = (smoothStart) ? "on" : "off";
});

smoothEndElement.addEventListener('click', () => {
    smoothEnd = smoothEnd == false;
    socketSendMessage('se ' + smoothEnd.toString()); 
    smoothEndElement.className = (smoothEnd) ? "on" : "off";
});


var filesList = [];

class FileElement {
    fileElement;
    fileImageElement;
    fileNameElement;
    fileId;

    filename;
    
    contentType = null;

    getContentURL() {
        return 'http://' + location.host + "/content?id=" + encodeURI(`${folderId}.${this.fileId}`); 
    }

    getMediaId() {
        return folderId.toString() + "." + this.fileId.toString()
    }

    async loadContent() {
        const contentURL = this.getContentURL();

        this.fileElement.addEventListener("click", () => {
            socketSendMessage("id " + this.getMediaId());
            setMediaId(this.getMediaId());

            const lastFile = document.querySelector(".file.current");

            if (lastFile != null && lastFile !== this.fileElement) {
                lastFile.classList.remove('current');
                this.fileElement.classList.add('current');
            }
        });

        const response = await fetch(contentURL, { method: "HEAD" });
        this.contentType = response.headers.get('content-type');

        if (!this.contentType) {
            return;
        }

        
        if (this.contentType.startsWith("video/")) {

            this.miniatureElement.remove();
            this.miniatureElement = createElement("video", "", ["file-image", "blurry", "filter-transition"], null, { src: contentURL });
            this.fileElement.insertBefore(this.miniatureElement, this.fileNameElement);

            this.miniatureElement.addEventListener('canplay', () => this.miniatureElement.classList.remove("blurry"));

        } else if (this.contentType.startsWith("image/")) {
            this.miniatureElement.src = contentURL
        } else {
            this.miniatureElement.remove();
            this.miniatureElement = createElement("div", "", ["audio-miniature-container"], null);
            createElement("img", "", [], this.miniatureElement, { src: "volume_up_white.svg" });
            
            this.fileElement.insertBefore(this.miniatureElement, this.fileNameElement);
        }
    }

    constructor(filename, parentElement = null) {
        this.filename = filename;
        this.fileElement = createElement("div", "", ["file"], parentElement);
        this.miniatureElement = createElement("img", "", ["file-image"], this.fileElement);
        this.fileNameElement = createElement("span", "", ["file-name"], this.fileElement, { textContent: filename });
    }
}


async function refreshFiles() {

    Array.from(filesContainer.children).forEach(element => { element.remove() });
    filesList = [];

    const placeholderSpinner = createElement("div", "", ["placeholder-spinner"], filesContainer);
    
    const response = await fetch("http://" + location.host + "/file_list?folder="+folderId);
    const text = await response.text();

    if (text.length < 1) {
        return;
    }

    placeholderSpinner.remove();
    const fileListText = text.split("\n");


    for (const filename of fileListText) {
        const newFile = new FileElement(filename, filesContainer);
        const fileId = filesList.push(newFile) - 1;
        newFile.fileId = fileId;
        newFile.loadContent();
    }

}

refreshFiles();

setLoadingPopup(true);

window.addEventListener("load", e => {
    addOnAttributesLoadedListener(attributes => {
        playing = attributes.playing;
        smoothStart = attributes.smoothBegin;
        smoothEnd = attributes.smoothEnd;
        const loop = attributes.loop;
        const currentTime = attributes.currentTime;
        const volume = attributes.effects.audio.volume;
        const mediaId = attributes.id;

        setMediaId(mediaId, false, false);
        setPlayButton(playing);

        volumeRangeInput.value = volume;

        currentTimeRange.max = currentTime * 2;
        currentTimeRange.value = currentTime;

        currentTimeText.value = toMinutesAndSeconds(currentTime);
        
        smoothEndElement.className = (smoothEnd) ? "on" : "off";
        smoothStartElement.className = (smoothStart) ? "on" : "off";

        setLoadingPopup(false);
    });


    connectSocket("admin");
});