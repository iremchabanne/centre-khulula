#!/bin/bash
#
# The admission race by hand — CP 8's centrepiece.
#
# Two keepers press "Admit" on the same free enclosure at the same instant.
# One receives 201, the other 409, and the centre never believes two animals
# live in one enclosure. Three defences produce that result:
#
#   1. a transaction    — animal and stay are created together or not at all
#   2. SELECT ... FOR UPDATE — the second request waits, then reads "occupied"
#   3. a partial unique index, as a last resort
#
# The automated version is api/tests/admission-race.test.ts. This script exists
# so the two status codes can be seen, which a passing test does not show.
#
# It writes: the winning admission creates an animal and a stay. Both are
# removed at the end, so the seed data is left as it was.
#
# Run it from the repository root, with the stack up:
#
#     bash api/scripts/check-admission-race.sh
#
set -u

API=http://localhost:3000/api
EMAIL=lerato.dlamini@khulula.org
PASSWORD=khulula-dev-password          # the seed password, development only
COOKIES=$(mktemp)

NAME="Race demo"                       # the name the cleanup deletes on

# The database password is read from the root .env, never written here.
set -a
source .env
set +a

psql_admin() {
  docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" khulula-postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -c "$1"
}

echo "== 1. Log in as a keeper =="
curl -s -c "$COOKIES" -o /dev/null -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
echo "   $EMAIL"

echo
echo "== 2. Take a free enclosure, then a species that belongs in it (RG17) =="
# This order rather than the other way round: a species whose enclosure type is
# fully occupied would leave nothing to race for.
FREE=$(curl -s -b "$COOKIES" "$API/enclosures/free" | jq -r '.[0].id')
TYPE=$(curl -s -b "$COOKIES" "$API/enclosures/free" | jq -r '.[0].type')

if [ "$FREE" = "null" ] || [ -z "$FREE" ]; then
  echo "   No free enclosure at all. Run 'npm run seed' from api/ and try again."
  rm -f "$COOKIES"
  exit 1
fi

SPECIES=$(curl -s -b "$COOKIES" "$API/species" \
  | jq -r --arg t "$TYPE" '[.items[] | select(.enclosure_type == $t)][0].id')

echo "   enclosure $FREE ($TYPE), species $SPECIES"

BODY="{\"name\":\"$NAME\",\"species_id\":$SPECIES,\"enclosure_id\":$FREE,\"sex\":\"unknown\",\"age_class\":\"adult\",\"admission_reason\":\"Concurrency demonstration.\"}"

echo
echo "== 3. Two admissions into that same enclosure, at the same instant =="

# Both requests are started in the background, so they reach the API together.
curl -s -b "$COOKIES" -o /dev/null -X POST "$API/animals" \
  -H 'Content-Type: application/json' -d "$BODY" \
  -w '   keeper A -> HTTP %{http_code}\n' &

curl -s -b "$COOKIES" -o /dev/null -X POST "$API/animals" \
  -H 'Content-Type: application/json' -d "$BODY" \
  -w '   keeper B -> HTTP %{http_code}\n' &

wait

echo
echo "   Expected: one 201 and one 409, in either order."

echo
echo "== 4. One open stay on that enclosure, not two =="
psql_admin "SELECT count(*) FROM stay WHERE enclosure_id = $FREE AND ended_at IS NULL;"

echo
echo "== 5. Clean up, so the seed data is left as it was =="
psql_admin "DELETE FROM stay WHERE animal_id IN (SELECT id FROM animal WHERE name = '$NAME');"
psql_admin "DELETE FROM animal WHERE name = '$NAME' RETURNING id, name;"

rm -f "$COOKIES"
