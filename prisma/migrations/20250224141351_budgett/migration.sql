/*
  Warnings:

  - Added the required column `category` to the `BudgetAllocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BudgetAllocation" ADD COLUMN     "category" "Category" NOT NULL;
