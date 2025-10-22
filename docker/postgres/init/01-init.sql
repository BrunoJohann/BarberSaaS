-- Inicialização do banco de dados BarberSaaS
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar timezone padrão
SET timezone = 'America/Sao_Paulo';

-- Criar usuário específico para a aplicação (opcional)
-- CREATE USER barbersaas_app WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE barbersaas TO barbersaas_app;

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Recarregar configurações
SELECT pg_reload_conf();
