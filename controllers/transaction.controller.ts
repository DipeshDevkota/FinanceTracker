import { NextFunction, Request, Response } from "express";
import { Category, PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();


const prisma = new PrismaClient();
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      price,
      name,
      quantity,
      brand,
      dateOfManufacture,
      dateOfExpiry,
      description,
      transactionPic,
      category, // This will now contain the category set in categorizeTransaction
    } = req.body;


    console.log("req",req.body)
    console.log("req categiry",req.body.category)

    if (!price || !quantity || !name || !brand || !category) {
       res.status(400).json({ message: "All fields are required!" });
       return;
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { name },
    });

    if (existingTransaction) {
       res.status(200).json({
        message: "This transaction has already been recorded.",
        existingTransaction,
      });
      return
    }


    const {budgetId} = req.params;
    const NumericBudgetId = Number(budgetId)
    console.log("Budgetid is :",budgetId)
    console.log("caet",category)
    console.log("type",typeof(category))
    if(!Object.values(Category).includes(category))
    {
      throw new Error("Invalid Category ")
    }

    console.log("Hello")
    const newTransaction = await prisma.transaction.create({
      data: {
        price,
        name,
        quantity,
        brand,
        dateOfManufacture,
        dateOfExpiry,
        description,
        transactionPic,
        category: category , // Now this is guaranteed to be a valid enum
        budgetId:NumericBudgetId,
      },
    });

    // Check if transaction exceeds the budget

    res.status(200).json({
      message: "New transaction added successfully.",
      newTransaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Server error while creating transaction." });
  }
};


export const categorizeTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: "Product name is required!" });
      return; // End the middleware if there's an error
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Categorize this product based on its details:
      Name: ${name || "N/A"}

      Categories: Food, Electronics, Fashion, Healthcare, Others. Respond with ONLY the category name (use uppercase). Do not include any other text.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const text = response.text().trim().toUpperCase(); // Trim whitespace and convert to uppercase

    // Validate against enum values
    const validCategories = ['FOOD', 'ELECTRONICS', 'FASHION', 'HEALTHCARE', 'OTHERS'];

    if (!validCategories.includes(text)) {
      throw new Error(`Invalid category: ${text}`);
    }

    req.body.category = text as Category; // Assigning the validated category to req.body

    next(); // Call next to proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    res.status(500).json({ message: "Server error while categorizing transaction." });
  }
};

export const allTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("AllTransactions route is  called!");
    const allTransactions = await prisma.transaction.findMany();
    console.log("Alltransactions are:", allTransactions);
     res.status(200).json({
      message: "All transactions fetched successfully",
      allTransactions,
    });
    return
  } catch (error) {
    console.error("Error fetching transactions:", error);
     res.status(500).json({ message: "Server error while fetching transactions." });
  }
  return
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("DeleteTransaction called!");

    const { id } = req.body;

    if (!id) {
       res.status(400).json({ message: "Transaction ID is required!" }); // More specific message
       return
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
       res.status(404).json({ message: "Transaction with this ID doesn't exist" }); // More specific message
       return
    }

    await prisma.transaction.delete({
      where: { id },
    });

     res.status(200).json({ message: "Item deleted successfully!" });
     return
  } catch (error) {
    console.error("Error deleting transaction:", error);
     res.status(500).json({ message: "Server error while deleting transaction." });
     return
  }
};