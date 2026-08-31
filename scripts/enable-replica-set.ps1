# PowerShell Script to Enable MongoDB Single-Node Replica Set rs0 on Port 27017
$configPath = "T:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg"

if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw
    if (-not ($content -match "replSetName")) {
        Add-Content -Path $configPath -Value "`nreplication:`n  replSetName: `"rs0`""
        Write-Host "Added replSetName rs0 to mongod.cfg"
    } else {
        Write-Host "replSetName is already configured in mongod.cfg"
    }
    Restart-Service -Name "MongoDB" -Force
    Write-Host "MongoDB service restarted successfully."
} else {
    Write-Host "mongod.cfg not found at $configPath"
}
