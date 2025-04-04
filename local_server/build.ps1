
$folder = "b:\projects\node\Proyector Digital\local_server"
$outputFileName = "servers.exe"

if(Test-Path "$folder\$outputFileName") {
    Remove-Item "$folder\$outputFileName"
}


pkg -t node16-win-x64 -o "$folder\..\$outputFileName" "$folder\."

if (Test-Path "$folder\$outputFileName") {
    
    if(Test-Path "$folder\..\$outputFileName") {
        Remove-Item "$folder\..\$outputFileName"
    }

    Copy-Item -Path "$folder\$outputFileName" -Destination "$folder\..\$outputFileName"
}