/*
  Warnings:

  - The `budgetAllocation` column on the `Budget` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `budgetRemaining` column on the `Budget` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `budgetAddition` column on the `Budget` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "budgetAllocation",
ADD COLUMN     "budgetAllocation" INTEGER,
DROP COLUMN "budgetRemaining",
ADD COLUMN     "budgetRemaining" INTEGER,
DROP COLUMN "budgetAddition",
ADD COLUMN     "budgetAddition" INTEGER;
