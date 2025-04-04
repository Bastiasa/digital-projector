
/**
 * @typedef {Object} MediaAttributes
 * @property {string} id
 * @property {number} currentTime
 * @property {boolean} time
 * @property {boolean} smoothBegin
 * @property {boolean} smoothEnd
 * @property {boolean} loop
 * 
 * @property {Object} effects
 * 
 * @property {Object} effects.image
 * @property {number} effects.image.opacity
 * @property {number} effects.image.brightness
 * @property {number} effects.image.saturation
 * @property {number} effects.image.blur
 * 
 * @property {Object} effects.audio
 * @property {number} effects.audio.volume
 * @property {number} effects.audio.reverb
 * @property {number} effects.audio.distortion
 * 
*/
const sendQueue = [];
var mainSocket = null;

/**@type {Array<(event:MessageEvent=>void)>} */
const onSocketMessageReceivedListeners = [];

/**@type {Array<(attributes:MediaAttributes)=>void>} */
const onAttributesLoadedListeners = [];

/**
 * 
 * @param {(event:MessageEvent)=>void} listener
 * @returns {number|-1}
 */
function addOnSocketMessageReceivedListener(listener) {
    if (typeof listener != "function") {
        return -1
    }

    return onSocketMessageReceivedListeners.push(listener);
}

/**
 * 
 * @param {number} listenerIndex 
 * @returns {boolean}
 */
function removeOnSocketMessageReceivedListener(listenerIndex) {
    if (!onSocketMessageReceivedListeners[listenerIndex]) {
        return false;
    } else {
        onSocketMessageReceivedListeners.splice(listenerIndex, 1);
        return true;
    }
}

/**
 * 
 * @param {(attributes:MediaAttributes)} listener 
 * @returns {number|-1}
 */
function addOnAttributesLoadedListener(listener) {
    if (typeof listener != "function") {
        return -1;
    }

    return onAttributesLoadedListeners.push(listener);
}

/**
 * 
 * @param {number} listenerIndex 
 * @returns {boolean}
 */
function removeOnAttributesLoadedListener(listenerIndex) {
    if (!onAttributesLoadedListeners[listenerIndex]) {
        return false;
    } else {
        onAttributesLoadedListeners.splice(listenerIndex, 1);
        return true;
    }
}

/**
 * 
 * @param {string | ArrayBufferLike | Blob | ArrayBufferView} data 
 */
function socketSendMessage(data) {
    sendQueue.push(data);
}

window.removeOnAttributesLoadedListener = removeOnAttributesLoadedListener;
window.removeOnSocketMessageReceivedListener = removeOnSocketMessageReceivedListener;

window.addOnAttributesLoadedListener = addOnAttributesLoadedListener;
window.addOnSocketMessageReceivedListener = addOnSocketMessageReceivedListener;

window.socketSendMessage = socketSendMessage;

async function onSocketConnectionStarted(e) {

    const attributesResponse = await fetch("/attributes.json", { cache: "no-cache" });
    const attributes = await attributesResponse.json();

    if (typeof attributes == "object") {
        onAttributesLoadedListeners.forEach(listener => {
            try {
                listener(attributes);
            } catch (err) {
                console.error("AttributeLoadedListenerError:", err);
            }
        });
    }
}

/**
 * 
 * @param {MessageEvent} e 
 */
function onSocketMessageReceived(e) {

    onSocketMessageReceivedListeners.forEach(listener => {
        if (typeof listener == "function") {
            try {
                listener(e);
            } catch (err) {   
                console.error("onSocketMessageReceivedError:", err);
            }
        }
    });
}

let currentLoop = -1;

function mainLoop() {

    if (mainSocket.readyState == WebSocket.OPEN) {
        const data = sendQueue.shift();
        
        if (data != undefined) {
            mainSocket.send(data);
            console.log("Sent:", data);
        }
        
    }

    currentLoop = requestAnimationFrame(mainLoop);
}

/**
 * 
 * @param {'admin'|'viewer'} socketPath 
 */
function connectSocket(socketPath = "admin") {
    mainSocket = new WebSocket(`ws://${location.host}/${socketPath}`);

    if (socketPath == "admin") {
        mainSocket.addEventListener('close', () => {
            if (confirm("Se ha desconectado el servidor, ¿Reconectar?")) {
                connectSocket();
            }
        });
    } else {
        mainSocket.addEventListener('close', e=>connectSocket(socketPath));
    }
    

    mainSocket.addEventListener('open', onSocketConnectionStarted);
    mainSocket.addEventListener('message', onSocketMessageReceived);

    if (currentLoop == -1) {
        mainLoop();
    }
}

window.connectSocket = connectSocket;




