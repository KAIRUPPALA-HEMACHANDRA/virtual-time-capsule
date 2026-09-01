/*
  Warnings:

  - A unique constraint covering the columns `[share_token]` on the table `capsules` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "capsules" ADD COLUMN     "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "capsules_share_token_key" ON "capsules"("share_token");
