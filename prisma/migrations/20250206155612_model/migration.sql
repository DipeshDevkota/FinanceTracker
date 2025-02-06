-- AlterTable
ALTER TABLE "budgetAddition" ADD COLUMN     "budgetAllocationId" INTEGER;

-- AddForeignKey
ALTER TABLE "budgetAddition" ADD CONSTRAINT "budgetAddition_budgetAllocationId_fkey" FOREIGN KEY ("budgetAllocationId") REFERENCES "budgetAllocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
