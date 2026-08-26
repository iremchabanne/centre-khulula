#!/bin/bash
#
# RG12 by hand: an account deactivated while its session is open must lose
# access immediately, on every protected route — not only on GET /auth/me.
#
# This script exists because it caught a real defect on 26/08/2026. Before the
# fix, step 4 below answered 200 on a deactivated account; the check now lives
# in requireSession (api/src/middleware.ts).
#
# It is a manual check, not an automated test: it talks to the running stack
# and it writes to the database. The automated version comes with step 23.
#
# Run it from the repository root, with the stack up and `npm run dev` running:
#
#     bash api/scripts/check-deactivated-account.sh
#
set -u

API=http://localhost:3000/api
EMAIL=lerato.dlamini@khulula.org
PASSWORD=khulula-dev-password          # the seed password, development only
COOKIES=$(mktemp)

# The database password is read from the root .env, never written here.
set -a
source .env
set +a

# -tA: no column headers, no padding — the output stays readable in a screenshot.
psql_admin() {
  docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" khulula-postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -c "$1"
}

echo "== 1. Log in as an active keeper =="
curl -s -c "$COOKIES" -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -w '\nHTTP %{http_code}\n'

echo
echo "== 2. A protected route, while the account is active =="
curl -s -b "$COOKIES" -o /dev/null -w 'GET /enclosures -> HTTP %{http_code}   (expect 200)\n' "$API/enclosures"

echo
echo "== 3. Deactivate the account, session left open =="
psql_admin "UPDATE staff_member SET is_active = false WHERE email = '$EMAIL' RETURNING email, is_active;"

echo
echo "== 4. Same session, same cookie, after deactivation =="
curl -s -b "$COOKIES" -o /dev/null \
  -w 'GET  /enclosures       -> HTTP %{http_code}   (expect 401)\n' "$API/enclosures"
curl -s -b "$COOKIES" -o /dev/null -X POST -H 'Content-Type: application/json' -d '{}' \
  -w 'POST /animals          -> HTTP %{http_code}   (expect 401)\n' "$API/animals"
curl -s -b "$COOKIES" -o /dev/null \
  -w 'GET  /auth/me          -> HTTP %{http_code}   (expect 401)\n' "$API/auth/me"

echo
echo "== 5. Reactivate, so the seed data is left as it was =="
psql_admin "UPDATE staff_member SET is_active = true WHERE email = '$EMAIL' RETURNING email, is_active;"

rm -f "$COOKIES"
