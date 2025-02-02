/*
  Warnings:

  - Added the required column `category` to the `budgetAllocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `budgetAllocation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Food', 'Electronics', 'Fashion', 'Healthcare', 'Others');

-- AlterTable
ALTER TABLE "budgetAllocation" ADD COLUMN     "category" "Category" NOT NULL,
ADD COLUMN     "period" TEXT NOT NULL;
