#!/bin/bash
#
# Access control by hand, on both axes at once.
#
#   role     — the outcome of an animal is a veterinarian's act (RG5, RG6)
#   is_admin — the donation list is an administrator's screen
#
# Nothing is written. The veterinarian sends a deliberately empty body: a 400
# from the validation proves she passed the role gate, where the keeper was
# stopped at it with a 403. Same route, same request, two different answers.
#
# Run it from the repository root, with the stack up:
#
#     bash api/scripts/check-access-control.sh
#
set -u

API=http://localhost:3000/api
PASSWORD=khulula-dev-password          # the seed password, development only

KEEPER=lerato.dlamini@khulula.org      # keeper, not an administrator
VET=aisha.patel@khulula.org            # veterinarian, not an administrator
ADMIN=sipho.ndlovu@khulula.org         # keeper AND administrator

KEEPER_COOKIES=$(mktemp)
VET_COOKIES=$(mktemp)
ADMIN_COOKIES=$(mktemp)

# Any animal id: the request never reaches the animal, it is stopped before.
ANIMAL=1

login() {
  curl -s -c "$2" -o /dev/null -X POST "$API/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$PASSWORD\"}"
}

login "$KEEPER" "$KEEPER_COOKIES"
login "$VET" "$VET_COOKIES"
login "$ADMIN" "$ADMIN_COOKIES"

echo "== Axis 1: role — PATCH /animals/$ANIMAL/outcome =="
echo "   The route is reserved for veterinarians (RG5, RG6)."
echo

curl -s -b "$KEEPER_COOKIES" -o /dev/null -X PATCH -H 'Content-Type: application/json' -d '{}' \
  -w '   keeper        -> HTTP %{http_code}   (403: stopped at the role gate)\n' \
  "$API/animals/$ANIMAL/outcome"

curl -s -b "$VET_COOKIES" -o /dev/null -X PATCH -H 'Content-Type: application/json' -d '{}' \
  -w '   veterinarian  -> HTTP %{http_code}   (400: past the gate, empty body refused)\n' \
  "$API/animals/$ANIMAL/outcome"

echo
echo "== Axis 2: is_admin — GET /donations =="
echo "   The screen is reserved for administrators. Both accounts below are"
echo "   keepers: only their is_admin flag differs."
echo

curl -s -b "$KEEPER_COOKIES" -o /dev/null \
  -w '   keeper, not admin -> HTTP %{http_code}   (expect 403)\n' "$API/donations"

curl -s -b "$ADMIN_COOKIES" -o /dev/null \
  -w '   keeper AND admin  -> HTTP %{http_code}   (expect 200)\n' "$API/donations"

echo
echo "Nothing was written. Every refusal came from the server, not from a hidden button."

rm -f "$KEEPER_COOKIES" "$VET_COOKIES" "$ADMIN_COOKIES"
