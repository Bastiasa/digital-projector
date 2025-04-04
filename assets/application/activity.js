const serverSwitchButton = document.querySelector("#server-switch-button");
const adminButton = document.querySelector("#admin-button");
const viewButton = document.querySelector("#view-button");

let serverActionSended = false;

function setDisabledAdminAndViewButtons(disabled) {
    [adminButton, viewButton].forEach(btn => btn.disabled = disabled);
}

let currentWindow = null;


function setSwitchButton(status) {
    serverActionSended = false;

    switch (status) {
        case 'started':
            serverSwitchButton.innerText = "Detener servidor";
            serverSwitchButton.disabled = false;
            setDisabledAdminAndViewButtons(false);
            break;
        case 'stopped':
            serverSwitchButton.innerText = "Iniciar servidor";
            serverSwitchButton.disabled = false;
            setDisabledAdminAndViewButtons(true);
            break;
    
        default:
            serverSwitchButton.innerText = "...";
            serverSwitchButton.disabled = true;
            setDisabledAdminAndViewButtons(true);
            break;
    }
    
    localStorage.setItem("localServerStatus", enabled);
}

serverSwitchButton.addEventListener("click", e => {
    if (serverActionSended) {
        return;
    }

    serverActionSended = true;
    
    e.target.disabled = true;
    e.target.innerText = "...";

    window.electron.send('server-switch');
});


window.electron.on('get-server-status', (event, closingServer) => {
    setSwitchButton(closingServer); 
});

window.electron.on('get-server-port', (event, port) => {
    adminButton.addEventListener('click', e => {
        window.electron.send("open-link", `http://localhost:${port}/admin`);
    });

    viewButton.addEventListener('click', e => { 
        window.electron.send("open-link", `http://localhost:${port}`);
    });
});

window.electron.send('get-server-status');
window.electron.send('get-server-port');