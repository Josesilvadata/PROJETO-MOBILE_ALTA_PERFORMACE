# Sobe o banco (Docker) e o back-end Spring Boot com as variaveis de ambiente.
# Uso: na raiz do projeto, rode  .\rodar.ps1
# Requer: Docker em execucao e um arquivo .env na raiz com POSTGRES_PASSWORD=...

$ErrorActionPreference = "Stop"

$raiz = $PSScriptRoot
$backend = Join-Path $raiz "backend_folder\backend"
$envFile = Join-Path $raiz ".env"

# 1) Carrega o .env da raiz como variaveis deste terminal
if (-not (Test-Path $envFile)) {
    Write-Host "Arquivo .env nao encontrado em $raiz. Copie o .env.example para .env e preencha." -ForegroundColor Red
    exit 1
}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)$') {
        Set-Item "env:$($matches[1])" ($matches[2].Trim('"'))
    }
}

if (-not $env:POSTGRES_PASSWORD) {
    Write-Host "POSTGRES_PASSWORD nao esta definido no .env." -ForegroundColor Red
    exit 1
}

# 2) Variaveis do back-end (so define se ainda nao existirem)
if (-not $env:DB_URL)             { $env:DB_URL = "jdbc:postgresql://localhost:5433/projeto_mobile" }
if (-not $env:DB_USER)            { $env:DB_USER = "projeto_dev" }
if (-not $env:DB_PASSWORD)        { $env:DB_PASSWORD = $env:POSTGRES_PASSWORD }
if (-not $env:JWT_EXPIRATION_MS)  { $env:JWT_EXPIRATION_MS = "3600000" }
if (-not $env:JWT_SECRET) {
    # Chave de teste, SO para desenvolvimento local. Nunca use em producao.
    $env:JWT_SECRET = "chave-de-teste-local-com-mais-de-32-caracteres-123"
}

# 3) Sobe o banco
Write-Host "Subindo o banco..." -ForegroundColor Cyan
Push-Location $raiz
docker compose up -d
Pop-Location

# 4) Sobe o back-end
Write-Host "Subindo o back-end..." -ForegroundColor Cyan
Push-Location $backend
try {
    .\mvnw spring-boot:run
}
finally {
    Pop-Location
}
