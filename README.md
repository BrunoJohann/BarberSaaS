# BarberSaaS

Sistema de agendamentos para barbearias - MVP com Next.js 14+, Prisma, TypeScript e multi-tenancy.

## 🚀 Funcionalidades

- **Multi-tenancy** por subdomínio e subpath
- **RBAC** (Role-Based Access Control) com OWNER/STAFF/CUSTOMER
- **Agendamentos** com anti-overbooking
- **Gestão de barbearias** e barbeiros
- **Serviços** configuráveis por barbearia
- **Granularidade de slots** configurável
- **APIs REST** completas
- **Feed ICS** para calendários
- **Dashboard** administrativo

## 🛠️ Tecnologias

- **Next.js 14+** (App Router)
- **TypeScript**
- **Prisma** (PostgreSQL)
- **NextAuth.js**
- **Tailwind CSS**
- **Zod** (validação)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (barber)/          # Frontend público
│   │   ├── page.tsx
│   │   └── t/[tenant]/[barbershop]/
│   ├── (dashboard)/       # Dashboard administrativo
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── home/
│   │   └── barbershops/
│   └── api/               # APIs
│       ├── services/
│       ├── slots/
│       ├── appointments/
│       ├── ics/
│       └── admin/
├── lib/
│   ├── auth/              # Autenticação e RBAC
│   ├── tenancy/           # Multi-tenancy
│   ├── db/                # Prisma
│   ├── calendar/          # ICS e calendários
│   └── config/            # Configurações
└── types/                 # Tipos TypeScript
```

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

```bash
# Copiar arquivo de ambiente
cp env.example .env

# Editar .env com suas configurações
DATABASE_URL="postgresql://user:password@localhost:5432/barber_mvp"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="changeme"
APP_DEFAULT_TIMEZONE="America/Sao_Paulo"
SLOT_GRANULARITY_MINUTES="15"
```

### 3. Configurar Prisma

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Popular banco com dados de exemplo
npm run prisma:seed
```

### 4. Executar Aplicação

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🔑 Credenciais de Teste

Após executar o seed:

- **OWNER**: `owner@acme.com` / `owner123`
- **STAFF**: `staff@acme.com` / `staff123`

## 🌐 URLs de Acesso

### Frontend Público (Agendamentos)

- `http://localhost:3000` - Página inicial
- `http://localhost:3000/t/acme/centro` - Barbearia Centro
- `http://localhost:3000/t/acme/moinhos` - Barbearia Moinhos

### Dashboard Administrativo

- `http://localhost:3000/login` - Login
- `http://localhost:3000/home` - Dashboard principal
- `http://localhost:3000/barbershops` - Gestão de barbearias

## 📊 Dados de Exemplo

O seed cria:

- **Tenant**: ACME Barbearias
- **2 Barbearias**: Centro (granularidade 15min) e Moinhos (usa .env)
- **4 Barbeiros**: 2 por barbearia
- **6 Serviços**: 3 por barbearia (Corte, Sobrancelha, Barba)
- **2 Agendamentos**: Exemplos de agendamentos
- **Períodos de trabalho**: Seg-Sáb 09:00-12:00 e 14:00-18:00

## 🔧 Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento
npm run build            # Build para produção
npm run start            # Executar produção
npm run lint             # Linting
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Executar migrações
npm run prisma:seed      # Popular banco
npm run prisma:studio    # Interface visual do banco
```

## 🏗️ Arquitetura

### Multi-tenancy

- **Subdomínio**: `acme.localhost:3000`
- **Subpath**: `/t/acme/centro`
- Resolução automática via middleware

### RBAC

- **OWNER**: Acesso total ao tenant
- **STAFF**: Acesso limitado a barbearias específicas
- **CUSTOMER**: Apenas agendamentos

### APIs

- **Públicas**: `/api/services`, `/api/slots`, `/api/appointments`
- **Admin**: `/api/admin/*`
- **ICS**: `/api/ics/barber/[id]`, `/api/ics/appointment/[id]`

## 📝 Próximos Passos

Este é o **Prompt 1** - base do projeto. Os próximos prompts implementarão:

- **Prompt 2**: UI completa e integrações
- **Prompt 3**: Engine de agenda, ICS real e métricas

## 🐛 Troubleshooting

### Erro de Conexão com Banco

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`

### Erro de Migração

```bash
npx prisma migrate reset
npm run prisma:migrate
npm run prisma:seed
```

### Erro de Build

```bash
npm run prisma:generate
npm run build
```
