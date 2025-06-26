/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `MedError` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MedError" DROP COLUMN "imageUrl";

-- CreateTable
CREATE TABLE "MedErrorImage" (
    "id" TEXT NOT NULL,
    "medErrorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedErrorImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MedErrorImage" ADD CONSTRAINT "MedErrorImage_medErrorId_fkey" FOREIGN KEY ("medErrorId") REFERENCES "MedError"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
