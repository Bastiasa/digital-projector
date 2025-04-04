
$folder = "b:\projects\node\Proyector Digital"
$settingsFilePath = "$folder\settings.json"

if(Test-Path $settingsFilePath) {
    $settingsContent = Get-Content $settingsFilePath
    $settings = $settingsContent | ConvertFrom-Json 

    $port = $settings.port.ToString()

    "Buscando en el puerto $port..."

    $result = NETSTAT.EXE -ano | findstr.exe "0.0.0.0:$port"

    if($result.Length -gt 1) {
        
        $parts = $result.Split("       ")

        if($parts.Length -gt 1) {

            "El puerto $port tenía un proceso activo. Cerrándolo."
            $pid_code = $parts[$parts.Length - 1]
            taskkill.exe /PID $pid_code /F
        }

    } else {
        "No se encontró ningún proceso para el puerto $port."
    }

}
