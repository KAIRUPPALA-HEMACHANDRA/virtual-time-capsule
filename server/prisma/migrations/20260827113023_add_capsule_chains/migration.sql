-- AlterTable
ALTER TABLE "capsules" ADD COLUMN     "prerequisite_id" TEXT;

-- AddForeignKey
ALTER TABLE "capsules" ADD CONSTRAINT "capsules_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "capsules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
