
/**
 * 
 * @param {{}} headers 
 * @param {XMLHttpRequest} request 
 */
function putHeaders(headers, request) {
    Object.keys(headers).forEach(headerName => {
        request.setRequestHeader(headerName, headers[headerName]);
    });
}

/**
 * 
 * @param {number} seconds 
 * @returns {string}
 */
function toMinutesAndSeconds(totalSeconds) {

    if (typeof totalSeconds !== 'number') {
        return '00:00';
    }

    function formatNumber(num) {
        return Math.floor(num).toString().padStart(2, '0');
    }

    let totalMinutes = totalSeconds / 60;

    let minutes = formatNumber(totalMinutes);
    let seconds = formatNumber(Math.round(totalMinutes % 1 * 60));

    return `${minutes}:${seconds}`;
}

/**
 * 
 * @param {keyof HTMLElementTagNameMap} tagName 
 * @param {string} id 
 * @param {Array<string>|string} elementClass 
 * @param {HTMLElement?} parent
 * @param {{string:any}} properties 
 * @returns 
 */
function createElement(tagName, id = "", elementClass = [], parent=null, properties={}) {
    const element = document.createElement(tagName);

    element.id = id;
    
    if (elementClass instanceof Array) {
        elementClass.forEach(className => element.classList.add(className));
    } else if (typeof elementClass == "string") {
        element.className = elementClass;
    }

    if (parent instanceof HTMLElement) {
        parent.appendChild(element);
    }

    
    for (const propertyName in properties) {
        element[propertyName] = properties[propertyName];
    }

    return element;
}

/**
 * 
 * @param {number} number 
 * @returns {string}
 */
function numberWithZero(number) {
    if (number < 10) {
        return `0${number}`;
    } else {
        return number;
    }
}

/**
 * 
 * @param {string} path 
 * @returns {string}
 */
function lastIndex(path, splitter = '/') {
    const splitted = path.split(splitter);
    return splitted[splitted.length - 1];
}

/**
 * 
 * @param {boolean} enabled 
 */
function setLoadingPopup(enabled) {
    const loadingPopup = document.querySelector("#loading-popup");

    if (!loadingPopup) {
        return;
    }

    if (enabled) {
        show(loadingPopup);
    } else {
        hide(loadingPopup);
    }
}

/**
 * 
 * @param {Image|HTMLVideoElement} visualElement 
 * @returns {{"renderedWidth":number, "renderedHeight":number}}
 */
function getRenderedSize(visualElement) {
    const containerWidth = visualElement.clientWidth;
    const containerHeight = visualElement.clientHeight;

    const naturalWidth = visualElement.naturalWidth || visualElement.videoWidth;
    const naturalHeight = visualElement.naturalHeight || visualElement.videoHeight;

    let renderedWidth, renderedHeight;

    const imageAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    if (imageAspectRatio > containerAspectRatio) {
        renderedWidth = containerWidth;
        renderedHeight = containerWidth / imageAspectRatio;
    } else {
        renderedWidth = containerHeight * imageAspectRatio;
        renderedHeight = containerHeight;
    }

    return { renderedWidth, renderedHeight };
}

/**
 * 
 * @param {string} folder 
 * @returns {Array<string>?}
 */
async function getFilesInFolder(folder) {
    const response = await fetch("/file_list?folder=" + encodeURIComponent(folder));

    if (!response.ok) {
        return null;    
    }

    const filesRaw = await response.text();
    return filesRaw.split('\n');
}

function show(popupElement) {
    popupElement.classList.remove('hidden');
}

function hide(popupElement) {
    if (!popupElement.classList.contains('hidden')) {
        popupElement.classList.add('hidden');
    }
}

window.everyFrameActions = [];

/**
 * 
 * @param {FrameRequestCallback} action 
 * @returns {number}
 */
function addEveryFrameAction(action) {
    if (typeof action == "function") {
        return window.everyFrameActions.push(action);
    }
}
/**
 * 
 * @param {number} index 
 */
function removeEveryFrameAction(index) {
    window.everyFrameActions.splice(index, 1);
}

function loop() {
    window.everyFrameActions.forEach(action => { if (typeof action == "function") { action(); }});   
    requestAnimationFrame(loop);
}

function isPlayable(element) {
    return element instanceof HTMLVideoElement || element instanceof HTMLAudioElement;
}

loop();
