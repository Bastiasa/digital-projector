const foldersContainer = document.querySelector("main#folders-container");
const smoothEndElement = document.querySelector("#smooth-end");
const smoothStartElement = document.querySelector("#smooth-begin");


let smoothStart = false;
let smoothEnd = false;
let playing = false;

let currentMediaId = "";


smoothStartElement.addEventListener('click', () => {
    smoothStart = smoothStart == false;
    window.socketSendMessage('ss ' + smoothStart.toString());
    smoothStartElement.className = (smoothStart) ? "on" : "off";
});

smoothEndElement.addEventListener('click', () => {
    smoothEnd = smoothEnd == false;
    window.socketSendMessage('se ' + smoothEnd.toString()); 
    smoothEndElement.className = (smoothEnd) ? "on" : "off";
});

var foldersList = [];

class Folder {

    folderId;

    folderElement;
    folderName;
    folderArrow;

    expanded = false;
    loading = false;

    fileList = [];

    async loadFolderFiles(expand = true) {
        const response = await fetch("../file_list?folder="+encodeURIComponent(this.folderId), { 'cache': 'no-cache'});
        const responseText = await response.text();

        const filesList = responseText.split("\n");

        this.fileList.forEach(fileElement => fileElement.remove());
        this.fileList = [];

        const filesNames = [];

        for (let fileIndex = filesList.length - 1; fileIndex >= 0; fileIndex--) {//const filename of filesList) {

            const filename = filesList[fileIndex];

            if (filename.length < 1) {
                continue;
            }

            filesNames.push(filename);
            
            if (!expand) {
                continue;
            }

            const fileElement = createElement("div", "", ["file"]);
            const fileNameElement = createElement("span", "", ["file-name-element"], fileElement, { textContent: filename });
            const fileId = fileIndex;
            
            this.fileList.push(fileElement)

            fileNameElement.addEventListener("click", () => {
                const newMediaId = this.folderId.toString() + "." + fileId.toString();
                window.socketSendMessage("id " + newMediaId);
                playing = true;
                setPlayButton(true);
                setMediaId(newMediaId);
            });


            if (this.folderElement.parentElement instanceof HTMLElement) {
                const parent = this.folderElement.parentElement;
                const selfIndex = Array.from(parent.children).indexOf(this.folderElement);

                if (parent.children.item(selfIndex + 1)) {
                    parent.insertBefore(fileElement, parent.children.item(selfIndex + 1));
                } else {
                    parent.appendChild(fileElement);
                }
            }
        }

        return filesNames;
    }

    onExpandButtonPressed(event) {
        if (this.loading) {
            return
        }

        this.loading = true;

        if (this.folderArrow.classList.contains("active")) {
            this.folderArrow.classList.remove("active");
        } else {
            this.folderArrow.classList.add("active");
        }

        this.expanded = this.expanded == false;

        if (!this.expanded) {
            this.fileList.forEach(element => element.remove());
            this.fileList = [];

            this.loading = false;
            return;
        }

        if (this.folderElement.parentElement != null) {
            const placeholderBelow = createElement("div", "", ["placeholder-container"]);
            createElement("div", "", ["placeholder-spinner"], placeholderBelow);

            const parent = this.folderElement.parentElement;
            const children = Array.from(parent.children);
            const selfIndex = children.indexOf(this.folderElement);

            if (parent.children.item(selfIndex + 1) != null) {
                parent.insertBefore(placeholderBelow, parent.children[selfIndex + 1])
            } else {
                parent.appendChild(placeholderBelow);
            }

            this.loadFolderFiles().then(result => {
                this.loading = false;
                placeholderBelow.remove();
                
                if (this.fileList.length < 1) {

                    setTimeout(() => {
                        this.folderArrow.classList.remove('active');
                        this.expanded = false;
                    }, 200);

                }
            });
        } else {
            this.loading = false;
            placeholderBelow.remove();
        }


    }

    constructor(folderPath, parent = null, useCompletePath = true) {
        this.folderPath = folderPath;

        if (!useCompletePath) {
            folderPath = folderPath.split("/")
            folderPath = folderPath[folderPath.length - 1];
        }

        const newFolder = createElement("div", "", ["folder"], foldersContainer)
        const newFolderName = createElement("a", "", ["folder-name"], newFolder, { textContent: folderPath });
        const newFolderArrow = createElement("img", "", ["folder-arrow"], newFolder, { src:'/icons/keyboard_arrow_down.svg'}); 
        
        this.folderElement = newFolder;
        this.folderName = newFolderName;
        this.folderArrow = newFolderArrow;

        this.folderName.addEventListener("click", () => {
            window.location.assign("folder/?id="+encodeURI(this.folderId));
        })

        if (parent instanceof HTMLElement) {
            parent.appendChild(newFolder);
        }

        newFolderArrow.onclick = this.onExpandButtonPressed.bind(this);
    }
}

var completePath = localStorage.getItem("completePath") != "false";
var updating = false;


async function updateFolders() {
    if (updating) {
        return;
    }

    updating = true;

    Array.from(foldersContainer.children).forEach(child => child.remove());
    foldersList = [];

    const placeholderSpinner = createElement("div", "", ["placeholder-spinner"], foldersContainer);

    const response = await fetch("../folder_list", { cache: "no-cache" });
    const responseText = await response.text()
    const foldersPathsList = responseText.split("\n").filter((elemnt, index) => elemnt.length >= 1);

    placeholderSpinner.remove();

    for (const folderPath of foldersPathsList) {
        const newFolder = new Folder(lastIndex(folderPath, '\\'), foldersContainer, completePath);
        const folderId = foldersList.push(newFolder) - 1;
        newFolder.folderId = folderId;
    }

    if (foldersList.length < 1) {
        createElement("span", "there-is-nothing", [], foldersContainer, {textContent:"No hay ninguna carpeta seleccionada. Vaya a la aplicación y seleccione una carpeta."})
    }

    window.folders = foldersList;

    updating = false;
}

updateFolders();
document.querySelector("#refresh_folders_button").onclick = updateFolders;

setLoadingPopup(true);

addEveryFrameAction(time => { 
    foldersContainer.style.marginBottom = `${bottomPanel.clientHeight}px`;
});

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
        setPlayButton(!playing);

        volumeRangeInput.value = volume;

        currentTimeRange.max = currentTime * 2;
        currentTimeRange.value = currentTime;

        currentTimeText.value = toMinutesAndSeconds(currentTime);
        
        smoothEndElement.className = (smoothEnd) ? "on" : "off";
        smoothStartElement.className = (smoothStart) ? "on" : "off";

        setLoadingPopup(false);
    });

    window.connectSocket("admin");
});