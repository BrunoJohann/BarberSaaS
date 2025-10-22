# 🐳 Docker Setup - BarberSaaS

Este documento explica como configurar e usar o ambiente Docker para o projeto BarberSaaS.

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Docker Compose](https://docs.docker.com/compose/install/) (geralmente incluído no Docker Desktop)

## 🚀 Início Rápido

### 1. Iniciar os Serviços

**Windows (PowerShell):**

```powershell
.\scripts\docker.ps1 start
```

**Linux/macOS (Bash):**

```bash
./scripts/docker.sh start
```

### 2. Configurar o Banco de Dados

Após os serviços estarem rodando, execute as migrações:

```bash
npm run db:migrate
npm run db:seed
```

### 3. Iniciar a Aplicação

```bash
npm run dev
```

## 🗄️ Serviços Incluídos

### PostgreSQL (Porta 5432)

- **Banco:** `barbersaas`
- **Usuário:** `barbersaas`
- **Senha:** `barbersaas123`
- **Host:** `localhost` (desenvolvimento) / `postgres` (Docker)

### Redis (Porta 6379)

- **Senha:** `barbersaas123`
- **Host:** `localhost` (desenvolvimento) / `redis` (Docker)

### pgAdmin (Porta 8080)

- **URL:** http://localhost:8080
- **Email:** admin@barbersaas.com
- **Senha:** admin123

## 📝 Comandos Disponíveis

### Windows (PowerShell)

```powershell
# Iniciar serviços
.\scripts\docker.ps1 start

# Parar serviços
.\scripts\docker.ps1 stop

# Reiniciar serviços
.\scripts\docker.ps1 restart

# Ver logs
.\scripts\docker.ps1 logs

# Ver status
.\scripts\docker.ps1 status

# Fazer backup
.\scripts\docker.ps1 backup

# Restaurar backup
.\scripts\docker.ps1 restore backup_file.sql

# Limpar volumes (CUIDADO!)
.\scripts\docker.ps1 clean
```

### Linux/macOS (Bash)

```bash
# Iniciar serviços
./scripts/docker.sh start

# Parar serviços
./scripts/docker.sh stop

# Reiniciar serviços
./scripts/docker.sh restart

# Ver logs
./scripts/docker.sh logs

# Ver status
./scripts/docker.sh status

# Fazer backup
./scripts/docker.sh backup

# Restaurar backup
./scripts/docker.sh restore backup_file.sql

# Limpar volumes (CUIDADO!)
./scripts/docker.sh clean
```

## 🔧 Configuração

### Variáveis de Ambiente

O arquivo `docker.env` contém as configurações para o ambiente Docker:

```env
# Database Configuration for Docker
DATABASE_URL="postgresql://barbersaas:barbersaas123@postgres:5432/barbersaas?schema=public"

# Redis Configuration for Docker
REDIS_URL="redis://:barbersaas123@redis:6379"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="barbersaas-secret-key-change-in-production"
```

### Conectar ao Banco de Dados

**String de Conexão (desenvolvimento):**

```
postgresql://barbersaas:barbersaas123@localhost:5432/barbersaas?schema=public
```

**String de Conexão (Docker interno):**

```
postgresql://barbersaas:barbersaas123@postgres:5432/barbersaas?schema=public
```

## 📊 Monitoramento

### Verificar Status dos Serviços

```bash
docker-compose ps
```

### Ver Logs em Tempo Real

```bash
docker-compose logs -f
```

### Ver Logs de um Serviço Específico

```bash
docker-compose logs -f postgres
docker-compose logs -f redis
```

## 💾 Backup e Restore

### Fazer Backup

```bash
# Windows
.\scripts\docker.ps1 backup

# Linux/macOS
./scripts/docker.sh backup
```

Os backups são salvos na pasta `backups/` com timestamp.

### Restaurar Backup

```bash
# Windows
.\scripts\docker.ps1 restore backup_20240120_143000.sql

# Linux/macOS
./scripts/docker.sh restore backup_20240120_143000.sql
```

## 🧹 Limpeza

### Parar e Remover Volumes (CUIDADO!)

⚠️ **ATENÇÃO:** Esta operação remove TODOS os dados dos bancos!

```bash
# Windows
.\scripts\docker.ps1 clean

# Linux/macOS
./scripts/docker.sh clean
```

### Limpeza Manual

```bash
# Parar serviços
docker-compose down

# Remover volumes
docker-compose down -v

# Remover imagens não utilizadas
docker image prune -f

# Remover volumes não utilizados
docker volume prune -f
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Porta já em uso:**

   ```bash
   # Verificar processos usando as portas
   netstat -tulpn | grep :5432
   netstat -tulpn | grep :6379
   ```

2. **Docker não está rodando:**

   - Verifique se o Docker Desktop está iniciado
   - No Windows, verifique se o WSL2 está habilitado

3. **Erro de permissão (Linux/macOS):**

   ```bash
   chmod +x scripts/docker.sh
   ```

4. **Banco não conecta:**
   - Aguarde alguns segundos após iniciar os serviços
   - Verifique se o PostgreSQL está saudável: `docker-compose ps`

### Logs de Debug

```bash
# Ver logs detalhados
docker-compose logs --tail=100 postgres
docker-compose logs --tail=100 redis
```

### Conectar ao PostgreSQL via CLI

```bash
# Conectar ao container
docker-compose exec postgres psql -U barbersaas -d barbersaas

# Executar comando SQL
docker-compose exec postgres psql -U barbersaas -d barbersaas -c "SELECT version();"
```

## 📁 Estrutura de Arquivos

```
├── docker-compose.yml          # Configuração dos serviços
├── docker.env                  # Variáveis de ambiente para Docker
├── docker/
│   └── postgres/
│       └── init/
│           └── 01-init.sql     # Script de inicialização do PostgreSQL
├── scripts/
│   ├── docker.sh              # Script Bash para gerenciamento
│   └── docker.ps1             # Script PowerShell para gerenciamento
└── backups/                   # Diretório para backups (criado automaticamente)
```

## 🔒 Segurança

### Para Produção

1. **Altere as senhas padrão:**

   - PostgreSQL: `barbersaas123`
   - Redis: `barbersaas123`
   - pgAdmin: `admin123`

2. **Use variáveis de ambiente:**

   ```bash
   export POSTGRES_PASSWORD="sua_senha_segura"
   export REDIS_PASSWORD="sua_senha_segura"
   ```

3. **Configure SSL/TLS:**

   - Adicione certificados SSL no `docker-compose.yml`
   - Configure conexões seguras

4. **Limite acesso de rede:**
   - Use redes Docker isoladas
   - Configure firewalls apropriados

## 📚 Recursos Adicionais

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [pgAdmin Docker Image](https://hub.docker.com/r/dpage/pgadmin4)
