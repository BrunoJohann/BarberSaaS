# Script PowerShell para gerenciar o Docker Compose do BarberSaaS

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(Position=1)]
    [string]$BackupFile = ""
)

# Função para imprimir mensagens coloridas
function Write-Message {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "[BarberSaaS] $Message" -ForegroundColor $Color
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[BarberSaaS] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[BarberSaaS] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[BarberSaaS] $Message" -ForegroundColor Blue
}

# Verificar se o Docker está rodando
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Função para iniciar os serviços
function Start-Services {
    param([string]$Environment = "dev")
    
    Write-Message "Iniciando serviços do BarberSaaS ($Environment)..."
    
    if (-not (Test-Docker)) {
        Write-Error "Docker não está rodando. Por favor, inicie o Docker Desktop."
        exit 1
    }
    
    # Copiar arquivo de ambiente se não existir
    if (-not (Test-Path ".env")) {
        Write-Info "Copiando docker.env para .env..."
        Copy-Item "docker.env" ".env"
    }
    
    # Escolher arquivo de configuração baseado no ambiente
    $composeFiles = @("docker-compose.yml")
    
    switch ($Environment.ToLower()) {
        "prod" {
            $composeFiles += "docker-compose.prod.yml"
            Write-Info "Usando configuração de PRODUÇÃO"
        }
        "test" {
            $composeFiles += "docker-compose.test.yml"
            Write-Info "Usando configuração de TESTES"
        }
        default {
            Write-Info "Usando configuração de DESENVOLVIMENTO"
        }
    }
    
    $composeArgs = $composeFiles | ForEach-Object { "-f", $_ }
    docker-compose @composeArgs up -d
    
    Write-Message "Serviços iniciados com sucesso!"
    
    if ($Environment -eq "test") {
        Write-Info "PostgreSQL: localhost:5433"
        Write-Info "Redis: localhost:6380"
    } else {
        Write-Info "PostgreSQL: localhost:5432"
        Write-Info "Redis: localhost:6379"
        if ($Environment -ne "prod") {
            Write-Info "pgAdmin: http://localhost:8080"
            Write-Info "  Email: admin@barbersaas.com"
            Write-Info "  Senha: admin123"
        }
    }
    
    Write-Warning "Aguarde alguns segundos para os serviços ficarem prontos..."
    if ($Environment -ne "prod") {
        Write-Info "Execute 'npm run db:migrate' para configurar o banco de dados."
    }
}

# Função para parar os serviços
function Stop-Services {
    Write-Message "Parando serviços do BarberSaaS..."
    docker-compose down
    Write-Message "Serviços parados com sucesso!"
}

# Função para reiniciar os serviços
function Restart-Services {
    Write-Message "Reiniciando serviços do BarberSaaS..."
    Stop-Services
    Start-Services
}

# Função para ver logs
function Show-Logs {
    Write-Message "Mostrando logs dos serviços..."
    docker-compose logs -f
}

# Função para ver status
function Show-Status {
    Write-Message "Status dos serviços:"
    docker-compose ps
}

# Função para limpar volumes (CUIDADO!)
function Clean-Volumes {
    Write-Warning "ATENÇÃO: Esta operação irá remover TODOS os dados dos bancos!"
    $confirm = Read-Host "Tem certeza? Digite 'yes' para confirmar"
    
    if ($confirm -eq "yes") {
        Write-Message "Parando e removendo volumes..."
        docker-compose down -v
        docker volume prune -f
        Write-Message "Volumes removidos com sucesso!"
    }
    else {
        Write-Info "Operação cancelada."
    }
}

# Função para backup do banco
function Backup-Database {
    Write-Message "Fazendo backup do banco de dados..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.sql"
    
    # Criar diretório de backups se não existir
    if (-not (Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups"
    }
    
    docker-compose exec postgres pg_dump -U barbersaas barbersaas | Out-File -FilePath "backups/$backupFile" -Encoding UTF8
    Write-Message "Backup salvo em: backups/$backupFile"
}

# Função para restaurar backup
function Restore-Database {
    if ([string]::IsNullOrEmpty($BackupFile)) {
        Write-Error "Por favor, forneça o arquivo de backup: .\scripts\docker.ps1 restore backup_file.sql"
        exit 1
    }
    
    Write-Message "Restaurando backup: $BackupFile"
    Get-Content "backups/$BackupFile" | docker-compose exec -T postgres psql -U barbersaas barbersaas
    Write-Message "Backup restaurado com sucesso!"
}

# Função para mostrar ajuda
function Show-Help {
    Write-Host "Uso: .\scripts\docker.ps1 [comando] [ambiente] [arquivo_backup]"
    Write-Host ""
    Write-Host "Comandos disponíveis:"
    Write-Host "  start     - Inicia todos os serviços"
    Write-Host "  stop      - Para todos os serviços"
    Write-Host "  restart   - Reinicia todos os serviços"
    Write-Host "  logs      - Mostra logs dos serviços"
    Write-Host "  status    - Mostra status dos serviços"
    Write-Host "  clean     - Remove todos os volumes (CUIDADO!)"
    Write-Host "  backup    - Faz backup do banco de dados"
    Write-Host "  restore   - Restaura backup do banco de dados"
    Write-Host "  help      - Mostra esta ajuda"
    Write-Host ""
    Write-Host "Ambientes disponíveis:"
    Write-Host "  dev       - Desenvolvimento (padrão)"
    Write-Host "  test      - Testes"
    Write-Host "  prod      - Produção"
    Write-Host ""
    Write-Host "Exemplos:"
    Write-Host "  .\scripts\docker.ps1 start"
    Write-Host "  .\scripts\docker.ps1 start test"
    Write-Host "  .\scripts\docker.ps1 start prod"
    Write-Host "  .\scripts\docker.ps1 logs"
    Write-Host "  .\scripts\docker.ps1 backup"
    Write-Host "  .\scripts\docker.ps1 restore backup_20240120_143000.sql"
}

# Processar comando
switch ($Command.ToLower()) {
    "start" {
        Start-Services -Environment $BackupFile
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "clean" {
        Clean-Volumes
    }
    "backup" {
        Backup-Database
    }
    "restore" {
        Restore-Database
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Comando desconhecido: $Command"
        Show-Help
        exit 1
    }
}
