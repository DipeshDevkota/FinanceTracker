/*
  Warnings:

  - Added the required column `notes` to the `budgetAllocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "budgetAllocation" ADD COLUMN     "notes" TEXT NOT NULL;
