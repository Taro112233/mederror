-- DropForeignKey
ALTER TABLE "MedErrorImage" DROP CONSTRAINT "MedErrorImage_medErrorId_fkey";

-- AddForeignKey
ALTER TABLE "MedErrorImage" ADD CONSTRAINT "MedErrorImage_medErrorId_fkey" FOREIGN KEY ("medErrorId") REFERENCES "MedError"("id") ON DELETE CASCADE ON UPDATE CASCADE;
