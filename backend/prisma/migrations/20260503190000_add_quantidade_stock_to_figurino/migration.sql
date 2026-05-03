ALTER TABLE "figurino"
ADD COLUMN IF NOT EXISTS "quantidade_stock" INTEGER DEFAULT 1;

UPDATE "figurino"
SET "quantidade_stock" = 1
WHERE "quantidade_stock" IS NULL;
