/*
  Warnings:

  - You are about to drop the column `reporterId` on the `MedError` table. All the data in the column will be lost.
  - Added the required column `reporterAccountId` to the `MedError` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MedError" DROP CONSTRAINT "MedError_reporterId_fkey";

-- AlterTable
ALTER TABLE "MedError" DROP COLUMN "reporterId",
ADD COLUMN     "reporterAccountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MedError" ADD CONSTRAINT "MedError_reporterAccountId_fkey" FOREIGN KEY ("reporterAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
