#!/bin/bash
#
# Backing up the database — CP 7.
#
# WHAT IT PRODUCES. One .sql file holding the whole database: the structure of
# the seven tables, the trigger, the two stored functions, and every row. It is
# plain text, so it can be opened and read.
#
# WHY --clean --if-exists. Without them the file only contains CREATE and
# INSERT, and restoring it onto a database that still has its tables fails on
# the first line. With them the file starts by dropping what it is about to
# recreate, so a restore works whatever state the database is in. That is the
# difference between a backup and a backup you can actually use.
#
# Run it from the repository root, with the stack up:
#
#     bash api/scripts/backup.sh
#
set -u

# The database password is read from the root .env, never written here.
set -a
source .env
set +a

mkdir -p backups

# The date is in the file name, so two backups never overwrite each other and
# the list sorts chronologically on its own.
FILE=backups/khulula-$(date +%Y-%m-%d-%H%M%S).sql

echo "Backing up $POSTGRES_DB ..."

docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" khulula-postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists > "$FILE"

echo "Written: $FILE"
ls -lh "$FILE"
