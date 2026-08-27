-- CreateTable
CREATE TABLE "recipients" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "capsule_id" TEXT NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "viewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipients_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_capsule_id_fkey" FOREIGN KEY ("capsule_id") REFERENCES "capsules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
