param([string]$BackendDir)

$appJsPath = Join-Path $BackendDir "app.js"

if (-not (Test-Path $appJsPath)) {
    Write-Error "No se encontro app.js en: $appJsPath"
    exit 1
}

$content = Get-Content $appJsPath -Raw -Encoding utf8

# Increase express.json body limit to support base64 images
$content = $content -replace 'express\.json\(\)', 'express.json({ limit: "15mb" })'

# Remove any previously injected lines to avoid duplicates
$content = $content -replace '(?m)^app\.use\([^)]*precios-examenes[^\n]*\n?', ''
$content = $content -replace '(?m)^app\.use\([^)]*configuracion[^\n]*\n?', ''

# Remove excess blank lines
$content = $content -replace '\n{3,}', "`n`n"

# Ensure module.exports = app; exists
if ($content -notmatch 'module\.exports\s*=\s*app') {
    Write-Error "No se encontro 'module.exports = app' en app.js"
    exit 1
}

# Insert both routes before module.exports
$newLines = 'app.use("/api/precios-examenes", require("./routes/precioExamen"));' + "`n" + 'app.use("/api/configuracion", require("./routes/configuracion"));'
$content = $content -replace '(module\.exports\s*=\s*app;)', "$newLines`n`$1"

Set-Content $appJsPath $content -Encoding utf8 -NoNewline
Write-Host "[OK] Rutas precios-examenes y configuracion registradas en app.js"
