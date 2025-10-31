-- PostgreSQL bootstrap script for Noah ERP
-- Execute with: psql -U postgres -f database-setup.sql

DO
$$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'noah_user') THEN
    CREATE ROLE noah_user WITH LOGIN PASSWORD 'q@9dlyU0AAJ9';
  END IF;
END
$$;

DO
$$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'noah_erp') THEN
    CREATE DATABASE noah_erp WITH OWNER = noah_user ENCODING 'UTF8';
  END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE noah_erp TO noah_user;

\connect noah_erp

ALTER SCHEMA public OWNER TO noah_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO noah_user;
