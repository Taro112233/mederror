/*
  Warnings:

  - Added the required column `unitId` to the `MedError` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedError" ADD COLUMN     "unitId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MedError" ADD CONSTRAINT "MedError_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
