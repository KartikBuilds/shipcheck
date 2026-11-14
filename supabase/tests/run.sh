#!/usr/bin/env bash
# Runs the database security tests on a throwaway PostgreSQL database.
set -euo pipefail
DB=shipcheck_rls_test
dropdb --if-exists "$DB" >/dev/null 2>&1 || true
createdb "$DB"
cd "$(dirname "$0")"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f auth-shim.sql
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f ../migrations/0001_init.sql
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f rls.test.sql 2>&1 | grep -E "PASS|FAIL|ERROR"
dropdb "$DB"
