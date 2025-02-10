npx prisma migrate dev --name init
npx prisma studio

export const budgetAddition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);
  const { amount } = req.body;

  // Validate the input amount
  const amountNumber = Number(amount);
  if (isNaN(amountNumber) || amountNumber <= 0) {
    res.status(400).json({ message: "Invalid amount provided" });
    return;
  }

  try {
    // Get the budget allocation and existing additions
    const budgetAllocation = await prisma.budgetAllocation.findUnique({
      where: { id: numericId },
    });

    if (!budgetAllocation) {
      res.status(404).json({ message: "Budget allocation not found!" });
      return;
    }

    // Calculate total existing additions
    const totalAdditions = await prisma.budgetAddition.aggregate({
      where: { budgetAllocationId: numericId },
      _sum: { amount: true },
    });

    // Calculate current total allocated budget
    const currentTotal = budgetAllocation.amount + (totalAdditions._sum.amount || 0);
    const projectedTotal = currentTotal + amountNumber;

    // Check if the new addition would exceed the limit
    if (projectedTotal > 1000) {
      res.status(400).json({ 
        message: `Budget would exceed limit. Current total: $${currentTotal}, Attempting to add: $${amountNumber}` 
      });
      return;
    }

    // Create the new budget addition
    const newAddition = await prisma.budgetAddition.create({
      data: {
        amount: amountNumber,
        budgetAllocation: {
          connect: { id: numericId },
        },
      },
    });

    // Determine response message based on new total
    const responseMessage = projectedTotal === 1000
      ? "Budget reached the maximum limit of $1000!"
      : "Budget updated successfully!";

    res.status(200).json({
      message: responseMessage,
      budgetAddition: newAddition,
      newTotal: projectedTotal,
      remainingBudget: 1000 - projectedTotal
    });

  } catch (error) {
    console.error("Error in budgetAddition:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


if possibly null then 0