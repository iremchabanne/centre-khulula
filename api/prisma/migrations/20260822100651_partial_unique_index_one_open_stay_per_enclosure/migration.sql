-- RG1 — an enclosure holds at most one animal at a time.
--
-- Written by hand: Prisma cannot express a partial index. Created empty with
--   npx prisma migrate dev --create-only
--
-- In our model, "the stay is in progress" means ended_at IS NULL. So the rule is:
-- for a given enclosure_id, there may be at most ONE row with ended_at IS NULL.
--
-- A plain unique index on enclosure_id would be wrong: it would allow one single
-- stay per enclosure for its whole lifetime. The WHERE clause below restricts the
-- uniqueness to the rows that are still open, and leaves closed stays alone —
-- an enclosure keeps its full history.
--
-- Why this belongs in the database and not in the application. The application
-- check would read "is this enclosure free?" and then insert. Two keepers
-- admitting an animal at the same moment both read "free" before either one
-- inserts, and both insert. The check is correct and the result is still wrong.
-- A unique index is evaluated at write time by PostgreSQL itself, so the second
-- insert is rejected whatever the timing. This is what turns the conflict of
-- screen 8 into a clean error instead of a double occupancy.

CREATE UNIQUE INDEX "uq_stay_current_enclosure"
    ON "stay" ("enclosure_id")
    WHERE "ended_at" IS NULL;
