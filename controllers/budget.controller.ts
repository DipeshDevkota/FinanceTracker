import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { BudgetAllocationSchema, BudgetSchema } from "../types/zodSchema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

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

    // Get category from Gemini API
    const category = await categorizeTransaction(req, res, next);
    console.log("Received category:", category);

    if (!category) {
      res.status(500).json({ message: "Failed to categorize transaction" });
      return;
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
    const newBudget = await prisma.budgetAllocation.create({
      data: {
        amount,
        category: sanitizedCategory,
        notes: sanitizedNotes,
        period: sanitizedPeriod,
      },
    });

    console.log("NewBudget is:", newBudget);

    res
      .status(201)
      .json({ message: "Budget allocated successfully!", newBudget });
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
    const budgetAllocation = await prisma.budgetAllocation.findUnique({
      where: { id: numericId },
    });
    if (!budgetAllocation) {
      res.status(404).json({ message: "Budget allocation not found!" });
      return;
    }
    const amountInNumber = Number(amount);

    console.log("Amount in NUmber");
    const typeofAmount = typeof amountInNumber;
    console.log("Type of amount is:", typeofAmount);
    const totalAdditions = await prisma.budgetAddition.aggregate({
      where: { budgetAllocationId: numericId },
      _sum: { amount: true },
    });

    const currentTotal =
      budgetAllocation.amount + (totalAdditions._sum.amount || 0);

      console.log("BudgetAllocationAMount is:",budgetAllocation.amount)
      console.log("TotalAdditionsAMount is:",totalAdditions._sum.amount)

    console.log("Current Total is:", currentTotal);
    const projectedTotal = currentTotal + amount;
    console.log("Projected Total is:", projectedTotal);

    const updatedAllocation = await prisma.budgetAllocation.update({
      where: { id: budgetAllocation.id },
      data: { amount: projectedTotal },
    });

    console.log("Updated Alocation is:", updatedAllocation);

    // Check if the new addition would exceed the limit
    if (projectedTotal > 1000) {
      res.status(400).json({
        message: `Budget would exceed limit. Current total: $${currentTotal}, Attempting to add: $${amount}`,
      });
      return;
    }

    //Create the new budget addition
    // const newAddition = await prisma.budgetAddition.create({
    //   data: {
    //     amount: amount,
    //     budgetAllocation: {
    //       connect: { id: numericId },
    //     },
    //   },
    // });

    const responseMessage =
      projectedTotal === 1000
        ? "Budget reached the maximum limit of $1000!"
        : "Budget updated successfully!";
    res.status(200).json({
      message: responseMessage,
      budgetAddition,
    });
  } catch (error) {
    console.error("Error in budgetAddition:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
export const viewBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("ViewBudgetController is called!");
    const viewBudget = await prisma.budgetAllocation.findMany();
    console.log("All of the budget controllers are:", viewBudget);
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
