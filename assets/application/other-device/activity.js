const qrImage = document.querySelector("#qr-image");

window.electron.on('get-qr-data', (event, data) => {
    if (data instanceof Uint8Array) {
        const imageBlob = new Blob([data], { type: "image/png" });
        qrImage.src = URL.createObjectURL(imageBlob);
    }
});

window.electron.send('get-qr-data');
