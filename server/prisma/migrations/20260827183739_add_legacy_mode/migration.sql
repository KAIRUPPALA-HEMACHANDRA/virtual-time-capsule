-- AlterTable
ALTER TABLE "capsules" ADD COLUMN     "is_legacy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legacy_days" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_active_at" TIMESTAMP(3);
