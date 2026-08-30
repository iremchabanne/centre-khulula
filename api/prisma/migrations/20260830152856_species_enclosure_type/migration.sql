-- RG17 — a species belongs in one kind of enclosure.
--
-- The cahier des charges says every animal occupies an enclosure suited to it,
-- but nothing in the model said which one, so a jackal could be admitted into
-- an aviary. This column is what the rule is checked against.
--
-- Written by hand rather than generated: the column is NOT NULL and the table
-- already holds nine rows, so it is added empty, filled, and only then made
-- required. Generated migrations cannot do that.

-- 1. Add it, nullable for now.
ALTER TABLE "species" ADD COLUMN "enclosure_type" "enclosure_type";

-- 2. Fill it. Matched on the scientific name, which is unique, rather than on
--    the common name or on an id the seed could renumber.
UPDATE "species" SET "enclosure_type" = 'small_mammal'
 WHERE "scientific_name" IN ('Mungos mungo', 'Smutsia temminckii', 'Leptailurus serval', 'Lupulella mesomelas');

UPDATE "species" SET "enclosure_type" = 'aviary'
 WHERE "scientific_name" IN ('Bubo africanus', 'Gyps coprotheres', 'Bucorvus leadbeateri');

UPDATE "species" SET "enclosure_type" = 'reptile'
 WHERE "scientific_name" IN ('Stigmochelys pardalis');

UPDATE "species" SET "enclosure_type" = 'large_mammal'
 WHERE "scientific_name" IN ('Sylvicapra grimmia');

-- 3. Now that no row is empty, make it required. Any species added later must
--    say where it belongs.
ALTER TABLE "species" ALTER COLUMN "enclosure_type" SET NOT NULL;
