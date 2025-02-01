-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "budgetAllocation" DROP NOT NULL,
ALTER COLUMN "budgetRemaining" DROP NOT NULL,
ALTER COLUMN "budgetAddition" DROP NOT NULL;
