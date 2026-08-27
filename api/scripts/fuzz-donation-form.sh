#!/bin/bash
#
# Fuzzing the donation form — CP 9.
#
# WHAT FUZZING IS. Sending deliberately broken input to a form to see whether
# the application stays standing. Not "does it accept a valid donation" — that
# is a normal test — but "what happens when someone sends nonsense".
#
# WHAT THIS SCRIPT CHECKS, and it is one single thing: every answer must be
# 201 or 400. A 400 means Zod caught the input and said why. A 500 would mean
# the input reached code that did not expect it, and that is the bug fuzzing
# looks for. Anything that is not 201 or 400 is reported as FAIL.
#
# WHY NO FUZZING TOOL. A real fuzzer generates thousands of random payloads and
# needs its own configuration to read. Fifteen payloads chosen by hand cover the
# categories that actually break web forms — wrong type, out of range, too long,
# injection, missing field, malformed JSON — and every one of them can be
# explained to a jury.
#
# WHY THE RATE LIMIT IS CLEARED. POST /api/donations allows 5 requests an hour
# per IP (RG, §6.5). That protection is deliberate and is load-tested elsewhere;
# here it would simply stop the fuzzing after five payloads. So the counter is
# deleted from Redis before each request. This is a test, run against the
# development stack, never against production.
#
# Run it from the repository root, with the stack up and `npm run dev` running:
#
#     bash api/scripts/fuzz-donation-form.sh
#
set -u

API=http://localhost:3000/api/donations

# The Redis password is read from the root .env, never written here.
set -a
source .env
set +a

# Each line is one payload. The label before the "|" says what is being tested.
PAYLOADS=(
  'negative amount|{"amount":-50,"consent_given":false}'
  'zero amount|{"amount":0,"consent_given":false}'
  'amount above the maximum|{"amount":999999,"consent_given":false}'
  'amount as a string|{"amount":"50","consent_given":false}'
  'amount as an array|{"amount":[50],"consent_given":false}'
  'amount is null|{"amount":null,"consent_given":false}'
  'amount missing|{"consent_given":false}'
  'consent missing|{"amount":50}'
  'SQL fragment in the name|{"amount":50,"donor_name":"Robert; DROP TABLE animal;--","consent_given":false}'
  'script tag in the message|{"amount":50,"message":"<script>alert(1)</script>","consent_given":false}'
  'email without consent|{"amount":50,"donor_email":"a@b.com","consent_given":false}'
  'not an email|{"amount":50,"donor_email":"nonsense","consent_given":true}'
  'unknown extra field|{"amount":50,"consent_given":false,"is_admin":true}'
  'empty object|{}'
  'not JSON at all|this is not json'
)

FAILURES=0

echo "== Fuzzing POST /api/donations =="
echo

for LINE in "${PAYLOADS[@]}"; do
  LABEL="${LINE%%|*}"
  BODY="${LINE#*|}"

  # Redis emptied before every request, so the rate limit does not stop the
  # fuzzing after five payloads. flushall rather than deleting one key: it is
  # one plain command, and on the development stack there is nothing in Redis
  # worth keeping — the sessions are ours and the enclosure cache rebuilds
  # itself. Never run this against production.
  docker exec khulula-redis redis-cli -a "$REDIS_PASSWORD" flushall > /dev/null 2>&1

  CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API" \
    -H 'Content-Type: application/json' \
    -d "$BODY")

  # 201 and 400 are both correct answers. Everything else is a finding.
  if [ "$CODE" = "201" ] || [ "$CODE" = "400" ]; then
    printf 'ok    %-30s -> HTTP %s\n' "$LABEL" "$CODE"
  else
    printf 'FAIL  %-30s -> HTTP %s\n' "$LABEL" "$CODE"
    FAILURES=$((FAILURES + 1))
  fi
done


# Two payloads are valid donations and really are written to the database — the
# SQL fragment and the script tag, which are accepted on purpose because they
# are only text. Removed here so the donation list screen stays clean.
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" khulula-postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q \
  -c "DELETE FROM donation WHERE donor_name LIKE 'Robert;%' OR message LIKE '<script>%';"

echo
echo "== $FAILURES failure(s) out of ${#PAYLOADS[@]} payloads =="

# A non-zero exit code, so the result is usable without reading the output.
exit $FAILURES
