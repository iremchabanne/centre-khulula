-- CreateEnum
CREATE TYPE "staff_role" AS ENUM ('keeper', 'veterinarian');

-- CreateEnum
CREATE TYPE "animal_status" AS ENUM ('admitted', 'in_care', 'recovering', 'released', 'deceased');

-- CreateEnum
CREATE TYPE "enclosure_status" AS ENUM ('free', 'occupied', 'maintenance');

-- CreateEnum
CREATE TYPE "enclosure_type" AS ENUM ('small_mammal', 'large_mammal', 'aviary', 'reptile');

-- CreateEnum
CREATE TYPE "iucn_status" AS ENUM ('least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered');

-- CreateEnum
CREATE TYPE "sex" AS ENUM ('male', 'female', 'unknown');

-- CreateEnum
CREATE TYPE "age_class" AS ENUM ('juvenile', 'subadult', 'adult', 'unknown');

-- CreateTable
CREATE TABLE "staff_member" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "staff_role" NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "species" (
    "id" SERIAL NOT NULL,
    "common_name" VARCHAR(100) NOT NULL,
    "scientific_name" VARCHAR(100) NOT NULL,
    "iucn_status" "iucn_status" NOT NULL,
    "habitat" VARCHAR(255) NOT NULL,
    "diet" VARCHAR(255) NOT NULL,
    "activity" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" VARCHAR(255) NOT NULL,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enclosure" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "type" "enclosure_type" NOT NULL,
    "notes" TEXT,
    "is_under_maintenance" BOOLEAN NOT NULL DEFAULT false,
    "status" "enclosure_status" NOT NULL DEFAULT 'free',

    CONSTRAINT "enclosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "species_id" INTEGER NOT NULL,
    "sex" "sex" NOT NULL,
    "age_class" "age_class" NOT NULL,
    "found_near" VARCHAR(255),
    "admission_reason" TEXT NOT NULL,
    "status" "animal_status" NOT NULL DEFAULT 'admitted',
    "admitted_at" TIMESTAMPTZ(6) NOT NULL,
    "outcome_at" TIMESTAMPTZ(6),
    "outcome_note" TEXT,
    "outcome_by_id" INTEGER,

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stay" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "enclosure_id" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "ended_at" TIMESTAMPTZ(6),
    "move_reason" TEXT,
    "opened_by_id" INTEGER NOT NULL,

    CONSTRAINT "stay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observation" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "observed_at" TIMESTAMPTZ(6) NOT NULL,
    "body" TEXT NOT NULL,
    "status_after" "animal_status",

    CONSTRAINT "observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(7,2) NOT NULL,
    "donor_name" VARCHAR(100),
    "donor_email" VARCHAR(255),
    "message" TEXT,
    "consent_given" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_member_email_key" ON "staff_member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "species_scientific_name_key" ON "species"("scientific_name");

-- CreateIndex
CREATE UNIQUE INDEX "enclosure_code_key" ON "enclosure"("code");

-- CreateIndex
CREATE INDEX "animal_status_idx" ON "animal"("status");

-- CreateIndex
CREATE INDEX "stay_animal_id_idx" ON "stay"("animal_id");

-- CreateIndex
CREATE INDEX "stay_enclosure_id_idx" ON "stay"("enclosure_id");

-- CreateIndex
CREATE INDEX "observation_animal_id_idx" ON "observation"("animal_id");

-- CreateIndex
CREATE INDEX "observation_author_id_idx" ON "observation"("author_id");

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_outcome_by_id_fkey" FOREIGN KEY ("outcome_by_id") REFERENCES "staff_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stay" ADD CONSTRAINT "stay_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stay" ADD CONSTRAINT "stay_enclosure_id_fkey" FOREIGN KEY ("enclosure_id") REFERENCES "enclosure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stay" ADD CONSTRAINT "stay_opened_by_id_fkey" FOREIGN KEY ("opened_by_id") REFERENCES "staff_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observation" ADD CONSTRAINT "observation_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observation" ADD CONSTRAINT "observation_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "staff_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
