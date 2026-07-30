[CmdletBinding()]
param(
    [ValidateSet("User", "Project")]
    [string]$Scope = "User",

    [string]$Project = (Get-Location).Path,

    [ValidateSet("Copy", "Link")]
    [string]$Mode = "Copy",

    [switch]$Force
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$SourceDir = Join-Path $RepoRoot "skills/better-art-direction"

if (-not (Test-Path (Join-Path $SourceDir "SKILL.md"))) {
    throw "Не найден исходный навык: $SourceDir"
}

if ($Scope -eq "User") {
    if (-not $HOME) { throw "Переменная HOME не задана" }
    $DestRoot = Join-Path $HOME ".agents/skills"
} else {
    $ProjectRoot = [System.IO.Path]::GetFullPath($Project)
    New-Item -ItemType Directory -Path $ProjectRoot -Force | Out-Null
    $DestRoot = Join-Path $ProjectRoot ".agents/skills"
}

$DestDir = Join-Path $DestRoot "better-art-direction"
New-Item -ItemType Directory -Path $DestRoot -Force | Out-Null

if (Test-Path $DestDir) {
    if ($Force) {
        Remove-Item -Path $DestDir -Recurse -Force
    } else {
        throw "Навык уже существует: $DestDir. Добавьте -Force для замены."
    }
}

if ($Mode -eq "Link") {
    try {
        New-Item -ItemType SymbolicLink -Path $DestDir -Target $SourceDir | Out-Null
    } catch {
        throw "Не удалось создать символическую ссылку. В Windows включите режим разработчика или используйте -Mode Copy. $($_.Exception.Message)"
    }
} else {
    Copy-Item -Path $SourceDir -Destination $DestDir -Recurse
}

if (-not (Test-Path (Join-Path $DestDir "SKILL.md"))) {
    throw "Установка не завершена: нет SKILL.md"
}

Write-Host "✅ Better Art Direction установлен: $DestDir"
Write-Host '🔎 В Codex выполните /skills или вызовите $better-art-direction.'
Write-Host "♻️ Если навык не появился, перезапустите Codex."
