-- The second database account — modele-donnees.md §5.6, cahier des charges §6.1.
--
-- Written by hand: Prisma does not manage database roles. Created empty with
--   npx prisma migrate dev --create-only
--
-- Two accounts, on purpose:
--   khulula_admin  owns the tables, runs the migrations, backs up and restores.
--   khulula_app    is the only account the running API uses.
--
-- This is the principle of least privilege. If the API were ever compromised —
-- an SQL injection, a bug — the account it holds simply cannot drop a table,
-- delete a donation or rewrite an observation. The restriction is not a rule
-- written in the code that a future commit could forget: it is removed from the
-- rights themselves.
--
-- NO PASSWORD IS SET HERE. This file is committed to Git, and a secret never
-- goes into the repository. The role is created able to log in but with no
-- password, so it cannot connect until an administrator runs, once, outside of
-- version control:
--     ALTER ROLE khulula_app PASSWORD '...';


-- ---------------------------------------------------------------------------
-- 1. The role.
--    A role is cluster-wide, not per-database: it survives `prisma migrate
--    reset`, which only drops the database. Without the guard below, replaying
--    the migrations on an existing cluster would fail on "role already exists".
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'khulula_app') THEN
        CREATE ROLE khulula_app LOGIN;
    END IF;
END
$$;


-- ---------------------------------------------------------------------------
-- 2. Rights.
--    A new role starts with no rights on anything. Everything below is granted
--    explicitly, so reading this section tells you exactly what the API can do.
-- ---------------------------------------------------------------------------

-- Needed to see the schema at all.
GRANT USAGE ON SCHEMA public TO khulula_app;

-- Reference data: seeded and changed by migration, never by the application.
GRANT SELECT ON species TO khulula_app;

-- Append-only. No UPDATE, no DELETE: a written observation is a record, and a
-- record that can be rewritten is not evidence of anything.
GRANT SELECT, INSERT ON observation TO khulula_app;

-- Everyday work. Still no DELETE: nothing is ever deleted in this model —
-- an account is deactivated, an animal and an enclosure keep their history.
GRANT SELECT, INSERT, UPDATE ON staff_member, enclosure, animal, stay, donation
    TO khulula_app;

-- Every id column takes its value from a sequence, so INSERT needs this.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO khulula_app;

-- Not granted, deliberately, and it is worth saying out loud:
--   * DELETE on any table
--   * UPDATE on observation
--   * INSERT or UPDATE on species
--   * anything at all on _prisma_migrations — migration history belongs to
--     khulula_admin, and the API has no business reading or changing it
--
-- Adding a table in a later migration means granting its rights in that same
-- migration. A table with no GRANT is simply invisible to the API.
