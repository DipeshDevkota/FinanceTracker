/*
  Warnings:

  - You are about to drop the column `dateofExpiry` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `dateofManufacture` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `dateOfManufacture` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "dateofExpiry",
DROP COLUMN "dateofManufacture",
ADD COLUMN     "dateOfExpiry" TIMESTAMP(3),
ADD COLUMN     "dateOfManufacture" TEXT NOT NULL;
