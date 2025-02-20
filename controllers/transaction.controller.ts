import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
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
      category,
      budgetId
    } = req.body;

    if (!price || !quantity || !name || !brand || !category) {
       res.status(400).json({ message: "All fields are required!" });
       return
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { name, category },
    });

    if (existingTransaction) {
       res.status(200).json({
        message: "This transaction has already been recorded.",
        existingTransaction,
      });
      return
    }

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
        category,
        budgetId
      },
    });

    ///when doing transaction if that goes to 1000$ of budgetAllocation. notification should be sent ? do you want to extend the budget???
    //if yes . budgetaddidtioncontroller call

     res.status(200).json({
      message: "New transaction added successfully.",
      newTransaction,
    });
    return
  } catch (error) {
    console.error("Error adding transaction:", error);
     res
      .status(500)
      .json({ message: "Server error while creating transaction." });
      return
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
       return
    }

    const model = genAI.getGenerativeModel({model:"gemini-1.5-flash"})

    const prompt = `
      Categorize this product based on its details:
      Name: ${name || "N/A"}

      Categories: Food, Electronics, Fashion, Healthcare, Others.  Respond with ONLY the category name. Do not include any other text.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    console.log("Response is :",response);
    const text= response.text();
    console.log("Text is:",text)

    res.status(200).json({message:`${name} lies in ${text}`,text})
    return;

  } catch (error) {
    console.error("Error categorizing transaction:", error);
     res.status(500).json({ message: "Server error while categorizing transaction." });
     return
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