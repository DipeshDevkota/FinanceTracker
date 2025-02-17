/*
  Warnings:

  - You are about to drop the column `budgetAddition` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `budgetAllocation` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `budgetRemaining` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `Category` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `TransactionPic` on the `Transaction` table. All the data in the column will be lost.
  - The `dateOfManufacture` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `budgetAddition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budgetAllocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budgetRemaining` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `price` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "budgetAddition" DROP CONSTRAINT "budgetAddition_budgetAllocationId_fkey";

-- DropForeignKey
ALTER TABLE "budgetAllocation" DROP CONSTRAINT "budgetAllocation_userId_fkey";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "budgetAddition",
DROP COLUMN "budgetAllocation",
DROP COLUMN "budgetRemaining";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "Category",
DROP COLUMN "TransactionPic",
ADD COLUMN     "category" "Category" NOT NULL,
ADD COLUMN     "transactionPic" TEXT,
DROP COLUMN "price",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "description" SET DATA TYPE TEXT,
DROP COLUMN "dateOfManufacture",
ADD COLUMN     "dateOfManufacture" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;

-- DropTable
DROP TABLE "budgetAddition";

-- DropTable
DROP TABLE "budgetAllocation";

-- DropTable
DROP TABLE "budgetRemaining";

-- CreateTable
CREATE TABLE "BudgetAllocation" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "Category" NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "BudgetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAdjustment" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "allocationId" INTEGER NOT NULL,

    CONSTRAINT "BudgetAdjustment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAdjustment" ADD CONSTRAINT "BudgetAdjustment_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "BudgetAllocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
