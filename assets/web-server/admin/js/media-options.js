const mediaOptionsButton = document.querySelector("#media-options-button");
const mediaOptionsPopup = document.querySelector("#media-options-popup");
const mediaOptionsCloseButton = mediaOptionsPopup.querySelector('.close');
const uploadAndShowInput = mediaOptionsPopup.querySelector("#show-uploaded-input");

mediaOptionsButton.addEventListener("click", e => show(mediaOptionsPopup));
mediaOptionsCloseButton.addEventListener('click', e => hide(mediaOptionsPopup));

window.volumeRanges.push(getRangeInput('volume-input'));

function getRangeInput(className) {
    return mediaOptionsPopup.querySelector('input[type=range].' + (className.toString()));
}

function getInput(className, type) {
    return mediaOptionsPopup.querySelector(`input[type=${type}].${className}`);
}

uploadAndShowInput.addEventListener('change', async e => {
    if (uploadAndShowInput.files.length < 1) {
        return;
    }

    const file = uploadAndShowInput.files[0];

    if (file instanceof File) {

        if (!(file.type.startsWith("image") || file.type.startsWith("video") || file.type.startsWith("audio"))) {
            alert("El archivo no es válido.");
            return;
        }

        const popup = document.querySelector("#upload-progress-popup");
        const info = popup.querySelector(".info");
        const fill = popup.querySelector(".progress-bar-fill");
        const cancelButton = popup.querySelector(".cancel");

        const pickFolderPopup = document.querySelector("#pick-folder-popup");
        const foldersContainer = pickFolderPopup.querySelector(".folders");
        const pickFolderCancel = pickFolderPopup.querySelector('.cancel');

        function setProgressBar(percent = 0) {
            fill.style.width = `${percent * 100}%`;
        }

        setProgressBar();
        info.textContent = ``;
        
        show(popup);

        const buffer = await file.arrayBuffer();
        const requestBody = new Uint8Array(buffer);

        const request = new XMLHttpRequest();

        request.open('POST', "/upload_and_show", true);

        putHeaders({ "content-type": file.type, "name":encodeURIComponent(file.name)}, request);

        request.upload.onprogress = e => {
            if (e.lengthComputable) {
                setProgressBar(e.loaded / e.total);
            }
        }

        cancelButton.onclick = e => {
            request.abort();
        }

        const end = await new Promise(resolve => {
            request.onload = e=> resolve(true);
            request.onerror = e => resolve(false);
            request.onabort = e => resolve(-1);

            request.send(requestBody);
        });

        uploadAndShowInput.value = '';
    
        setTimeout(() => {
            hide(popup);
        }, 500);
    }
});

/**
 * @type {Array<{prefix:string, range:HTMLInputElement, position:string}>}
 */
const rangesForAttributesUpdate = [];


function getInputValue(inputElement) {
    switch (inputElement.type) {
        case 'number':
        case 'text':
        case 'email':
        case 'url':
        case 'range':
            return inputElement.value;
            break;
        
        case 'checkbox':
            return inputElement.checked;
            break;
        
        default:
            return inputElement.value;
            break;
    }
}

function setInputValue(inputElement, newValue) {
    switch (inputElement.type) {
        case 'number':
        case 'text':
        case 'email':
        case 'url':
        case 'range':
            inputElement.value = newValue.toString();
            break;
        
        case 'checkbox':
            inputElement.checked = newValue;
            break;
    }
}

/**
 * 
 * @param {string} prefix 
 * @param {HTMLInputElement} targetInput 
 * @param {Array<HTMLInputElement> | HTMLInputElement} cloneIn 
 * @param {string?} attributePosition
 */
function inputPropertyCallback(prefix, targetInput, cloneIn = [], attributePosition = null) {


    ['input', 'change'].forEach(eventName => {

        if (targetInput.classList.contains("only-on-change") && eventName == 'input') {
            return;
        }

        targetInput.addEventListener(eventName, e => {

            const newValue = getInputValue(targetInput);

            socketSendMessage(prefix + newValue.toString());

            if (cloneIn instanceof Array) {
                cloneIn.forEach(otherTarget => {
                    if (otherTarget instanceof HTMLInputElement) {
                        setInputValue(otherTarget, newValue);
                    }
                });
            } else if (cloneIn instanceof HTMLInputElement) {
                setInputValue(cloneIn, newValue);
            }
        });
    })


    if (typeof attributePosition == "string") {
        return rangesForAttributesUpdate.push(
            { "position": attributePosition, "range": targetInput, "prefix": prefix }
        );
    }
}

inputPropertyCallback("roc ", getInput('reset-on-change-input', 'checkbox'), null, "effects.transform.resetOnChange");
inputPropertyCallback("scal ", getInput('scale-input', 'number'), null, "effects.transform.scale");
inputPropertyCallback("rota ", getRangeInput('rotation-input'), null, "effects.transform.rotation");
inputPropertyCallback("posx ", getRangeInput('x-input'), null, "effects.transform.position.x");
inputPropertyCallback("posy ", getRangeInput('y-input'), null, "effects.transform.position.y");

inputPropertyCallback("opac ", getRangeInput('opacity-input'), null, "effects.image.opacity");
inputPropertyCallback("blur ", getRangeInput("blur-input"), null, "effects.image.blur");
inputPropertyCallback("brig ", getRangeInput("brightness-input"), null, "effects.image.brightness");
inputPropertyCallback("satu ", getRangeInput('saturation-input'), null, "effects.image.saturation");
inputPropertyCallback("cont ", getRangeInput("contrast-input"), null, "effects.image.contrast");

inputPropertyCallback("v ", getRangeInput("volume-input"), window.volumeRanges, "effects.audio.volume")


mediaOptionsPopup.querySelectorAll('img.reset-value-button').forEach(resetButton => {
    resetButton.addEventListener('click', e => { 
        const target = resetButton.parentElement.querySelector("input");

        if (target instanceof HTMLInputElement) {
            target.value = resetButton.getAttribute('data-value') || "";
            target.dispatchEvent(new Event('input', {bubbles:true, cancelable:true}));
        }
     });
});


mediaOptionsPopup.querySelectorAll("input.clear-on-click").forEach(clearOnClickInput => {
    let lastValue = clearOnClickInput.value;


    clearOnClickInput.addEventListener("mousedown", e => lastValue = clearOnClickInput.value);
    clearOnClickInput.addEventListener("mousenter", e => lastValue = clearOnClickInput.value);
    clearOnClickInput.addEventListener("input", e => lastValue = clearOnClickInput.value);
    clearOnClickInput.addEventListener("change", e => lastValue = clearOnClickInput.value);

    clearOnClickInput.addEventListener("focus", e => clearOnClickInput.value = "");
    clearOnClickInput.addEventListener("blur", e => clearOnClickInput.value = lastValue);
});

const labelsUpdates = [];


mediaOptionsPopup.querySelectorAll(".percent-label, .value-label").forEach(/**@param {HTMLSpanElement} label*/(label) => {

    const foundInputElement = label.parentElement.querySelector("input");
    let digits = parseFloat(label.getAttribute("data-digits") || "0") || 0;
    const suffix = label.getAttribute("data-suffix") || (label.classList.contains('percent-label') ? "%" : "");


    if (!label.getAttribute("data-mantain-input-columns")) {
        foundInputElement.style.setProperty("--use-columns", "8")
    }

    function updatePercentLabel() {
        label.textContent = `${(parseFloat(foundInputElement.value) / parseFloat(foundInputElement.max) * 100).toFixed(digits)}%`; 
    }

    function updateValueLabel() {
        label.textContent = `${foundInputElement.value}${suffix}`;
    }



    let updateLabel = null;

    if (label.classList.contains("percent-label")) { 
        updateLabel = updatePercentLabel;
    } else if (label.classList.contains("value-label")) {
        updateLabel = updateValueLabel;
    }

    if (typeof updateLabel != "function") {
        return;
    }

    if (foundInputElement) {
        ["change", "input"].forEach(eventName => {
            foundInputElement.addEventListener(eventName, e => updateLabel());
        });
    }

    updateLabel();
    labelsUpdates.push(updateLabel);

    if (label.isContentEditable) {


        label.addEventListener("keydown", e => {

            if (e.key == 'Enter') {
                e.preventDefault();
                label.blur();

                let newValue = parseFloat(label.textContent)

                if (!isFinite(newValue)) {
                    label.textContent = `${parseFloat(foundInputElement.value).toFixed(digits)}${suffix}`;
                    return;
                }

                if (label.classList.contains("percent-label")) {
                    newValue /= 100;
                }

                const minValue = parseFloat(foundInputElement.min);
                const maxValue = parseFloat(foundInputElement.max);

                if (isFinite(minValue)) {
                    newValue = Math.max(minValue, newValue);
                }

                if (isFinite(maxValue)) {
                    newValue = Math.min(maxValue, newValue);
                }

                foundInputElement.value = newValue.toString();
                foundInputElement.dispatchEvent(new Event("change"));
            }
         });
    }
});

window.addEventListener("load", e => {
    addOnSocketMessageReceivedListener(event => {
        
        const stringContent = (typeof event.data == "string")
            ? event.data
            : "";
        
        rangesForAttributesUpdate.forEach(rangeInfo => {
            if (stringContent.startsWith(rangeInfo.prefix)) {
                let value = (stringContent.substring(rangeInfo.prefix.length));

                if (rangeInfo.range.type == "checkbox") {
                    rangeInfo.range.checked = value == "true";

                } else if (rangeInfo.range.type == "number" || rangeInfo.range.type == "range") {
                    value = parseFloat(value);
                    rangeInfo.range.value = (!isNaN(value) && isFinite(value)) ? value.toString() : range.value;
                    rangeInfo.range.dispatchEvent(new Event("change"));
                }
            } 
        })
    });

    addOnAttributesLoadedListener(attributes => {
        
        rangesForAttributesUpdate.forEach(rangeInfo => {
            const value = eval("attributes." + rangeInfo.position);
            console.log(value);
            
            setInputValue(rangeInfo.range, value);
        });

        labelsUpdates.forEach(update => update());
    });
});

