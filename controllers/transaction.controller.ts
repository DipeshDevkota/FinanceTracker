import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINAI_API_KEY);

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
      TransactionPic,
      Category,
    } = req.body;

    if (!price || !quantity || !name || !brand || !Category) {
       res.status(400).json({ message: "All fields are required!" });
       return
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { name, Category },
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
        TransactionPic,
        Category,
      },
    });

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
    const { name, description } = req.body;

    if (!name) {
       res.status(400).json({ message: "Product name is required!" });
       return
    }

    const model = genAI.model("gemini-nano");

    const prompt = `
      Categorize this product based on its details:
      Name: ${name || "N/A"}
      Description: ${description || "N/A"}

      Categories: Food, Electronics, Fashion, Healthcare, Others.  Respond with ONLY the category name. Do not include any other text.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const category = result.response.candidates[0].content.parts[0].text.trim();

    const validCategories = ["Food", "Electronics", "Fashion", "Healthcare", "Others"];
    if (!validCategories.includes(category)) {
      console.warn(`Invalid category returned: ${category}`);
       res.status(500).json({ message: "Could not categorize the product." });
       return
    }

     res.status(200).json({ message: "Transaction categorized successfully.", category });
     return

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