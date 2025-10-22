# 🚀 Quick Start com Docker - BarberSaaS

## ⚡ Início Rápido (5 minutos)

### 1. Pré-requisitos

- Docker Desktop instalado e rodando
- Node.js 18+ instalado

### 2. Clone e Configure

```bash
git clone <seu-repositorio>
cd BarberSaaS
npm install
```

### 3. Inicie os Serviços Docker

```bash
# Windows (PowerShell)
.\scripts\docker.ps1 start

# Linux/macOS (Bash)
./scripts/docker.sh start
```

### 4. Configure o Banco de Dados

```bash
npm run db:migrate
npm run db:seed
```

### 5. Inicie a Aplicação

```bash
npm run dev
```

### 6. Acesse a Aplicação

- **Aplicação:** http://localhost:3000
- **pgAdmin:** http://localhost:8080
  - Email: admin@barbersaas.com
  - Senha: admin123

## 🛠️ Comandos Úteis

### Gerenciar Docker

```bash
# Ver status
npm run docker:status

# Ver logs
npm run docker:logs

# Parar serviços
npm run docker:stop

# Reiniciar serviços
npm run docker:restart
```

### Gerenciar Banco de Dados

```bash
# Executar migrações
npm run db:migrate

# Popular banco com dados de teste
npm run db:seed

# Abrir Prisma Studio
npm run db:studio
```

### Testes

```bash
# Executar testes
npm run test:run

# Interface de testes
npm run test:ui
```

## 🔧 Configuração

### Variáveis de Ambiente

O arquivo `docker.env` já está configurado para o ambiente Docker. Se precisar alterar:

1. Edite `docker.env`
2. Reinicie os serviços: `npm run docker:restart`

### Conectar ao Banco

- **Host:** localhost
- **Porta:** 5432
- **Banco:** barbersaas
- **Usuário:** barbersaas
- **Senha:** barbersaas123

## 🆘 Problemas Comuns

### Porta já em uso

```bash
# Verificar processos
netstat -tulpn | grep :5432
netstat -tulpn | grep :6379

# Parar serviços
npm run docker:stop
```

### Docker não inicia

1. Verifique se Docker Desktop está rodando
2. Reinicie Docker Desktop
3. Execute: `docker system prune -f`

### Banco não conecta

1. Aguarde 30 segundos após iniciar
2. Verifique status: `npm run docker:status`
3. Veja logs: `npm run docker:logs`

## 📊 Monitoramento

### Ver Logs em Tempo Real

```bash
npm run docker:logs
```

### Status dos Serviços

```bash
npm run docker:status
```

### Conectar ao PostgreSQL

```bash
docker-compose exec postgres psql -U barbersaas -d barbersaas
```

## 🧹 Limpeza

### Parar e Limpar Tudo

```bash
npm run docker:clean
```

⚠️ **CUIDADO:** Remove todos os dados dos bancos!

## 📚 Próximos Passos

1. **Desenvolvimento:** Comece editando os arquivos em `src/`
2. **Banco:** Use Prisma Studio para visualizar dados
3. **Testes:** Execute `npm run test:run` para verificar funcionalidades
4. **Deploy:** Configure variáveis de ambiente para produção

## 🔗 Links Úteis

- [Documentação Docker Completa](./DOCKER.md)
- [Prisma Studio](http://localhost:5555) (após `npm run db:studio`)
- [pgAdmin](http://localhost:8080)
- [Aplicação](http://localhost:3000)
