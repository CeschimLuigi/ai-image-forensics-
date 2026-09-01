# Compila o projeto em PDF manualmente (alternativa ao Ctrl+S do VS Code).
# Uso:  .\build.ps1          -> compila uma vez
#       .\build.ps1 -Watch   -> recompila a cada salvamento do .tex

param([switch]$Watch)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$tex = 'projeto-pesquisa.tex'
$out = Join-Path $PSScriptRoot 'build'
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

function Invoke-Build {
    Write-Host "[build] compilando $tex ..." -ForegroundColor Cyan
    # Duas passadas: a segunda resolve o sumario.
    1..2 | ForEach-Object {
        & pdflatex -synctex=1 -interaction=nonstopmode -file-line-error `
                   -output-directory="$out" $tex | Out-Null
    }
    $pdf = Join-Path $out 'projeto-pesquisa.pdf'
    if (Test-Path $pdf) {
        Write-Host "[build] OK -> $pdf" -ForegroundColor Green
    } else {
        Write-Host "[build] falhou. Veja $out\projeto-pesquisa.log" -ForegroundColor Red
    }
}

Invoke-Build

if ($Watch) {
    Write-Host "[watch] observando $tex (Ctrl+C para sair)" -ForegroundColor Yellow
    $fsw = New-Object System.IO.FileSystemWatcher $PSScriptRoot, $tex
    $fsw.NotifyFilter = [System.IO.NotifyFilters]::LastWrite
    while ($true) {
        $r = $fsw.WaitForChanged([System.IO.WatcherChangeTypes]::Changed, 1000)
        if (-not $r.TimedOut) {
            Start-Sleep -Milliseconds 300   # espera o editor terminar de gravar
            Invoke-Build
        }
    }
}
