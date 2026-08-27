-- AlterTable
ALTER TABLE "capsules" ADD COLUMN     "geo_radius" INTEGER DEFAULT 100,
ADD COLUMN     "is_geo_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
