import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { BudgetAllocationSchema, BudgetSchema } from "../types/zodSchema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "../types/userType";
import { redisClient } from "../redis/client";
const prisma = new PrismaClient();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

interface RequestWithUser extends Request {
  user?: User;
}

export const categorizeTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<string | null> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Product name is required!" });
      return null;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Categorize this product based on its details:
      Name: ${name}

      Categories: Food, Electronics, Fashion, Healthcare, Others.
      Respond with ONLY the category name. Do not include any other text.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    console.log("Result while categorizing items is:", result);

    const response = await result.response;
    console.log("Response while categorizing items is:", response);
    const text = response.text().trim();

    console.log("Category detected:", text);
    return text; // Return only the category
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    return null;
  }
};

export const budgetAllocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("BudgetAllocation route called!");

  try {
    if (!req.body) {
      res.status(400).json({ message: "Request body is missing!" });
      return;
    }

    console.log("Req.body is:", req.body);

    // Validate request body using Zod
    const validateData = BudgetAllocationSchema.safeParse(req.body);
    if (!validateData.success) {
      res.status(400).json({
        message: "Invalid input data",
        errors: validateData.error.errors,
      });
      return;
    }

    const { amount, notes, period, name } = validateData.data; // Extract fields

    if (!name) {
      res
        .status(400)
        .json({ message: "Product name is required for categorization!" });
      return;
    }
    const redisKey = `category:${name.toLowerCase()}`;
    let category = await redisClient.get(redisKey);

    if (!category) {
      console.log("Fetching category from API....");
      category = await categorizeTransaction(req, res, next);
      if (!category) {
        res.status(500).json({ message: "Failed to categorize transaction" });
        return;
      }

      await redisClient.setex(redisKey, 3600, category);
    } else {
      console.log("Category retreived from cache:", category);
    }

    // Sanitize input data (Remove null characters)
    function sanitizeString(str: string | null | undefined): string {
      return str ? str.replace(/\x00/g, "") : "";
    }

    const sanitizedCategory = sanitizeString(category);
    const sanitizedNotes = sanitizeString(notes);
    const sanitizedPeriod = sanitizeString(period);

    console.log("Sanitized category:", sanitizedCategory);
    console.log("Sanitized notes:", sanitizedNotes);
    console.log("Sanitized period:", sanitizedPeriod);

    // Store budget allocation in the database
    // const newBudget = await prisma.budgetAllocation.create({
    //   data: {
    //     amount,
    //     category: sanitizedCategory,
    //     notes: sanitizedNotes,
    //     period: sanitizedPeriod,
    //   },
    // });

    // console.log("NewBudget is:", newBudget);

    res.status(201).json({ message: "Budget allocated successfully!" });
    return;
  } catch (error) {
    console.error("Error in budgetAllocation:", error);
    res
      .status(500)
      .json({ message: "Server error while allocating budget.", error });
    return;
  }
};


export const budgetAddition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);
  const { amount } = req.body;

  try {
    const redisKey = `budgetAllocation:${numericId}`; // Unique Redis key for caching

    // **1. Check Redis Cache First**
    const cachedData = await redisClient.get(redisKey);
    if (cachedData) {
      console.log("Serving from Redis cache");
       res.status(200).json(JSON.parse(cachedData));
       return
    }

    // **2. Fetch Budget Allocation from DB**
    const budgetAllocation = await prisma.budgetAllocation.findUnique({
      where: { id: numericId },
    });

    if (!budgetAllocation) {
      res.status(404).json({ message: "Budget allocation not found!" });
      return;
    }

    const amountInNumber = Number(amount);
    const totalAdditions = await prisma.budgetAddition.aggregate({
      where: { allocationId: numericId },
      _sum: { amount: true },
    });

    const currentTotal = budgetAllocation.amount + (totalAdditions._sum.amount || 0);
    const projectedTotal = currentTotal + amountInNumber;

    // **3. Budget Limit Check**
    if (projectedTotal > 1000) {
      res.status(400).json({
        message: `Budget would exceed limit. Current total: $${currentTotal}, Attempting to add: $${amount}`,
        projectedTotal,
      });
      return;
    }

    // **4. Update Budget Allocation in DB**
    const updatedAllocation = await prisma.budgetAllocation.update({
      where: { id: budgetAllocation.id },
      data: { amount: projectedTotal },
    });

    // **5. Update Redis Cache**
    await redisClient.set(redisKey, JSON.stringify(updatedAllocation), "EX", 3600); // Cache for 1 hour

    const responseMessage =
      projectedTotal === 1000
        ? "Budget reached the maximum limit of $1000!"
        : "Budget updated successfully!";

    res.status(200).json({
      message: responseMessage,
      projectedTotal,
    });
  } catch (error) {
    console.error("Error in budgetAddition:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const viewBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const redisKey = "allBudgetAllocation";
    console.log("ViewBudgetController is called!");
    const cachedData = await redisClient.get(redisKey);
    if(cachedData)
    {
      console.log("Serving from Redis Cache");
      res.status(200).json(JSON.parse(cachedData))
      return;
    }
    const viewBudget = await prisma.budgetAllocation.findMany();
    console.log("All of the budget controllers are:", viewBudget);
    await redisClient.set(redisKey,JSON.stringify(viewBudget),"EX",3600)
    res
      .status(200)
      .json({ message: "All of the budgets allocated are:", viewBudget });
    return;
  } catch (error) {
    console.error("Error in budgetAddition:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const budgetDeleteById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Deleting the budget controller is called!");
    const { id } = req.params;
    const numericId = Number(id);

    const { amount } = req.body;
    const amountToDelete = Number(amount);
    const user = req.user;
    const userId = user?.id;
    if (!userId) {
      res.status(404).json({ message: "User is not authenticated" });
      return;
    }

    const existingBudgetId = await prisma.budgetAllocation.findUnique({
      where: { id: numericId },
    });

    if (!existingBudgetId) {
      res.status(404).json({ message: "Budgetwith this Id doesn't exist!" });
      return;
    }

    if (amountToDelete <= 0) {
      res
        .status(400)  
        .json({ message: "Please provide a valid amount to delete!" });
      return;
    }

    const existingBudgetWithUser = await prisma.budget.findUnique({
      where: { id: numericId },
      include: { user: true },
    });

    if (!existingBudgetWithUser) {
      res.status(404).json({ message: "Budget of this User doesn't exist!" });
      return;
    }

    if (existingBudgetWithUser.userId !== userId) {
      res.status(404).json({ message: "User is not authenticated" });
      return;
    }

    if (existingBudgetId.amount < amountToDelete) {
      res.status(400).json({
        message: "Cannot delete more than the existing budget amount",
      });
      return;
    }

    const newAmount = existingBudgetId.amount - amountToDelete;

    const updateBudget = await prisma.budgetAllocation.update({
      where: { id: numericId },
      data: { amount: newAmount },
    });

    const deletionRecord = await prisma.budgetAdjustment.create({
      data: {
        amount: -amountToDelete,
        type: "DELETION",
        allocation: {
          connect: { id: numericId },
        },
      },
    });

    res.status(200).json({
      message: "Budget amount deleted successfully!",
      budget: {
        id: updateBudget.id,
        previousAmount: existingBudgetId.amount,
        deletedAmount: amountToDelete,
        currentAmount: updateBudget.amount,
        category: updateBudget.category,
        period: updateBudget.period,
        notes: updateBudget.notes,
        // lastUpdated: updateBudget.updatedAt
      },
      deletion: {
        id: deletionRecord.id,
        amount: deletionRecord.amount,
      },
    });

    return;
  } catch (error) {
    console.error("Error in budgetDeleteById", error);
    res.status(500).json({
      message: "Internal server error while deleting budget amount",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};
export const viewBudgetById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("ViewBudget Controller is called!");
    const { id } = req.params;
    const numericId = Number(id);
    if (!id) {
      res.status(404).json({ message: "Error in fetching single budget" });
      return;
    }
    const existingBudgetId = await prisma.budgetAllocation.findUnique({
      where: { id: numericId },
    });

    console.log("Existing Budgetid is:", existingBudgetId);
    if (!existingBudgetId) {
      res.status(404).json({ message: "Budget doesn't exist on the database" });
      return;
    }

    res.status(200).json({
      message: "Budget with the id is available on the database",
      existingBudgetId,
    });
    return;
  } catch (error) {
    console.error("Error in budgetAddition:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

//budgetAddition and budgetRemaining controllers to be made

export const budgetRemaining = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Budget remaining controller is called!");
    const { id } = req.params;
    const numericId = Number(id);

    const user = req.user;
    const userId = user?.id;
    if (!userId) {
      res.status(404).json({ message: "User is not authenticated" });
      return;
    }

    // Get the budget allocation
    const budgetAllocation = await prisma.budgetAllocation.findUnique({
      where: { id: numericId },
      include: {
        adjustments: true, // Include all adjustments (additions and deletions)
      },
    });

    if (!budgetAllocation) {
      res.status(404).json({ message: "Budget allocation not found" });
      return;
    }

    // Verify user owns the budget
    const existingBudgetWithUser = await prisma.budget.findUnique({
      where: { id: numericId },
      include: { user: true },
    });

    if (!existingBudgetWithUser || existingBudgetWithUser.userId !== userId) {
      res
        .status(403)
        .json({ message: "User is not authorized to view this budget" });
      return;
    }

    // Calculate total adjustments
    const totalAdjustments = budgetAllocation.adjustments.reduce(
      (sum, adjustment) => sum + adjustment.amount,
      0
    );

    // Calculate remaining budget
    const initialAmount = budgetAllocation.amount;
    const remainingAmount = initialAmount + totalAdjustments;

    // Calculate percentage remaining
    const percentageRemaining = (
      (remainingAmount / initialAmount) *
      100
    ).toFixed(2);

    // Get recent transactions
    const recentAdjustments = budgetAllocation.adjustments
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    res.status(200).json({
      message: "Budget remaining details retrieved successfully",
      budget: {
        id: budgetAllocation.id,
        category: budgetAllocation.category,
        period: budgetAllocation.period,
        initialAmount,
        remainingAmount,
        percentageRemaining: `${percentageRemaining}%`,
        totalSpent: initialAmount - remainingAmount,
      },
      recentTransactions: recentAdjustments.map((adj) => ({
        id: adj.id,
        amount: adj.amount,
        type: adj.type,
        date: adj.createdAt,
      })),
      status:
        remainingAmount <= 0
          ? "DEPLETED"
          : remainingAmount < initialAmount * 0.2
          ? "LOW"
          : remainingAmount < initialAmount * 0.5
          ? "MODERATE"
          : "HEALTHY",
    });
    return;
  } catch (error) {
    console.error("Error in budgetRemaining:", error);
    res.status(500).json({
      message: "Internal server error while fetching remaining budget",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};

export const budgetHistory = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const numericId = Number(id);
    const user = req.user;
    if (!user?.id) {
      res.status(404).json({ message: "User is not authenticated" });
      return;
    }

    const budgetHistory = await prisma.budgetAdjustment.findMany({
      where: {
        allocationId: numericId,
        createdAt: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },

      orderBy: { createdAt: "desc" },
      include: {
        allocation: true,
      },
    });

    res.status(200).json({
      message: "Budget history retrieved successfully",
      history: budgetHistory,
    });
  } catch (error) {
    console.error("Error in budgetHistory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
