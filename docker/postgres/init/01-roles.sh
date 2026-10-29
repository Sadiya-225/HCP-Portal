#!/bin/sh
# Runs once on first initialization of an empty PostgreSQL data volume.
# Creates the migration and application roles with least privilege.
# Idempotent-safe: uses CREATE ROLE only when the role does not exist.
set -eu

psql -v ON_ERROR_STOP=1 \
  --username "${POSTGRES_USER:-postgres}" \
  --dbname "$POSTGRES_DB" \
  -v app_user="$APP_DB_USER" \
  -v app_password="$APP_DB_PASSWORD" \
  -v mig_user="$MIGRATION_DB_USER" \
  -v mig_password="$MIGRATION_DB_PASSWORD" \
  -v dbname="$POSTGRES_DB" <<'SQL'
-- Migration role: can connect and perform DDL (tables, indexes) in the
-- public schema, but owns no data-grant privileges beyond that.
SELECT format(
  'CREATE ROLE %I LOGIN PASSWORD %L',
  :'mig_user',
  :'mig_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'mig_user')
\gexec

-- Application role: connect + DML only.
SELECT format(
  'CREATE ROLE %I LOGIN PASSWORD %L',
  :'app_user',
  :'app_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user')
\gexec

-- Keep passwords fresh if the script ever re-runs.
SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'mig_user', :'mig_password')
\gexec
SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password')
\gexec

SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'dbname', :'mig_user')
\gexec
SELECT format('GRANT CREATE ON DATABASE %I TO %I', :'dbname', :'mig_user')
\gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'dbname', :'app_user')
\gexec

-- Remove default public-schema CREATE from everyone; hand it only to the
-- migration role.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SELECT format('GRANT USAGE, CREATE ON SCHEMA public TO %I', :'mig_user')
\gexec
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'app_user')
\gexec

-- Application role gets DML on everything the migration role has created
-- and will create in the public schema.
SELECT format(
  'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I',
  :'app_user'
)
\gexec
SELECT format(
  'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I',
  :'app_user'
)
\gexec
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public '
    || 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I',
  :'mig_user',
  :'app_user'
)
\gexec
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public '
    || 'GRANT USAGE, SELECT ON SEQUENCES TO %I',
  :'mig_user',
  :'app_user'
)
\gexec
SQL
