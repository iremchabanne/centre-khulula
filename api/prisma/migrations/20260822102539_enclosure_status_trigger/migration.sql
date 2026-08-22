-- RG3 and RG7 — enclosure.status is derived, never typed in.
--
-- Written by hand: Prisma cannot express a trigger. Created empty with
--   npx prisma migrate dev --create-only
--
-- The rule, from modele-donnees.md §5.4:
--     if is_under_maintenance                      -> 'maintenance'
--     else if a stay exists with ended_at IS NULL  -> 'occupied'
--     else                                         -> 'free'
--
-- Why the database and not the application. Three places would have to update
-- this column: admission, move, and outcome. Forget one — or add a fourth place
-- later — and the column starts lying: a screen shows "free" for an enclosure
-- that holds an animal. The rule is written once, here, and cannot be bypassed.


-- ---------------------------------------------------------------------------
-- 1. The rule itself, in one function.
--    Both triggers below call it, so the rule exists in a single place.
-- ---------------------------------------------------------------------------

CREATE FUNCTION compute_enclosure_status(
    p_enclosure_id       INTEGER,
    p_under_maintenance  BOOLEAN
)
RETURNS enclosure_status
LANGUAGE plpgsql
AS $$
BEGIN
    -- Maintenance is a human decision and wins over everything else (RG16).
    IF p_under_maintenance THEN
        RETURN 'maintenance';
    END IF;

    -- "ended_at IS NULL" is what "stay in progress" means in this model.
    IF EXISTS (
        SELECT 1
        FROM stay
        WHERE enclosure_id = p_enclosure_id
          AND ended_at IS NULL
    ) THEN
        RETURN 'occupied';
    END IF;

    RETURN 'free';
END;
$$;


-- ---------------------------------------------------------------------------
-- 2. Trigger on enclosure — covers RG16.
--    Fires BEFORE the row is written, so it simply overwrites NEW.status.
--    No second UPDATE, therefore no risk of the trigger calling itself.
-- ---------------------------------------------------------------------------

CREATE FUNCTION trg_enclosure_set_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.status := compute_enclosure_status(NEW.id, NEW.is_under_maintenance);
    RETURN NEW;
END;
$$;

CREATE TRIGGER enclosure_set_status
    BEFORE INSERT OR UPDATE ON enclosure
    FOR EACH ROW
    EXECUTE FUNCTION trg_enclosure_set_status();


-- ---------------------------------------------------------------------------
-- 3. Trigger on stay — covers RG3 (admission occupies) and RG7 (outcome frees).
--    Fires AFTER the stay is written, because the rule needs to see the row
--    that was just inserted or closed.
--
--    The UPDATE below fires the BEFORE trigger of section 2, which recomputes
--    the same value. That is harmless and it terminates: section 2 only edits
--    NEW, it never issues another UPDATE.
-- ---------------------------------------------------------------------------

CREATE FUNCTION trg_stay_refresh_enclosure_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- The enclosure the stay now points at (insert and update).
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        UPDATE enclosure
        SET status = compute_enclosure_status(id, is_under_maintenance)
        WHERE id = NEW.enclosure_id;
    END IF;

    -- The enclosure the stay used to point at. Only differs from the line above
    -- if a row was deleted, or if enclosure_id was changed by hand. Neither
    -- should happen, but the enclosure it left must not stay marked occupied.
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        UPDATE enclosure
        SET status = compute_enclosure_status(id, is_under_maintenance)
        WHERE id = OLD.enclosure_id;
    END IF;

    -- An AFTER trigger ignores its return value.
    RETURN NULL;
END;
$$;

CREATE TRIGGER stay_refresh_enclosure_status
    AFTER INSERT OR UPDATE OR DELETE ON stay
    FOR EACH ROW
    EXECUTE FUNCTION trg_stay_refresh_enclosure_status();


-- ---------------------------------------------------------------------------
-- 4. Bring the rows that already exist in line with the rule.
--    The table is empty today, but a migration must not assume that.
-- ---------------------------------------------------------------------------

UPDATE enclosure
SET status = compute_enclosure_status(id, is_under_maintenance);
