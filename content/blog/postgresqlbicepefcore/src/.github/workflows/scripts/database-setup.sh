#!/usr/bin/env bash
set -euo pipefail

HOST="$1"
APPLICATION_DATABASE_NAME="$2"
APPLICATION_DATABASE_ADMINS_NAME="$3"
APPLICATION_IDENTITY_NAME="$4"
INITIAL_CREATE_POSTGRES_DB_FILE="$5"
INITIAL_CREATE_APPLICATION_DB_FILE="$6"
MIGRATION_SQL="$7"

echo "----------------------------------------------------"
echo "PostgreSQL AAD Auth Migration Script"
echo "----------------------------------------------------"
echo "HOST:                 $HOST"
echo "DATABASE:             $APPLICATION_DATABASE_NAME"
echo "APP DB ADMINS NAME:   $APPLICATION_DATABASE_ADMINS_NAME"
echo "APP ID NAME:          $APPLICATION_IDENTITY_NAME"
echo "POSTGRES DB FILE:     $INITIAL_CREATE_POSTGRES_DB_FILE"
echo "APP DB FILE:          $INITIAL_CREATE_APPLICATION_DB_FILE"
echo "MIGRATION SQL:        $MIGRATION_SQL"
echo "----------------------------------------------------"

if [[ -z "$HOST" ]]; then
  echo "ERROR: HOST argument is empty" >&2
  exit 1
fi

if [[ -z "$APPLICATION_DATABASE_NAME" ]]; then
  echo "ERROR: APPLICATION_DATABASE_NAME argument is empty" >&2
  exit 1
fi

if [[ -z "$APPLICATION_DATABASE_ADMINS_NAME" ]]; then
  echo "ERROR: APPLICATION_DATABASE_ADMINS_NAME argument is empty" >&2
  exit 1
fi

if [[ -z "$APPLICATION_IDENTITY_NAME" ]]; then
  echo "ERROR: APPLICATION_IDENTITY_NAME argument is empty" >&2
  exit 1
fi

echo "Installing PostgreSQL client..."
sudo apt-get update -y
sudo apt-get install -y postgresql-client

echo "Acquiring AAD token..."
AAD_TOKEN=$(az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv)
export PGPASSWORD="$AAD_TOKEN"

if [[ -z "$AAD_TOKEN" ]]; then
  echo "ERROR: Failed to acquire AAD token for PostgreSQL" >&2
  exit 1
fi

# Base connection string (dbname added later)
BASE_CONN="host=$HOST port=5432 user=$APPLICATION_DATABASE_ADMINS_NAME sslmode=require"
# Export variables for envsubst
export APPLICATION_IDENTITY_NAME
export APPLICATION_DATABASE_NAME

echo "Running initial environment setup against the postgres database"
envsubst < "$INITIAL_CREATE_POSTGRES_DB_FILE" > replaced-postgres.sql
psql --set=ON_ERROR_STOP=1 "$BASE_CONN dbname=postgres" -f replaced-postgres.sql

echo "Running initial environment setup against the application database"
envsubst < "$INITIAL_CREATE_APPLICATION_DB_FILE" > replaced-application.sql
psql --set=ON_ERROR_STOP=1 "$BASE_CONN dbname=$APPLICATION_DATABASE_NAME" -f replaced-application.sql

echo "Running migration SQL against the targeted database..."
psql --set=ON_ERROR_STOP=1 "$BASE_CONN dbname=$APPLICATION_DATABASE_NAME" -f "$MIGRATION_SQL"

echo "----------------------------------------------------"
echo "Database setup and migrations completed successfully."
echo "----------------------------------------------------"