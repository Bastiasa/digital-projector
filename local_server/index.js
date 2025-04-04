const urlParser = require('url');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const path = require('path');
const cheerio = require('cheerio');
const { isArrayBufferView } = require('util/types');
const { send } = require('process');

const settingsFilesExpectedPath = path.resolve("settings.json");

const settings = JSON.parse(fs.readFileSync(settingsFilesExpectedPath));
const contentIdRegex = /^\d+\.\d+$/;


function getFilteredFiles(filePathList) {
    return  filePathList.filter(
            path => {
                const type = getMimeType(path).split("/")[0];
                return type == "video" || type == "audio" || type == "image";
            }
        ).sort();
}

/**@type {Buffer?} */
const remoteUploadedContentPath = path.resolve("tmp.data");
/**@type {string?} */
let remoteUploadedContentMimeType = null;
/**@type {string?} */
let remoteUploadedContentName = null;
/**
 * Un objeto en el que las claves son cadenas de texto y los valores son funciones que manejan solicitudes HTTP.
 * 
 * @type {Object.<string, function(http.IncomingMessage, http.ServerResponse<http.IncomingMessage>)>}
 */
const customPaths = {

    "/upload_and_show": (req, res) => {
        const contentType = req.headers['content-type'];
        const contentLength = req.headers['content-length'];
        let name = req.headers.name;

        if (!name || !contentLength || !req.method == "POST" || !contentType || (!contentType.startsWith("image") && !contentType.startsWith("video") && !contentType.startsWith("audio"))) {
            res
                .writeHead(400)
                .end();
            return;
        }

        name = decodeURIComponent(name);

        remoteUploadedContentMimeType = contentType;
        remoteUploadedContentName = name + " (externo)";
        const stream = fs.createWriteStream(remoteUploadedContentPath);

        stream.on('finish', () => {
            res.writeHead(200).end();
            wsServer.clients.forEach(ws => {
                
                ws.send("id external");
                ws.send("t 0");

                if (mediaAttributes.effects.transform.resetOnChange) {
                    sendRessetedTransformValues();
                }
            });

            mediaAttributes.currentTime = 0;
            mediaAttributes.playing = true;
            mediaAttributes.id = "external";

            updateAttributesFile();
        });

        stream.on('error', err => {
            res
                .writeHead(500)
                .end();
            remoteUploadedContentName = null;
            remoteUploadedContentMimeType = null;
        });

        req.on('error', err => {
            res
                .writeHead(500)
                .end();
            remoteUploadedContentName = null;
            remoteUploadedContentMimeType = null;
        });

        req.pipe(stream);
    },

    "/upload": (req, res) => {

        const contentType = req.headers['content-type'];
        let name = req.headers['name'];
        const folder = req.headers['folder'] || 0;
        const folderPath = getSettings().folders[folder];

        if (!req.method == "POST" || !contentType || (!contentType.startsWith("image") && !contentType.startsWith("video") && !contentType.startsWith("audio")) || !name || !folderPath) {
            res
                .writeHead(400)
                .end("");
            return;
        }

        name = decodeURIComponent(name);

        let filePath = path.join(folderPath, name);
        let renameCount = 1;
        
        const extension = path.extname(name);
        const fileNameWithoutExtension = name.substring(0, name.length - extension.length);

        while (fs.existsSync(filePath)) {
            filePath = path.join(folderPath, `${fileNameWithoutExtension} (${renameCount})${extension}`);
            renameCount++;
        }

        const stream = fs.createWriteStream(filePath);
        stream.on('finish', () => { res.writeHead(200).end(); });
        stream.on('error', () => { res.writeHead(500).end(); });
        req.on('error', () => { res.writeHead(500).end(); });
        
        req.pipe(stream);
    },

    "/folder_list": (req, res) => {

        const result = getSettings().folders.join('\n');

        res.writeHead(200, {
            'content-type': 'text/plain; charset=ISO-8859-1'
        });

        res.end(result);
    },

    "/file_list": (req, res) => {

        const url = urlParser.parse(req.url, true);
        const queryParams = url.query

        const folderId = queryParams['folder'];
        const settings = getSettings();

        const foundFolder = settings.folders[parseInt(folderId, 10)];

        if (!folderId || !foundFolder || !fs.existsSync(foundFolder || "")) {
            res.writeHead(400, {});
            res.end();

            return;
        }

        let result = getFilteredFiles(fs.readdirSync(foundFolder));

        if (!result) {
            res.writeHead(404).end();
            return;
        }

        res
            .writeHead(200, {
                'content-type': 'text/plain; charset=utf-8',
                'folder':encodeURIComponent(foundFolder)
            })
            .end(result.join('\n'));
    },

    "/external_data": (req, res) => {
        if (!fs.existsSync(remoteUploadedContentPath) || remoteUploadedContentMimeType == null || remoteUploadedContentName == null) {
            res
                .writeHead(404)
                .end();
            return;
        } 

        const range = req.headers.range;
        const stat = fs.statSync(remoteUploadedContentPath);

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : stat.size - 1;
            
            if (end < start) {
                res.writeHead(400).end();
                return;
            }
            
            const chunkSize = (end - start) + 1;

            res.writeHead(206, {
                "accept-ranges": "bytes",
                "content-length":chunkSize,
                "content-type": remoteUploadedContentMimeType,
                "content-range": `bytes ${start}-${end}/${stat.size}`,
                'name': encodeURIComponent(remoteUploadedContentName)
            });
            
            if (req.method != "HEAD") {
                const stream = fs.createReadStream(remoteUploadedContentPath, { start, end });
                stream.pipe(res);
            } else {
                res.end();
            }
        } else {
            res.writeHead(200, {
                "content-type": remoteUploadedContentMimeType,
                "content-length": stat.size,
                'name': encodeURIComponent(remoteUploadedContentName)
            });

            const stream = fs.createReadStream(remoteUploadedContentPath);
            stream.pipe(res);
        }
    },

    "/content": (req, res) => {
        
        const url = urlParser.parse(req.url, true);
        const queryParams = url.query;

        const contentId = queryParams['id'];
        const settings = getSettings();

        if (contentId == "external") {
            res.writeHead(302, { "location": "/external_data" + (new URL(req.url, `http://${req.headers.host}`)).search }).end();
            return;
        }
        
        if (!contentId || !contentIdRegex.test(contentId)) {
            res.writeHead(400);
            res.end();
            return;
        }

        const folderId = parseInt(contentId.split(".")[0], 10);
        const fileId = parseInt(contentId.split(".")[1], 10);

        const folder = settings.folders[folderId];

        if (folder == undefined || !fs.existsSync(folder || "")) {
            res.writeHead(400);
            res.end();
            return;
        }

        const files = getFilteredFiles(fs.readdirSync(folder));
        const fileName = files[fileId];

        if (!fileName) {
            res.writeHead(400);
            res.end();
            return;
        }

        const filePath = path.join(folder, fileName);

        if (!fs.existsSync(filePath)) {
            res.writeHead(400);
            res.end();
            return;
        }


        const stat = fs.statSync(filePath);
        const range = req.headers.range;
        const mimeType = getMimeType(filePath);

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : stat.size - 1;
            
            const chunkSize = (end - start) + 1;

            res.writeHead(206, {
                "accept-ranges": "bytes",
                "content-type": mimeType,
                "content-length": chunkSize,
                "content-range": `bytes ${start}-${end}/${stat.size}`,
                "name":encodeURIComponent(fileName)
            });
            
            if (req.method != "HEAD") {
                const stream = fs.createReadStream(filePath, { start, end });
                stream.pipe(res);
            } else {
                res.end();
            }
            
        } else {
            res.writeHead(200, {
                "content-type": mimeType,
                "content-length": stat.size,
                "name":encodeURIComponent(fileName)
            });

            if (req.method != "HEAD") {
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.end();
            }

        }
    },

    "/name": (req, res) => {
        
        const url = urlParser.parse(req.url, true);
        const queryParams = url.query;

        const contentId = queryParams['id'];
        const settings = getSettings();

        if (contentId == "external" && remoteUploadedContentName != null) {
            res
                .writeHead(200)
                .end(encodeURIComponent(remoteUploadedContentName));
            return;
        }
        
        if (!contentId || !contentIdRegex.test(contentId)) {
            res.writeHead(400);
            res.end();
            return;
        }

        const folderId = parseInt(contentId.split(".")[0], 10);
        const fileId = parseInt(contentId.split(".")[1], 10);

        const folder = settings.folders[folderId];

        if (folder == undefined || !fs.existsSync(folder || "")) {
            res.writeHead(400);
            res.end();
            return;
        }

        const files = getFilteredFiles(fs.readdirSync(folder));
        const fileName = files[fileId];

        if (!fileName) {
            res.writeHead(400);
            res.end();
            return;
        }

        res.writeHead(200,
            {
                "content-length": fileName.length
            }
        );

        res.end(encodeURIComponent(fileName));
    }
}


console.log("Comenzando el servidor local...");

function webServerFolderRelative(source) {
    let resourcesFolder = path.resolve("resources")

    if (!fs.existsSync(resourcesFolder)) {
        resourcesFolder = path.resolve(".");
    }

    return path.join(resourcesFolder, "assets/web-server/", source);
}

function processHTMLFile(htmlFilePath) {
    const rootPath = path.dirname(htmlFilePath);
    const fileContent = fs.readFileSync(htmlFilePath, { encoding: 'utf-8' });
    
    const $ = cheerio.load(fileContent);

    function errorMsg(importElement, msg) {
        const replaced = $(importElement).html();
        $(importElement).replaceWith(`<script>console.error("NodeImportException: ${msg}");</script> <!--${replaced}-->`);        
    }

    $('.node-import').each((index, importElement) => {
        let importPath = $(importElement).attr("target");

        if (!importPath) {
            errorMsg(importElement, `No import path.`);
            return;
        }

        if (importPath.startsWith("/")) {
            importPath = webServerFolderRelative(importPath.substring(1));
        } else {
            importPath = webServerFolderRelative(path.join(rootPath, importPath));
        }

        if (!fs.existsSync(importPath)) {
            errorMsg(importElement, `404 NOT_FOUND ${$(importElement).attr('target')} .`);
            return;
        }

        const importContent = fs.readFileSync(importPath);
        $(importElement).replaceWith(importContent.toString());
    });
    
    return $.html(); 
}

function getMimeType(fname) {
    const extension = path.extname(fname).substring(1).toLowerCase();

    switch (extension) {
        case "htm":
            return "text/html";
        case "html":
        case "css":
            return "text/" + extension;
        case "txt":
            return "text/plain";
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "bmp":
        case "webp":
            return "image/" + extension;
        case "mp4":
        case "webm":
        case "mov":
        case "avi":
        case "wmv":
        case "flv":
        case "mkv":
            return "video/" + extension;
        case "mp3":
        case "wav":
        case "ogg":
        case "aac":
        case "flac":
        case "wma":
        case "m4a":
            return "audio/" + extension;
        case "js":
            return "application/javascript";
        case "json":
            return "application/json";
        case "svg":
            return "image/svg+xml";
        default:
            return "application/octet-stream";
    }

}

/**
 * 
 * @returns {{folders:Array<String>, port:number}}
 */
function getSettings() {
    const settingsFilePath =settingsFilesExpectedPath;

    if (fs.existsSync(settingsFilePath)) {
        const fileContents = fs.readFileSync(settingsFilePath, {encoding:'utf-8'});
        return JSON.parse(fileContents.toString());
    } else {
        const newFileContents = JSON.stringify(settingsTemplate);
        fs.writeFileSync(settingsFilePath, newFileContents, {'encoding':'utf-8'});
        return JSON.parse(newFileContents);
    }
}


const server = http.createServer((req, res) => {

    console.log("Request: ", req.method, req.url);
    const url = urlParser.parse(req.url, true);

    if (customPaths[url.pathname] != undefined) {
        customPaths[url.pathname](req, res);
        return;
    }

    let relativePath = webServerFolderRelative(url.pathname.substring(1));
    let mimeType = getMimeType(relativePath);
    const range = req.headers.range;

    if (!fs.existsSync(relativePath)) {
        res.statusCode = 404;
        res.end();
        return;
    }

    let stats = fs.statSync(relativePath);
    
    if (stats.isDirectory() && fs.existsSync(path.join(relativePath, "index.html"))) {

        if (!url.pathname.endsWith("/")) {
            res.writeHead(302, {
                "location": url.pathname + "/"
            });

            res.end();
            return;
        }

        relativePath = path.join(relativePath, "index.html");
        stats = fs.statSync(relativePath);
        mimeType = "text/html";

    } else if (stats.isDirectory()) {
        res.statusCode = 403;
        res.end();

        return;
    }

    if (mimeType == "text/html") {
        const content = processHTMLFile(relativePath);
        res
            .writeHead(200, {
            'content-type': "text/html",
            "content-length": content.length
            })
            .end(content);
        
        return;
    }
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : stats.size - 1;
        const chunkSize = (end - start) + 1;
        const stream = fs.createReadStream(relativePath, { start, end });

        res.writeHead(206, {
            "content-range": `bytes ${start}-${end}/${stats.size}`,
            "accept-ranges": "bytes",
            "content-length": chunkSize,
            "content-type": mimeType
        });

        stream.pipe(res);
        return;
    } else {
        res.writeHead(200, {
            "content-length": stats.size,
            "content-type": mimeType
        });

        const responseStream = fs.createReadStream(relativePath);
        responseStream.pipe(res);
    }


});

const wsServer = new WebSocket.Server({ server });

let viewers = [];

process.on('exit', () => {
    if (fs.existsSync(remoteUploadedContentPath)) {
        fs.unlinkSync(remoteUploadedContentPath);
    }

    mediaAttributes.id = "";
    mediaAttributes.currentTime = 0;
    mediaAttributes.playing = false;

    updateAttributesFile();
})

const defaultMediaAttributes =  {
    "id":"",
    "currentTime":0,
    "playing":false,
    "smoothBegin":false,
    "smoothEnd":false,
    "loop":false,
    
    "effects": {

        "transform": {
            "resetOnChange":true,
            "scale": 1,
            "position": {
                "x": 0,
                "y":0
            },

            "rotation":0
        },

        "image": {
            "opacity":1,
            "blur": 0,
            "brightness":1,
            "saturation":1,
            "contrast":1
        },

        "audio": {
            "volume":1
        }
    }
}

const mediaAttributes = {
    "id":"",
    "currentTime":0,
    "playing":false,
    "smoothBegin":false,
    "smoothEnd":false,
    "loop":false,
    
    "effects": {

        "transform": {
            "resetOnChange":true,
            "scale": 1,
            "position": {
                "x": 0,
                "y":0
            },

            "rotation":0
        },


        "image": {
            "opacity":1,
            "blur": 0,
            "brightness":1,
            "saturation":1,
            "contrast":1
        },

        "audio": {
            "volume":1
        }
    }
}

function updateAttributesFile(newContent = mediaAttributes) {
    const attributesFilePath = webServerFolderRelative("attributes.json");
    const attributesFileContent = JSON.stringify(newContent);

    fs.writeFileSync(attributesFilePath, attributesFileContent, {encoding:'utf-8'});
}


if (!fs.existsSync(webServerFolderRelative("attributes.json"))) {
    updateAttributesFile(defaultMediaAttributes);
}

let currentMessage = "";
let currentMessageSender = null;

function sendToEveryclient(message, excluded = null) {
    wsServer.clients.forEach(client => {
        if (client != excluded && (typeof message == "string" || message instanceof Blob || isArrayBufferView(message))) {
            client.send(message);
        }
    })
}

function sendRessetedTransformValues() {
        sendToEveryclient("posx 0");
        sendToEveryclient("posy 0");
        sendToEveryclient("scal 1");
        sendToEveryclient("rota 0");
}

/**
 * 
 * @param {string} start 
 * @param {'number'|'id'|'boolean'|'string'} type 
 * @param {string} attributeName 
 * @param {object} object 
 */
function checkPropertySet(start, type, attributeName, object = mediaAttributes) {

    if (currentMessage.startsWith(start)) {
        let newValue = currentMessage.substring(start.length);

        switch (type) {
            case 'number':
                newValue = parseFloat(newValue);
                object[attributeName] = !isNaN(newValue) ? newValue : object[attributeName];
                break;
            case 'id':
                object[attributeName] = newValue;
                mediaAttributes.playing = true;
                mediaAttributes.currentTime = 0.0;

                if (mediaAttributes.effects.transform.resetOnChange) {
                    mediaAttributes.effects.transform = defaultMediaAttributes.effects.transform;
                    sendRessetedTransformValues();
                }

                sendToEveryclient("t 0", currentMessageSender);

                break;
            case 'boolean':
                object[attributeName] = newValue = newValue == 'true';
                break;
            default:
                break;
        }
    }

}

/**
 * 
 * @param {string} start 
 * @param {string} attributeName 
 * @param {object} object 
 */
function checkNumberPropertySet(start, attributeName, object = mediaAttributes) {
    return checkPropertySet(start, 'number', attributeName, object);
}

/**
 * 
 * @param {string} start 
 * @param {string} attributeName 
 * @param {object} object 
 */
function checkBooleanPropertySet(start, attributeName, object = mediaAttributes) {
    return checkPropertySet(start, 'boolean', attributeName, object);
}

function onViewerMessageReceived(message) {

    if (!message) {
        console.log("Se envió un valor vacío.");
        return;
    }

    const stringContent = message.toString();

    if (stringContent.startsWith("st ")) {
        const currentTime = parseFloat(stringContent.substring("st ".length));
        mediaAttributes.currentTime = !isNaN(currentTime) && isFinite(currentTime) ? currentTime : mediaAttributes.currentTime;
    } else if (stringContent.startsWith("sp ")) {
        mediaAttributes.playing = stringContent.substring("p ".length) == "true";
    }

    sendToEveryclient(stringContent, this);
    updateAttributesFile();
}

function onAdminMessageReceived(message) {

    if (!message) {
        console.log("Se envió un valor vacío.");
        return;
    }

    const stringContent = message.toString();

    currentMessage = stringContent;
    currentMessageSender = this;

    console.log("Recibido de un administrador: " + stringContent);
    
    checkPropertySet('id ', 'id', 'id');
    
    checkNumberPropertySet('t ', 'currentTime');
    checkNumberPropertySet('st ', 'currentTime');

    checkBooleanPropertySet('ss ', 'smoothBegin');
    checkBooleanPropertySet('se ', 'smoothEnd');
    checkBooleanPropertySet('p ', 'playing');

    checkBooleanPropertySet('roc ', 'resetOnChange', mediaAttributes.effects.transform);
    checkNumberPropertySet('scal ', 'scale', mediaAttributes.effects.transform);
    checkNumberPropertySet('rota ', 'rotation', mediaAttributes.effects.transform);
    checkNumberPropertySet('posx ', 'x', mediaAttributes.effects.transform.position);
    checkNumberPropertySet('posy ', 'y', mediaAttributes.effects.transform.position);

    checkNumberPropertySet('opac ', 'opacity', mediaAttributes.effects.image);
    checkNumberPropertySet('blur ', 'blur', mediaAttributes.effects.image);
    checkNumberPropertySet('brig ', 'brightness', mediaAttributes.effects.image);
    checkNumberPropertySet('satu ', 'saturation', mediaAttributes.effects.image);
    checkNumberPropertySet('cont ', 'contrast', mediaAttributes.effects.image);
    
    checkNumberPropertySet('v ', 'volume', mediaAttributes.effects.audio);
    sendToEveryclient(stringContent, this);

    updateAttributesFile();
}

wsServer.on('connection', (socket, request) => {
    const { url } = request;

    console.log("Un websocket se ha conectado a la url " + url);

    if (url == "/viewer") {
        viewers.push(socket);
        socket.on('message', onViewerMessageReceived);
        socket.on('close', (code, reason) => {
            viewers = viewers.filter(viewer => viewer !== socket);
        });

        return;
    }


    if (url == "/admin") {
        socket.on('message', onAdminMessageReceived);
    } else {
        socket.close(1008);
    }

});

// process.on("SIGTERM", () => {
//     console.log("closed");
//     process.exit(0);  
// });


process.stdin.on("data", (data) => {

    const message = data.toString();

    if (message == "close") {
        console.log("Terminando el servidor local...");


        console.log("closed");
        process.exit(0);

        // wsServer.clients.forEach(socket => {
        //     socket.close(1000);
        // });

        // wsServer.close(err => {
        //     server.close(err => {
        //         console.log("Servidor local terminado.");
        //         console.log("closed");
        //         process.exit(0);
        //     });
        // });
    }

    
});

server.listen(settings['port'], "0.0.0.0");