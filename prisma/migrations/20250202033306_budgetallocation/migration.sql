-- CreateTable
CREATE TABLE "budgetAllocation" (
    "id" SERIAL NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "budgetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgetRemaining" (
    "id" SERIAL NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "budgetRemaining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgetAddition" (
    "id" SERIAL NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "budgetAddition_pkey" PRIMARY KEY ("id")
);
