$port = if ($env:PORT) { $env:PORT } else { 8080 }
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$mimeTypes = @{
    '.html' = 'text/html'
    '.css'  = 'text/css'
    '.js'   = 'application/javascript'
    '.json' = 'application/json'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "  Pokemon World Server running!" -ForegroundColor Green
Write-Host "  Open in your browser: http://localhost:$port" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $path = $request.Url.LocalPath
            if ($path -eq '/') { $path = '/index.html' }

            $filePath = Join-Path $root ($path -replace '/', '\')

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath)
                $contentType = $mimeTypes[$ext]
                if (-not $contentType) { $contentType = 'application/octet-stream' }

                $response.ContentType = $contentType
                $response.StatusCode = 200
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = [long]$bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $response.ContentType = 'text/plain'
                $msg = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
                $response.ContentLength64 = [long]$msg.Length
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
        } catch {
            Write-Host "Request error: $_" -ForegroundColor Yellow
        } finally {
            $response.OutputStream.Close()
        }
    }
} finally {
    $listener.Stop()
}
