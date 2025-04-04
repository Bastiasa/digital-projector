
const portInput = document.getElementById('local-server-port');
const foldersContainer = document.getElementById('folders-container');
const foldersContainerEmpty = foldersContainer.querySelector('.empty');

var settings = {
    folders: [],
    port:6677
}

portInput.addEventListener('change', () => {
    const newValue = parseInt(portInput.value);

    if (newValue >= 1024 && newValue <= 6535) {
        settings.port = newValue;
    }
})

function iterateFolderPathsList(path) {
    const newFolderElement = document.createElement('div');
    const newFolderPathElement = document.createElement('span');
    const newFolderDeleteButton = document.createElement('img');

    newFolderPathElement.textContent = path;
    newFolderDeleteButton.src = 'delete.svg';
    newFolderDeleteButton.alt = 'ELIMINAR';

    newFolderDeleteButton.addEventListener('click', () => {

        settings.folders = settings.folders.filter(a => a !== path);

        newFolderElement.animate(
            [
                { opacity: "1", height: `${newFolderElement.offsetHeight}px` },
                { opacity: "0", height: "0" }
            ],
            {
                duration: 250,
                fill: "forwards"
            }
        ).play();

        setTimeout(() => {
            newFolderElement.remove();

            if (foldersContainer.children.length < 1) {
                foldersContainer.appendChild(foldersContainerEmpty);
            }
        }, 250);
    });

    newFolderElement.classList.add('folder');
    newFolderPathElement.classList.add('path');
    newFolderDeleteButton.classList.add('delete-button');

    foldersContainer.appendChild(newFolderElement);

    newFolderElement.appendChild(newFolderPathElement);
    newFolderElement.appendChild(newFolderDeleteButton);
}

window.electron.on('get-settings', (event, givenSettings) => {
    settings = givenSettings;

    portInput.value = settings.port.toString();
    settings.folders.forEach(iterateFolderPathsList);


    if (settings.folders.length > 0) {
        foldersContainerEmpty.remove();
    }
});


window.electron.on('query-folders-completed', (event, paths) => {
    if (paths.length > 0) {
        foldersContainerEmpty.remove();
    }


    paths.forEach(path => {
        if (!settings.folders.includes(path)) {
            console.log("New path added:", path);
            settings.folders.push(path);
        }
    });

    settings.folders = settings.folders.sort();
    Array.from(foldersContainer.children).forEach(elem => elem.remove());
    settings.folders.forEach(iterateFolderPathsList);
});

window.electron.send('get-settings');
