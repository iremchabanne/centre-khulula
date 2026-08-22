-- T4 — the two dashboard indicators: occupancy rate and average length of stay.
--
-- Written by hand: Prisma cannot express a stored function. Created empty with
--   npx prisma migrate dev --create-only
--
-- Why stored functions rather than a computation in the service layer:
--   1. The computation runs where the data is. The API asks for one number and
--      receives one number, instead of downloading every stay row and summing
--      them in Node. This stays true whether the centre has 20 stays or 20 000
--      — an éco-conception argument as much as a performance one.
--   2. The definition of each indicator is a business rule, and it is written
--      once. Two screens cannot end up computing "occupancy" differently.


-- ---------------------------------------------------------------------------
-- 1. Occupancy rate, as a percentage.
--
--    numerator   : enclosures whose status is 'occupied'
--    denominator : enclosures that are actually usable — maintenance excluded
--
--    An enclosure closed for repair is not free, so counting it in the
--    denominator would make a busy centre look half-empty.
-- ---------------------------------------------------------------------------

CREATE FUNCTION occupancy_rate()
RETURNS NUMERIC(5, 1)
LANGUAGE plpgsql
AS $$
DECLARE
    usable   INTEGER;
    occupied INTEGER;
BEGIN
    SELECT count(*) INTO usable
    FROM enclosure
    WHERE is_under_maintenance = false;

    -- Every enclosure under maintenance: there is nothing to report, and
    -- dividing by zero would raise an error.
    IF usable = 0 THEN
        RETURN 0.0;
    END IF;

    SELECT count(*) INTO occupied
    FROM enclosure
    WHERE status = 'occupied';

    -- occupied is multiplied first, and by 100.0 rather than 100, so that the
    -- division is done on decimals. With integers, 3 / 7 would give 0.
    RETURN round((occupied * 100.0) / usable, 1);
END;
$$;


-- ---------------------------------------------------------------------------
-- 2. Average length of stay, in days.
--
--    Only finished stays are counted. A stay in progress has no length yet;
--    including it would drag the average down every time an animal is admitted.
--
--    Returns NULL when no stay has ended yet — "not enough data" and "zero days"
--    are two different facts, and the dashboard must be able to tell them apart.
-- ---------------------------------------------------------------------------

CREATE FUNCTION average_stay_length_days()
RETURNS NUMERIC(6, 1)
LANGUAGE plpgsql
AS $$
DECLARE
    result NUMERIC(6, 1);
BEGIN
    SELECT round(avg(EXTRACT(EPOCH FROM (ended_at - started_at)) / 86400)::numeric, 1)
    INTO result
    FROM stay
    WHERE ended_at IS NOT NULL;

    RETURN result;
END;
$$;

-- EXTRACT(EPOCH FROM interval) gives the interval in seconds; 86400 is the
-- number of seconds in a day. avg() ignores NULL rows on its own, but the
-- WHERE clause states the intent rather than relying on that.
