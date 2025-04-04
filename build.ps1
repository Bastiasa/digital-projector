
if (Test-Path "b:\projects\node\Proyector Digital\assets\web-server\attributes.json") {
    Remove-Item "b:\projects\node\Proyector Digital\assets\web-server\attributes.json"
}

npm run build