const searchPopupOpenButton = document.querySelector("#search-popup-open");
const searchPopup = document.querySelector("#search-popup");
const searchInput = searchPopup.querySelector(".search-input");

const searchPopupPlaceholderSpinner = createElement("div", "", "placeholder-spinner", null);
const searchPopupMatchUppercase = searchPopup.querySelector(".match-uppercase");
const matchAccentsSearchPopup = searchPopup.querySelector('.match-accents');
const searchPopupExtensionInput = searchPopup.querySelector('.extension');

const resultsContainer = searchPopup.querySelector(".results-container");
const closeSearchPopupButton = searchPopup.querySelector(".close");
const nothingInsideElement = createElement("span", "", "empty-prompt", null, {"textContent":"No se ha encontrado ningún recurso."});


searchPopupOpenButton.addEventListener("click", e => initSearchPopup());
closeSearchPopupButton.addEventListener("click", e => hideSearchPopup());

function hideSearchPopup() {
    hide(searchPopup);

    setTimeout(() => {
        Array.from(resultsContainer.children).forEach(e => e.remove());
        searchInput.value = '';
    }, 200);
}

let currentSearchId = -1;

/**
 * 
 * @param {(searchKeyWord:string)=>boolean} condition 
 * @returns 
 */
function searchInFolders(condition) {
    if (!window.folders || window.folders.length < 1) {
        resultsContainer.appendChild(nothingInsideElement);
        return;
    }

    currentSearchId++;
    const ownSearchId = currentSearchId;

    Array.from(resultsContainer.children).forEach(e => e.remove());

    nothingInsideElement.remove();
    resultsContainer.appendChild(searchPopupPlaceholderSpinner)

    let loaded = 0;

    window.folders.forEach(async folder => {
        const folderId = folder.folderId;
        loaded++;

        if (!folderId) {
            return;
        }

        let resourceIndex = -1;

        const response = await fetch("/file_list?folder=" + encodeURIComponent(folderId), { cache: "no-cache" });
        
        let fileList = await response.text();
        fileList = fileList.split('\n');
        fileList = fileList.filter(value => value.length > 0);

        let folderPath = response.headers.get('folder');
        folderPath = decodeURIComponent(folderPath || "");

        function checkLoaded() {
            searchPopupPlaceholderSpinner.remove();

            if (loaded >= window.folders.length && resultsContainer.children.length <= 0) {
                resultsContainer.appendChild(nothingInsideElement);
            } else {
                nothingInsideElement.remove();
            }
        }


        if (!response.ok || !fileList || !folderPath) {
            checkLoaded();
            return;
        }

        if (currentSearchId != ownSearchId) {
            checkLoaded();
            return;
        }

        fileList.forEach(fileName => {
                    
            resourceIndex++;

            const resourceId = `${folder.folderId}.${resourceIndex}`;
            const resourceElement = createElement("div", "", ["resource", "clickable"], null, { "textContent": fileName, "--data-id": resourceId });
            const searchKeyWord = `${lastIndex(folderPath, "\\")} ${fileName}`;

            createElement("br", "", null, resourceElement);
            createElement("span", "", "small", resourceElement, { "textContent": `(${lastIndex(folderPath, '\\')})` });

            resourceElement.addEventListener("click", e => {
                window.socketSendMessage("id " + resourceId);
                playing = true;
                setPlayButton(true);
                setMediaId(resourceId);
        });

            if (typeof condition == "function" && !condition(searchKeyWord)) {
            } else {
                resultsContainer.appendChild(resourceElement);
                searchPopupPlaceholderSpinner.remove();
            }
        });

        checkLoaded();
    });
}

function initSearchPopup() {
    show(searchPopup);
    searchInFolders();
}

function updateSearchPopupResults() {
    searchInFolders(searchKeyWord => {

        let searchValue = searchInput.value;
        let extension = searchPopupExtensionInput.value;

        if (searchPopupMatchUppercase.classList.contains("off")) {
            searchKeyWord = searchKeyWord.toLowerCase();
            searchValue = searchValue.toLowerCase();
            extension = extension.toLowerCase();
        }

        if (matchAccentsSearchPopup.classList.contains("off")) {
            function noAccents(target) {
                return target.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            }

            searchKeyWord = noAccents(searchKeyWord);
            searchValue = noAccents(searchValue);
            extension = noAccents(extension);
        }

        return searchKeyWord.includes(searchValue) && searchKeyWord.endsWith(extension);
    });
}


[matchAccentsSearchPopup, searchPopupMatchUppercase].forEach(searchPopupButton => {
    searchPopupButton.addEventListener('click', e => updateSearchPopupResults());
});


[searchInput, searchPopupExtensionInput].forEach(searchPopupTextInput => {
    searchPopupTextInput.addEventListener("input", e => updateSearchPopupResults());
    searchPopupTextInput.addEventListener("change", e => updateSearchPopupResults());
});
