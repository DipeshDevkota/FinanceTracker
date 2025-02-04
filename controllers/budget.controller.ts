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

    // Validate request body using Zod
    const validateData = BudgetAllocationSchema.safeParse(req.body);
    if (!validateData.success) {
      res
        .status(400)
        .json({
          message: "Invalid input data",
          errors: validateData.error.errors,
        });
      return;
    }

    const { amount, notes, period, name } = validateData.data; // Extract fields

    // Ensure `name` exists for category detection
    if (!name) {
      res
        .status(400)
        .json({ message: "Product name is required for categorization!" });
      return;
    }
    const currencysymbol = "$";
    const validamount = `${amount}${currencysymbol}`;

    // Get category from Gemini API
    const category = await categorizeTransaction(req, res, next);

    console.log("Categorized item in budgetAllocation", category);
    if (!category) {
      res.status(500).json({ message: "Failed to categorize transaction" });
      return;
    }

    // Store budget allocation in the database
    const newBudget = await prisma.budgetAllocation.create({
      data: {
        amount: validamount,
        category,
        notes,
        period,
      },
    });
    console.log("NewBudget is :", newBudget);

    res
      .status(201)
      .json({ message: "Budget allocated successfully!", newBudget });
  } catch (error) {
    console.error("Error in budgetAllocation:", error);
    res.status(500).json({ message: "Server error while allocating budget." });
  }
};

export const budgetAddition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("budgetAddition Controller is called!");

  const { id } = req.params;
  const numericId = parseInt(id, 10);
  console.log("Id is:", numericId);

  const existingBudgetId = await prisma.budgetAllocation.findUnique({
    where: { id: numericId },
  });
  console.log("ExistingBudgetId is:",existingBudgetId)
  const existingBudgetAmount = existingBudgetId?.amount
  if(existingBudgetId && existingBudgetAmount === "1000")
  {
    console.log("Amount that has 1000$ is",existingBudgetAmount)

     res.status(400).json({message:"Existing budgetamount is",existingBudgetAmount})
     return;

  }
  const { amount } = req.body;


  ///you have to check first before comparing the values
  if (existingBudgetId && existingBudgetId?.amount < "1000$") {
    const additionBudget = await prisma.budgetAddition.create({
      data: {
        amount,
      },
    });
    console.log("AdditionBudget is:", additionBudget);
    res.status(400).json({ message: "AdditionBudget is:", additionBudget });
    return;
  }
};

//budgetAddition and budgetRemaining controllers to be made
