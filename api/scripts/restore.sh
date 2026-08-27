#!/bin/bash
#
# Restoring the database from a backup — CP 7.
#
# WHAT IT DOES, and it is worth being blunt about it: it REPLACES the current
# database with the contents of the file. Everything written since that backup
# is lost. That is what a restore is.
#
# The file to restore is given as an argument, never guessed:
#
#     bash api/scripts/restore.sh backups/khulula-2026-08-27-181500.sql
#
# Restoring "the most recent backup" automatically would be convenient and
# wrong — the most recent backup is sometimes the one taken just after the
# accident.
#
set -u

# The database password is read from the root .env, never written here.
set -a
source .env
set +a

# $1 is the first argument given on the command line. Without it there is
# nothing to restore, so the script stops rather than doing something clever.
if [ $# -eq 0 ]; then
  echo "Usage: bash api/scripts/restore.sh <backup file>"
  echo
  echo "Available backups:"
  ls -1 backups/ 2>/dev/null
  exit 1
fi

FILE=$1

if [ ! -f "$FILE" ]; then
  echo "No such file: $FILE"
  exit 1
fi

echo "This will REPLACE the contents of $POSTGRES_DB with $FILE."
read -r -p "Type yes to continue: " ANSWER

if [ "$ANSWER" != "yes" ]; then
  echo "Cancelled. Nothing was changed."
  exit 1
fi

# -i so the file arrives on the standard input of psql inside the container.
# The backup was written with --clean, so it drops each table before recreating
# it; the DROP lines are noisy on a fresh database, which is normal.
docker exec -i -e PGPASSWORD="$POSTGRES_PASSWORD" khulula-postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q < "$FILE"

echo "Restored from $FILE"
