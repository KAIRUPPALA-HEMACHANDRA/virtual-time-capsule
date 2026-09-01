-- AlterTable
ALTER TABLE "capsules" ADD COLUMN     "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reactions" TEXT,
ADD COLUMN     "self_destruct_after_read" BOOLEAN NOT NULL DEFAULT false;
