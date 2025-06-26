/*
  Warnings:

  - Added the required column `reporterName` to the `MedError` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reporterPhone` to the `MedError` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reporterPosition` to the `MedError` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reporterUsername` to the `MedError` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedError" ADD COLUMN     "reporterName" TEXT NOT NULL,
ADD COLUMN     "reporterOrganizationId" TEXT,
ADD COLUMN     "reporterPhone" TEXT NOT NULL,
ADD COLUMN     "reporterPosition" TEXT NOT NULL,
ADD COLUMN     "reporterUsername" TEXT NOT NULL;
