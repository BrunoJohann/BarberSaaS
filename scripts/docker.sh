#!/bin/bash

# Script para gerenciar o Docker Compose do BarberSaaS

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[BarberSaaS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[BarberSaaS]${NC} $1"
}

print_error() {
    echo -e "${RED}[BarberSaaS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[BarberSaaS]${NC} $1"
}

# Verificar se o Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando. Por favor, inicie o Docker Desktop."
        exit 1
    fi
}

# Função para iniciar os serviços
start() {
    print_message "Iniciando serviços do BarberSaaS..."
    check_docker
    
    # Copiar arquivo de ambiente se não existir
    if [ ! -f .env ]; then
        print_info "Copiando docker.env para .env..."
        cp docker.env .env
    fi
    
    docker-compose up -d
    
    print_message "Serviços iniciados com sucesso!"
    print_info "PostgreSQL: localhost:5432"
    print_info "Redis: localhost:6379"
    print_info "pgAdmin: http://localhost:8080"
    print_info "  Email: admin@barbersaas.com"
    print_info "  Senha: admin123"
    
    print_warning "Aguarde alguns segundos para os serviços ficarem prontos..."
    print_info "Execute 'npm run db:migrate' para configurar o banco de dados."
}

# Função para parar os serviços
stop() {
    print_message "Parando serviços do BarberSaaS..."
    docker-compose down
    print_message "Serviços parados com sucesso!"
}

# Função para reiniciar os serviços
restart() {
    print_message "Reiniciando serviços do BarberSaaS..."
    stop
    start
}

# Função para ver logs
logs() {
    print_message "Mostrando logs dos serviços..."
    docker-compose logs -f
}

# Função para ver status
status() {
    print_message "Status dos serviços:"
    docker-compose ps
}

# Função para limpar volumes (CUIDADO!)
clean() {
    print_warning "ATENÇÃO: Esta operação irá remover TODOS os dados dos bancos!"
    read -p "Tem certeza? Digite 'yes' para confirmar: " confirm
    
    if [ "$confirm" = "yes" ]; then
        print_message "Parando e removendo volumes..."
        docker-compose down -v
        docker volume prune -f
        print_message "Volumes removidos com sucesso!"
    else
        print_info "Operação cancelada."
    fi
}

# Função para backup do banco
backup() {
    print_message "Fazendo backup do banco de dados..."
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="backup_${timestamp}.sql"
    
    docker-compose exec postgres pg_dump -U barbersaas barbersaas > "backups/${backup_file}"
    print_message "Backup salvo em: backups/${backup_file}"
}

# Função para restaurar backup
restore() {
    if [ -z "$1" ]; then
        print_error "Por favor, forneça o arquivo de backup: ./scripts/docker.sh restore backup_file.sql"
        exit 1
    fi
    
    print_message "Restaurando backup: $1"
    docker-compose exec -T postgres psql -U barbersaas barbersaas < "backups/$1"
    print_message "Backup restaurado com sucesso!"
}

# Função para mostrar ajuda
help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start     - Inicia todos os serviços"
    echo "  stop      - Para todos os serviços"
    echo "  restart   - Reinicia todos os serviços"
    echo "  logs      - Mostra logs dos serviços"
    echo "  status    - Mostra status dos serviços"
    echo "  clean     - Remove todos os volumes (CUIDADO!)"
    echo "  backup    - Faz backup do banco de dados"
    echo "  restore   - Restaura backup do banco de dados"
    echo "  help      - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 start"
    echo "  $0 logs"
    echo "  $0 backup"
    echo "  $0 restore backup_20240120_143000.sql"
}

# Criar diretório de backups se não existir
mkdir -p backups

# Processar comando
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Comando desconhecido: $1"
        help
        exit 1
        ;;
esac
