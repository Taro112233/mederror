/*
  Warnings:

  - You are about to drop the column `errorType` on the `MedError` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `MedError` table. All the data in the column will be lost.
  - You are about to drop the column `subErrorType` on the `MedError` table. All the data in the column will be lost.
  - Added the required column `errorTypeId` to the `MedError` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severityId` to the `MedError` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subErrorTypeId` to the `MedError` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedError" DROP COLUMN "errorType",
DROP COLUMN "severity",
DROP COLUMN "subErrorType",
ADD COLUMN     "errorTypeId" TEXT NOT NULL,
ADD COLUMN     "severityId" TEXT NOT NULL,
ADD COLUMN     "subErrorTypeId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ErrorType";

-- DropEnum
DROP TYPE "Severity";

-- DropEnum
DROP TYPE "SubErrorTypeAdministration";

-- DropEnum
DROP TYPE "SubErrorTypeDispensing";

-- DropEnum
DROP TYPE "SubErrorTypePreDispensing";

-- DropEnum
DROP TYPE "SubErrorTypePrescribing";

-- DropEnum
DROP TYPE "SubErrorTypeTranscribing";

-- CreateTable
CREATE TABLE "Severity" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Severity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ErrorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubErrorType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "errorTypeId" TEXT NOT NULL,

    CONSTRAINT "SubErrorType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Severity_code_key" ON "Severity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorType_code_key" ON "ErrorType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SubErrorType_code_key" ON "SubErrorType"("code");

-- AddForeignKey
ALTER TABLE "SubErrorType" ADD CONSTRAINT "SubErrorType_errorTypeId_fkey" FOREIGN KEY ("errorTypeId") REFERENCES "ErrorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedError" ADD CONSTRAINT "MedError_severityId_fkey" FOREIGN KEY ("severityId") REFERENCES "Severity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedError" ADD CONSTRAINT "MedError_errorTypeId_fkey" FOREIGN KEY ("errorTypeId") REFERENCES "ErrorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedError" ADD CONSTRAINT "MedError_subErrorTypeId_fkey" FOREIGN KEY ("subErrorTypeId") REFERENCES "SubErrorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
