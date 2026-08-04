const { io } = require("socket.io-client");


const address = 'http://localhost:5000/';

const socket = io(address, {
    auth: {
        role: "admin"
    }
});

socket.on('connect', () => {
    const data = {

        contrast: 0.5,
        brightness: 0.5,
        opacity: 0.5,
        blur: 3,
        currentFileId: "60f63ffb1ee3ab6e6b6c8f8c5fa43f42d4ad7fd00321337b6794ba46c7e58011"
    };

    socket.emit('update', data);

    socket.on('update', data => {
        console.log(data);
    })
    console.log('Connected, sent: ', data);
});