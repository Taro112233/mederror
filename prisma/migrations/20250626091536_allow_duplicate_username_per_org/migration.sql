/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,username]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Account_username_key";

-- CreateIndex
CREATE UNIQUE INDEX "Account_organizationId_username_key" ON "Account"("organizationId", "username");
