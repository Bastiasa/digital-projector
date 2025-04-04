const uploadInput = document.querySelector("#upload-input");

const popup = document.querySelector("#upload-progress-popup");
const info = popup.querySelector(".info");
const fill = popup.querySelector(".progress-bar-fill");
const cancelButton = popup.querySelector(".cancel");

const pickFolderPopup = document.querySelector("#pick-folder-popup");
const foldersContainer = pickFolderPopup.querySelector(".folders");
const pickFolderCancel = pickFolderPopup.querySelector('.cancel');

let currentUploadRequest = null;


uploadInput.addEventListener('click', e => {
    if (!window.folders || window.folders.length <= 0) {
        e.preventDefault();
        alert('No hay ninguna carpeta disponible.');
    }
});

uploadInput.addEventListener("change", async e => {

    let folderId = window.folderId;

    if (!folderId && window.folders instanceof Array) {
        if (window.folders.length == 1) {
            folderId = window.folders[0].folderId;
        } else if (window.folders.length < 1) {
            uploadInput.value = '';
            return;
        } else {
            show(pickFolderPopup);
            
            folderId = await new Promise(resolve => {
                window.folders.forEach(folder => {
                    createElement('button', '', '', foldersContainer, {
                        onclick: e => {
                            resolve(folder.folderId.toString()); 
                        },
                        innerText:lastIndex(folder.folderPath, '\\')
                    });
                });

                pickFolderCancel.onclick = e=>resolve(null);
            });

            hide(pickFolderPopup);
            Array.from(foldersContainer.children).forEach(e => e.remove());

            if (!folderId) {
                uploadInput.value = ''
                return;
            }
        }
    }

    function setProgressBar(percent = 0) {
        fill.style.width = `${percent * 100}%`;
    }

    fill.style.width = "0";

    const files = Array.from(e.target.files).filter(file => file.type.startsWith("image") ||  file.type.startsWith("video") || file.type.startsWith("audio"));
    const filesCount = files.length;
    let uploaded = 0;

    setProgressBar();
    
    popup.classList.remove("hidden");
    info.textContent = `0/${filesCount}`;


    for (let index = 0; index < filesCount; index++) {
        const file = files[index];
        

        if (file instanceof File) {
            
            if (!file.type.startsWith("image") && !file.type.startsWith("video") && !file.type.startsWith("audio")) {
                continue;
            }

            const buffer = await file.arrayBuffer();

            if (!buffer) {
                uploaded++;
                setProgressBar(uploaded / filesCount);
                continue;
            }

            const requestBody = new Uint8Array(buffer);

            const requestHeaders = {
                "content-type": file.type,
                "folder": folderId.toString(),
                "name": encodeURIComponent(file.name)
            };

            const request = new XMLHttpRequest();

            request.open("POST", "/upload", true);
            putHeaders(requestHeaders, request);

            request.upload.addEventListener('progress', e => {
                if (e.lengthComputable) {
                    const percent = (uploaded + (e.loaded / e.total)) / filesCount
                    setProgressBar(percent);
                    console.log(uploaded + (e.loaded / e.total)); 
                }
            });


            const resultPromise = new Promise(resolve => {
                request.onload = e => { resolve(request.status == 200) };
                request.onerror = e => { resolve(false) };
                request.onabort = e => { resolve('aborted') };
                request.send(requestBody);
            });
            

            currentUploadRequest = request;
            const result = await resultPromise;
            currentUploadRequest = null;

            if (result == 'aborted') {
                uploadInput.value = '';
                hide(popup);
                return;
            }

            uploaded++;
            setProgressBar(uploaded / filesCount);
            info.textContent = `${uploaded}/${filesCount}`;
        }
    }

    setProgressBar(uploaded / filesCount);

    setTimeout(() => {
        hide(popup);
        uploadInput.value = '';
    }, 500);
});

cancelButton.addEventListener("click", e => {
    if (currentUploadRequest instanceof XMLHttpRequest) {
        currentUploadRequest.abort();
    }
});